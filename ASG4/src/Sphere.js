class Sphere {
    constructor() {
        this.type = 'sphere';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.textureNum = -2;
    }

    render() {
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        let d = Math.PI / 10;  // Angle step for vertical slices
        let dd = Math.PI / 10; // Angle step for horizontal slices

        for (let t = 0; t < Math.PI; t += d) {
            for (let r = 0; r < 2 * Math.PI; r += d) {
                let p1 = [Math.sin(t) * Math.cos(r), Math.sin(t) * Math.sin(r), Math.cos(t)];
                let p2 = [Math.sin(t + dd) * Math.cos(r), Math.sin(t + dd) * Math.sin(r), Math.cos(t + dd)];
                let p3 = [Math.sin(t) * Math.cos(r + dd), Math.sin(t) * Math.sin(r + dd), Math.cos(t)];
                let p4 = [Math.sin(t + dd) * Math.cos(r + dd), Math.sin(t + dd) * Math.sin(r + dd), Math.cos(t + dd)];

                let v = [];
                let uv = [];

                // First Triangle
                v = v.concat(p1, p2, p4);
                uv = uv.concat([0, 0, 1, 1, 1, 0]); // Dummy UV values for now
                drawTriangle3DUVNormal(v, uv, v); // Normals = Positions for a sphere

                // Second Triangle
                v = [];
                uv = [];
                v = v.concat(p1, p4, p3);
                uv = uv.concat([0, 0, 0, 0, 0, 0]);
                drawTriangle3DUVNormal(v, uv, v);
            }
        }
    }
}
