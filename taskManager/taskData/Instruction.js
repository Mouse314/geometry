export default class Instruction {
    constructor(text) {
        this.text = text;
        this.display();
    }

    display() {
        const container = document.getElementById('task-instructions');
        if (!container) return;

        // Удалим старые блоки инструкции
        container.querySelectorAll('.instruction-block').forEach(n => n.remove());

        const block = document.createElement('div');
        block.className = 'instruction-block';
        block.style.cssText = `
            background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.06));
            padding: 12px 14px;
            border-radius: 8px;
            color: #eef;
            margin-top: 10px;
            box-shadow: 0 6px 18px rgba(0,0,0,0.25);
            font-size: 0.95rem;
            line-height: 1.4;
        `;

        // Заголовок
        const h = document.createElement('div');
        h.innerText = 'Управление';
        h.style.cssText = 'font-weight:700; margin-bottom:8px; color:#ffd770;';
        block.appendChild(h);

        if (Array.isArray(this.text)) {
            const ul = document.createElement('ul');
            ul.style.cssText = 'margin:0; padding-left:1.1em;';
            for (const item of this.text) {
                const li = document.createElement('li');
                li.innerText = item;
                li.style.margin = '6px 0';
                ul.appendChild(li);
            }
            block.appendChild(ul);
        } else if (typeof this.text === 'string') {
            const p = document.createElement('p');
            p.innerText = this.text;
            p.style.margin = '0';
            block.appendChild(p);
        } else if (this.text && typeof this.text === 'object') {
            // объект со структурой {title, items}
            if (this.text.title) {
                const t = document.createElement('div');
                t.innerText = this.text.title;
                t.style.fontWeight = '600';
                t.style.marginBottom = '6px';
                block.appendChild(t);
            }
            if (Array.isArray(this.text.items)) {
                const ul = document.createElement('ul');
                ul.style.cssText = 'margin:0; padding-left:1.1em;';
                for (const item of this.text.items) {
                    const li = document.createElement('li');
                    li.innerText = item;
                    li.style.margin = '6px 0';
                    ul.appendChild(li);
                }
                block.appendChild(ul);
            }
        }

        container.appendChild(block);
        // Открываем details чтобы блок был виден
        container.open = true;
    }
}
