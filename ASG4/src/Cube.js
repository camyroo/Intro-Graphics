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
let g_cubeNormalBuffer = null;

function initCubeBuffers() {
    const vertices = new Float32Array([
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
    ]);

    const uv = new Float32Array([
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
    ]);

const normals = new Float32Array([
    // Front Face
    0, 0, -1,  0, 0, -1,  0, 0, -1, 
    0, 0, -1,  0, 0, -1,  0, 0, -1,

    // Back Face
    0, 0, 1,  0, 0, 1,  0, 0, 1,
    0, 0, 1,  0, 0, 1,  0, 0, 1,


    // Bottom Face
    0, 1, 0,  0, 1, 0,  0, 1, 0,
    0, 1, 0,  0, 1, 0,  0, 1, 0,
    
    // Top Face
    0, -1, 0,  0, -1, 0,  0, -1, 0,
    0, -1, 0,  0, -1, 0,  0, -1, 0,



    // Left Face
    -1, 0, 0,  -1, 0, 0,  -1, 0, 0,
    -1, 0, 0,  -1, 0, 0,  -1, 0, 0,

    // Right Face
    1, 0, 0,  1, 0, 0,  1, 0, 0,
    1, 0, 0,  1, 0, 0,  1, 0, 0
]);


    // Vertex Buffer
    g_cubeVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, g_cubeVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // UV Buffer
    g_cubeUVBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, g_cubeUVBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW);

    // Normal Buffer
    g_cubeNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, g_cubeNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
}

function drawCube() {
    if (!g_cubeVertexBuffer) initCubeBuffers();

    gl.bindBuffer(gl.ARRAY_BUFFER, g_cubeVertexBuffer);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.bindBuffer(gl.ARRAY_BUFFER, g_cubeUVBuffer);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_UV);

    gl.bindBuffer(gl.ARRAY_BUFFER, g_cubeNormalBuffer);
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Normal);

    gl.drawArrays(gl.TRIANGLES, 0, 36);
}
