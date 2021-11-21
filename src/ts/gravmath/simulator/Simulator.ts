import Body from "../body/Body";

export const G = 6.67408E-11;

export default class Simulator {
    private static readonly DT = 0.05;

    private readonly jupiter: Body;
    private readonly comet: Body;
    private readonly sat: Body;
    private readonly startSatE: number;

    private minDistance = Number.MAX_VALUE;
    private minHeight = Number.MAX_VALUE;

    public constructor(jupiter: Body, comet: Body, sat: Body) {
        this.jupiter = jupiter;
        this.comet = comet;
        this.sat = sat;
        this.startSatE = this.calcSatE();

        jupiter.updateDt(Simulator.DT);
        comet.updateDt(Simulator.DT);
        sat.updateDt(Simulator.DT);
    }

    public step() {
        this.calcForces();
        this.applyForces();
    }

    public getMinHeight(): number {
        return this.minHeight;
    }

    public getMinDistance(): number {
        return this.minDistance;
    }

    public getSatDE():number {
        return this.calcSatE() - this.startSatE;
    }


    private calcForces() {
        const height = Simulator.calcForce(this.sat, this.jupiter)
        if (this.minHeight > height) {
            this.minHeight = height;
        }

        const distance = Simulator.calcForce(this.sat, this.comet);
        if (this.minDistance > distance) {
            this.minDistance = distance;
        }

        Simulator.calcForce(this.comet, this.jupiter);
    }

    applyForces() {
        Simulator.applyForce(this.sat);
        Simulator.applyForce(this.comet);
    }

    private calcSatE() {
        const sqrV = this.sat.velocity.x * this.sat.velocity.x + this.sat.velocity.y * this.sat.velocity.y + this.sat.velocity.z * this.sat.velocity.z;
        const dx = this.sat.position.x - this.jupiter.position.x;
        const dy = this.sat.position.y - this.jupiter.position.y;
        const dz = this.sat.position.z - this.jupiter.position.z;
        const r = Math.sqrt(dx * dx + dy * dy + dz * dz);

        return sqrV - 2 * this.jupiter.mu / r;
    }

    private static calcForce(b1: Body, b2: Body): number {
        const dx = b2.position.x - b1.position.x;
        const dy = b2.position.y - b1.position.y;
        const dz = b2.position.z - b1.position.z;
        const squareDst = dx * dx + dy * dy + dz * dz;
        const dst = Math.sqrt(squareDst);

        const fScalar = b1.mu * b2.mass / (squareDst * dst);

        b1.gravForce.x += fScalar * dx;
        b1.gravForce.y += fScalar * dy;
        b1.gravForce.z += fScalar * dz;

        return dst;
    }

    private static applyForce(b: Body) {
        const dtMassRatio = b.getDtMassRatio();
        b.velocity.x += b.gravForce.x * dtMassRatio;
        b.velocity.y += b.gravForce.y * dtMassRatio;
        b.velocity.z += b.gravForce.z * dtMassRatio;

        b.position.x += b.velocity.x * Simulator.DT;
        b.position.y += b.velocity.y * Simulator.DT;
        b.position.z += b.velocity.z * Simulator.DT;

        b.gravForce.x = 0;
        b.gravForce.y = 0;
        b.gravForce.z = 0;
    }
}