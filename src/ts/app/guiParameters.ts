const MIN_DEG = 0;
const MAX_DEG = 359.9;

export default class GuiParameters {
    public comet: { mass: Parameter, keplerianElements: KeplerianElements };
    public sat: KeplerianElements;
    public warp: Parameter;

    constructor() {
        this.comet = {
            //mass: {name: "Mass (ton)", value: 1E11, min: 1E7, max: 1E13, step: 1000},
            mass: {name: "Mass (ton)", value: 5E18, min: 1E7, max: 1E31, step: 1000},
            keplerianElements: createKeplerianElements(-1800000, -1E10, -50000, 2, 0, 0, 0, -125)
        };

        this.sat = createKeplerianElements(1200000, 50000, 1E10, 0.93, 0, 135, 0, -13.38);
        this.warp = {name: "Warp", value: 20, min: 0, max: 25, step: 1}
    }
}

function createKeplerianElements(a: number, minA: number, maxA: number, e: number, i: number, pa: number, raan: number, ma: number): KeplerianElements {
    return {
        a: {name: "Semi-major axis (a, km)", value: a, min: minA, max: maxA, step: 0.01},
        e: {name: "Eccentricity (e)", value: e, min: a > 0 ? 0 : 1.01, max: a > 0 ? 0.99 : 10, step: 0.0001},
        i: {name: "Inclination (i, deg)", value: i, min: MIN_DEG, max: MAX_DEG, step: 0.001},
        pa: {name: "Perigee Argument (ω, deg)", value: pa, min: MIN_DEG, max: MAX_DEG, step: 0.001},
        raan: {name: "Longitude of Ascending Node (Ω, deg)", value: raan, min: MIN_DEG, max: MAX_DEG, step: 0.001},
        ma: {name: "Mean anomaly (M<sub>0</sub>, deg)", value: ma, min: -2 * MAX_DEG, max: 2 * MAX_DEG, step: 0.001},
    }
}

export type KeplerianElements = {
    a: Parameter,
    e: Parameter,
    i: Parameter,
    pa: Parameter,
    raan: Parameter,
    ma: Parameter
}

export type Parameter = {
    name: string,
    value: number,
    min: number,
    max: number,
    step: number
}