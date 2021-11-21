import Vector from "../geometry/euclidean/threed/vector";
import {G} from "../simulator/Simulator";

export default class Body {
    public readonly mass: number;
    public readonly mu: number;
    public readonly radius: number;

    public position: Vector;
    public velocity: Vector;
    public gravForce: Vector;

    private dtMassRatio = 0;

    constructor(mass: number, radius: number) {
        this.mass = mass;
        this.radius = radius;

        this.mu = G * mass;

        this.position = new Vector(0, 0, 0);
        this.velocity = new Vector(0, 0, 0);
        this.gravForce = new Vector(0, 0, 0);
    }

    public updateDt(dt: number) {
        this.dtMassRatio = dt / this.mass;
    }

    public getDtMassRatio() {
        return this.dtMassRatio;
    }
}