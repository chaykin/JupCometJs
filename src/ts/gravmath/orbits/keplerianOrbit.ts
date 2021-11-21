import {format} from "../../utils/stringUtils";
import FastMath from "../../utils/math/fastMath";
import MathUtils from "../../utils/math/mathUtils";
import Vector from "../geometry/euclidean/threed/vector";

export default class KeplerianOrbit {

    /**
     * Name of the eccentricity parameter
     */
    private static readonly ECCENTRICITY = "eccentricity";

    /** First coefficient to compute Kepler equation solver starter. */
    private static readonly A = 3 * (FastMath.PI - 1) * (FastMath.PI - 1) / (3 * FastMath.PI + 2);

    /** Second coefficient to compute Kepler equation solver starter. */
    private static readonly B = (6 * FastMath.PI - 1) * (6 * FastMath.PI - 1) / (6 * (3 * FastMath.PI + 2));

    /**
     * Semi-major axis (m)
     */
    private readonly a: number;

    /**
     * Eccentricity
     */
    private readonly e: number;

    /**
     * Inclination (rad)
     */
    private readonly i: number;

    /**
     * Perigee Argument (rad)
     */
    private readonly pa: number;

    /**
     * Longitude of Ascending Node (rad)
     */
    private readonly raan: number;

    /**
     * True anomaly (rad)
     */
    private readonly v: number;

    /**
     * Value of mu used to compute position and velocity (m³/s²)
     */
    private readonly mu: number;

    private pvCoord = {position: new Vector(0, 0, 0), velocity: new Vector(0, 0, 0)}
    private pvCoordComputed = false;

    public constructor(a: number, e: number, i: number, pa: number, raan: number, meanAnomaly: number, mu: number) {
        if (a * (1 - e) < 0) {
            throw new Error(format(ErrorMessages.ORBIT_A_E_MISMATCH_WITH_CONIC_TYPE, a, e));
        }

        // Checking eccentricity range
        KeplerianOrbit.checkParameterRangeInclusive(KeplerianOrbit.ECCENTRICITY, e, 0.0, Number.POSITIVE_INFINITY);

        this.a = a;
        this.e = e;
        this.i = i;
        this.pa = pa;
        this.raan = raan;

        this.v = (a < 0) ?
            KeplerianOrbit.hyperbolicEccentricToTrue(KeplerianOrbit.meanToHyperbolicEccentric(meanAnomaly, e), e) :
            KeplerianOrbit.ellipticEccentricToTrue(KeplerianOrbit.meanToEllipticEccentric(meanAnomaly, e), e);

        // check true anomaly range
        if (1 + e * Math.cos(this.v) <= 0) {
            const vMax = Math.acos(-1 / e);
            throw new Error(format(ErrorMessages.ORBIT_ANOMALY_OUT_OF_HYPERBOLIC_RANGE, this.v, e, -vMax, vMax));
        }

        this.mu = mu;
    }

    /**
     * Get the eccentric anomaly
     *
     * @return eccentric anomaly (rad)
     */
    public getEccentricAnomaly(): number {
        return (this.a < 0) ?
            KeplerianOrbit.trueToHyperbolicEccentric(this.v, this.e) :
            KeplerianOrbit.trueToEllipticEccentric(this.v, this.e);
    }

    public getPVCoordinates(): { position: Vector, velocity: Vector } {
        if (!this.pvCoordComputed) {
            this.computePVWithoutA();
        }

        return this.pvCoord;
    }

    /**
     * Compute position and velocity but not acceleration
     */
    private computePVWithoutA() {
        if (this.pvCoordComputed) {
            // already computed
            return;
        }

        // preliminary variables
        const scRaan = FastMath.sinCos(this.raan);
        const scPa = FastMath.sinCos(this.pa);
        const scI = FastMath.sinCos(this.i);
        const cosRaan = scRaan.cos;
        const sinRaan = scRaan.sin;
        const cosPa = scPa.cos;
        const sinPa = scPa.sin;
        const cosI = scI.cos;
        const sinI = scI.sin;

        const crcp = cosRaan * cosPa;
        const crsp = cosRaan * sinPa;
        const srcp = sinRaan * cosPa;
        const srsp = sinRaan * sinPa;

        // reference axes defining the orbital plane
        const p = new Vector(crcp - cosI * srsp, srcp + cosI * crsp, sinI * sinPa);
        const q = new Vector(-crsp - cosI * srcp, -srsp + cosI * crcp, sinI * cosPa);

        if (this.a > 0) {
            // elliptical case

            // elliptic eccentric anomaly
            const uME2 = (1 - this.e) * (1 + this.e);
            const s1Me2 = Math.sqrt(uME2);
            const scE = FastMath.sinCos(this.getEccentricAnomaly());
            const cosE = scE.cos;
            const sinE = scE.sin;

            // coordinates of position and velocity in the orbital plane
            const x = this.a * (cosE - this.e);
            const y = this.a * sinE * s1Me2;
            const factor = Math.sqrt(this.mu / this.a) / (1 - this.e * cosE);
            const xDot = -sinE * factor;
            const yDot = cosE * s1Me2 * factor;

            const position = Vector.new(x, p, y, q);
            const velocity = Vector.new(xDot, p, yDot, q);
            this.pvCoord = {position, velocity};
        } else {
            // hyperbolic case

            // compute position and velocity factors
            const scV = FastMath.sinCos(this.v);
            const sinV = scV.sin;
            const cosV = scV.cos;
            const f = this.a * (1 - this.e * this.e);
            const posFactor = f / (1 + this.e * cosV);
            const velFactor = Math.sqrt(this.mu / f);

            const x = posFactor * cosV;
            const y = posFactor * sinV;
            const xDot = -velFactor * sinV;
            const yDot = velFactor * (this.e + cosV);

            const position = Vector.new(x, p, y, q);
            const velocity = Vector.new(xDot, p, yDot, q);
            this.pvCoord = {position, velocity};
        }

        this.pvCoordComputed = true;
    }

    /** Computes the hyperbolic eccentric anomaly from the mean anomaly.
     * <p>
     * The algorithm used here for solving hyperbolic Kepler equation is
     * Danby's iterative method (3rd order) with Vallado's initial guess.
     * </p>
     * @param meanAnomaly mean anomaly (rad)
     * @param ecc eccentricity
     * @return H the hyperbolic eccentric anomaly
     */
    public static meanToHyperbolicEccentric(meanAnomaly: number, ecc: number): number {
        // Resolution of hyperbolic Kepler equation for Keplerian parameters

        // Initial guess
        let H: number;
        if (ecc < 1.6) {
            if (-FastMath.PI < meanAnomaly && meanAnomaly < 0.0 || meanAnomaly > FastMath.PI) {
                H = meanAnomaly - ecc;
            } else {
                H = meanAnomaly + ecc;
            }
        } else {
            if (ecc < 3.6 && Math.abs(meanAnomaly) > FastMath.PI) {
                H = meanAnomaly - FastMath.copySign(ecc, meanAnomaly);
            } else {
                H = meanAnomaly / (ecc - 1.);
            }
        }

        // Iterative computation
        let iter = 0;
        do {
            const f3 = ecc * Math.cosh(H);
            const f2 = ecc * Math.sinh(H);
            const f1 = f3 - 1.;
            const f0 = f2 - H - meanAnomaly;
            const f12 = 2. * f1;
            const d = f0 / f12;
            const fdf = f1 - d * f2;
            const ds = f0 / fdf;
            const shift = f0 / (fdf + ds * ds * f3 / 6.);

            H -= shift;

            if (Math.abs(shift) <= 1.0e-12) {
                return H;
            }

        } while (++iter < 50);

        throw new Error(format(ErrorMessages.UNABLE_TO_COMPUTE_HYPERBOLIC_ECCENTRIC_ANOMALY, iter));
    }

    /**
     * Computes the true anomaly from the hyperbolic eccentric anomaly
     *
     * @param H hyperbolic eccentric anomaly (rad)
     * @param e eccentricity
     * @return v the true anomaly
     */
    public static hyperbolicEccentricToTrue(H: number, e: number): number {
        return 2 * Math.atan(Math.sqrt((e + 1) / (e - 1)) * Math.tanh(H / 2));
    }

    /**
     * Computes the hyperbolic eccentric anomaly from the true anomaly
     *
     * @param v true anomaly (rad)
     * @param e – eccentricity
     * @return H the hyperbolic eccentric anomaly
     */
    public static trueToHyperbolicEccentric(v: number, e: number): number {
        const scv = FastMath.sinCos(v);
        const sinhH = Math.sqrt(e * e - 1) * scv.sin / (1 + e * scv.cos);
        return Math.asinh(sinhH);
    }

    /**
     * Computes the elliptic eccentric anomaly from the mean anomaly
     * <p>
     *     The algorithm used here for solving Kepler equation has been published
     *     in: "Procedures for  solving Kepler's Equation", A. W. Odell and R. H. Gooding, Celestial Mechanics 38 (1986) 307-334
     * </p>
     *
     * @param M mean anomaly (rad)
     * @param e eccentricity
     * @return E the eccentric anomaly
     */
    public static meanToEllipticEccentric(M: number, e: number): number {
        // reduce M to [-PI PI) interval
        const reducedM = MathUtils.normalizeAngle(M, 0.0);

        // compute start value according to A. W. Odell and R. H. Gooding S12 starter
        let E: number;
        if (Math.abs(reducedM) < 1.0 / 6.0) {
            E = reducedM + e * (Math.cbrt(6 * reducedM) - reducedM);
        } else {
            if (reducedM < 0) {
                const w = FastMath.PI + reducedM;
                E = reducedM + e * (KeplerianOrbit.A * w / (KeplerianOrbit.B - w) - FastMath.PI - reducedM);
            } else {
                const w = FastMath.PI - reducedM;
                E = reducedM + e * (FastMath.PI - KeplerianOrbit.A * w / (KeplerianOrbit.B - w) - reducedM);
            }
        }

        const e1 = 1 - e;
        const noCancellationRisk = (e1 + E * E / 6) >= 0.1;

        // perform two iterations, each consisting of one Halley step and one Newton-Raphson step
        for (let j = 0; j < 2; ++j) {
            let f: number;
            let fd: number;
            const sc = FastMath.sinCos(E);
            const fdd = e * sc.sin;
            const fddd = e * sc.cos;
            if (noCancellationRisk) {
                f = (E - fdd) - reducedM;
                fd = 1 - fddd;
            } else {
                f = KeplerianOrbit.eMeSinE(E, e) - reducedM;
                const s = Math.sin(0.5 * E);
                fd = e1 + 2 * e * s * s;
            }
            const dee = f * fd / (0.5 * f * fdd - fd * fd);

            // update eccentric anomaly, using expressions that limit underflow problems
            const w = fd + 0.5 * dee * (fdd + dee * fddd / 3);
            fd += dee * (fdd + 0.5 * dee * fddd);
            E -= (f - dee * (fd - w)) / fd;
        }

        // expand the result back to original range
        E += M - reducedM;

        return E;
    }

    /**
     * Computes the true anomaly from the elliptic eccentric anomaly
     *
     * @param E eccentric anomaly (rad)
     * @param e eccentricity
     * @return v the true anomaly
     */
    public static ellipticEccentricToTrue(E: number, e: number): number {
        const beta = e / (1 + Math.sqrt((1 - e) * (1 + e)));
        const scE = FastMath.sinCos(E);
        return E + 2 * Math.atan(beta * scE.sin / (1 - beta * scE.cos));
    }

    /**
     * Computes the elliptic eccentric anomaly from the true anomaly
     *
     * @param v true anomaly (rad)
     * @param e eccentricity
     * @return E the elliptic eccentric anomaly
     */
    public static trueToEllipticEccentric(v: number, e: number): number {
        const beta = e / (1 + Math.sqrt(1 - e * e));
        const scv = FastMath.sinCos(v);
        return v - 2 * Math.atan(beta * scv.sin / (1 + beta * scv.cos));
    }

    /**
     * Accurate computation of E - e sin(E)
     * <p>
     *     This method is used when E is close to 0 and e close to 1,
     *     i.e. near the perigee of almost parabolic orbits
     * </p>
     * @param E eccentric anomaly
     * @param e eccentricity
     * @return E - e sin(E)
     */
    private static eMeSinE(E: number, e: number): number {
        let x = (1 - e) * Math.sin(E);
        let mE2 = -E * E;
        let term = E;
        let d = 0;
        // the inequality test below IS intentional and should NOT be replaced by a check with a small tolerance
        for (let x0 = Number.NaN; x !== x0;) {
            d += 2;
            term *= mE2 / (d * (d + 1));
            x0 = x;
            x = x - term;
        }
        return x;
    }

    private static checkParameterRangeInclusive(parameterName: string, parameter: number, lowerBound: number, upperBound: number) {
        if (parameter < lowerBound || parameter > upperBound) {
            throw new Error(format(ErrorMessages.INVALID_PARAMETER_RANGE, parameterName, parameter, lowerBound, upperBound));
        }
    }
}