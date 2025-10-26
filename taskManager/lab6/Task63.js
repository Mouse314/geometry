import { Point } from "../../objects/Point.js";
import { Polygon } from "../../objects/Polygon.js";
import { clearAllFields } from "../taskData/clearAllFields.js";
import SelectField from "../taskData/SelectField.js";
import { PRESETS } from "./Pressets.js";

export default class Task63 {
    constructor(scene) {
        this.name = "Задача 3. Триангуляция невыпуклого многоугольника";
        this.description = "Разбиение невыпуклого многоугольника на треугольники (триангуляция).";
        document.getElementById('task-name').innerText = this.name;
        document.getElementById('task-description').innerText = this.description;
        this.scene = scene;
        this.scene.task = this;
        this.triangles = [];
        this.presetIndex = 0;

        this.presets = PRESETS;

        clearAllFields();

        new SelectField(
            'Фигура-пресет',
            this.presetIndex,
            this.presets.map((p, i) => ({ value: i, label: p.name })),
            (value) => {
                this.presetIndex = Number(value);
                this.setPreset();
            },
            this.scene
        );
        this.init();
        this.scene.render();
    }

    setPreset() {
        this.original = new Polygon(
            PRESETS[this.presetIndex].points.map(pt => new Point(pt.x, pt.y)),
            "orange", true, true
        );
        this.update();
        this.scene.render();
    }

    init() {
        this.setPreset();
    }

    isConvex(polygon) {
        const n = polygon.vertices.length;
        if (n < 4) return true;
        let sign = 0;
        for (let i = 0; i < n; i++) {
            const dx1 = polygon.vertices[(i + 2) % n].x - polygon.vertices[(i + 1) % n].x;
            const dy1 = polygon.vertices[(i + 2) % n].y - polygon.vertices[(i + 1) % n].y;
            const dx2 = polygon.vertices[i].x - polygon.vertices[(i + 1) % n].x;
            const dy2 = polygon.vertices[i].y - polygon.vertices[(i + 1) % n].y;
            const zcross = dx1 * dy2 - dy1 * dx2;
            if (zcross !== 0) {
                if (sign === 0) sign = Math.sign(zcross);
                else if (sign !== Math.sign(zcross)) return false;
            }
        }
        return true;
    }

    pointInPolygon(point, polygon) {
        let cnt = 0;
        for (let i = 0, n = polygon.vertices.length; i < n; i++) {
            const a = polygon.vertices[i];
            const b = polygon.vertices[(i + 1) % n];
            if (((a.y > point.y) !== (b.y > point.y)) &&
                (point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y + 1e-12) + a.x)) {
                cnt++;
            }
        }
        return cnt % 2 === 1;
    }

    isDiagonal(polygon, i, j) {
        if (Math.abs(i - j) === 1 || Math.abs(i - j) === polygon.vertices.length - 1) return false;
        const a = polygon.vertices[i], b = polygon.vertices[j];
        for (let k = 0; k < polygon.vertices.length; k++) {
            const c = polygon.vertices[k];
            const d = polygon.vertices[(k + 1) % polygon.vertices.length];
            if (k === i || (k + 1) % polygon.vertices.length === i || k === j || (k + 1) % polygon.vertices.length === j) continue;
            if (this.segmentsIntersect(a, b, c, d)) return false;
        }
        const mid = new Point((a.x + b.x) / 2, (a.y + b.y) / 2);
        return this.pointInPolygon(mid, polygon);
    }

    segmentsIntersect(a, b, c, d) {
        function ccw(p1, p2, p3) {
            return (p3.y - p1.y) * (p2.x - p1.x) > (p2.y - p1.y) * (p3.x - p1.x);
        }
        return (ccw(a, c, d) !== ccw(b, c, d)) && (ccw(a, b, c) !== ccw(a, b, d));
    }

    // Проверка, является ли угол в вершине i выпуклым
    isConvexVertex(vertices, i) {
        const n = vertices.length;
        const a = vertices[(i - 1 + n) % n];
        const b = vertices[i];
        const c = vertices[(i + 1) % n];
        const cross = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
        return cross > 0; // для обхода против часовой стрелки
    }

    // Проверка, содержит ли треугольник другие вершины
    triangleContainsOther(vertices, i) {
        const n = vertices.length;
        const a = vertices[(i - 1 + n) % n];
        const b = vertices[i];
        const c = vertices[(i + 1) % n];
        for (let j = 0; j < n; j++) {
            if (j === (i - 1 + n) % n || j === i || j === (i + 1) % n) continue;
            if (this.pointInTriangle(vertices[j], a, b, c)) return true;
        }
        return false;
    }

    // Проверка, лежит ли точка p внутри треугольника abc
    pointInTriangle(p, a, b, c) {
        function sign(p1, p2, p3) {
            return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
        }
        const d1 = sign(p, a, b);
        const d2 = sign(p, b, c);
        const d3 = sign(p, c, a);
        const has_neg = (d1 < 0) || (d2 < 0) || (d3 < 0);
        const has_pos = (d1 > 0) || (d2 > 0) || (d3 > 0);
        return !(has_neg && has_pos);
    }

    // Алгоритм ушей (ear clipping)
    triangulate(polygon, result) {
        let vertices = polygon.vertices.slice();
        while (vertices.length > 3) {
            let earFound = false;
            for (let i = 0; i < vertices.length; i++) {
                if (this.isConvexVertex(vertices, i) && !this.triangleContainsOther(vertices, i)) {
                    // Ухо найдено
                    const a = vertices[(i - 1 + vertices.length) % vertices.length];
                    const b = vertices[i];
                    const c = vertices[(i + 1) % vertices.length];
                    result.push(new Polygon([a, b, c], "red", false, false, true));
                    vertices.splice(i, 1);
                    earFound = true;
                    break;
                }
            }
            if (!earFound) break; // не нашли ухо — возможно, самопересечение
        }
        if (vertices.length === 3) {
            result.push(new Polygon([...vertices], "red", false, false, true));
        }
    }

    calculate() {
        this.triangles = [];
        this.triangulate(this.original, this.triangles);
    }

    update() {
        this.calculate();
        this.scene.objects = [this.original, ...this.triangles];
    }

    softUpdate() {}
}
