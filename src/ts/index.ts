import {WEBGL} from "three/examples/jsm/WebGL"
import App from "./app/app";
import App2 from "./app/App2";

if (WEBGL.isWebGLAvailable()) {
    new App(<HTMLElement>document.getElementById('appContainer')).render();
    //new App2(<HTMLElement>document.getElementById('appContainer'));
} else {
    const warning = WEBGL.getWebGLErrorMessage();
    warning.id = "webgl-error-message";

    document.body.appendChild(warning);
}

document.getElementById("loading")?.remove();
