export default class BooleanField {
    constructor(fieldName, value, updateCollback, scene) {
        this.fieldName = fieldName;
        this.value = value;
        this.updateCollback = updateCollback;
        this.scene = scene;

        this.addInputField();
    }

    addInputField() {
        console.log('add input field');
        let container = document.getElementById('task-data');
        const field = document.createElement('div');

        const name = document.createElement('span');
        name.innerText = `${this.fieldName}: `;
        name.style.color = 'white';
        field.appendChild(name);

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = this.value;
        input.style.marginLeft = '10px';
        input.addEventListener('change', () => {
            this.updateCollback(input.checked);
        });
        
        field.appendChild(input);

        container.appendChild(field);
    }
}