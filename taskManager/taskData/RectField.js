export class RectField {
    constructor(rect, scene) {
        this.rect = rect;
        this.scene = scene;
        this.inputX = null;
        this.inputY = null;
        this.inputW = null;
        this.inputH = null;
        this.addRect();
        rect.addSubscriber(this);
    }

    addRect() {
        let container = document.getElementById('task-data');
        const field = document.createElement('div');
        field.className = 'rect-field';
        field.style.display = 'flex';
        field.style.alignItems = 'center';
        field.style.justifyContent = 'space-between';
        field.style.padding = '10px';

        // Название
        const rectName = document.createElement('span');
        rectName.innerText = `Прямоугольник: `;
        rectName.style.color = this.rect.color || 'cyan';
        field.appendChild(rectName);

        const positionWrapper = document.createElement('div');
        positionWrapper.style.display = 'grid';
        positionWrapper.style.gridTemplateColumns = '1fr 1fr 1fr 1fr';
        positionWrapper.style.gridTemplateRows = 'auto 1fr';
        positionWrapper.style.columnGap = '10px';

        // X
        const inputX = document.createElement('input');
        inputX.type = 'number';
        inputX.value = this.rect.center.x;
        inputX.required = true;
        inputX.style.width = '60px';
        inputX.addEventListener('input', (e) => {
            this.rect.center.x = parseFloat(e.target.value);
            this.scene.render();
        });
        positionWrapper.appendChild(document.createTextNode('X: '));
        positionWrapper.appendChild(inputX);
        this.inputX = inputX;

        // Y
        const inputY = document.createElement('input');
        inputY.type = 'number';
        inputY.value = this.rect.center.y;
        inputY.required = true;
        inputY.style.width = '60px';
        inputY.addEventListener('input', (e) => {
            this.rect.center.y = parseFloat(e.target.value);
            this.scene.render();
        });
        positionWrapper.appendChild(document.createTextNode('Y: '));
        positionWrapper.appendChild(inputY);
        this.inputY = inputY;

        // Width
        const inputW = document.createElement('input');
        inputW.type = 'number';
        inputW.value = this.rect.scale.x;
        inputW.required = true;
        inputW.style.width = '60px';
        inputW.addEventListener('input', (e) => {
            this.rect.scale.x = parseFloat(e.target.value);
            this.scene.render();
        });
        positionWrapper.appendChild(document.createTextNode('W: '));
        positionWrapper.appendChild(inputW);
        this.inputW = inputW;

        // Height
        const inputH = document.createElement('input');
        inputH.type = 'number';
        inputH.value = this.rect.scale.y;
        inputH.required = true;
        inputH.style.width = '60px';
        inputH.addEventListener('input', (e) => {
            this.rect.scale.y = parseFloat(e.target.value);
            this.scene.render();
        });
        positionWrapper.appendChild(document.createTextNode('H: '));
        positionWrapper.appendChild(inputH);
        this.inputH = inputH;

        field.appendChild(positionWrapper);
        container.appendChild(field);
    }

    update(rect) {
        this.inputX.value = rect.center.x.toFixed(2);
        this.inputY.value = rect.center.y.toFixed(2);
        this.inputW.value = rect.scale.x.toFixed(2);
        this.inputH.value = rect.scale.y.toFixed(2);
    }
}
