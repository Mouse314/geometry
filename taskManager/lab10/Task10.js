import { clearAllFields } from "../taskData/clearAllFields.js";
import SelectField from "../taskData/SelectField.js";
import Instruction from "../taskData/Instruction.js";
import { Point } from "../../objects/Point.js";

export default class Task10 {
    constructor(scene) {
        this.scene = scene;
        this.scene.task = this;
        this.name = "Лабораторная 10. Фракталы (GPU Accelerated)";
        this.description = "Выберите фрактал из списка для построения. Алгебраические фракталы считаются на GPU.";
        
        document.getElementById('task-name').innerText = this.name;
        document.getElementById('task-description').innerText = this.description;

        this.currentFractal = "triangle";
        this.depth = 4; // Default recursion depth
        
        this.glCanvas = null;
        this.gl = null;
        this.program = null;
        
        this.init();
    }

    init() {
        clearAllFields();
        
        const options = [
            { value: "triangle", label: "1.1 Фрактальный треугольник" },
            { value: "square", label: "1.2 Квадратный фрактал" },
            { value: "dragon_polyline", label: "1.3 Драконова ломаная" },
            { value: "dragon_harter", label: "1.4 Дракон Хартера-Хейтуэя" },
            { value: "koch", label: "1.5 Кривая Коха" },
            { value: "hilbert", label: "1.6 Кривая Гильберта" },
            { value: "snowflake", label: "1.7 Снежинка" },
            { value: "twisted_square", label: "1.8 Закрученный квадрат" },
            { value: "julia", label: "2.1 Множество Жулиа" },
            { value: "mandelbrot", label: "2.2 Мандельбротовы облака" },
            { value: "newton", label: "2.3 Фрактал Ньютона" },
            { value: "spider", label: "2.4 Фрактал Паук" },
            { value: "apollon", label: "2.5 Множество Аполлона" },
            { value: "biomorph", label: "2.6 Биоморфы" },
            { value: "tree", label: "3.1 Фрактальное дерево" },
            { value: "brownian", label: "3.2 Броуновское движение" },
            { value: "plasma", label: "3.3 Плазма" },
            { value: "random_koch", label: "3.4 Рандомизированная звезда Коха" },
        ];

        new SelectField("Фрактал", this.currentFractal, options, (val) => {
            this.currentFractal = val;
            this.update();
        }, this.scene);

        new Instruction("Используйте колесико мыши для масштабирования.");
        
        this.initWebGL();

        // Add a renderer object to the scene
        this.scene.objects = [{
            draw: (ctx, scene) => this.renderFractal(ctx, scene)
        }];
        
        this.update();
    }

    initWebGL() {
        this.glCanvas = document.createElement('canvas');
        this.gl = this.glCanvas.getContext('webgl');
        
        if (!this.gl) {
            console.error("WebGL not supported");
            return;
        }

        const vsSource = `
            attribute vec2 position;
            void main() {
                gl_Position = vec4(position, 0.0, 1.0);
            }
        `;

        const fsSource = `
            precision highp float;
            uniform vec2 u_resolution;
            uniform vec2 u_offset;
            uniform float u_scale;
            uniform int u_type;
            uniform int u_maxIter;

            // Helper for color
            vec4 getColor(int iter, int max) {
                if (iter == max) return vec4(0.0, 0.0, 0.0, 1.0);
                float t = float(iter) / float(max);
                float r = 9.0 * (1.0 - t) * t * t;
                float g = 15.0 * (1.0 - t) * (1.0 - t) * t;
                float b = 8.5 * (1.0 - t) * (1.0 - t) * (1.0 - t);
                return vec4(r, g, b, 1.0);
            }

            void main() {
                // gl_FragCoord.y is 0 at bottom.
                // wy = (gl_FragCoord.y - u_offset.y) / u_scale
                
                float wx = (gl_FragCoord.x - u_offset.x) / u_scale;
                float wy = (gl_FragCoord.y - u_offset.y) / u_scale;
                
                int iter = 0;
                bool escaped = false;
                
                if (u_type == 0) { // Mandelbrot
                    float zx = 0.0;
                    float zy = 0.0;
                    float zx2 = 0.0;
                    float zy2 = 0.0;
                    for (int i = 0; i < 1000; i++) {
                        if (i >= u_maxIter) break;
                        if (zx2 + zy2 > 4.0) break;
                        zy = 2.0 * zx * zy + wy;
                        zx = zx2 - zy2 + wx;
                        zx2 = zx * zx;
                        zy2 = zy * zy;
                        iter++;
                    }
                    gl_FragColor = getColor(iter, u_maxIter);

                } else if (u_type == 1) { // Julia
                    float cx = -0.7;
                    float cy = 0.27015;
                    float zx = wx;
                    float zy = wy;
                    float zx2 = zx * zx;
                    float zy2 = zy * zy;
                    for (int i = 0; i < 1000; i++) {
                        if (i >= u_maxIter) break;
                        if (zx2 + zy2 > 4.0) break;
                        zy = 2.0 * zx * zy + cy;
                        zx = zx2 - zy2 + cx;
                        zx2 = zx * zx;
                        zy2 = zy * zy;
                        iter++;
                    }
                    gl_FragColor = getColor(iter, u_maxIter);

                } else if (u_type == 2) { // Newton
                    float zx = wx;
                    float zy = wy;
                    float tol = 0.001;
                    for (int i = 0; i < 1000; i++) {
                        if (i >= u_maxIter) break;
                        
                        float zx2 = zx * zx;
                        float zy2 = zy * zy;
                        float r2 = zx2 + zy2;
                        if (r2 == 0.0) break;
                        float r4 = r2 * r2;
                        
                        float invZ2x = (zx2 - zy2) / r4;
                        float invZ2y = (-2.0 * zx * zy) / r4;
                        
                        float nx = 0.6666 * zx + 0.3333 * invZ2x;
                        float ny = 0.6666 * zy + 0.3333 * invZ2y;
                        
                        float dx = nx - zx;
                        float dy = ny - zy;
                        
                        zx = nx;
                        zy = ny;
                        
                        if (dx*dx + dy*dy < tol*tol) {
                            iter = i; // Converged
                            break;
                        }
                        iter++;
                    }
                    gl_FragColor = getColor(iter, u_maxIter);

                } else if (u_type == 3) { // Spider
                    float curCx = wx;
                    float curCy = wy;
                    float zx = 0.0;
                    float zy = 0.0;
                    
                    for (int i = 0; i < 1000; i++) {
                        if (i >= u_maxIter) break;
                        if (zx*zx + zy*zy > 4.0) break;
                        
                        float tmp = zx*zx - zy*zy + curCx;
                        zy = 2.0 * zx * zy + curCy;
                        zx = tmp;
                        
                        curCx = curCx / 2.0 + zx;
                        curCy = curCy / 2.0 + zy;
                        
                        iter++;
                    }
                    gl_FragColor = getColor(iter, u_maxIter);

                } else if (u_type == 4) { // Biomorph
                    float cx = wx;
                    float cy = wy;
                    float zx = 0.0;
                    float zy = 0.0;
                    
                    for (int i = 0; i < 1000; i++) {
                        if (i >= u_maxIter) break;
                        
                        float tmp = zx*zx - zy*zy + cx;
                        zy = 2.0 * zx * zy + cy;
                        zx = tmp;
                        
                        if (abs(zx) > 10.0 || abs(zy) > 10.0) {
                            escaped = true;
                            break;
                        }
                        iter++;
                    }
                    
                    if (!escaped && (abs(zx) < 2.0 || abs(zy) < 2.0)) {
                        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
                    } else {
                        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
                    }

                } else if (u_type == 5) { // Plasma
                    // Use gl_FragCoord directly for screen space pattern
                    float x = gl_FragCoord.x;
                    float y = u_resolution.y - gl_FragCoord.y; // Flip Y to match canvas
                    float v = sin(x / 20.0) + sin(y / 20.0) + sin((x + y) / 20.0);
                    float c = (v + 3.0) * 40.0 / 255.0;
                    gl_FragColor = vec4(c, c, 1.0, 1.0);
                }
            }
        `;

        const shaderProgram = this.initShaderProgram(this.gl, vsSource, fsSource);
        this.program = shaderProgram;

        this.programInfo = {
            program: shaderProgram,
            attribLocations: {
                position: this.gl.getAttribLocation(shaderProgram, 'position'),
            },
            uniformLocations: {
                resolution: this.gl.getUniformLocation(shaderProgram, 'u_resolution'),
                offset: this.gl.getUniformLocation(shaderProgram, 'u_offset'),
                scale: this.gl.getUniformLocation(shaderProgram, 'u_scale'),
                type: this.gl.getUniformLocation(shaderProgram, 'u_type'),
                maxIter: this.gl.getUniformLocation(shaderProgram, 'u_maxIter'),
            },
        };

        // Create buffer for full screen quad
        const positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        const positions = [
            -1.0,  1.0,
             1.0,  1.0,
            -1.0, -1.0,
             1.0, -1.0,
        ];
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);
        this.positionBuffer = positionBuffer;
    }

    initShaderProgram(gl, vsSource, fsSource) {
        const vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
            return null;
        }
        return shaderProgram;
    }

    loadShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    update() {
        this.scene.render();
    }
    
    softUpdate() {
        this.update();
    }

    renderFractal(ctx, scene) {
        const width = scene.canvas.width;
        const height = scene.canvas.height;

        ctx.save();
        
        const pixelFractals = ["mandelbrot", "julia", "newton", "spider", "biomorph", "plasma"];
        if (pixelFractals.includes(this.currentFractal)) {
             this.renderWebGL(ctx, scene, pixelFractals.indexOf(this.currentFractal));
        } else {
             this.drawGeometricFractal(ctx);
        }
        
        ctx.restore();
    }

    renderWebGL(ctx, scene, typeIndex) {
        if (!this.gl) return;

        const width = scene.canvas.width;
        const height = scene.canvas.height;

        // Resize WebGL canvas if needed
        if (this.glCanvas.width !== width || this.glCanvas.height !== height) {
            this.glCanvas.width = width;
            this.glCanvas.height = height;
            this.gl.viewport(0, 0, width, height);
        }

        this.gl.useProgram(this.program);

        // Bind buffer
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.vertexAttribPointer(
            this.programInfo.attribLocations.position,
            2,
            this.gl.FLOAT,
            false,
            0,
            0
        );
        this.gl.enableVertexAttribArray(this.programInfo.attribLocations.position);

        // Set uniforms
        this.gl.uniform2f(this.programInfo.uniformLocations.resolution, width, height);
        this.gl.uniform2f(this.programInfo.uniformLocations.offset, scene.offsetX, scene.offsetY);
        this.gl.uniform1f(this.programInfo.uniformLocations.scale, scene.scale);
        this.gl.uniform1i(this.programInfo.uniformLocations.type, typeIndex);
        this.gl.uniform1i(this.programInfo.uniformLocations.maxIter, 50);

        // Draw
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

        // Composite to main canvas
        ctx.drawImage(this.glCanvas, 0, 0);
    }

    drawGeometricFractal(ctx) {
        ctx.strokeStyle = "white";
        ctx.lineWidth = 1;
        
        switch (this.currentFractal) {
            case "triangle":
                this.drawSierpinskiTriangle(ctx, -10, -10, 20, this.depth);
                break;
            case "square":
                this.drawSierpinskiCarpet(ctx, -10, -10, 20, this.depth);
                break;
            case "dragon_polyline":
            case "dragon_harter":
                this.drawDragon(ctx, -5, 0, 5, 0, 10);
                break;
            case "koch":
                this.drawKoch(ctx, -10, 0, 10, 0, this.depth);
                break;
            case "snowflake":
                this.drawSnowflake(ctx, 0, 0, 15, this.depth);
                break;
            case "hilbert":
                this.drawHilbert(ctx, 0, 0, 20, 5);
                break;
            case "twisted_square":
                this.drawTwistedSquare(ctx, 0, 0, 10, 0, this.depth * 2);
                break;
            case "apollon":
                this.drawApollonian(ctx, 0, 0, 10, this.depth);
                break;
            case "tree":
                this.drawTree(ctx, 0, -10, 5, Math.PI/2, 8);
                break;
            case "brownian":
                this.drawBrownian(ctx, -10, 0, 10, 0, 8);
                break;
            case "random_koch":
                this.drawRandomKoch(ctx, -10, 0, 10, 0, this.depth);
                break;
        }
    }

    // --- Geometric Implementations ---

    drawSierpinskiTriangle(ctx, x, y, size, depth) {
        if (depth === 0) {
            const p1 = this.scene.worldToScreen(x, y);
            const p2 = this.scene.worldToScreen(x + size, y);
            const p3 = this.scene.worldToScreen(x + size / 2, y + size * Math.sqrt(3) / 2);
            
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.lineTo(p3.x, p3.y);
            ctx.closePath();
            ctx.stroke();
        } else {
            const newSize = size / 2;
            this.drawSierpinskiTriangle(ctx, x, y, newSize, depth - 1);
            this.drawSierpinskiTriangle(ctx, x + newSize, y, newSize, depth - 1);
            this.drawSierpinskiTriangle(ctx, x + newSize / 2, y + newSize * Math.sqrt(3) / 2, newSize, depth - 1);
        }
    }

    drawSierpinskiCarpet(ctx, x, y, size, depth) {
        if (depth === 0) {
            const s = this.scene.worldToScreen(x, y);
            const e = this.scene.worldToScreen(x + size, y + size);
            ctx.strokeRect(s.x, s.y, e.x - s.x, e.y - s.y);
        } else {
            const newSize = size / 3;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (i === 1 && j === 1) continue;
                    this.drawSierpinskiCarpet(ctx, x + i * newSize, y + j * newSize, newSize, depth - 1);
                }
            }
        }
    }

    drawDragon(ctx, x1, y1, x2, y2, depth) {
        if (depth === 0) {
            const p1 = this.scene.worldToScreen(x1, y1);
            const p2 = this.scene.worldToScreen(x2, y2);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        } else {
            const dx = x2 - x1;
            const dy = y2 - y1;
            const nx = x1 + (dx - dy) / 2;
            const ny = y1 + (dx + dy) / 2;
            this.drawDragon(ctx, x1, y1, nx, ny, depth - 1);
            this.drawDragon(ctx, x2, y2, nx, ny, depth - 1);
        }
    }

    drawKoch(ctx, x1, y1, x2, y2, depth) {
        if (depth === 0) {
            const p1 = this.scene.worldToScreen(x1, y1);
            const p2 = this.scene.worldToScreen(x2, y2);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        } else {
            const dx = x2 - x1;
            const dy = y2 - y1;
            const p1x = x1 + dx / 3;
            const p1y = y1 + dy / 3;
            const p3x = x1 + 2 * dx / 3;
            const p3y = y1 + 2 * dy / 3;
            
            const p2x = p1x + (dx / 3) * Math.cos(-Math.PI / 3) - (dy / 3) * Math.sin(-Math.PI / 3);
            const p2y = p1y + (dx / 3) * Math.sin(-Math.PI / 3) + (dy / 3) * Math.cos(-Math.PI / 3);

            this.drawKoch(ctx, x1, y1, p1x, p1y, depth - 1);
            this.drawKoch(ctx, p1x, p1y, p2x, p2y, depth - 1);
            this.drawKoch(ctx, p2x, p2y, p3x, p3y, depth - 1);
            this.drawKoch(ctx, p3x, p3y, x2, y2, depth - 1);
        }
    }

    drawSnowflake(ctx, x, y, size, depth) {
        const h = size * Math.sqrt(3) / 2;
        const p1 = { x: x - size / 2, y: y - h / 3 };
        const p2 = { x: x + size / 2, y: y - h / 3 };
        const p3 = { x: x, y: y + 2 * h / 3 };
        
        this.drawKoch(ctx, p1.x, p1.y, p2.x, p2.y, depth);
        this.drawKoch(ctx, p2.x, p2.y, p3.x, p3.y, depth);
        this.drawKoch(ctx, p3.x, p3.y, p1.x, p1.y, depth);
    }

    drawHilbert(ctx, x, y, size, depth) {
        const hilbert = (x, y, xi, xj, yi, yj, n) => {
            if (n <= 0) {
                const p = this.scene.worldToScreen(x + (xi + yi) / 2, y + (xj + yj) / 2);
                ctx.lineTo(p.x, p.y);
            } else {
                hilbert(x, y, yi / 2, yj / 2, xi / 2, xj / 2, n - 1);
                hilbert(x + xi / 2, y + xj / 2, xi / 2, xj / 2, yi / 2, yj / 2, n - 1);
                hilbert(x + xi / 2 + yi / 2, y + xj / 2 + yj / 2, xi / 2, xj / 2, yi / 2, yj / 2, n - 1);
                hilbert(x + xi / 2 + yi, y + xj / 2 + yj, -yi / 2, -yj / 2, -xi / 2, -xj / 2, n - 1);
            }
        };
        
        ctx.beginPath();
        hilbert(x - size/2, y - size/2, size, 0, 0, size, depth);
        ctx.stroke();
    }

    drawTwistedSquare(ctx, x, y, size, angle, depth) {
        if (depth === 0) return;
        
        const half = size / 2;
        const corners = [
            {x: -half, y: -half}, {x: half, y: -half}, {x: half, y: half}, {x: -half, y: half}
        ];
        
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
            const rx = corners[i].x * Math.cos(angle) - corners[i].y * Math.sin(angle);
            const ry = corners[i].x * Math.sin(angle) + corners[i].y * Math.cos(angle);
            const sp = this.scene.worldToScreen(x + rx, y + ry);
            if (i === 0) ctx.moveTo(sp.x, sp.y);
            else ctx.lineTo(sp.x, sp.y);
        }
        ctx.closePath();
        ctx.stroke();
        
        this.drawTwistedSquare(ctx, x, y, size * 0.9, angle + 0.1, depth - 1);
    }

    drawApollonian(ctx, x, y, r, depth) {
        if (depth === 0) return;
        
        const sp = this.scene.worldToScreen(x, y);
        const sp2 = this.scene.worldToScreen(x + r, y);
        const sr = Math.abs(sp2.x - sp.x);
        
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sr, 0, Math.PI * 2);
        ctx.stroke();
        
        const newR = r / 2.15;
        
        this.drawApollonian(ctx, x + r/2, y + r/4, newR, depth - 1);
        this.drawApollonian(ctx, x - r/2, y + r/4, newR, depth - 1);
        this.drawApollonian(ctx, x, y - r/2, newR, depth - 1);
    }

    drawTree(ctx, x, y, len, angle, depth) {
        if (depth === 0) return;
        
        const x2 = x + len * Math.cos(angle);
        const y2 = y + len * Math.sin(angle);
        
        const p1 = this.scene.worldToScreen(x, y);
        const p2 = this.scene.worldToScreen(x2, y2);
        
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        
        this.drawTree(ctx, x2, y2, len * 0.7, angle - 0.5, depth - 1);
        this.drawTree(ctx, x2, y2, len * 0.7, angle + 0.5, depth - 1);
    }

    drawBrownian(ctx, x1, y1, x2, y2, depth) {
        if (depth === 0) {
            const p1 = this.scene.worldToScreen(x1, y1);
            const p2 = this.scene.worldToScreen(x2, y2);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        } else {
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            const dist = Math.hypot(x2 - x1, y2 - y1);
            const offset = (Math.random() - 0.5) * dist * 0.5;
            
            this.drawBrownian(ctx, x1, y1, midX, midY + offset, depth - 1);
            this.drawBrownian(ctx, midX, midY + offset, x2, y2, depth - 1);
        }
    }

    drawRandomKoch(ctx, x1, y1, x2, y2, depth) {
        if (depth === 0) {
            const p1 = this.scene.worldToScreen(x1, y1);
            const p2 = this.scene.worldToScreen(x2, y2);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        } else {
            const dx = x2 - x1;
            const dy = y2 - y1;
            const p1x = x1 + dx / 3;
            const p1y = y1 + dy / 3;
            const p3x = x1 + 2 * dx / 3;
            const p3y = y1 + 2 * dy / 3;
            
            const sign = Math.random() > 0.5 ? 1 : -1;
            
            const p2x = p1x + (dx / 3) * Math.cos(-sign * Math.PI / 3) - (dy / 3) * Math.sin(-sign * Math.PI / 3);
            const p2y = p1y + (dx / 3) * Math.sin(-sign * Math.PI / 3) + (dy / 3) * Math.cos(-sign * Math.PI / 3);

            this.drawRandomKoch(ctx, x1, y1, p1x, p1y, depth - 1);
            this.drawRandomKoch(ctx, p1x, p1y, p2x, p2y, depth - 1);
            this.drawRandomKoch(ctx, p2x, p2y, p3x, p3y, depth - 1);
            this.drawRandomKoch(ctx, p3x, p3y, x2, y2, depth - 1);
        }
    }
}
