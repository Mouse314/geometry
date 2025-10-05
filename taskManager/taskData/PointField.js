export class PointField {
    constructor(point, scene) {
        this.point = point;
        this.scene = scene;
        this.inputX = null;
        this.inputY = null;
        
        this.addPoint();

        point.addSubscriber(this);
    }

    addPoint() {
        let container = document.getElementById('task-data');
        
        const field = document.createElement('div');
        field.className = 'point-field';
        field.style.display = 'flex';
        field.style.alignItems = 'center';
        field.style.justifyContent = 'space-between';

        // Название точки
        const pointName = document.createElement('span');
        pointName.innerText = `т. ${this.point.name.length > 0 ? this.point.name : 'Точка'}: `;
        pointName.style.color = this.point.color;
        field.appendChild(pointName);

        const positionWrapper = document.createElement('div');
        positionWrapper.style.display = 'flex';
        positionWrapper.style.alignItems = 'space-between';
        positionWrapper.style.gap = '10px';

        // X
        const inputX = document.createElement('input');
        inputX.type = 'number';
        inputX.value = this.point.x;
        inputX.required = true;
        inputX.style.width = '60px';
        inputX.addEventListener('input', (e) => {
            this.point.x = parseFloat(e.target.value);
            this.scene.render();
        });
        positionWrapper.appendChild(document.createTextNode('X: '));
        positionWrapper.appendChild(inputX);
        this.inputX = inputX;
        
        // Y
        const inputY = document.createElement('input');
        inputY.type = 'number';
        inputY.value = this.point.y;
        inputY.required = true;
        inputY.style.width = '60px';
        inputY.addEventListener('input', (e) => {
            this.point.y = parseFloat(e.target.value);
            this.scene.render();
        });
        positionWrapper.appendChild(document.createTextNode('Y: '));
        positionWrapper.appendChild(inputY);
        this.inputY = inputY;
        
        field.appendChild(positionWrapper);

        container.appendChild(field);
    }

    update(point) {
        this.inputX.value = point.x.toFixed(2);
        this.inputY.value = point.y.toFixed(2);
    }
}