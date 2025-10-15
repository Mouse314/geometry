import { Segment } from "../../objects/Segment.js";
import { Point } from "../../objects/Point.js";
import { Polygon } from "../../objects/Polygon.js";
import SelectField from "../taskData/SelectField.js";
import TextInputfield from "../taskData/TextInputfield.js";

export default class Task51 {
    constructor(scene) {
        this.scene = scene;
        this.scene.task = this;
        
        this.N = 10;
        
        this.points = [];
        
        this.hull = [];
        this.hullGeometry = null;
        
        // Graham | Gift
        this.algType = 'Graham';

        const pointNumController = new TextInputfield(
            'Количество точек',
            this.N,
            (value) => {
                this.N = value;
                this.init();
            },
            this.scene
        );

        const algTypeSelectController = new SelectField(
            'Тип алгоритма: ',
            this.algType,
            [
                { value: 'Graham', label: 'Алгоритм Грэхема' },
                { value: 'Gift', label: 'Заворачивание подарка' }
            ],
            (value) => {
                this.algType = value;
            },
            this.scene
        );

        this.init();
    }
    
    init() {
        this.points = [];
        for (let i = 0; i < this.N; i++) {
            const x = 10 - Math.random() * 20;
            const y = 10 - Math.random() * 20;
            this.points.push(new Point(x, y, "blue", 5, "", true));
        }
        
        this.scene.objects = [...this.points];

        this.update();
        this.scene.render();
    }
    
    giftWrapSegments = [];
    
    // Вспомогательный метод для вычисления квадрата расстояния между двумя точками
    dist(a, b) {
        return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
    }
    
    // Алгоритм заворота подарка (Джарвиса)
    giftWrapHull() {
        this.hullGeometry = null;
        this.giftWrapSegments = [];
    
        if (this.points.length < 3) {
            this.hull = [...this.points];
            this.hullGeometry = new Polygon(this.hull, "orange");
            return;
        }
    
        // Найти самую левую точку
        let leftmost = this.points[0];
        for (let p of this.points) {
            if (p.x < leftmost.x || (p.x === leftmost.x && p.y < leftmost.y)) {
                leftmost = p;
            }
        }
    
        const hull = [];
        let current = leftmost;
        let next;
        do {
            hull.push(current);
            next = this.points[0] === current ? this.points[1] : this.points[0];
            for (let candidate of this.points) {
                if (candidate === current) continue;
                // Векторное произведение: если candidate левее current->next
                const cross = (next.x - current.x) * (candidate.y - current.y) - (next.y - current.y) * (candidate.x - current.x);
                if (cross < 0 || (cross === 0 && this.dist(current, candidate) > this.dist(current, next))) {
                    // candidate левее или дальше по прямой
                    next = candidate;
                }
            }
            // Визуализируем поворот: отрезок из current в продолжение стороны current-next
            const dx = next.x - current.x;
            const dy = next.y - current.y;
            const len = Math.sqrt(dx*dx + dy*dy);
            const ext = 25; // коэффициент удлинения
            const endX = current.x + dx/len * len * ext;
            const endY = current.y + dy/len * len * ext;
            this.giftWrapSegments.push(new Segment(current, new Point(endX, endY, "red", 2, "", false), "red", 2, false));
            current = next;
        } while (current !== leftmost);
    
        this.hull = hull;
        this.hullGeometry = new Polygon(this.hull, "orange");
    }
    // Вспомогательный метод для вычисления квадрата расстояния между двумя точками
    dist(a, b) {
        return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
    }
    
    // Алгоритм заворота подарка (Джарвиса)
    giftWrapHull() {
        this.hullGeometry = null;
        this.giftWrapSegments = [];
    
        if (this.points.length < 3) {
            this.hull = [...this.points];
            this.hullGeometry = new Polygon(this.hull, "orange");
            return;
        }
    
        // Найти самую левую точку
        let leftmost = this.points[0];
        for (let p of this.points) {
            if (p.x < leftmost.x || (p.x === leftmost.x && p.y < leftmost.y)) {
                leftmost = p;
            }
        }
    
        const hull = [];
        let current = leftmost;
        let next;
        do {
            hull.push(current);
            next = this.points[0] === current ? this.points[1] : this.points[0];
            for (let candidate of this.points) {
                if (candidate === current) continue;
                // Векторное произведение: если candidate левее current->next
                const cross = (next.x - current.x) * (candidate.y - current.y) - (next.y - current.y) * (candidate.x - current.x);
                if (cross < 0 || (cross === 0 && this.dist(current, candidate) > this.dist(current, next))) {
                    // candidate левее или дальше по прямой
                    next = candidate;
                }
            }
            // Визуализируем поворот (отрезок current-next)
            this.giftWrapSegments.push(new Segment(current, next, "red", 5, false));
            current = next;
        } while (current !== leftmost);
    
        this.hull = hull;
        this.hullGeometry = new Polygon(this.hull, "orange");
    }
    
    dist(a, b) {
        return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
    }
    
    createHull() {
        this.hullGeometry = null;

        if (this.points.length < 3) {
            this.hull = [...this.points];
            this.hullGeometry = new Polygon(this.hull, "green");
            return;
        }

        // 1. Найти точку с минимальной y (и x при равенстве y)
        let start = this.points[0];
        for (let p of this.points) {
            if (p.y < start.y || (p.y === start.y && p.x < start.x)) {
                start = p;
            }
        }

        // 2. Отсортировать по полярному углу относительно start
        const sorted = this.points.slice().sort((a, b) => {
            if (a === start) return -1;
            if (b === start) return 1;
            const angleA = Math.atan2(a.y - start.y, a.x - start.x);
            const angleB = Math.atan2(b.y - start.y, b.x - start.x);
            if (angleA === angleB) {
                // Ближайшая к start точка первой
                const distA = (a.x - start.x) ** 2 + (a.y - start.y) ** 2;
                const distB = (b.x - start.x) ** 2 + (b.y - start.y) ** 2;
                return distA - distB;
            }
            return angleA - angleB;
        });

        // 3. Алгоритм Грэхема
        const hull = [];
        for (let p of sorted) {
            while (hull.length >= 2) {
                const q = hull[hull.length - 2];
                const r = hull[hull.length - 1];
                // Векторное произведение QR x RP
                const cross = (r.x - q.x) * (p.y - q.y) - (r.y - q.y) * (p.x - q.x);
                if (cross <= 0) {
                    hull.pop();
                } else {
                    break;
                }
            }
            hull.push(p);
        }

        this.hull = hull;
        this.hullGeometry = new Polygon(this.hull, "green");
    }

    update() {
        if (this.algType === 'Gift') this.giftWrapHull();
        else if (this.algType === 'Graham') this.createHull();
        this.scene.objects = [...this.points, ...this.giftWrapSegments, this.hullGeometry];
        this.scene.render();
    }

    softUpdate() {
        this.update();
    }
}