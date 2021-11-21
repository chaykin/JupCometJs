import Body from "../gravmath/body/Body"
import {BufferAttribute, BufferGeometry, Color, Line, LineBasicMaterial, Scene} from "three";

export default class BodyTail {
    private static readonly DIM = 3;
    private static readonly TAIL_SIZE = 4096;

    private readonly scene: Scene;
    private readonly scaleFactor: number;
    private readonly body: Body;
    private readonly bufAttr: BufferAttribute;
    private readonly bufArr: Float32Array;
    private readonly line: Line;

    constructor(scene: Scene, scaleFactor: number, body: Body, color: Color) {
        this.scene = scene;
        this.scaleFactor = scaleFactor;
        this.body = body;

        this.bufArr = new Float32Array(BodyTail.TAIL_SIZE * BodyTail.DIM);
        this.bufAttr = new BufferAttribute(this.bufArr, BodyTail.DIM);

        const material = new LineBasicMaterial({color: color, linewidth: 2});
        const geometry = new BufferGeometry();
        geometry.setAttribute('position', this.bufAttr);
        geometry.setDrawRange(0, 0);

        this.line = new Line(geometry, material);
        scene.add(this.line);

        this.render();
    }

    public render() {
        let startIndex = BodyTail.DIM * this.line.geometry.drawRange.count;
        if (this.line.geometry.drawRange.count >= BodyTail.TAIL_SIZE) {
            startIndex -= BodyTail.DIM;
            this.bufArr.copyWithin(0, BodyTail.DIM);
        } else {
            this.line.geometry.setDrawRange(0, this.line.geometry.drawRange.count + 1);
        }

        this.bufArr[startIndex] = this.body.position.x * this.scaleFactor;
        this.bufArr[startIndex + 1] = this.body.position.y * this.scaleFactor;
        this.bufArr[startIndex + 2] = this.body.position.z * this.scaleFactor;

        this.line.geometry.attributes.position.needsUpdate = true;
        this.line.geometry.computeBoundingBox();
        this.line.geometry.computeBoundingSphere();
    }

    public cleanup() {
        this.scene.remove(this.line);
    }
}