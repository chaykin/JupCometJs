import Body from "../gravmath/body/Body";

export default class BodyFactory {

    public static createJupiter(): Body {
        return new Body(1.8986E27, 69911000);
    }

    public static createSat(): Body {
        return new Body(1000, 3);
    }

    public static createComet(mass: number): Body {
        return new Body(mass, 100000);
    }
}