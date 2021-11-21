export default class FastMath {

    /**
     * Archimede's constant PI, ratio of circle circumference to diameter
     */
    public static readonly PI = 105414357.0 / 33554432.0 + 1.984187159361080883e-9;

    private static readonly LOG_MAX_VALUE = Math.log(Number.MAX_VALUE);

    /**
     * Returns the first argument with the sign of the second argument.
     * A NaN {@code sign} argument is treated as positive.
     *
     * @param magnitude the value to return
     * @param sign the sign for the returned value
     * @return the magnitude with the same sign as the {@code sign} argument
     */
    public static copySign(magnitude: number, sign: number): number {
        const absMagnitude = Math.abs(magnitude);
        return sign > 0 ? absMagnitude : -absMagnitude;
    }

    /**
     * Combined Sine and Cosine function.
     *
     * @param x Argument.
     * @return [sin(x), cos(x)]
     */
    public static sinCos(x: number): { sin: number, cos: number } {
        return {sin: Math.sin(x), cos: Math.cos(x)};
    }
}