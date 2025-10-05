import { INTERACT_BOX_SIZE } from '../engine/Constants.js';

export class Polygon {
    constructor(vertices, color, isDraggable = true) {
        this.vertices = vertices; // Массив объектов Point
        this.color = color || 'purple';
        this.isDraggable = isDraggable;
    }

    draw(ctx, scene) {
        ctx.save();
        // Прозрачная внутренняя заливка
        ctx.globalAlpha = 0.2;
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
}