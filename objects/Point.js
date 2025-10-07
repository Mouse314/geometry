import { INTERACT_BOX_SIZE } from "../engine/Constants.js";
import { PointField } from "../taskManager/taskData/PointField.js";

export class Point {

    constructor(x, y, color, size, name = '', isDraggable = true) {
        this.x = x;
        this.y = y;
        this.color = color || 'green';
        this.name = name;
        this.size = size || 5;
        this.isDraggable = isDraggable;
        this.subscribers = []; // Функции для обновления связанных данных

        this.control = null;
    }

    addSubscriber(sub) {
        this.subscribers.push(sub);
    }

    distanceTo(other) {
        return Math.hypot(this.x - other.x, this.y - other.y);
    }

    translate(delta) {
        this.x += delta.x;
        this.y += delta.y;
    }

    rotate(angle, origin = new Point(0, 0)) {
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        const x = this.x - origin.x;
        const y = this.y - origin.y;
        this.x = origin.x + x * cosA - y * sinA;
        this.y = origin.y + x * sinA + y * cosA;
    }

    calculateScreenCoordinates(scene) {
        return scene.worldToScreen(this.x, this.y);
    }

    draw(ctx, scene) {
        const screenCoords = this.calculateScreenCoordinates(scene);
        ctx.beginPath();
        ctx.arc(screenCoords.x, screenCoords.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();

        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, screenCoords.x, screenCoords.y - 15);

        this.subscribers.forEach((sub) => {sub.update(this)});
    }

    areEquals(other) {
        if (!other) return false;
        return this.x === other.x && this.y === other.y;
    }

    getClosestInteractPoint(mousepos, scene, isShifting) {
        const screenPos = scene.worldToScreen(this.x, this.y);

        if (Math.abs(screenPos.x - mousepos.x) <= this.size &&
            Math.abs(screenPos.y - mousepos.y) <= this.size) {
            return (delta) => { this.translate(delta) };
        }
        else return null;
    }
}