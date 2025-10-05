import { INTERACT_BOX_SIZE } from "../engine/Constants.js";

export class Text {

    constructor(position, color, size, text = '', isDraggable = false) {
        this.position = position;
        this.color = color || 'white';
        this.text = text;
        this.size = size || 5;
        this.isDraggable = isDraggable;
    }

    calculateScreenCoordinates(scene) {
        return scene.worldToScreen(this.position.x, this.position.y);
    }

    draw(ctx, scene) {
        const screenCoords = this.calculateScreenCoordinates(scene);
        ctx.fillStyle = this.color;
        ctx.font = `${this.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(this.text, screenCoords.x, screenCoords.y);
    }

    getClosestInteractPoint(mousepos, scene, isShifting) {
        const screenPos = scene.worldToScreen(this.position.x, this.position.y);

        if (Math.abs(screenPos.x - mousepos.x) <= this.size &&
            Math.abs(screenPos.y - mousepos.y) <= this.size) {
            return (delta) => {this.position.translate(delta)};
        }
        else return null;
    }
}