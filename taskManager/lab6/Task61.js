import { Point } from "../../objects/Point.js";
import { Polygon } from "../../objects/Polygon.js";
import Triangle from "../../objects/Triangle.js";

export default class Task61 {
    constructor(scene) {
        this.name = "Задача 1. Разбиение выпуклого многоугольника на треугольники";
        this.description = "Данная задача заключается в разбиении выпуклого многоугольника на треугольники с помощью диагоналей.";

        document.getElementById('task-name').innerText = this.name;
        document.getElementById('task-description').innerText = this.description;

        this.scene = scene;
        this.scene.task = this;

        this.polygon = null;
        this.triangles = [];

        this.init();
        this.scene.render();
    }

    init() {
        this.polygon = new Polygon([new Point(0, 0), new Point(10, 0), new Point(10, 10), new Point(0, 10)], "green", true, true);

        this.update();
    }

    calculate() {
        this.triangles = [];
        const startVertex = this.polygon.vertices[0];
        for (let i = 1; i < this.polygon.vertices.length; i++) {
            const v1 = this.polygon.vertices[i];
            const v2 = this.polygon.vertices[(i + 1) % this.polygon.vertices.length];
            this.triangles.push(new Triangle([v1, v2, startVertex], "red", 2, true, true));
        }
    }

    update() {
        this.calculate();
        this.scene.objects = [this.polygon, ...this.triangles];
    }

    softUpdate() {

    }
}