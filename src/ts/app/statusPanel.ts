import Simulator from "../gravmath/simulator/Simulator";

export default class StatusPanel {
    private static readonly MIN_SAFE_HEIGHT = 72000000;

    private readonly simulator: Simulator
    private readonly minDstEl: HTMLElement;
    private readonly minHeightEl: HTMLElement;
    private readonly dEEl: HTMLElement;
    private readonly statusEl: HTMLElement;

    private safe = true;

    constructor(simulator: Simulator) {
        this.simulator = simulator;

        this.minDstEl = <HTMLElement>document.getElementById("minDst");
        this.minHeightEl = <HTMLElement>document.getElementById("minHeight");
        this.statusEl = <HTMLElement>document.getElementById("status");
        this.dEEl = <HTMLElement>document.getElementById("DE");
    }

    public render() {
        const minDistance = this.simulator.getMinDistance();
        const minHeight = this.simulator.getMinHeight();
        const satDe = this.simulator.getSatDE();

        this.minDstEl.innerText = StatusPanel.formatNum(minDistance / 1000.0);
        this.minHeightEl.innerText = StatusPanel.formatNum(minHeight / 1000.0);
        this.dEEl.innerText = satDe.toString();

        this.safe = StatusPanel.MIN_SAFE_HEIGHT <= minHeight;
        if (this.safe) {
            this.statusEl.style.color = "#eee";
            this.statusEl.innerText = "Orbiting";
        } else {
            this.statusEl.style.color = "red";
            this.statusEl.innerText = "Burned!";
        }
    }

    public isSafe() {
        return this.safe;
    }

    private static formatNum(num: number): string {
        return new Intl.NumberFormat(navigator.language, {maximumFractionDigits: 2}).format(num);
    }
}