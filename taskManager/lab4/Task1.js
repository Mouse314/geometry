import { Point } from "../../objects/Point.js";
import { Rect } from "../../objects/Rect.js";
import { Text } from "../../objects/Text.js";
import { Line } from "../../objects/Line.js";
import { PointField } from "../taskData/PointField.js";
import { RectField } from "../taskData/RectField.js";
import TextInputfield from "../taskData/TextInputfield.js";
import BooleanField from "../taskData/BooleanField.js";
import { clearAllFields } from "../taskData/clearAllFields.js";

export default class Task1 {
    constructor(scene) {
        this.name = "Задача 1. Региональный поиск - подсчёт";
        this.description = "";

        document.getElementById('task-name').innerText = this.name;
        document.getElementById('task-description').innerText = this.description;

        this.scene = scene;
        scene.task = this;

        // Для конкретной задачи
        this.N = 10;
        this.neededGrid = true;
        this.points = [];

        this.lines = [];
        this.texts = [];

        this.pointsOrderedByX = [];
        this.pointsOrderedByY = [];

        this.locusesX = [];
        this.locusesY = [];

        this.dominantValues = [[]];

        this.rect = null;

        this.init();

        // Интерфейс контролов
        clearAllFields();

        const gridShowfield = new BooleanField("Показывать сетку", this.neededGrid, (value) => {
            this.neededGrid = value;
            this.addObjectsToScene();
        }, this.scene);

        const rectField = new RectField(this.rect, this.scene);
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
        this.lines = [];
        this.texts = [];
        this.pointsOrderedByX = [];
        this.pointsOrderedByY = [];
        this.dominantValues = [[]];

        for (let i = 0; i < this.N; i++) {
            const point = new Point(
                Math.random() * 20 - 10,
                Math.random() * 20 - 10,
                'red',
                5,
            );

            point.isDraggable = false;

            this.points.push(point);
        }

        this.rect = new Rect(new Point(0, 0), { x: 5, y: 5 }, 'cyan', '', true);

        if (this.neededGrid) {
            for (const point of this.points) {
                this.lines.push(new Line(new Point(point.x, point.y), 0, 'gray'));
                this.lines.push(new Line(new Point(point.x, point.y), Math.PI / 2, 'gray'));
            }
        }

        this.recalculate();
        console.log("Points inside rectangle: " + this.getInsidePointscount());

        this.addObjectsToScene();
    }

    addObjectsToScene() {
        this.scene.objects = [
            ...this.points,
            this.rect
        ];

        if (this.neededGrid) {
            this.scene.objects.push(
                ...this.lines,
                ...this.texts.flat(),
            );
        }

        this.scene.render();
    }

    recalculate() {
        this.pointsOrderedByX = [...this.points].sort((a, b) => a.x - b.x);
        this.pointsOrderedByY = [...this.points].sort((a, b) => a.y - b.y);

        this.dominantValues = Array(this.N + 1).fill(0).map(() => Array(this.N + 1).fill(0));
        if (this.neededGrid) this.texts = Array(this.N + 1).fill(new Text(0, 0, 'white', 5, '22')).map(() => Array(this.N + 1).fill(new Text(0, 0, 'white', 5, '22')));

        for (let i = 0; i < this.N; i++) {
            for (let j = 0; j < this.N; j++) {
                let x = i === this.N - 1 ? this.pointsOrderedByX[i].x + 1 : (this.pointsOrderedByX[i].x + this.pointsOrderedByX[i + 1].x) / 2;
                let y = j === this.N - 1 ? this.pointsOrderedByY[j].y + 1 : (this.pointsOrderedByY[j].y + this.pointsOrderedByY[j + 1].y) / 2;
                for (let k = 0; k < this.N; k++) {
                    if (this.points[k].x <= x && this.points[k].y <= y) {
                        this.dominantValues[i + 1][j + 1]++;
                    }
                }


                if (this.neededGrid) this.texts[i][j] = new Text(new Point(x, y), 'grey', 16, `${this.dominantValues[i + 1][j + 1]}`);
            }
        }
    }

    getInsidePointscount() {
        const topLeft = this.dominantValues[this.binarySearch(this.pointsOrderedByX, this.rect.center.x - this.rect.scale.x / 2, 'x')]
        [this.binarySearch(this.pointsOrderedByY, this.rect.center.y + this.rect.scale.y / 2, 'y')];

        const topRight = this.dominantValues[this.binarySearch(this.pointsOrderedByX, this.rect.center.x + this.rect.scale.x / 2, 'x')]
        [this.binarySearch(this.pointsOrderedByY, this.rect.center.y + this.rect.scale.y / 2, 'y')];

        const bottomLeft = this.dominantValues[this.binarySearch(this.pointsOrderedByX, this.rect.center.x - this.rect.scale.x / 2, 'x')]
        [this.binarySearch(this.pointsOrderedByY, this.rect.center.y - this.rect.scale.y / 2, 'y')];

        const bottomRight = this.dominantValues[this.binarySearch(this.pointsOrderedByX, this.rect.center.x + this.rect.scale.x / 2, 'x')]
        [this.binarySearch(this.pointsOrderedByY, this.rect.center.y - this.rect.scale.y / 2, 'y')];

        const value = Math.abs(topRight - topLeft - bottomRight + bottomLeft);

        console.log(value);

        this.rect.text = `${value}`;

        return value;
    }


    binarySearch(arr, target, key) {
        let left = 0, right = arr.length;
        while (left < right) {
            const mid = Math.floor((left + right) / 2);
            if (arr[mid][key] <= target) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        return left;
    }

    update() {
        this.getInsidePointscount();
        this.scene.render();
    }

    softUpdate() {

    }
}