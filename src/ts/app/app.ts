import {Color, PerspectiveCamera, Scene, Vector3, WebGLRenderer} from "three";
import Stats from 'three/examples/jsm/libs/stats.module.js';
import {Renderer} from "three/src/renderers/WebGLRenderer";
import Body from "../gravmath/body/Body"
import KeplerianOrbit from "../gravmath/orbits/keplerianOrbit";
import GuiWrapper from "./guiWrapper";
import GuiParameters, {KeplerianElements} from "./guiParameters";
import Simulator from "../gravmath/simulator/Simulator";
import BodyFactory from "./bodyFactory";
import FastMath from "../utils/math/fastMath";
import SceneFactory from "./sceneFactory";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import BodyTail from "./bodyTail";
import StatusPanel from "./statusPanel";

export default class App {
    private static readonly SPEED_FACTOR = 1000;
    private static readonly SCALE_FACTOR = 1 / 1E6;

    private static readonly DEFAULT_CAM_POS = new Vector3(0, 0, 5000);

    private readonly renderer: Renderer;
    private readonly stats: Stats;
    private readonly scene: Scene;
    private readonly camera: PerspectiveCamera;
    private readonly controls: OrbitControls;

    private readonly jupiter = BodyFactory.createJupiter();

    private statusPanel: StatusPanel | undefined;
    private simulator: Simulator | undefined;
    private tails: BodyTail[] | undefined;
    private stepsPerFrame = 0;

    constructor(container: HTMLElement) {
        this.renderer = App.createRenderer(container);

        document.addEventListener('DOMContentLoaded', () => App.updateSize(this.renderer), false);
        window.addEventListener("resize", this.onWindowResize.bind(this), false);

        this.stats = Stats();
        container.appendChild(this.stats.dom);

        this.scene = new SceneFactory(App.SCALE_FACTOR, this.jupiter).createScene();
        this.camera = App.createCamera();
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableRotate = true;
        this.controls.enablePan = true;

        this.createGui();
    }

    public render() {
        requestAnimationFrame(this.render.bind(this));

        if (this.statusPanel?.isSafe()) {
            for (let i = 0; i < this.stepsPerFrame; i++) {
                this.simulator?.step();
            }
            this.tails?.forEach(t => t.render());
        }

        this.statusPanel?.render();
        this.renderer.render(this.scene, this.camera);
        this.stats.update();
    }

    private onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.controls.update();

        App.updateSize(this.renderer)
    }

    private createGui() {
        const gui = new GuiWrapper();
        gui.subscribeToWarpUpdate((warp: number) => this.updateStepsPerFrame(warp));
        gui.subscribeToStart((parameters: GuiParameters) => this.startSimulation(parameters));
    }

    private startSimulation(parameters: GuiParameters) {
        const comet = BodyFactory.createComet(parameters.comet.mass.value * 1000);
        const sat = BodyFactory.createSat();

        const cometOrbit = App.createOrbit(parameters.comet.keplerianElements, this.jupiter.mu);
        const satOrbit = App.createOrbit(parameters.sat, this.jupiter.mu);

        comet.position = cometOrbit.getPVCoordinates().position;
        comet.velocity = cometOrbit.getPVCoordinates().velocity;

        sat.position = satOrbit.getPVCoordinates().position;
        sat.velocity = satOrbit.getPVCoordinates().velocity

        const cometTail = new BodyTail(this.scene, App.SCALE_FACTOR, comet, new Color(0x0DCEB3));
        const satTail = new BodyTail(this.scene, App.SCALE_FACTOR, sat, new Color(0xFFFFFF));
        if (this.tails) {
            this.tails.forEach(t => t.cleanup());
        }
        this.tails = [cometTail, satTail];
        this.simulator = new Simulator(this.jupiter, comet, sat);
        this.statusPanel = new StatusPanel(this.simulator);

        this.updateStepsPerFrame(parameters.warp.value);
    }

    private updateStepsPerFrame(warp: number) {
        this.stepsPerFrame = App.SPEED_FACTOR * warp;
    }

    private static createOrbit(keplerianElements: KeplerianElements, mu: number): KeplerianOrbit {
        const a = keplerianElements.a.value * 1000;
        const e = keplerianElements.e.value;
        const i = FastMath.PI / 180.0 * keplerianElements.i.value;
        const pa = FastMath.PI / 180.0 * keplerianElements.pa.value;
        const raan = FastMath.PI / 180.0 * keplerianElements.raan.value;
        const m0 = FastMath.PI / 180.0 * keplerianElements.ma.value;

        return new KeplerianOrbit(a, e, i, pa, raan, m0, mu);
    }

    private static createCamera(): PerspectiveCamera {
        let camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 10, 200000);
        camera.position.set(App.DEFAULT_CAM_POS.x, App.DEFAULT_CAM_POS.y, App.DEFAULT_CAM_POS.z);

        return camera;
    }

    private static createRenderer(container: HTMLElement): WebGLRenderer {
        let renderer = new WebGLRenderer({antialias: true});
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.setClearColor(new Color("black"));
        renderer.setPixelRatio(window.devicePixelRatio);
        App.updateSize(renderer);

        container.appendChild(renderer.domElement);
        return renderer;
    }

    private static updateSize(renderer: Renderer) {
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

