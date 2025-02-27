class Triangle {
    constructor() {
        this.type = 'triangle';
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
    }

    render() {
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        gl.uniform1f(u_Size, this.size);

        let d = this.size / 200.0;
        drawTriangle([
            this.position[0], this.position[1],
            this.position[0] + d, this.position[1],
            this.position[0], this.position[1] + d
        ]);
    }
}

let g_vertexBuffer = null;

function initTriangle3D() {
    if (!g_vertexBuffer) {
        g_vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);
    }
}

function drawTriangle(vertices) {
    if (!g_vertexBuffer) initTriangle3D();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);
}

let g_uvBuffer = null;

function drawTriangle3DUV(vertices, uv) {
    if (!g_vertexBuffer) g_vertexBuffer = gl.createBuffer();
    if (!g_uvBuffer) g_uvBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.bindBuffer(gl.ARRAY_BUFFER, g_uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_UV);

    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);
}

let g_normalBuffer = null;

function drawTriangle3DUVNormal(vertices, uv, normals) {
    if (!g_vertexBuffer) g_vertexBuffer = gl.createBuffer();
    if (!g_uvBuffer) g_uvBuffer = gl.createBuffer();
    if (!g_normalBuffer) g_normalBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.bindBuffer(gl.ARRAY_BUFFER, g_uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_UV);

    gl.bindBuffer(gl.ARRAY_BUFFER, g_normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Normal);

    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);
}
