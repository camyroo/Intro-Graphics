class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.textureNum = -1;
        this.cubeVerts32 = new Float32Array([
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
        this.cubeVerts = [ 
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
            1, 0, 0,  1, 0, 1,  1, 1, 1];


    }


    render() {

        var rgba = this.color;

        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        //Front of cube
        drawTriangle3DUV([0, 0, 0, 1, 1, 0, 1, 0, 0], [0, 0, 1, 1, 1, 0]);
        drawTriangle3DUV([0, 0, 0, 0, 1, 0, 1, 1, 0], [0, 0, 0, 1, 1, 1]);

        //Other sides of the cube, top, bottom, left, right, back
        // fill in

        gl.uniform4f(u_FragColor, rgba[0] * .9, rgba[1] * .9, rgba[2] * .9, rgba[3]);

        // Back Face
        drawTriangle3DUV([0, 0, 1, 1, 0, 1, 1, 1, 1], [0, 0, 1, 0, 1, 1]);
        drawTriangle3DUV([0, 0, 1, 1, 1, 1, 0, 1, 1], [0, 0, 1, 1, 0, 1]);

        // Top Face
        drawTriangle3DUV([0, 1, 0, 0, 1, 1, 1, 1, 1], [0, 0, 0, 1, 1, 1]);
        drawTriangle3DUV([0, 1, 0, 1, 1, 1, 1, 1, 0], [0, 0, 1, 1, 1, 0]);

        // Bottom Face
        drawTriangle3DUV([0, 0, 0, 1, 0, 0, 1, 0, 1], [0, 0, 1, 0, 1, 1]);
        drawTriangle3DUV([0, 0, 0, 1, 0, 1, 0, 0, 1], [0, 0, 1, 1, 0, 1]);

        // Left Face
        drawTriangle3DUV([0, 0, 0, 0, 1, 0, 0, 1, 1], [0, 0, 0, 1, 1, 1]);
        drawTriangle3DUV([0, 0, 0, 0, 1, 1, 0, 0, 1], [0, 0, 1, 1, 1, 0]);

        // Right Face
        drawTriangle3DUV([1, 0, 0, 1, 1, 1, 1, 1, 0], [0, 0, 1, 1, 1, 0]);
        drawTriangle3DUV([1, 0, 0, 1, 0, 1, 1, 1, 1], [0, 0, 0, 1, 1, 1]);
    }

    renderfast() {
        var rgba = this.color;
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        var allverts = [
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
        ];

        var alluvs = [
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
        ];

        drawTriangle3DUV(allverts, alluvs);
    }

    renderfaster() {
        var rgba = this.color;
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        if (g_vertexBuffer == null) {
            initTriangle3D();

        }

        gl.bufferData(gl.ARRAY_BUFFER, )
    }

}