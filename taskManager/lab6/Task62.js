import { Point } from "../../objects/Point.js";
import { Polygon } from "../../objects/Polygon.js";
import { clearAllFields } from "../taskData/clearAllFields.js";
import SelectField from "../taskData/SelectField.js";
import { PRESETS } from "./Pressets.js";

export default class Task62 {
    constructor(scene) {
        this.name = "Задача 2. Разбиение невыпуклого многоугольника на выпуклые части";
        this.description = "Рекурсивное разбиение невыпуклого многоугольника на минимальное количество выпуклых частей.";
        document.getElementById('task-name').innerText = this.name;
        document.getElementById('task-description').innerText = this.description;
        this.scene = scene;
        this.scene.task = this;
        this.polygons = [];
        this.presetIndex = 0;
        this.init();
        this.scene.render();

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

    // Оптимальное разбиение с мемоизацией
    decompose(polygon, result, memo) {
        if (!memo) memo = new Map();
        if (this.isConvex(polygon)) {
            result.push(polygon);
            return 1;
        }
        const n = polygon.vertices.length;
        const key = polygon.vertices.map(v => v.x + ',' + v.y).join('|');
        if (memo.has(key)) {
            const polys = memo.get(key);
            for (const p of polys) result.push(p);
            return polys.length;
        }
        let minParts = Infinity;
        let bestDecomp = null;
        for (let i = 0; i < n; i++) {
            for (let j = i + 2; j < n; j++) {
                if ((j + 1) % n === i) continue;
                if (this.isDiagonal(polygon, i, j)) {
                    const poly1 = new Polygon([], polygon.color, false, false, true);
                    const poly2 = new Polygon([], polygon.color, false, false, true);
                    for (let k = i; k !== j; k = (k + 1) % n) poly1.vertices.push(polygon.vertices[k]);
                    poly1.vertices.push(polygon.vertices[j]);
                    for (let k = j; k !== i; k = (k + 1) % n) poly2.vertices.push(polygon.vertices[k]);
                    poly2.vertices.push(polygon.vertices[i]);
                    let temp = [];
                    const parts1 = this.decompose(poly1, temp, memo);
                    const parts2 = this.decompose(poly2, temp, memo);
                    if (parts1 + parts2 < minParts) {
                        minParts = parts1 + parts2;
                        bestDecomp = temp;
                    }
                }
            }
        }
        if (minParts === Infinity) {
            result.push(polygon);
            memo.set(key, [polygon]);
            return 1;
        } else {
            for (const p of bestDecomp) result.push(p);
            memo.set(key, bestDecomp);
            return minParts;
        }
    }

    calculate() {
        this.polygons = [];
        this.decompose(this.original, this.polygons);
    }

    update() {
        this.calculate();
        this.scene.objects = [this.original, ...this.polygons];
    }

    softUpdate() {}
}
