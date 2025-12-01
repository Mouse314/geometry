import { Scene } from "./engine/Scene.js";
import TaskHub from "./taskManager/TaskHub.js";
import Task1 from "./taskManager/lab4/Task1.js";
import Task2 from "./taskManager/lab4/Task2.js";
import Task3 from "./taskManager/lab4/Task3.js";
import Task51 from "./taskManager/lab5/Task51.js";
import Task61 from "./taskManager/lab6/Task61.js";
import Task81 from "./taskManager/lab8/Task81.js";

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.style.background = 'black';

const scene = new Scene(canvas);


const taskManager = new TaskHub(scene);
taskManager.setTask(new Task81(scene));


function resizeCanvasToBlock() {
    const block = canvas.parentElement;
    const rect = block.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    scene.render();
}

window.addEventListener('resize', resizeCanvasToBlock);
resizeCanvasToBlock();

document.getElementById('l4t1').onclick = () => {
    taskManager.setTaskById(1);
}
document.getElementById('l4t2').onclick = () => {
    taskManager.setTaskById(2);
}
document.getElementById('l4t3').onclick = () => {
    taskManager.setTaskById(3);
}
document.getElementById('l5t1').onclick = () => {
    taskManager.setTaskById(51);
}
document.getElementById('l6t1').onclick = () => {
    taskManager.setTaskById(61);
}
document.getElementById('l6t2').onclick = () => {
    taskManager.setTaskById(62);
}
document.getElementById('l6t3').onclick = () => {
    taskManager.setTaskById(63);
}
document.getElementById('l7t1').onclick = () => {
    taskManager.setTaskById(71);
}
document.getElementById('l8t1').onclick = () => {
    taskManager.setTaskById(81);
}
document.getElementById('l9t1').onclick = () => {
    taskManager.setTaskById(91);
}
document.getElementById('l9t2').onclick = () => {
    taskManager.setTaskById(92);
}
document.getElementById('l10t1').onclick = () => {
    taskManager.setTaskById(101);
}