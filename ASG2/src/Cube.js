class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
    }


    render() {

        var rgba = this.color;


        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        //Front of cube
        drawTriangle3D([0, 0, 0, 1, 1, 0, 1, 0, 0]);
        drawTriangle3D([0, 0, 0, 0, 1, 0, 1, 1, 0]);

        //Other sides of the cube, top, bottom, left, right, back
        // fill in

        gl.uniform4f(u_FragColor, rgba[0] * .9, rgba[1] * .9, rgba[2] * .9, rgba[3]);

        //Top of cube
        drawTriangle3D([0, 1, 0, 0, 1, 1, 1, 1, 1]);
        drawTriangle3D([0, 1, 0, 1, 1, 1, 1, 1, 0]);

        // Bottom 
        drawTriangle3D([0, 0, 0, 1, 0, 0, 1, 0, 1]);
        drawTriangle3D([0, 0, 0, 1, 0, 1, 0, 0, 1]);

        // Left 
        drawTriangle3D([0, 0, 0, 0, 1, 0, 0, 1, 1]);
        drawTriangle3D([0, 0, 0, 0, 1, 1, 0, 0, 1]);

        // Right 
        drawTriangle3D([1, 0, 0, 1, 1, 1, 1, 1, 0]);
        drawTriangle3D([1, 0, 0, 1, 0, 1, 1, 1, 1]);

        // Back 
        drawTriangle3D([0, 0, 1, 1, 0, 1, 1, 1, 1]);
        drawTriangle3D([0, 0, 1, 1, 1, 1, 0, 1, 1]);
    }
}