import { Point } from "../../objects/Point.js";
import { Polygon } from "../../objects/Polygon.js";

export default class Task51 {
    constructor(scene) {
        this.scene = scene;
        this.scene.task = this;

        this.N = 10;

        this.points = [];

        this.hull = [];
        this.hullGeometry = null;

        this.init();
    }

    init() {
        this.points = [];
        for (let i = 0; i < this.N; i++) {
            const x = 10 - Math.random() * 20;
            const y = 10 - Math.random() * 20;
            this.points.push(new Point(x, y, "blue", 5, "P", true));
        }

        this.scene.objects = [...this.points];
        this.scene.render();
    }

    createHull() {
        this.hullGeometry = null;
        
        const massCenterPoint = this.getMassCenter();
        
        for (let point of this.points) {
            point.angle = Math.atan2(point.y - massCenterPoint.y, point.x - massCenterPoint.x);
            point.name = `${point.angle}`;
        }
        
        this.points.sort((a, b) => a.angle - b.angle);

        this.hull = [...this.points];
        let ind = 0;

        while (ind < this.hull.length) {
            const p1 = this.hull[ind % this.hull.length];
            const p2 = this.hull[(ind + 1) % this.hull.length];
            const p3 = this.hull[(ind + 2) % this.hull.length];

            const cross = (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);

            if (cross < 0) {
                this.hull.splice(ind + 1, 1);
                ind -= 1;
            }
            ind += 1;
            if (ind > this.N) break;
        }

        this.hullGeometry = new Polygon(this.hull, "green");
    }

    getMassCenter() {
        const xSum = this.points.reduce((sum, p) => sum + p.x, 0);
        const ySum = this.points.reduce((sum, p) => sum + p.y, 0);
        return new Point(xSum / this.N, ySum / this.N, "red", 5, "C", true);
    }

    update() {
        this.createHull();
        this.scene.objects = [...this.points, this.hullGeometry];
        this.scene.render();
    }

    softUpdate() {
        this.update();
    }
}