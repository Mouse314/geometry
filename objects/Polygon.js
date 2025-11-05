import { INTERACT_BOX_SIZE } from '../engine/Constants.js';
import { Point } from './Point.js';

export class Polygon {
    constructor(vertices, color, isDraggable = true, isEditable = false, isHighlightable = false) {
        this.vertices = vertices; // Массив объектов Point
        this.color = color || 'purple';
        this.isDraggable = isDraggable;
        this.isEditable = isEditable;
        this.isHighlightable = isHighlightable;
        this.isFill = false;
    }


    getClosestInteractPoint(mousepos, scene, isShifting) {
        // Проверяем расстояние до каждой вершины
        for (const vertex of this.vertices) {
            const screenPos = scene.worldToScreen(vertex.x, vertex.y);
            if (Math.abs(screenPos.x - mousepos.x) <= INTERACT_BOX_SIZE &&
                Math.abs(screenPos.y - mousepos.y) <= INTERACT_BOX_SIZE) {
                return isShifting ?
                    (delta) => { this.vertices.forEach(v => v.translate(delta)) } :
                    (delta) => { vertex.translate(delta) };
            }
        }
        return null;
    }

    checkHighlight(mousePos, scene) {
        // Проверяем пересечение с мышкой, и если курсор внутри - вернуть true
        const screenVertices = this.vertices.map(v => scene.worldToScreen(v.x, v.y));
        const ctx = scene.ctx;
        ctx.beginPath();
        ctx.moveTo(screenVertices[0].x, screenVertices[0].y);
        for (let i = 1; i < screenVertices.length; i++) {
            const vertex = screenVertices[i];
            ctx.lineTo(vertex.x, vertex.y);
        }
        ctx.closePath();
        this.isFill = ctx.isPointInPath(mousePos.x, mousePos.y);
    }

    clicked(mousepos, scene, isShifting) {
        // Соединяем и разъединяем вершины
        for (let i = 0; i < this.vertices.length; i++) {
            const vertex = this.vertices[i];
            const interactFunc = vertex.getClosestInteractPoint(mousepos, scene, isShifting);
            if (interactFunc) {
                if (isShifting && this.isEditable) { // Шифт - удаление вершины
                    this.vertices = this.vertices.filter(v => v !== vertex);
                    return true;
                }
            }
        }
        // Добавляем новую точку в ближайшее место к ребру
        if (this.isEditable) {
            const worldPos = scene.screenToWorld(mousepos.x, mousepos.y);
            let minDist = Infinity;
            let insertIdx = this.vertices.length;
            // Найти ближайшее ребро
            for (let i = 0; i < this.vertices.length; i++) {
                const a = this.vertices[i];
                const b = this.vertices[(i + 1) % this.vertices.length];
                // Проекция точки на отрезок ab
                const ax = a.x, ay = a.y, bx = b.x, by = b.y;
                const px = worldPos.x, py = worldPos.y;
                const abx = bx - ax, aby = by - ay;
                const apx = px - ax, apy = py - ay;
                const ab2 = abx * abx + aby * aby;
                let t = ab2 === 0 ? 0 : (apx * abx + apy * aby) / ab2;
                t = Math.max(0, Math.min(1, t));
                const projx = ax + t * abx;
                const projy = ay + t * aby;
                const dist = Math.hypot(projx - px, projy - py);
                if (dist < minDist) {
                    minDist = dist;
                    insertIdx = i + 1;
                }
            }
            const newPoint = new Point(worldPos.x, worldPos.y, 'red', 10, String.fromCharCode(65 + this.vertices.length), this.isDraggable);
            this.vertices.splice(insertIdx, 0, newPoint);
            return true;
        }
    }

    draw(ctx, scene) {
        ctx.save();
        // Прозрачная внутренняя заливка
        ctx.globalAlpha = this.isFill ? 0.8 : 0.2;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        const firstVertex = scene.worldToScreen(this.vertices[0].x, this.vertices[0].y);
        ctx.moveTo(firstVertex.x, firstVertex.y);
        for (let i = 1; i < this.vertices.length; i++) {
            const vertex = scene.worldToScreen(this.vertices[i].x, this.vertices[i].y);
            ctx.lineTo(vertex.x, vertex.y);
        }
        ctx.closePath();
        ctx.fill();

        // Границы
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(firstVertex.x, firstVertex.y);
        for (let i = 1; i < this.vertices.length; i++) {
            const vertex = scene.worldToScreen(this.vertices[i].x, this.vertices[i].y);
            ctx.lineTo(vertex.x, vertex.y);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();

        // Точки
        ctx.globalAlpha = 1.0;
        for (const vertex of this.vertices) {
            const screenPos = scene.worldToScreen(vertex.x, vertex.y);
            ctx.fillStyle = vertex.color;
            ctx.beginPath();
            ctx.arc(screenPos.x, screenPos.y, vertex.size, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
}