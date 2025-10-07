import { Point } from "../../objects/Point.js";
import { Rect } from "../../objects/Rect.js";
import { Segment } from "../../objects/Segment.js";

export default class Task3 {
    constructor(scene) {
        this.scene = scene;

        this.scene.task = this;

        this.segment = new Segment(new Point(0, 0), new Point(1, 1), "red", true);
        this.point = new Point(0, 0, "blue", 5, "P", true);
        this.rect = new Rect(new Point(0, 0), new Point(1, 1), "green", true);

        this.init();
    }

    init() {
        this.scene.objects = [this.segment, this.point, this.rect];

        this.scene.render();

        console.log('Task 3 initialized');
    }

    update() {

    }

    softUpdate() {

    }
}