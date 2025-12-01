import { Point } from "../../objects/Point.js";
import { Segment } from "../../objects/Segment.js";
import { Rect } from "../../objects/Rect.js";
import TextInputfield from "../taskData/TextInputfield.js";
import SelectField from "../taskData/SelectField.js";
import { clearAllFields } from "../taskData/clearAllFields.js";
import Instruction from "../taskData/Instruction.js";
import { Polygon } from "../../objects/Polygon.js";

export default class Task81 {
	constructor(scene) {
		this.name = "Задача 8.1. Отсечение отрезка прямоугольным окном";
		this.description = "Выберите алгоритм отсечения";

		document.getElementById('task-name').innerText = this.name;
		document.getElementById('task-description').innerText = this.description;

		this.scene = scene;
		scene.task = this;

		this.N = 1;
		this.points = [];
		this.segments = [];
		this.rect = null;
		this.clippedSegments = [];

		this.presets = [
			{
				name: "Касание в точке",
				segments: [
					[new Point(-4, 4), new Point(0, 8)]
				],
				rect: { center: new Point(0, 0), scale: { x: 8, y: 8 } }
			},
			{
				name: "Лежит на границе",
				segments: [
					[new Point(-4, 4), new Point(4, 4)]
				],
				rect: { center: new Point(0, 0), scale: { x: 8, y: 8 } }
			},
			{
				name: "Полностью внутри",
				segments: [
					[new Point(-2, -2), new Point(2, 2)]
				],
				rect: { center: new Point(0, 0), scale: { x: 8, y: 8 } }
			},
			{
				name: "Полностью вне",
				segments: [
					[new Point(-10, -10), new Point(-8, -8)]
				],
				rect: { center: new Point(0, 0), scale: { x: 8, y: 8 } }
			},
			{
				name: "Пересекает угол",
				segments: [
					[new Point(-10, 8), new Point(8, -10)]
				],
				rect: { center: new Point(0, 0), scale: { x: 8, y: 8 } }
			},
			{
				name: "Пересекает две стороны",
				segments: [
					[new Point(-10, 0), new Point(10, 0)]
				],
				rect: { center: new Point(0, 0), scale: { x: 8, y: 8 } }
			},
			{
				name: "Выпуклый многоугольник (Клирус-Бек)",
				segments: [
					[new Point(0, 0), new Point(8, 8)],
					[new Point(2, 7), new Point(7, 2)],
					[new Point(-2, 4), new Point(6, 4)]
				],
				polygon: [
					new Point(2, 2),
					new Point(6, 2),
					new Point(8, 4),
					new Point(6, 7),
					new Point(2, 7),
					new Point(0, 4)
				]
			}
		];

		this.algorithms = [
			{ value: "cohen-sutherland", label: "Коэн-Сазерленд" },
			{ value: "cyrus-beck", label: "Клирус-Бек" },
			{ value: "sutherland-sproull", label: "Спрулл-Сазерленд" }
		];
		this.selectedAlgorithm = this.algorithms[0].value;
		this.presetIndex = 0;

		this.init();

		clearAllFields();

		new SelectField(
			"Алгоритм отсечения",
			this.selectedAlgorithm,
			this.algorithms,
			(value) => {
				this.selectedAlgorithm = value;
				this.update();
			},
			this.scene
		);

		new SelectField(
			"Пресет",
			this.presetIndex,
			this.presets.map((p, i) => ({ value: i, label: p.name })),
			(value) => {
				this.presetIndex = Number(value);
				this.setPreset();
			},
			this.scene
		);

		new Instruction("ЛКМ по углам - масштабирование прямоугольника\nSHIFT + ЛКМ - перемещение\nПеремещайте концы отрезков для тестирования отсечения");
	}

	init() {
		this.setPreset();
	}

	setPreset() {
		this.segments = [];
		const preset = this.presets[this.presetIndex];
		this.polygon = null;
		for (const seg of preset.segments) {
			this.segments.push(new Segment(seg[0], seg[1], "yellow", 3, true));
		}
		if (preset.polygon) {
			this.polygon = new Polygon(preset.polygon, "blue", true, true, false);
			this.rect = null;
		} else {
			this.polygon = null;
			this.rect = new Rect(preset.rect.center, preset.rect.scale, "cyan", "", true);
		}
		this.update();
	}

	update() {
		this.clippedSegments = [];
		let objects = [];
		if (this.polygon) {
			// Всегда отображаем polygon, даже если rect определён
			objects = [this.polygon];
			if (this.segments.length > 0) {
				const seg = this.segments[0];
				objects.push(seg);
				let clipped = null;
				if (this.selectedAlgorithm === "cohen-sutherland") {
					clipped = this.cohenSutherlandClip(seg, this.polygon);
				} else if (this.selectedAlgorithm === "cyrus-beck") {
					clipped = this.cyrusBeckClip(seg, this.polygon);
				} else if (this.selectedAlgorithm === "sutherland-sproull") {
					clipped = this.sutherlandSproullClip(seg, this.polygon);
				}
				if (clipped) objects.push(clipped);
			}
		} else if (this.rect) {
			// Только rect, только первый отрезок, только результат отсечения
			objects = [this.rect];
			if (this.segments.length > 0) {
				const seg = this.segments[0];
				objects.push(seg);
				let clipped = null;
				if (this.selectedAlgorithm === "cohen-sutherland") {
					clipped = this.cohenSutherlandClip(seg, this.rect);
				} else if (this.selectedAlgorithm === "cyrus-beck") {
					clipped = this.cyrusBeckClip(seg, this.rect);
				} else if (this.selectedAlgorithm === "sutherland-sproull") {
					clipped = this.sutherlandSproullClip(seg, this.rect);
				}
				if (clipped) objects.push(clipped);
			}
		}
		this.scene.objects = objects;
		this.scene.render();
	}

    softUpdate() {
        this.update();
    }

	// --- Алгоритмы отсечения ---
	// 1. Коэн-Сазерленд
	cohenSutherlandClip(segment, rect) {
		// Коэн-Сазерленд
		// Определяем границы окна
		const xmin = rect.center.x - rect.scale.x / 2;
		const xmax = rect.center.x + rect.scale.x / 2;
		const ymin = rect.center.y - rect.scale.y / 2;
		const ymax = rect.center.y + rect.scale.y / 2;

		// Коды регионов
		function computeCode(x, y) {
			let code = 0;
			if (x < xmin) code |= 1; // слева
			if (x > xmax) code |= 2; // справа
			if (y < ymin) code |= 4; // ниже
			if (y > ymax) code |= 8; // выше
			return code;
		}

		let x1 = segment.startPoint.x, y1 = segment.startPoint.y;
		let x2 = segment.endPoint.x, y2 = segment.endPoint.y;
		let code1 = computeCode(x1, y1);
		let code2 = computeCode(x2, y2);
		let accept = false;

		while (true) {
			if (!(code1 | code2)) {
				accept = true;
				break;
			} else if (code1 & code2) {
				break;
			} else {
				let codeOut = code1 ? code1 : code2;
				let x, y;
				if (codeOut & 8) { // выше
					x = x1 + (x2 - x1) * (ymax - y1) / (y2 - y1);
					y = ymax;
				} else if (codeOut & 4) { // ниже
					x = x1 + (x2 - x1) * (ymin - y1) / (y2 - y1);
					y = ymin;
				} else if (codeOut & 2) { // справа
					y = y1 + (y2 - y1) * (xmax - x1) / (x2 - x1);
					x = xmax;
				} else if (codeOut & 1) { // слева
					y = y1 + (y2 - y1) * (xmin - x1) / (x2 - x1);
					x = xmin;
				}
				if (codeOut === code1) {
					x1 = x; y1 = y; code1 = computeCode(x1, y1);
				} else {
					x2 = x; y2 = y; code2 = computeCode(x2, y2);
				}
			}
		}
		if (accept) {
			return new Segment(new Point(x1, y1, "green", 5, "", false), new Point(x2, y2, "green", 5, "", false), "green", 10, false);
		}
		return null;
	}

	// 2. Клирус-Бек для произвольного выпуклого многоугольника
	cyrusBeckClip(segment, rect) {
		// Получаем вершины окна (Polygon или Rect)
		let vertices = [];
		if (rect.vertices) {
			vertices = rect.vertices;
		} else {
			// Rect: вычисляем 4 вершины
			const cx = rect.center.x, cy = rect.center.y;
			const sx = rect.scale.x / 2, sy = rect.scale.y / 2;
			vertices = [
				new Point(cx - sx, cy - sy),
				new Point(cx + sx, cy - sy),
				new Point(cx + sx, cy + sy),
				new Point(cx - sx, cy + sy)
			];
		}

		const p0 = segment.startPoint;
		const p1 = segment.endPoint;
		const d = { x: p1.x - p0.x, y: p1.y - p0.y };

		let tE = 0, tL = 1;
		const nVerts = vertices.length;
		for (let i = 0; i < nVerts; i++) {
			const a = vertices[i];
			const b = vertices[(i + 1) % nVerts];
			// Вектор стороны
			const edge = { x: b.x - a.x, y: b.y - a.y };
			// Внешняя нормаль (перпендикуляр, направлен наружу)
			const normal = { x: edge.y, y: -edge.x };
			// Точка на стороне
			const pE = a;
			// w = p0 - pE
			const w = { x: p0.x - pE.x, y: p0.y - pE.y };
			const D = d.x * normal.x + d.y * normal.y;
			const N = -(w.x * normal.x + w.y * normal.y);
			if (D === 0) {
				if (N < 0) return null; // вне окна
				else continue;
			}
			const t = N / D;
			if (D < 0) {
				if (t > tL) return null;
				if (t > tE) tE = t;
			} else {
				if (t < tE) return null;
				if (t < tL) tL = t;
			}
		}
		if (tE > tL) return null;
		const clipA = new Point(p0.x + d.x * tE, p0.y + d.y * tE, "purple", 5, "", false);
		const clipB = new Point(p0.x + d.x * tL, p0.y + d.y * tL, "purple", 5, "", false);
		return new Segment(clipA, clipB, "purple", 10, false);
	}

	// 3. Спрулл-Сазерленд
	sutherlandSproullClip(segment, rect) {
		// Спрулл-Сазерленд (Sutherland-Hodgman для отрезка и прямоугольника)
		// Отсекаем отрезок по каждой стороне окна
		const xmin = rect.center.x - rect.scale.x / 2;
		const xmax = rect.center.x + rect.scale.x / 2;
		const ymin = rect.center.y - rect.scale.y / 2;
		const ymax = rect.center.y + rect.scale.y / 2;

		let x1 = segment.startPoint.x, y1 = segment.startPoint.y;
		let x2 = segment.endPoint.x, y2 = segment.endPoint.y;

		function clipSide(p1, p2, side) {
			let inside = (pt) => {
				if (side === "left") return pt.x >= xmin;
				if (side === "right") return pt.x <= xmax;
				if (side === "bottom") return pt.y >= ymin;
				if (side === "top") return pt.y <= ymax;
			};
			let intersect = (a, b) => {
				if (side === "left" || side === "right") {
					const xEdge = side === "left" ? xmin : xmax;
					const t = (xEdge - a.x) / (b.x - a.x);
					return new Point(xEdge, a.y + (b.y - a.y) * t, "orange", 5, "", false);
				} else {
					const yEdge = side === "bottom" ? ymin : ymax;
					const t = (yEdge - a.y) / (b.y - a.y);
					return new Point(a.x + (b.x - a.x) * t, yEdge, "orange", 5, "", false);
				}
			};
			const pt1 = new Point(p1.x, p1.y, "", 0, "", false);
			const pt2 = new Point(p2.x, p2.y, "", 0, "", false);
			if (inside(pt1) && inside(pt2)) return [pt1, pt2];
			if (!inside(pt1) && !inside(pt2)) return null;
			if (inside(pt1)) return [pt1, intersect(pt1, pt2)];
			if (inside(pt2)) return [intersect(pt1, pt2), pt2];
			return null;
		}

		let sides = ["left", "right", "bottom", "top"];
		let pts = [new Point(x1, y1, "", 0, "", false), new Point(x2, y2, "", 0, "", false)];
		for (let side of sides) {
			if (!pts) break;
			pts = clipSide(pts[0], pts[1], side);
		}
		if (pts) {
			return new Segment(pts[0], pts[1], "blue", 10, false);
		}
		return null;
	}
}