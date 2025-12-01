import Curve from "../../objects/Curve.js";
import { Point } from "../../objects/Point.js";
import { clearAllFields } from "../taskData/clearAllFields.js";
import Instruction from "../taskData/Instruction.js";
import BooleanField from "../taskData/BooleanField.js";

export default class Task92 {
    constructor(scene) {
        this.name = "Задача 9.2. Аппроксимация заданной от руки кривой кривой Безье";
        this.description = "Зажмите ЛКМ и проведите курсором для рисования кривой. После отпускания она будет аппроксимирована.";

        document.getElementById('task-name').innerText = this.name;
        document.getElementById('task-description').innerText = this.description;

        this.scene = scene;
        this.scene.task = this;

        this.inputPoints = [];
        this.bezierCurves = [];
        this.showInputPoints = true;
        this.isDrawing = false;

        this.init();

        clearAllFields();

        new BooleanField("Показывать исходные точки", this.showInputPoints, (value) => {
            this.showInputPoints = value;
            this.update();
        }, this.scene);

        new Instruction("Зажмите ЛКМ и рисуйте кривую.");
    }

    init() {
        this.inputPoints = [];
        this.bezierCurves = [];
        this.update();
    }

    onMouseDown(worldPos, scene) {
        this.isDrawing = true;
        this.inputPoints = [new Point(worldPos.x, worldPos.y, "blue", 2, "", false)];
        this.bezierCurves = [];
        this.update();
        return true; // Prevent panning
    }

    onMouseMove(worldPos, scene) {
        if (this.isDrawing) {
            // Add point if distance is enough
            const lastPoint = this.inputPoints[this.inputPoints.length - 1];
            const dist = Math.hypot(worldPos.x - lastPoint.x, worldPos.y - lastPoint.y);
            if (dist > 0.5) { // Threshold
                this.inputPoints.push(new Point(worldPos.x, worldPos.y, "blue", 2, "", false));
                this.update();
            }
            return true;
        }
        return false;
    }

    onMouseUp(worldPos, scene) {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.approximateCurve();
            this.update();
        }
    }

    approximateCurve() {
        // Subsample points to avoid too many segments
        const sampledPoints = [];
        if (this.inputPoints.length > 0) {
            sampledPoints.push(this.inputPoints[0]);
            for (let i = 1; i < this.inputPoints.length - 1; i++) {
                if (i % 5 === 0) { // Take every 5th point
                    sampledPoints.push(this.inputPoints[i]);
                }
            }
            sampledPoints.push(this.inputPoints[this.inputPoints.length - 1]);
        }
        
        this.bezierCurves = [];
        if (sampledPoints.length < 2) return;

        for (let i = 0; i < sampledPoints.length - 1; i++) {
            const p0 = sampledPoints[i];
            const p3 = sampledPoints[i + 1];

            const p1 = this.getControlPoint(sampledPoints, i, true);
            const p2 = this.getControlPoint(sampledPoints, i + 1, false);

            const curve = new Curve(false, false);
            curve.setPoints([p0, p1, p2, p3]);
            this.bezierCurves.push(curve);
        }
    }
    
    getControlPoint(points, index, isStart) {
        const p = points[index];
        let tangent = { x: 0, y: 0 };

        if (index === 0) {
            const next = points[index + 1];
            tangent.x = next.x - p.x;
            tangent.y = next.y - p.y;
        } else if (index === points.length - 1) {
            const prev = points[index - 1];
            tangent.x = p.x - prev.x;
            tangent.y = p.y - prev.y;
        } else {
            const prev = points[index - 1];
            const next = points[index + 1];
            tangent.x = (next.x - prev.x) / 2;
            tangent.y = (next.y - prev.y) / 2;
        }

        const factor = isStart ? 0.33 : -0.33;
        return new Point(
            p.x + tangent.x * factor,
            p.y + tangent.y * factor,
            "transparent",
            0,
            "",
            false
        );
    }

    update() {
        const objects = [...this.bezierCurves];
        if (this.showInputPoints) {
            objects.push(...this.inputPoints);
        }
        this.scene.objects = objects;
        this.scene.render();
    }
    
    softUpdate() {
        this.update();
    }
}
