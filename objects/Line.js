import { Point } from './Point.js';

export class Line {
    constructor(point, angle, color, width = 1) {
        this.point = point;
        this.angle = angle;
        this.color = color || 'white';
        this.width = width;
    }

    draw(ctx, scene) {
        // Вычисляем пересечения прямой с границами экрана
        const w = scene.canvas.width;
        const h = scene.canvas.height;
        const dx = Math.cos(this.angle);
        const dy = Math.sin(this.angle);
        // Прямая: x = x0 + t*dx, y = y0 + t*dy
        const x0 = this.point.x;
        const y0 = this.point.y;

        // Границы экрана в мировых координатах
        const left = scene.screenToWorld(0, 0).x;
        const right = scene.screenToWorld(w, 0).x;
        const bottom = scene.screenToWorld(0, 0).y;
        const top = scene.screenToWorld(0, h).y;

        let intersections = [];

        // Пересечение с левой и правой границей (x = left/right)
        if (dx !== 0) {
            // x = left
            let t = (left - x0) / dx;
            let y = y0 + t * dy;
            if (y >= top && y <= bottom) intersections.push(new Point(left, y));
            // x = right
            t = (right - x0) / dx;
            y = y0 + t * dy;
            if (y >= top && y <= bottom) intersections.push(new Point(right, y));
        }
        // Пересечение с верхней и нижней границей (y = top/bottom)
        if (dy !== 0) {
            // y = top
            let t = (top - y0) / dy;
            let x = x0 + t * dx;
            if (x >= left && x <= right) intersections.push(new Point(x, top));
            // y = bottom
            t = (bottom - y0) / dy;
            x = x0 + t * dx;
            if (x >= left && x <= right) intersections.push(new Point(x, bottom));
        }
        
        // Оставляем только две точки
        if (intersections.length >= 2) {
            ctx.save();
            const screen1 = scene.worldToScreen(intersections[0].x, intersections[0].y);
            const screen2 = scene.worldToScreen(intersections[1].x, intersections[1].y);
            

            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.width;
            ctx.setLineDash([10, 10]);
            ctx.beginPath();
            ctx.moveTo(screen1.x, screen1.y);
            ctx.lineTo(screen2.x, screen2.y);
            ctx.stroke();
            ctx.restore();
        }
    }

    getClosestInteractPoint(mousepos) {
        // Бесконечная линия не имеет точек взаимодействия
        return null;
    }
}