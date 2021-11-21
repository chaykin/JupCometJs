import {
    AmbientLight,
    BoxGeometry,
    DirectionalLight,
    Mesh, MeshBasicMaterial,
    MeshPhongMaterial,
    Scene,
    SphereGeometry, TextureLoader,
    Vector3
} from "three";
import Body from "../gravmath/body/Body"

export default class SceneFactory {
    private static readonly DIRECT_LIGHT_POS = new Vector3(10, 10, 5);
    private static readonly SEGMENTS = 256;

    private readonly scene = new Scene();
    private readonly scaleFactor: number;
    private readonly jupiter: Body;

    constructor(scaleFactor: number, jupiter: Body) {
        this.scaleFactor = scaleFactor;
        this.jupiter = jupiter;
    }

    public createScene(): Scene {
        this.addLights();
        this.addJupiter();

        return this.scene;
    }

    private addLights() {
        const directLight = new DirectionalLight();
        directLight.position.set(SceneFactory.DIRECT_LIGHT_POS.x, SceneFactory.DIRECT_LIGHT_POS.y, SceneFactory.DIRECT_LIGHT_POS.z);

        this.scene.add(directLight);
        this.scene.add(new AmbientLight());
    }

    private addJupiter() {
        const radius = this.scaleFactor * this.jupiter.radius;

        const geometry = new SphereGeometry(radius, SceneFactory.SEGMENTS, SceneFactory.SEGMENTS);
        const material = new MeshPhongMaterial({color: 0xAE7E5E});
        const mesh = new Mesh(geometry, material);

        this.scene.add(mesh);
    }
}
