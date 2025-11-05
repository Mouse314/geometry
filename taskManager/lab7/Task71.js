import { Point } from "../../objects/Point.js";
import { Polygon } from "../../objects/Polygon.js";
import Triangle from "../../objects/Triangle.js";
import { Segment } from "../../objects/Segment.js";
import Instruction from "../taskData/Instruction.js";

export default class Task71 {
    constructor(scene) {
        this.name = "Задача 1 (лаб7). Монотонный метод: типы вершин + DCEL";
        this.description = "Классификация вершин (start/end/split/merge/regular-left/right) и подсветка областей DCEL вместо триангуляции.";
        document.getElementById('task-name').innerText = this.name;
        document.getElementById('task-description').innerText = this.description;
        this.scene = scene;
        this.scene.task = this;
        this.polygon = null;
        this.triangles = [];
        this.facePolys = [];
        this.dcelDiagonals = [];
        this.init();
        this.scene.render();

        new Instruction({
            title: 'Легенда типов вершин',
            items: [
                'Start (локальный максимум, выпуклая) — зелёный',
                'End (локальный минимум, выпуклая) — красный',
                'Regular (левая цепь) — синий',
                'Regular (правая цепь) — фиолетовый',
                'Split (локальный максимум, вогнутая) — оранжевый',
                'Merge (локальный минимум, вогнутая) — жёлтый'
            ]
        });
    }

    init() {
        // Пример y-монотонного многоугольника
        this.polygon = new Polygon([
            new Point(4, 10, "black", 6),
            new Point(6, 9, "black", 5),
            new Point(7, 7, "black", 5),
            new Point(6, 5, "black", 5),
            new Point(5, 3, "black", 5),
            new Point(6, 1, "black", 5),
            new Point(4, 1.5, "black", 5),
            new Point(3, 3.5, "black", 5),
            new Point(2.5, 5.5, "black", 5),
            new Point(3, 7.5, "black", 5),
            new Point(4, 9, "black", 5)
        ], "green", true, true);
        this.update();
    }

    // Вспомогательное: ориентированная площадь полигона
    polygonArea(vertices) {
        let area = 0;
        for (let i = 0; i < vertices.length; i++) {
            const a = vertices[i];
            const b = vertices[(i + 1) % vertices.length];
            area += (a.x * b.y - a.y * b.x);
        }
        return area / 2;
    }

    // Ориентация тройки точек (положительно для левого поворота)
    orient(a, b, c) {
        return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
    }

    // Определение левой/правой цепи между top и bottom
    buildChains(vertices) {
        const n = vertices.length;
        if (n === 0) return { chain: [], topIdx: 0, bottomIdx: 0 };
        let topIdx = 0, bottomIdx = 0;
        for (let i = 1; i < n; i++) {
            const v = vertices[i];
            const vt = vertices[topIdx];
            if (v.y > vt.y || (v.y === vt.y && v.x < vt.x)) topIdx = i;
            const vb = vertices[bottomIdx];
            if (v.y < vb.y || (v.y === vb.y && v.x < vb.x)) bottomIdx = i;
        }
        const chain = new Array(n).fill(null);
        let idx = topIdx;
        while (true) {
            chain[idx] = 'right';
            if (idx === bottomIdx) break;
            idx = (idx + 1) % n;
        }
        idx = topIdx;
        while (true) {
            chain[idx] = 'left';
            if (idx === bottomIdx) break;
            idx = (idx - 1 + n) % n;
        }
        return { chain, topIdx, bottomIdx };
    }

    // Классификация вершин: start/end/split/merge/regular
    classifyVertices(vertices) {
        const n = vertices.length;
        const area = this.polygonArea(vertices);
        const orientSign = area >= 0 ? 1 : -1; // CCW -> +1
        const types = new Array(n).fill('regular');
        for (let i = 0; i < n; i++) {
            const prev = vertices[(i - 1 + n) % n];
            const curr = vertices[i];
            const next = vertices[(i + 1) % n];
            const isLocalMax = curr.y > prev.y && curr.y > next.y;
            const isLocalMin = curr.y < prev.y && curr.y < next.y;
            const cross = this.orient(prev, curr, next);
            const isConvex = orientSign * cross > 0; // внутренний угол < 180°
            if (isLocalMax) {
                types[i] = isConvex ? 'start' : 'split';
            } else if (isLocalMin) {
                types[i] = isConvex ? 'end' : 'merge';
            } else {
                types[i] = 'regular';
            }
        }
        return types;
    }

    // Подсветка областей DCEL: для простого полигона — одна внутренняя область (не используем в финальном рендере)
    buildDCELFaces() {
        return [new Polygon(this.polygon.vertices.slice(), 'rgba(100,200,250,0.35)', false, false, true)];
    }

    // Построить диагонали, которые использовал бы монотонный метод (без рисования треугольников)
    buildDiagonalsMonotone(polygon) {
        const verts = polygon.vertices;
        const n = verts.length;
        if (n < 3) return [];
        let top = 0, bottom = 0;
        for (let i = 1; i < n; i++) {
            if (verts[i].y > verts[top].y || (verts[i].y === verts[top].y && verts[i].x < verts[top].x)) top = i;
            if (verts[i].y < verts[bottom].y || (verts[i].y === verts[bottom].y && verts[i].x < verts[bottom].x)) bottom = i;
        }
        const leftChain = [];
        const rightChain = [];
        let idx = top;
        while (idx !== bottom) { leftChain.push(idx); idx = (idx + 1) % n; }
        leftChain.push(bottom);
        idx = top;
        while (idx !== bottom) { rightChain.push(idx); idx = (idx - 1 + n) % n; }
        rightChain.push(bottom);
        const inLeft = (i) => leftChain.indexOf(i) !== -1;
        const inRight = (i) => rightChain.indexOf(i) !== -1;
        const sorted = [...new Set([...leftChain, ...rightChain])];
        sorted.sort((a, b) => verts[b].y - verts[a].y || verts[a].x - verts[b].x);
        const stack = [sorted[0], sorted[1]];
        const diagKeys = new Set();
        const diagonals = [];
        const isAdjacent = (i, j) => (Math.abs(i - j) === 1) || (Math.abs(i - j) === n - 1);
        const addDiag = (i, j) => {
            if (i === j) return;
            if (isAdjacent(i, j)) return; // не добавляем ребра контура
            const a = Math.min(i, j), b = Math.max(i, j);
            const key = `${a}-${b}`;
            if (diagKeys.has(key)) return;
            diagKeys.add(key);
            diagonals.push(new Segment(verts[i], verts[j], '#00AEEF', 2, false));
        };
        for (let k = 2; k < sorted.length; k++) {
            const curr = sorted[k];
            const topOfStack = stack[stack.length - 1];
            const currLeft = inLeft(curr);
            const topLeft = inLeft(topOfStack);
            if (currLeft !== topLeft) {
                // Разные цепи: веер диагоналей от curr к стеку
                while (stack.length > 1) {
                    const v1 = stack.pop();
                    addDiag(curr, v1);
                }
                stack.pop();
                stack.push(sorted[k - 1], curr);
            } else {
                // Одна цепь: добавляем диагонали пока сохраняется выпуклость
                let last = stack.pop();
                while (stack.length > 0) {
                    const v1 = stack[stack.length - 1];
                    const a = verts[curr], b = verts[last], c = verts[v1];
                    const cross = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
                    // Для левой цепи требуем правый поворот (cross < 0), для правой — левый (cross > 0)
                    if (currLeft ? cross < 0 : cross > 0) break;
                    addDiag(curr, v1);
                    last = stack.pop();
                }
                stack.push(last, curr);
            }
        }
        return diagonals;
    }

    triangulateMonotone(polygon) {
        const verts = polygon.vertices;
        const n = verts.length;
        if (n < 3) return [];
        // Найти top и bottom по y
        let top = 0, bottom = 0;
        for (let i = 1; i < n; i++) {
            if (verts[i].y > verts[top].y || (verts[i].y === verts[top].y && verts[i].x < verts[top].x)) top = i;
            if (verts[i].y < verts[bottom].y || (verts[i].y === verts[bottom].y && verts[i].x < verts[bottom].x)) bottom = i;
        }
        // Разделить на две цепи: left и right
        let leftChain = [], rightChain = [];
        let idx = top;
        while (idx !== bottom) {
            leftChain.push(idx);
            idx = (idx + 1) % n;
        }
        leftChain.push(bottom);
        idx = top;
        while (idx !== bottom) {
            rightChain.push(idx);
            idx = (idx - 1 + n) % n;
        }
        rightChain.push(bottom);
        // Сортировать индексы по убыванию y
        const sorted = [...leftChain, ...rightChain].filter((v, i, arr) => arr.indexOf(v) === i);
        sorted.sort((a, b) => verts[b].y - verts[a].y || verts[a].x - verts[b].x);
        // Алгоритм с использованием стека
        const stack = [sorted[0], sorted[1]];
        const triangles = [];
        for (let i = 2; i < sorted.length; i++) {
            const curr = sorted[i];
            if ((leftChain.includes(curr) && rightChain.includes(stack[stack.length-1])) ||
                (rightChain.includes(curr) && leftChain.includes(stack[stack.length-1]))) {
                // Разные цепи
                while (stack.length > 1) {
                    const v1 = stack.pop();
                    triangles.push(new Triangle([
                        verts[curr], verts[v1], verts[stack[stack.length-1]]
                    ], "red", 2, true, true));
                }
                stack.pop();
                stack.push(sorted[i-1], curr);
            } else {
                // Одна цепь
                let last = stack.pop();
                while (stack.length > 0) {
                    const v1 = stack[stack.length-1];
                    // Проверка на выпуклость
                    const a = verts[curr], b = verts[last], c = verts[v1];
                    const cross = (b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
                    if (leftChain.includes(curr) ? cross < 0 : cross > 0) break;
                    triangles.push(new Triangle([a, b, c], "red", 2, true, true));
                    last = stack.pop();
                }
                stack.push(last, curr);
            }
        }
        return triangles;
    }

    // Проверка y-монотонности (обе цепи не возрастают по y сверху вниз)
    isYMonotone(vertices) {
        const { chain, topIdx, bottomIdx } = this.buildChains(vertices);
        // правая цепь: идём next от top к bottom
        let idx = topIdx;
        let prevY = vertices[idx].y;
        while (idx !== bottomIdx) {
            idx = (idx + 1) % vertices.length;
            if (vertices[idx].y > prevY + 1e-9) return false;
            prevY = vertices[idx].y;
        }
        // левая цепь: идём prev от top к bottom
        idx = topIdx;
        prevY = vertices[idx].y;
        while (idx !== bottomIdx) {
            idx = (idx - 1 + vertices.length) % vertices.length;
            if (vertices[idx].y > prevY + 1e-9) return false;
            prevY = vertices[idx].y;
        }
        return true;
    }

    // Ear clipping fallback для немонотонных многоугольников
    triangulateEarClipping(polygon) {
        const triangles = [];
        const verts = polygon.vertices.map(p => p); // копия ссылок
        const area = this.polygonArea(verts);
        const isCCW = area > 0;
        const orient = (a,b,c) => (b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
        const pointInTri = (p,a,b,c) => {
            const s1 = orient(p,a,b), s2 = orient(p,b,c), s3 = orient(p,c,a);
            const hasNeg = (s1 < 0) || (s2 < 0) || (s3 < 0);
            const hasPos = (s1 > 0) || (s2 > 0) || (s3 > 0);
            return !(hasNeg && hasPos);
        };
        const isConvexAt = (arr,i) => {
            const n = arr.length;
            const a = arr[(i-1+n)%n], b = arr[i], c = arr[(i+1)%n];
            return (orient(a,b,c) > 0) === isCCW;
        };
        let guard = 0;
        while (verts.length > 3 && guard++ < 1000) {
            let earFound = false;
            const n = verts.length;
            for (let i = 0; i < n; i++) {
                if (!isConvexAt(verts,i)) continue;
                const a = verts[(i-1+n)%n], b = verts[i], c = verts[(i+1)%n];
                let hasInside = false;
                for (let j = 0; j < n; j++) {
                    if (j === (i-1+n)%n || j === i || j === (i+1)%n) continue;
                    if (pointInTri(verts[j], a,b,c)) { hasInside = true; break; }
                }
                if (hasInside) continue;
                triangles.push(new Triangle([a,b,c], 'red', 2, true, true));
                verts.splice(i,1);
                earFound = true;
                break;
            }
            if (!earFound) break;
        }
        if (verts.length === 3) triangles.push(new Triangle([verts[0],verts[1],verts[2]], 'red', 2, true, true));
        return triangles;
    }

    calculate() {
        // Классификация и монотонность
        const isMono = this.isYMonotone(this.polygon.vertices);
        if (isMono) {
            // Диагонали, которые проведёт монотонный алгоритм
            this.dcelDiagonals = this.buildDiagonalsMonotone(this.polygon);
            // Триангуляция монотонного многоугольника
            this.triangles = this.triangulateMonotone(this.polygon);
        } else {
            // Немонотоный: используем Ear Clipping как универсальный способ
            this.dcelDiagonals = [];
            this.triangles = this.triangulateEarClipping(this.polygon);
        }
    }

    update() {
        this.calculate();
        // Классификация вершин и раскраска
        const { chain } = this.buildChains(this.polygon.vertices);
        const types = this.classifyVertices(this.polygon.vertices);
        for (let i = 0; i < this.polygon.vertices.length; i++) {
            const base = types[i] === 'regular' ? (chain[i] === 'left' ? 'regular-left' : 'regular-right') : types[i];
            const color = base === 'start' ? 'green'
                : base === 'end' ? 'red'
                : base === 'split' ? 'orange'
                : base === 'merge' ? 'yellow'
                : base === 'regular-left' ? 'blue'
                : 'purple'; // regular-right
            this.polygon.vertices[i].color = color;
        }
        // Рендер: полигон + диагонали (если есть) + треугольники
        this.scene.objects = [this.polygon, ...this.dcelDiagonals, ...this.triangles];
    }

    softUpdate() {}
}