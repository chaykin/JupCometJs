import MathArrays from "../../../../utils/math/mathArrays";

export default class Vector {

    /**
     * Abscissa
     */
    public x: number;

    /**
     * Ordinate
     */
    public y: number;

    /**
     * Height
     */
    public z: number;


    /**
     * Simple constructor. Build a vector from its coordinates
     * @param x abscissa
     * @param y ordinate
     * @param z height
     */
    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * Linear constructor
     * Build a vector from two other ones and corresponding scale factors.
     * The vector built will be a1 * u1 + a2 * u2
     */
    public static new(a1: number, u1: Vector, a2: number, u2: Vector): Vector {
        const x = MathArrays.linearCombination(a1, u1.x, a2, u2.x);
        const y = MathArrays.linearCombination(a1, u1.y, a2, u2.y);
        const z = MathArrays.linearCombination(a1, u1.z, a2, u2.z);

        return new Vector(x, y, z);
    }
}