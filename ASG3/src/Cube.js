class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.textureNum = -1;
    }

    render() {
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        drawCube();
    }
}

let g_cubeVertexBuffer = null;
let g_cubeUVBuffer = null;

function initCubeBuffers() {
    if (!g_cubeVertexBuffer) {
        g_cubeVertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, g_cubeVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            // Front Face
            0, 0, 0,  1, 1, 0,  1, 0, 0,
            0, 0, 0,  0, 1, 0,  1, 1, 0,

            // Back Face
            0, 0, 1,  1, 0, 1,  1, 1, 1,
            0, 0, 1,  0, 1, 1,  1, 1, 1,

            // Top Face
            0, 1, 0,  0, 1, 1,  1, 1, 1,
            0, 1, 0,  1, 1, 1,  1, 1, 0,

            // Bottom Face
            0, 0, 0,  1, 0, 0,  1, 0, 1,
            0, 0, 0,  1, 0, 1,  0, 0, 1,

            // Left Face
            0, 0, 0,  0, 1, 0,  0, 1, 1,
            0, 0, 0,  0, 1, 1,  0, 0, 1,

            // Right Face
            1, 0, 0,  1, 1, 1,  1, 1, 0,
            1, 0, 0,  1, 0, 1,  1, 1, 1
        ]), gl.STATIC_DRAW);
    }

    if (!g_cubeUVBuffer) {
        g_cubeUVBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, g_cubeUVBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            // Front Face
            0, 0,  1, 1,  1, 0,
            0, 0,  0, 1,  1, 1,

            // Back Face
            0, 0,  1, 0,  1, 1,
            0, 0,  0, 1,  1, 1,

            // Top Face
            0, 0,  0, 1,  1, 1,
            0, 0,  1, 1,  1, 0,

            // Bottom Face
            0, 0,  1, 0,  1, 1,
            0, 0,  1, 1,  0, 1,

            // Left Face
            0, 0,  0, 1,  1, 1,
            0, 0,  1, 1,  1, 0,

            // Right Face
            0, 0,  1, 1,  1, 0,
            0, 0,  0, 1,  1, 1
        ]), gl.STATIC_DRAW);
    }
}

function drawCube() {
    if (!g_cubeVertexBuffer) initCubeBuffers();

    gl.bindBuffer(gl.ARRAY_BUFFER, g_cubeVertexBuffer);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.bindBuffer(gl.ARRAY_BUFFER, g_cubeUVBuffer);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_UV);

    gl.drawArrays(gl.TRIANGLES, 0, 36); 
}
