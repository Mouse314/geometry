import { INTERACT_BOX_SIZE } from '../engine/Constants.js';
import { Point } from './Point.js';

export class Segment {
    constructor(startPoint, endPoint, color, isDraggable = true) {
        this.startPoint = startPoint; // Объект Point
        this.endPoint = endPoint;
        this.color = color || 'yellow';
        this.isDraggable = isDraggable;
    }

    draw(ctx, scene) {
        const startScreen = this.startPoint.calculateScreenCoordinates(scene);
        const endScreen = this.endPoint.calculateScreenCoordinates(scene);

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(startScreen.x, startScreen.y);
        ctx.lineTo(endScreen.x, endScreen.y);
        ctx.stroke();
    }

    areEquals(other) {
        return (this.startPoint.areEquals(other.startPoint) && this.endPoint.areEquals(other.endPoint)) ||
               (this.startPoint.areEquals(other.endPoint) && this.endPoint.areEquals(other.startPoint));
    }

    getIntersection(other) {
        const x1 = this.startPoint.x;
        const y1 = this.startPoint.y;
        const x2 = this.endPoint.x;
        const y2 = this.endPoint.y;

        const x3 = other.startPoint.x;
        const y3 = other.startPoint.y;
        const x4 = other.endPoint.x;
        const y4 = other.endPoint.y;

        const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (denom === 0) return null; // Параллельные линии или совпадающие

        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

        if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
            const intersectX = x1 + t * (x2 - x1);
            const intersectY = y1 + t * (y2 - y1);
            return new Point(intersectX, intersectY, 'orange', 7, 'X', false);
        }
        return null; // Линии не пересекаются в пределах отрезков
    }

    getPointClockwise(point) {
        const ax = this.endPoint.x - this.startPoint.x;
        const ay = this.endPoint.y - this.startPoint.y;
        const bx = point.x - this.startPoint.x;
        const by = point.y - this.startPoint.y;
        const cross = ax * by - ay * bx;
        return cross < 0; // true, если point находится по часовой от startPoint к endPoint
    }

    getClosestInteractPoint(mousepos, scene, isShifting) {

        const screenPos1 = scene.worldToScreen(this.startPoint.x, this.startPoint.y);
        const screenPos2 = scene.worldToScreen(this.endPoint.x, this.endPoint.y);


        if (Math.abs(screenPos1.x - mousepos.x) <= INTERACT_BOX_SIZE &&
            Math.abs(screenPos1.y - mousepos.y) <= INTERACT_BOX_SIZE) {
            if (isShifting)
                return (delta) => {
                    this.startPoint.translate(delta);
                    this.endPoint.translate(delta);
                };
            return (delta) => { this.startPoint.translate(delta); };
        }
        else if (Math.abs(screenPos2.x - mousepos.x) <= INTERACT_BOX_SIZE &&
            Math.abs(screenPos2.y - mousepos.y) <= INTERACT_BOX_SIZE) {
            if (isShifting)
                return (delta) => {
                    this.startPoint.translate(delta);
                    this.endPoint.translate(delta);
                };
            return (delta) => { this.endPoint.translate(delta); };
        }
        else return null;
    }
}