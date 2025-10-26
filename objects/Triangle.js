export default class Triangle {
    constructor(vertices, color, lineWidth = 2, isSelectable = true, isHighlightable = false) {
        this.vertices = vertices;
        this.color = color || 'purple';
        this.lineWidth = lineWidth;
        this.isSelectable = isSelectable;
        this.isHighlightable = isHighlightable;
        this.isFill = false;
    }

    checkHighlight(mousePos, scene) {
        // Проверяем пересечение с мышкой, и если курсор внутри - вернуть true
        const [v1, v2, v3] = this.vertices.map(v => scene.worldToScreen(v.x, v.y));
        const ctx = scene.ctx;
        ctx.beginPath();
        ctx.moveTo(v1.x, v1.y);
        ctx.lineTo(v2.x, v2.y);
        ctx.lineTo(v3.x, v3.y);
        ctx.closePath();
        this.isFill = ctx.isPointInPath(mousePos.x, mousePos.y);
    }
    
    draw(ctx, scene) {
        ctx.save();

        // Заливка
        if (this.isFill) {
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            const [v1, v2, v3] = this.vertices.map(v => scene.worldToScreen(v.x, v.y));
            ctx.moveTo(v1.x, v1.y);
            ctx.lineTo(v2.x, v2.y);
            ctx.lineTo(v3.x, v3.y);
            ctx.closePath();
            ctx.fill();
        }

        // Контур
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;
        ctx.beginPath();
        const [v1, v2, v3] = this.vertices.map(v => scene.worldToScreen(v.x, v.y));
        ctx.moveTo(v1.x, v1.y);
        ctx.lineTo(v2.x, v2.y);
        ctx.lineTo(v3.x, v3.y);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }
}