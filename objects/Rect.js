import { INTERACT_BOX_SIZE } from '../engine/Constants.js';

export class Rect {
    constructor(center, scale, color, text = '', isDraggable = true) {
        this.center = center; // Объект Point, центр прямоугольника
        this.scale = scale;
        this.color = color || 'blue';
        this.text = text;
        this.isDraggable = isDraggable;

        this.subscribers = []; // Функции для обновления связанных данных
    }

    addSubscriber(sub) {
        this.subscribers.push(sub);
    }

    draw(ctx, scene) {
        const screenCoords = this.calculateScreenCoordinates(scene);
        ctx.save();
        // Прозрачная внутренняя заливка
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = this.color;
        ctx.fillRect(
            screenCoords.x,
            screenCoords.y,
            this.scale.x * scene.scale,
            this.scale.y * scene.scale
        );

        // Границы
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(
            screenCoords.x,
            screenCoords.y,
            this.scale.x * scene.scale,
            this.scale.y * scene.scale
        );
        ctx.restore();

        if (this.text) {
            ctx.fillStyle = 'white';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.text, screenCoords.x + (this.scale.x * scene.scale) / 2, screenCoords.y + (this.scale.y * scene.scale) / 2);
        }

        const topleft = { x: this.center.x - this.scale.x / 2, y: this.center.y + this.scale.y / 2 };
        const topright = { x: this.center.x + this.scale.x / 2, y: this.center.y + this.scale.y / 2 };
        const bottomleft = { x: this.center.x - this.scale.x / 2, y: this.center.y - this.scale.y / 2 };
        const bottomright = { x: this.center.x + this.scale.x / 2, y: this.center.y - this.scale.y / 2 };

        const topleftScreen = scene.worldToScreen(topleft.x, topleft.y);
        const toprightScreen = scene.worldToScreen(topright.x, topright.y);
        const bottomleftScreen = scene.worldToScreen(bottomleft.x, bottomleft.y);
        const bottomrightScreen = scene.worldToScreen(bottomright.x, bottomright.y);

        ctx.save();
        ctx.fillStyle = 'red';
        ctx.fillRect(topleftScreen.x, topleftScreen.y, INTERACT_BOX_SIZE, INTERACT_BOX_SIZE);
        ctx.fillStyle = 'green';
        ctx.fillRect(toprightScreen.x, toprightScreen.y, INTERACT_BOX_SIZE, INTERACT_BOX_SIZE);
        ctx.fillStyle = 'blue';
        ctx.fillRect(bottomleftScreen.x, bottomleftScreen.y, INTERACT_BOX_SIZE, INTERACT_BOX_SIZE);
        ctx.fillStyle = 'yellow';
        ctx.fillRect(bottomrightScreen.x, bottomrightScreen.y, INTERACT_BOX_SIZE, INTERACT_BOX_SIZE);
        ctx.restore();

        this.subscribers.forEach((sub) => { sub.update(this) });
    }

    calculateScreenCoordinates(scene) {
        const worldCoords = { x: this.center.x - this.scale.x / 2, y: this.center.y + this.scale.y / 2 };
        return scene.worldToScreen(worldCoords.x, worldCoords.y);
    }


    getClosestInteractPoint(mousepos, scene, isShifting) {
        // Проверяем расстояние до каждой стороны
        const topleft = { x: this.center.x - this.scale.x / 2, y: this.center.y - this.scale.y / 2 };
        const topright = { x: this.center.x + this.scale.x / 2, y: this.center.y - this.scale.y / 2 };
        const bottomleft = { x: this.center.x - this.scale.x / 2, y: this.center.y + this.scale.y / 2 };
        const bottomright = { x: this.center.x + this.scale.x / 2, y: this.center.y + this.scale.y / 2 };

        const topleftScreen = scene.worldToScreen(topleft.x, topleft.y);
        const toprightScreen = scene.worldToScreen(topright.x, topright.y);
        const bottomleftScreen = scene.worldToScreen(bottomleft.x, bottomleft.y);
        const bottomrightScreen = scene.worldToScreen(bottomright.x, bottomright.y);

        if (Math.abs(topleftScreen.x - mousepos.x) <= INTERACT_BOX_SIZE &&
            Math.abs(topleftScreen.y - mousepos.y) <= INTERACT_BOX_SIZE) {
            return isShifting ?
                (delta) => { this.center.translate(delta) } :
                (delta) => { this.scale.x += delta.x; this.scale.y += delta.y; };
        }
        else if (Math.abs(toprightScreen.x - mousepos.x) <= INTERACT_BOX_SIZE &&
            Math.abs(toprightScreen.y - mousepos.y) <= INTERACT_BOX_SIZE) {
            return isShifting ?
                (delta) => { this.center.translate(delta) } :
                (delta) => { this.scale.x += delta.x; this.scale.y += delta.y; };
        }
        else if (Math.abs(bottomleftScreen.x - mousepos.x) <= INTERACT_BOX_SIZE &&
            Math.abs(bottomleftScreen.y - mousepos.y) <= INTERACT_BOX_SIZE) {
            return isShifting ?
                (delta) => { this.center.translate(delta) } :
                (delta) => { this.scale.x += delta.x; this.scale.y += delta.y; };
        }
        else if (Math.abs(bottomrightScreen.x - mousepos.x) <= INTERACT_BOX_SIZE &&
            Math.abs(bottomrightScreen.y - mousepos.y) <= INTERACT_BOX_SIZE) {
            return isShifting ?
                (delta) => { this.center.translate(delta) } :
                (delta) => { this.scale.x += delta.x; this.scale.y += delta.y; };
        }
        return null;
    }

}