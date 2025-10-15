export default class SelectField {
    constructor(fieldName, value, options, updateCallback, scene) {
        this.fieldName = fieldName;
        this.value = value;
        this.options = options; // массив вариантов
        this.updateCallback = updateCallback;
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

        const select = document.createElement('select');
        select.style.marginLeft = '10px';
        for (const opt of this.options) {
            const option = document.createElement('option');
            option.value = opt.value;
            option.innerText = opt.label || opt.value;
            if (opt.value === this.value) option.selected = true;
            select.appendChild(option);
        }
        select.addEventListener('change', () => {
            this.value = select.value;
            this.updateCallback(select.value);
        });
        field.appendChild(select);

        container.appendChild(field);
    }
}