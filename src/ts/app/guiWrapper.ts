import {GUI, GUIController} from "three/examples/jsm/libs/dat.gui.module"
import GuiParameters, {KeplerianElements, Parameter} from "./guiParameters";

export default class GuiWrapper {
    private parameters: GuiParameters;

    private warpListener: ((warp: number) => void) | undefined;
    private startListener: ((parameters: GuiParameters) => void) | undefined;

    private prevWarp: number;

    constructor() {
        this.parameters = new GuiParameters();
        this.prevWarp = this.parameters.warp.value;

        const gui = new GUI({width: 510});
        const comet = gui.addFolder("Comet");
        GuiWrapper.addParameter(comet, this.parameters.comet.mass);
        GuiWrapper.addKeplerianElementParams(comet, this.parameters.comet.keplerianElements);
        comet.open();

        const sat = gui.addFolder("Satellite");
        GuiWrapper.addKeplerianElementParams(sat, this.parameters.sat);
        sat.open();

        const controller = GuiWrapper.addParameter(comet, this.parameters.warp).onFinishChange(() => {
            if (this.warpListener) {
                this.warpListener(this.parameters.warp.value);
            }
        });
        document.onkeydown = (e: KeyboardEvent) => this.onKeyDown(controller, e);

        gui.add({
            onStart: () => {
                if (this.startListener) {
                    this.startListener(this.parameters)
                }
            }
        }, "onStart").name("Start!");
    }

    public subscribeToWarpUpdate(warpListener: (warp: number) => void) {
        this.warpListener = warpListener;
    }

    public subscribeToStart(startListener: (parameters: GuiParameters) => void) {
        this.startListener = startListener;
    }

    private onKeyDown(controller: GUIController, e: KeyboardEvent) {
        switch (e.code) {
            case "Comma":
                controller.setValue(Math.max(this.parameters.warp.min, this.parameters.warp.value - 1));
                break;
            case "Period":
                controller.setValue(Math.min(this.parameters.warp.max, this.parameters.warp.value + 1));
                break;
            case "Space":
                if (this.parameters.warp.value === 0) {
                    controller.setValue(Math.min(this.parameters.warp.max, this.prevWarp));
                } else {
                    this.prevWarp = this.parameters.warp.value;
                    controller.setValue(0);
                }
                break;
        }
        if (this.warpListener) {
            this.warpListener(this.parameters.warp.value);
        }
    }

    private static addParameter(gui: GUI, param: Parameter): GUIController {
        return gui.add(param, "value", param.min, param.max, param.step).name(param.name);
    }

    private static addKeplerianElementParams(qui: GUI, keplerianElements: KeplerianElements) {
        GuiWrapper.addParameter(qui, keplerianElements.a);
        GuiWrapper.addParameter(qui, keplerianElements.e);
        GuiWrapper.addParameter(qui, keplerianElements.i);
        GuiWrapper.addParameter(qui, keplerianElements.pa);
        GuiWrapper.addParameter(qui, keplerianElements.raan);
        GuiWrapper.addParameter(qui, keplerianElements.ma);
    }
}