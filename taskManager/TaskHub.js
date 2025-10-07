import Task1 from "./lab4/Task1.js";
import Task2 from "./lab4/Task2.js";
import Task3 from "./lab4/Task3.js";

export default class TaskHub {
    constructor(scene) {
        this.currentTask = null;
        this.scene = scene;
    }

    setTask(task) {
        this.currentTask = task;
    }

    setTaskById(id) {
        if (id === 1) this.setTask(new Task1(this.scene));
        else if (id === 2) this.setTask(new Task2(this.scene));
        else if (id === 3) this.setTask(new Task3(this.scene));
    }

    playCurrentTask() {
        if (this.currentTask) {
            this.currentTask.play();
        }
    }

    updateCurrentTask() {
        if (this.currentTask) {
            this.currentTask.update();
        }
    }
}