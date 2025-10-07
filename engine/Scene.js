export class Scene {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.task = null;
        this.objects = [];
        // Окружение для преобразования координат
        this.scale = 50.0; // Масштаб
        this.offsetX = window.innerWidth / 2; // Смещение по X
        this.offsetY = window.innerHeight / 2; // Смещение по Y

        this.text = '';

        this.isShifting = false; // Флаг для проверки зажат ли Shift
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Shift') {
                this.isShifting = true;
            }
        });
        window.addEventListener('keyup', (e) => {
            if (e.key === 'Shift') {
                this.isShifting = false;
            }
        });

        // Подписка на события мыши
        this.isMouseDown = false;
        this.lastMousePos = null;
        this.interactingCallback = null;
        canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        canvas.addEventListener('mouseleave', this.onMouseLeave.bind(this));
        canvas.addEventListener('wheel', this.onScroll.bind(this));

        this.render();
    }
    // Получение координат мыши относительно canvas
    getMouseScreenPos(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = (event.clientY - rect.top);
        return { x, y };
    }

    getMouseWorldPos(event) {
        const screenPos = this.getMouseScreenPos(event);
        return this.screenToWorld(screenPos.x, this.canvas.height - screenPos.y);
    }

    onMouseDown(event) {
        this.isMouseDown = true;
        this.lastMousePos = this.getMouseScreenPos(event);
        this.mouseDownPos = this.lastMousePos;
        // ...дополнительная логика при нажатии...
    }

    onMouseUp(event) {
        event.preventDefault();

        this.isMouseDown = false;
        this.lastMousePos = this.getMouseScreenPos(event);
        this.interactingCallback = null;
        // ...дополнительная логика при отпускании...

        if (Math.abs(this.mouseDownPos.x - this.lastMousePos.x) < 3 && Math.abs(this.mouseDownPos.y - this.lastMousePos.y) < 3) {
            // Клик
            for (const obj of this.objects) {
                if (obj.clicked) {
                    if (obj.clicked(this.lastMousePos, this, this.isShifting)) {
                        this.task.update();
                        this.render();
                    }
                }
            }
        }
    }

    onMouseMove(event) {
        const pos = this.getMouseScreenPos(event);

        this.text = `${this.screenToWorld(pos.x, pos.y).x.toFixed(2)} ; ${this.screenToWorld(pos.x, pos.y).y.toFixed(2)}`;

        if (this.isMouseDown) {
            // Движение объектов
            if (!this.interactingCallback) {
                for (const obj of this.objects) {
                    if (obj && obj.isDraggable) {
                        const interactFunc = obj.getClosestInteractPoint(pos, this, this.isShifting);
                        if (interactFunc) {
                            this.interactingCallback = interactFunc;
                            this.lastMousePos = pos;
                            return;
                        }
                    }
                }
            }
            else {
                // Перемещаем объект
                const screenDelta = { x: pos.x - this.lastMousePos.x, y: pos.y - this.lastMousePos.y };
                this.interactingCallback(this.screenDeltaIntoWorld(screenDelta));
                this.task.update();
                this.lastMousePos = pos;
                this.render();
                return;
            }

            // Движение холста
            const dx = pos.x - this.lastMousePos.x;
            const dy = -(pos.y - this.lastMousePos.y);
            this.setOffset(this.offsetX + dx, this.offsetY + dy);
            this.task.softUpdate();
            this.render();
            // ...логика при перемещении с зажатой кнопкой...
        }
        // ...логика при перемещении мыши...
        this.lastMousePos = pos;
    }

    onMouseLeave(event) {
        this.isMouseDown = false;
        this.lastMousePos = null;
        // ...логика при уходе мыши с canvas...
    }


    onScroll(event) {
        event.preventDefault();
        const mouseScreen = this.getMouseScreenPos(event);
        const mouseWorld = this.screenToWorld(mouseScreen.x, mouseScreen.y);

        const zoomSpeed = Math.min(1 / (1 + Math.log(this.scale) * 2), .1);
        const delta = Math.sign(event.deltaY) * -zoomSpeed * this.scale;
        const newScale = Math.max(this.scale + delta, 1);
        this.setScale(newScale);

        this.text = `${mouseWorld.x.toFixed(2)} ; ${mouseWorld.y.toFixed(2)}`;

        const newOffsetX = mouseScreen.x - mouseWorld.x * newScale;
        const newOffsetY = this.canvas.height - mouseScreen.y - mouseWorld.y * newScale;
        this.setOffset(newOffsetX, newOffsetY);
        this.render();
    }


    addObject(obj) {
        this.objects.push(obj);
    }

    // Перевод мировых координат в экранные
    worldToScreen(x, y) {
        return {
            x: (x * this.scale) + this.offsetX,
            y: this.canvas.height - ((y * this.scale) + this.offsetY)
        };
    }

    // Перевод экранных координат в мировые
    screenToWorld(x, y) {
        return {
            x: (x - this.offsetX) / this.scale,
            y: ((this.canvas.height - y) - this.offsetY) / this.scale
        };
    }

    screenDeltaIntoWorld(delta) {
        return {
            x: delta.x / this.scale,
            y: -delta.y / this.scale
        };
    }

    // Установка масштаба
    setScale(scale) {
        this.scale = scale;
    }

    // Установка смещения
    setOffset(offsetX, offsetY) {
        this.offsetX = offsetX;
        this.offsetY = offsetY;
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (const obj of this.objects) {
            if (obj) obj.draw(this.ctx, this);
        }

        // Отрисовка координат
        this.ctx.save();
        this.ctx.fillStyle = 'white';
        this.ctx.font = '30px Arial';
        this.ctx.fillText(this.text, 100, 100);
        this.ctx.restore();
    }
}