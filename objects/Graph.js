import { Segment } from "./Segment.js";
import { Point } from "./Point.js";

export class Graph {
    constructor(scene, isDraggable = true) {

        this.isDraggable = isDraggable;

        this.scene = scene;
        this.verticies = [
            new Point(0, 2, 'red', 10, 'A', this.isDraggable),
            new Point(5, 0, 'red', 10, 'B', this.isDraggable),
            new Point(6, 6, 'red', 10, 'C', this.isDraggable),
            new Point(0, 4, 'red', 10, 'D', this.isDraggable)
        ];
        this.edges = [
            new Segment(this.verticies[0], this.verticies[1], 'blue', this.isDraggable),
            new Segment(this.verticies[1], this.verticies[2], 'blue', this.isDraggable),
            new Segment(this.verticies[2], this.verticies[3], 'blue', this.isDraggable),
            new Segment(this.verticies[3], this.verticies[0], 'blue', this.isDraggable)
        ];

        this.selectedVertex = null;

        this.isEditing = false;
    }

    draw(ctx, scene) {
        this.edges.forEach(edge => edge.draw(ctx, scene));
        this.verticies.forEach(vertex => vertex.draw(ctx, scene));
    }

    getClosestInteractPoint(mousepos, scene, isShifting) {
        for (const vertex of this.verticies) {
            const interactFunc = vertex.getClosestInteractPoint(mousepos, scene, isShifting);
            if (interactFunc) return isShifting ?
                (delta) => { this.verticies.forEach(v => v.translate(delta)); } :
                interactFunc;
        }
        return null;
    }

    clicked(mousepos, scene, isShifting) {
        // Соединяем и разъединяем вершины
        for (const vertex of this.verticies) {
            const interactFunc = vertex.getClosestInteractPoint(mousepos, scene, isShifting);
            if (interactFunc) {
                if (isShifting) { // Шифт - удаление вершины
                    this.verticies = this.verticies.filter(v => v !== vertex);
                    this.edges = this.edges.filter(e => !e.startPoint.areEquals(vertex) && !e.endPoint.areEquals(vertex)  );
                    return true;
                }
                if (this.selectedVertex === null) {
                    this.selectedVertex = vertex;
                    vertex.color = 'green'; // Выделяем выбранную вершину
                    return true;
                }
                else if (this.selectedVertex === vertex) {
                    // Снимаем выделение, если кликнули на ту же вершину
                    this.selectedVertex.color = 'red';
                    this.selectedVertex = null;
                    return true;
                }
                else {
                    // Проверяем, есть ли уже ребро между этими двумя вершинами
                    const existingEdge = this.edges.find(e => (e.areEquals(new Segment(this.selectedVertex, vertex))));
                    if (existingEdge) {
                        // Удаляем ребро
                        this.edges = this.edges.filter(e => e !== existingEdge);
                        this.selectedVertex.color = 'red';
                        this.selectedVertex = null;
                    } else {
                        // Добавляем новое ребро
                        this.edges.push(new Segment(this.selectedVertex, vertex, 'blue', this.isDraggable));
                        this.selectedVertex.color = 'red';
                        this.selectedVertex = null;
                    }
                    return true;
                }
            }
        }
        // Добавляем новую точку
        const worldPos = scene.screenToWorld(mousepos.x, mousepos.y);
        const newPoint = new Point(worldPos.x, worldPos.y, 'red', 10, String.fromCharCode(65 + this.verticies.length), this.isDraggable);
        this.verticies.push(newPoint);
        return true;
    }
}