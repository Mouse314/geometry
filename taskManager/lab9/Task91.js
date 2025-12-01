import Curve from "../../objects/Curve.js";
import { Point } from "../../objects/Point.js";

export default class Task91 {
    constructor(scene) {
        this.scene = scene;
        this.scene.task = this;

        this.curve = new Curve(true, true);
        this.points = [];

        this.init();
    }

    init() {
        this.points = [
            new Point(-10, -10, "red", 10, "", true),
            new Point(0, 10, "red", 10, "", true),
            new Point(10, -10, "red", 10, "", true),
            new Point(20, 10, "red", 10, "", true),
        ];

        this.curve.setPoints(this.points);

        this.scene.objects = [...this.points, this.curve];
    }

    update() {

    }

    softUpdate() {
        this.update();
    }
}