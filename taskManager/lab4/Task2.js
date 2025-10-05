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

        this.init();
    }

    init() {
        this.graph = new Graph(this.scene);

        this.graph.isEditing = true;

        this.getLines();
        this.point = new Point(6.5, 2.5, 'yellow', 10, 'P', true);

        this.scene.objects = [];
        this.scene.objects = [this.graph, ...this.lines, this.point];

        this.calculations();

        console.log(this.segmentsInLines);

        this.scene.render();

    }

    calculations() {
        this.linesSorteredByY = [...this.lines].sort((a, b) => a.point.y - b.point.y);

        // Получаем полосу

        const ind = this.binaryIntervalSearch(this.linesSorteredByY, this.point.y, 'point.y');

        if (ind - 1 >= 0) {
            this.linesSorteredByY[ind - 1].color = 'white';
            this.linesSorteredByY[ind - 1].width = 2;
        };
        if (ind < this.linesSorteredByY.length) {
            this.linesSorteredByY[ind].color = 'white';
            this.linesSorteredByY[ind].width = 2;
        }

        this.segmentsInLines = [];

        // Получаем все отрезки для каждой полосы
        for (let i = 0; i < this.linesSorteredByY.length + 1; i++) {
            this.segmentsInLines[i] = this.getSegmentsInsideTunnel(i);
        }

        const sortedProperSegments = [...this.segmentsInLines[ind]].sort((a, b) => {
            const x1 = (a.startPoint.y < a.endPoint.y) ? a.startPoint.x : a.endPoint.x;
            const x2 = (b.startPoint.y < b.endPoint.y) ? b.startPoint.x : b.endPoint.x;
            return (x1 - x2);
        });


        // Формируем трапецию

        const properSegmentIndex = this.binarySegmentsBeetweenSearch(sortedProperSegments, this.point, 'point');

        const leftTrapetiaEdge = sortedProperSegments[properSegmentIndex - 1];
        const rightTrapetiaEdge = sortedProperSegments[properSegmentIndex];

        this.trapetia = null;
        const color = 'rgba(0, 255, 0, 1)';

        if (!leftTrapetiaEdge && !rightTrapetiaEdge) {
            if (ind <= 0) {
                // Точка сверху
                const topLeft = this.scene.screenToWorld(0, 0);
                const bottomLeft = this.scene.screenToWorld(0, this.scene.worldToScreen(0, this.linesSorteredByY[0].point.y).y);
                const bottomRight = this.scene.screenToWorld(this.scene.canvas.width, this.scene.worldToScreen(0, this.linesSorteredByY[0].point.y).y);
                const topRight = this.scene.screenToWorld(this.scene.canvas.width, 0);

                this.trapetia = new Polygon([topLeft, topRight, bottomRight, bottomLeft], color, false);
            }
            else {
                // Точка снизу
                const topLeft = this.scene.screenToWorld(0, this.scene.worldToScreen(0, this.linesSorteredByY[this.linesSorteredByY.length - 1].point.y).y);
                const bottomLeft = this.scene.screenToWorld(0, this.scene.canvas.height);
                const bottomRight = this.scene.screenToWorld(this.scene.canvas.width, this.scene.canvas.height);
                const topRight = this.scene.screenToWorld(this.scene.canvas.width, this.scene.worldToScreen(0, this.linesSorteredByY[this.linesSorteredByY.length - 1].point.y).y);

                this.trapetia = new Polygon([topLeft, topRight, bottomRight, bottomLeft], color, false);
            }
        }
        else if (!leftTrapetiaEdge) {
            // Точка слева
            const yMax = Math.max(rightTrapetiaEdge.startPoint.y, rightTrapetiaEdge.endPoint.y);
            const yMin = Math.min(rightTrapetiaEdge.startPoint.y, rightTrapetiaEdge.endPoint.y);
            
            const topLeft = this.scene.screenToWorld(0, this.scene.worldToScreen(0, yMax).y);
            const bottomLeft = this.scene.screenToWorld(0, this.scene.worldToScreen(0, yMin).y);

            const topRight = rightTrapetiaEdge.startPoint.y > rightTrapetiaEdge.endPoint.y ? rightTrapetiaEdge.startPoint : rightTrapetiaEdge.endPoint;
            const bottomRight = rightTrapetiaEdge.startPoint.y < rightTrapetiaEdge.endPoint.y ? rightTrapetiaEdge.startPoint : rightTrapetiaEdge.endPoint;

            this.trapetia = new Polygon([topLeft, topRight, bottomRight, bottomLeft], color, false);
        }
        else if (!rightTrapetiaEdge) {
            // Точка справа
            const yMax = Math.max(leftTrapetiaEdge.startPoint.y, leftTrapetiaEdge.endPoint.y);
            const yMin = Math.min(leftTrapetiaEdge.startPoint.y, leftTrapetiaEdge.endPoint.y);

            const topRight = this.scene.screenToWorld(this.scene.canvas.width, this.scene.worldToScreen(0, yMax).y);
            const bottomRight = this.scene.screenToWorld(this.scene.canvas.width, this.scene.worldToScreen(0, yMin).y);

            const topLeft = leftTrapetiaEdge.startPoint.y > leftTrapetiaEdge.endPoint.y ? leftTrapetiaEdge.startPoint : leftTrapetiaEdge.endPoint;
            const bottomLeft = leftTrapetiaEdge.startPoint.y < leftTrapetiaEdge.endPoint.y ? leftTrapetiaEdge.startPoint : leftTrapetiaEdge.endPoint;

            this.trapetia = new Polygon([topLeft, topRight, bottomRight, bottomLeft], color, false);
        }
        else {
            // Точка внутри
            const bottomLeft = leftTrapetiaEdge.startPoint.y > leftTrapetiaEdge.endPoint.y ? leftTrapetiaEdge.startPoint : leftTrapetiaEdge.endPoint;
            const topLeft = leftTrapetiaEdge.startPoint.y < leftTrapetiaEdge.endPoint.y ? leftTrapetiaEdge.startPoint : leftTrapetiaEdge.endPoint;
            const topRight = rightTrapetiaEdge.startPoint.y < rightTrapetiaEdge.endPoint.y ? rightTrapetiaEdge.startPoint : rightTrapetiaEdge.endPoint;
            const bottomRight = rightTrapetiaEdge.startPoint.y > rightTrapetiaEdge.endPoint.y ? rightTrapetiaEdge.startPoint : rightTrapetiaEdge.endPoint;

            this.trapetia = new Polygon([topLeft, topRight, bottomRight, bottomLeft], color, false);
        }

        this.scene.objects = [this.graph, ...this.lines, this.point, ...this.segmentsInLines[ind], this.trapetia];
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

            console.log(p1, p2);

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

        this.scene.render();
    }
}