import Task1 from "./lab4/Task1.js";
import Task2 from "./lab4/Task2.js";
import Task3 from "./lab4/Task3.js";
import Task51 from "./lab5/Task51.js";
import Task61 from "./lab6/Task61.js";
import Task62 from "./lab6/Task62.js";
import Task63 from "./lab6/Task63.js";
import Task71 from "./lab7/Task71.js";
import Task81 from "./lab8/Task81.js";
import Task91 from "./lab9/Task91.js";
import Task92 from "./lab9/Task92.js";
import Task10 from "./lab10/Task10.js";

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
        else if (id === 51) this.setTask(new Task51(this.scene));
        else if (id === 61) this.setTask(new Task61(this.scene));
        else if (id === 62) this.setTask(new Task62(this.scene));
        else if (id === 63) this.setTask(new Task63(this.scene));
        else if (id === 71) this.setTask(new Task71(this.scene));
        else if (id === 81) this.setTask(new Task81(this.scene));
        else if (id === 91) this.setTask(new Task91(this.scene));
        else if (id === 92) this.setTask(new Task92(this.scene));
        else if (id === 101) this.setTask(new Task10(this.scene));
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