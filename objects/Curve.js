export default class Curve {
    constructor(isDraggable = true, isEditable = true) {
        this.isDraggable = isDraggable;
        this.isEditable = isEditable;

        this.points = [];
    }

    // p0 control control p3
    setPoints(points) {
        this.points = points;
    }

    draw(ctx, scene) {
        if (this.points.length !== 4) return;
        const [p0, p1, p2, p3] = this.points;
        const start = scene.worldToScreen(p0.x, p0.y);
        const c1 = scene.worldToScreen(p1.x, p1.y);
        const c2 = scene.worldToScreen(p2.x, p2.y);
        const end = scene.worldToScreen(p3.x, p3.y);

            // Рисуем саму кривую Безье
            ctx.save();
            ctx.strokeStyle = "#ff00cc";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, end.x, end.y);
            ctx.stroke();
            ctx.restore();

            // Рисуем пунктирные линии между p0-p1 и p2-p3
            ctx.save();
            ctx.strokeStyle = "#888";
            ctx.setLineDash([8, 6]);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(c1.x, c1.y);
            ctx.moveTo(end.x, end.y);
            ctx.lineTo(c2.x, c2.y);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();

            // Рисуем соединяющую ломаную между всеми точками
            ctx.save();
            ctx.strokeStyle = "#00aaff";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(c1.x, c1.y);
            ctx.lineTo(c2.x, c2.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
            ctx.restore();

            // Рисуем контрольные точки
            ctx.save();
            ctx.fillStyle = "#00aaff";
            for (const pt of this.points) {
                const scr = scene.worldToScreen(pt.x, pt.y);
                ctx.beginPath();
                ctx.arc(scr.x, scr.y, 6, 0, 2 * Math.PI);
                ctx.fill();
            }
            ctx.restore();
    }

    clicked() {
        return null;
    }

    getClosestInteractPoint() {
        return null;
    }
}