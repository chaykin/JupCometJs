/**
 * Arrays utilities
 */
export default class MathArrays {

    /**
     * Compute a linear combination.
     * <p>
     * This method computes a<sub>1</sub>&times;b<sub>1</sub> +
     * a<sub>2</sub>&times;b<sub>2</sub>
     */
    public static linearCombination(a1: number, b1: number, a2: number, b2: number): number {
        return a1 * b1 + a2 * b2;
    }

}