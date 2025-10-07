import { Graph } from "../../objects/Graph.js";
import { Point } from "../../objects/Point.js";
import { Rect } from "../../objects/Rect.js";
import { Segment } from "../../objects/Segment.js";
import { clearAllFields } from "../taskData/clearAllFields.js";
import TextInputfield from "../taskData/TextInputfield.js";

export default class Task3 {
    constructor(scene) {
        this.name = "Задача 3. 2D Дерево поиска";
        this.description = "Реализовать метод многомерного двоичного поиска";
        document.getElementById('task-name').innerText = this.name;
        document.getElementById('task-description').innerText = this.description;

        this.scene = scene;
        this.scene.task = this;

        this.N = 10;
        this.graph = new Graph(this.scene, true, false);
        this.points = [];

        this.kdTree = [];

        this.treeSegments = [];

        this.globalCounter = 0;

        this.way = [];

        this.init();

        // Интерфейс контролов
        clearAllFields();

        const pointsAmountField = new TextInputfield("N", this.N, (value) => {
            const intValue = parseInt(value);
            if (!isNaN(intValue)) {
                this.N = intValue;
                this.init();
            }
        }, this.scene);
    }

    init() {
        this.points = [];
        this.globalCounter = 0;

        for (let i = 0; i < this.N; i++) {
            const x = Math.random() * 10;
            const y = Math.random() * 10;
            this.points.push(new Point(x, y, "blue", 5, "P", true));
        }

        this.graph.verticies = this.points;
        this.graph.edges = [];

        this.update();
    }

    form2DSearchTree() {
        // Построение 2D-дерева поиска (kd-tree)
        function buildKDTree(points, depth = 0) {
            if (!points.length) return null;
            const axis = depth % 2 === 0 ? 'x' : 'y';
            const sorted = [...points].sort((a, b) => a[axis] - b[axis]);
            const median = Math.floor(sorted.length / 2);
            return {
                point: sorted[median],
                left: buildKDTree(sorted.slice(0, median), depth + 1),
                right: buildKDTree(sorted.slice(median + 1), depth + 1),
                axis
            };
        }
        this.kdTree = buildKDTree(this.points);
    }

    draw2DSearchTree(node, prevNode) {
        if (!node) return;
        // Обход в ширину (BFS)
        const queue = [];
        let counter = this.globalCounter;
        queue.push({ node, prevNode, level: 0 });
        while (queue.length > 0) {
            const { node: curNode, prevNode: curPrev, level } = queue.shift();
            if (!curNode) continue;
            if (!curNode.point.areEquals(this.graph.selectedVertex)) {
                if (counter === 0){
                    curNode.point.color = "yellow";
                }
                else {
                    curNode.point.color = level % 2 === 0 ? "rgba(0, 195, 255, 1)" : "rgba(102, 0, 255, 1)";
                }
            }
            curNode.point.name = this.N > 100 ? `` : `${counter}`;
            counter++;
            if (curPrev) {
                this.treeSegments.push(new Segment(curPrev.point, new Point(curPrev.point.x, curNode.point.y), "red", Math.pow((this.N - counter + Math.floor(this.N / 5)) / this.N, 2) * 6, false));
                this.treeSegments.push(new Segment(new Point(curPrev.point.x, curNode.point.y), curNode.point, "red", Math.pow((this.N - counter + Math.floor(this.N / 5)) / this.N, 2) * 6, false));
            }
            queue.push({ node: curNode.left, prevNode: curNode, level: level + 1 });
            queue.push({ node: curNode.right, prevNode: curNode, level: level + 1 });
        }
        this.globalCounter = counter;
    }

    searchKDTree(node, point, depth = 0) {
        if (!node) return null;
        this.way.push(node.point);
        const axis = depth % 2 === 0 ? 'x' : 'y';
        if (node.point[axis] === (point[axis])) {
            return node.point;
        }
        const nextNode = point[axis] < node.point[axis] ? node.left : node.right;
        return this.searchKDTree(nextNode, point, depth + 1);
    }

    drawWayToPoint(point) {
        this.way = [];

        this.searchKDTree(this.kdTree, point);

        this.way[0].color = "rgba(255, 255, 0, 1)";
        for (let i = 0; i < this.way.length - 1; i++) {
            this.treeSegments.push(new Segment(this.way[i], new Point(this.way[i].x, this.way[i + 1].y), "green", 6, false));
            this.treeSegments.push(new Segment(new Point(this.way[i].x, this.way[i + 1].y), this.way[i + 1], "green", 6, false));
            this.way[i].color = "rgba(29, 156, 0, 1)";
        }
        this.way[this.way.length - 1].color = "rgba(0, 255, 187, 1)";
    }

    update() {
        this.form2DSearchTree();
        this.globalCounter = 0;
        this.treeSegments = [];
        this.draw2DSearchTree(this.kdTree, null);
        if (this.graph.selectedVertex) this.drawWayToPoint(this.graph.selectedVertex);
        this.scene.objects = [...this.treeSegments, this.graph, ...this.way];
        this.scene.render();
    }

    softUpdate() {
        this.update();
    }
}