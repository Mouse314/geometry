import { Graph } from "../../objects/Graph.js";
import { Line } from "../../objects/Line.js";
import { Point } from "../../objects/Point.js";
import { Polygon } from "../../objects/Polygon.js";
import { Segment } from "../../objects/Segment.js";

export default class Task2 {
    constructor(scene) {
        this.name = "Задача 2. Локализация точки на планарном подразбиении";
        this.description = "";
        document.getElementById('task-name').innerText = this.name;
        document.getElementById('task-description').innerText = this.description;
        this.scene = scene;
        scene.task = this;

        // Для конкретной задачи

        this.graph = null;

        this.lines = [];

        this.segmentsInLines = [];

        this.linesSorteredByY = [];

        this.trapetia = null;

        this.init();
    }

    init() {
        this.graph = new Graph(this.scene);

        this.graph.isEditing = true;

        this.getLines();
        this.point = new Point(6.5, 2.5, 'yellow', 10, 'P', true);
        
        this.scene.objects = [this.graph, ...this.lines, this.point, this.trapetia];

        this.calculations();

        console.log(this.segmentsInLines);

        this.scene.render();

        this.calculations();
    }

    calculations() {
        this.linesSorteredByY = [...this.lines].sort((a, b) => a.point.y - b.point.y);

        // Получаем полосу

        this.ind = this.binaryIntervalSearch(this.linesSorteredByY, this.point.y, 'point.y');

        if (this.ind - 1 >= 0) {
            this.linesSorteredByY[this.ind - 1].color = 'white';
            this.linesSorteredByY[this.ind - 1].width = 2;
        };
        if (this.ind < this.linesSorteredByY.length) {
            this.linesSorteredByY[this.ind].color = 'white';
            this.linesSorteredByY[this.ind].width = 2;
        }

        this.segmentsInLines = [];

        // Получаем все отрезки для каждой полосы
        for (let i = 0; i < this.linesSorteredByY.length + 1; i++) {
            this.segmentsInLines[i] = this.getSegmentsInsideTunnel(i);
        }

        this.sortedProperSegments = [...this.segmentsInLines[this.ind]].sort((a, b) => {
            const x1 = (a.startPoint.y < a.endPoint.y) ? a.startPoint.x : a.endPoint.x;
            const x2 = (b.startPoint.y < b.endPoint.y) ? b.startPoint.x : b.endPoint.x;
            return (x1 - x2);
        });

        this.properSegmentIndex = this.binarySegmentsBeetweenSearch(this.sortedProperSegments, this.point, 'point');

        this.leftTrapetiaEdge = this.sortedProperSegments[this.properSegmentIndex - 1];
        this.rightTrapetiaEdge = this.sortedProperSegments[this.properSegmentIndex];

        this.leftTrapetiaEdge && (this.leftTrapetiaEdge.color = 'red');
        this.rightTrapetiaEdge && (this.rightTrapetiaEdge.color = 'purple');

        this.color = 'rgba(0, 255, 0, 1)';

        // Формируем трапецию
        this.formTrapetia();

        this.scene.objects = [this.graph, ...this.lines, this.point, ...this.segmentsInLines[this.ind], this.trapetia];
    }

    formTrapetia() {

        if (!this.leftTrapetiaEdge && !this.rightTrapetiaEdge) {
            if (this.ind <= 0) {
                // Точка снизу
                const topLeft = this.scene.screenToWorld(0, this.scene.worldToScreen(0, this.linesSorteredByY[0].point.y).y);
                const bottomLeft = this.scene.screenToWorld(0, this.scene.canvas.height);
                const bottomRight = this.scene.screenToWorld(this.scene.canvas.width, this.scene.canvas.height);
                const topRight = this.scene.screenToWorld(this.scene.canvas.width, this.scene.worldToScreen(0, this.linesSorteredByY[0].point.y).y);

                this.trapetia = new Polygon([topLeft, topRight, bottomRight, bottomLeft], this.color, false);
                // Точка сверху
            }
            else {
                const topLeft = this.scene.screenToWorld(0, 0);
                const bottomLeft = this.scene.screenToWorld(0, this.scene.worldToScreen(0, this.linesSorteredByY[this.linesSorteredByY.length - 1].point.y).y);
                const bottomRight = this.scene.screenToWorld(this.scene.canvas.width, this.scene.worldToScreen(0, this.linesSorteredByY[this.linesSorteredByY.length - 1].point.y).y);
                const topRight = this.scene.screenToWorld(this.scene.canvas.width, 0);

                console.log(topLeft);

                this.trapetia = new Polygon([topLeft, topRight, bottomRight, bottomLeft], this.color, false);
            }
        }
        else if (!this.leftTrapetiaEdge) {
            // Точка слева
            const yMax = Math.max(this.rightTrapetiaEdge.startPoint.y, this.rightTrapetiaEdge.endPoint.y);
            const yMin = Math.min(this.rightTrapetiaEdge.startPoint.y, this.rightTrapetiaEdge.endPoint.y);

            const topLeft = this.scene.screenToWorld(0, this.scene.worldToScreen(0, yMax).y);
            const bottomLeft = this.scene.screenToWorld(0, this.scene.worldToScreen(0, yMin).y);

            const topRight = this.rightTrapetiaEdge.startPoint.y > this.rightTrapetiaEdge.endPoint.y ? this.rightTrapetiaEdge.startPoint : this.rightTrapetiaEdge.endPoint;
            const bottomRight = this.rightTrapetiaEdge.startPoint.y < this.rightTrapetiaEdge.endPoint.y ? this.rightTrapetiaEdge.startPoint : this.rightTrapetiaEdge.endPoint;

            this.trapetia = new Polygon([topLeft, topRight, bottomRight, bottomLeft], this.color, false);
        }
        else if (!this.rightTrapetiaEdge) {
            // Точка справа
            const yMax = Math.max(this.leftTrapetiaEdge.startPoint.y, this.leftTrapetiaEdge.endPoint.y);
            const yMin = Math.min(this.leftTrapetiaEdge.startPoint.y, this.leftTrapetiaEdge.endPoint.y);

            const topRight = this.scene.screenToWorld(this.scene.canvas.width, this.scene.worldToScreen(0, yMax).y);
            const bottomRight = this.scene.screenToWorld(this.scene.canvas.width, this.scene.worldToScreen(0, yMin).y);

            const topLeft = this.leftTrapetiaEdge.startPoint.y > this.leftTrapetiaEdge.endPoint.y ? this.leftTrapetiaEdge.startPoint : this.leftTrapetiaEdge.endPoint;
            const bottomLeft = this.leftTrapetiaEdge.startPoint.y < this.leftTrapetiaEdge.endPoint.y ? this.leftTrapetiaEdge.startPoint : this.leftTrapetiaEdge.endPoint;

            this.trapetia = new Polygon([topLeft, topRight, bottomRight, bottomLeft], this.color, false);
        }
        else {
            // Точка внутри
            const bottomLeft = this.leftTrapetiaEdge.startPoint.y > this.leftTrapetiaEdge.endPoint.y ? this.leftTrapetiaEdge.startPoint : this.leftTrapetiaEdge.endPoint;
            const topLeft = this.leftTrapetiaEdge.startPoint.y < this.leftTrapetiaEdge.endPoint.y ? this.leftTrapetiaEdge.startPoint : this.leftTrapetiaEdge.endPoint;
            const topRight = this.rightTrapetiaEdge.startPoint.y < this.rightTrapetiaEdge.endPoint.y ? this.rightTrapetiaEdge.startPoint : this.rightTrapetiaEdge.endPoint;
            const bottomRight = this.rightTrapetiaEdge.startPoint.y > this.rightTrapetiaEdge.endPoint.y ? this.rightTrapetiaEdge.startPoint : this.rightTrapetiaEdge.endPoint;

            this.trapetia = new Polygon([topLeft, topRight, bottomRight, bottomLeft], this.color, false);
        }
    }

    binaryIntervalSearch(arr, value, key) {
        let left = 0, right = arr.length;
        while (left < right) {
            const mid = Math.floor((left + right) / 2);
            const y = key.includes('.') ? arr[mid][key.split('.')[0]][key.split('.')[1]] : arr[mid][key];
            if (y <= value) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        return left;
    }

    binarySegmentsBeetweenSearch(arr, value, key) {
        let left = 0, right = arr.length;
        while (left < right) {
            const mid = Math.floor((left + right) / 2);
            const segment = arr[mid];
            const correctSegment = segment.startPoint.y < segment.endPoint.y ?
                segment :
                new Segment(segment.endPoint, segment.startPoint, segment.color, false);
            const rotateSign = correctSegment.getPointClockwise(value);
            if (rotateSign > 0) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        return left;
    }

    getSegmentsInsideTunnel(number) {
        if (number <= 0 || number >= this.linesSorteredByY.length) return [];
        const segments = [];
        for (const edge of this.graph.edges) {
            let p1 = null, p2 = null;
            const y1 = edge.startPoint.y;
            const y2 = edge.endPoint.y;
            // Пересечение с верхней линией
            const f = (this.linesSorteredByY[number].point.y - y1) / (y2 - y1);
            if (f >= 0 && f <= 1) p1 = new Point(edge.startPoint.x + f * (edge.endPoint.x - edge.startPoint.x), this.linesSorteredByY[number].point.y);
            // Пересечение с нижней линией
            const f2 = (this.linesSorteredByY[number - 1].point.y - y1) / (y2 - y1);
            if (f2 >= 0 && f2 <= 1) p2 = new Point(edge.startPoint.x + f2 * (edge.endPoint.x - edge.startPoint.x), this.linesSorteredByY[number - 1].point.y);

            if (p1 && p2) {
                segments.push(new Segment(p1, p2, 'orange', 3, false));
            }
        }
        return segments;
    }

    getLines() {
        this.lines = [];
        this.graph.verticies.forEach(v => this.lines.push(new Line(v, 0, 'grey')));
        this.scene.objects = [this.graph, ...this.lines, this.point];
    }

    update() {
        this.getLines();

        this.calculations();
    }

    softUpdate() {
        // this.formTrapetia();
    }
}