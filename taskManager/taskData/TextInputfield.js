export default class TextInputfield {
    constructor(fieldName, value, updateCollback, scene) {
        this.fieldName = fieldName;
        this.value = value;
        this.updateCollback = updateCollback;
        this.scene = scene;

        this.addInputField();
    }

    addInputField() {
        let container = document.getElementById('task-data');
        const field = document.createElement('div');

        const name = document.createElement('span');
        name.innerText = `${this.fieldName}: `;
        name.style.color = 'white';
        field.appendChild(name);

        const input = document.createElement('input');
        input.type = 'number';
        input.value = this.value;
        input.style.marginLeft = '10px';
        
        field.appendChild(input);

        const updateButton = document.createElement('button');
        updateButton.innerText = 'Применить';
        updateButton.style.marginLeft = '10px';
        updateButton.addEventListener('click', () => {
            this.updateCollback(input.value);
        });
        field.appendChild(updateButton);

        container.appendChild(field);
    }
}