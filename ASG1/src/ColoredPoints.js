// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform float u_Size;
    void main() {
      gl_Position = a_Position;
      //gl_PointSize = 10.0;
      gl_PointSize = u_Size;
    }`

// Fragment shader program
var FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main() {   
        gl_FragColor = u_FragColor;
    }`

//Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

function setupWebGl() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    //gl = getWebGLContext(canvas);
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
}

function connectVariablesToGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (!u_Size) {
        console.log('Failed to get the storage location of u_Size');
        return;
    }
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
const CAT = 3;

let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_segments = 1;
var g_shapesList = [];

function addActionsForHtmlUI() {
    document.getElementById('green').onclick = function () { g_selectedColor = [0.0, 1.0, 0.0, 1.0]; }
    document.getElementById('red').onclick = function () { g_selectedColor = [1.0, 0.0, 0.0, 1.0]; }
    document.getElementById('clearButton').onclick = function () {
        g_shapesList = [];
        renderAllShapes();
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gameAct = false; 
        canvas.onmousemove = function (ev) { if (ev.buttons === 1) { click(ev) } };
    }


    document.getElementById('pointButton').onclick = function () { g_selectedType = POINT };
    document.getElementById('triButton').onclick = function () { g_selectedType = TRIANGLE };
    document.getElementById('circleButton').onclick = function () { g_selectedType = CIRCLE };
    document.getElementById('catButton').onclick = function () { cat(); };
    document.getElementById('snakeButton').onclick = function () { snakeGame(); };


    document.getElementById('redSlide').addEventListener('mouseup', function () { g_selectedColor[0] = this.value / 100 });
    document.getElementById('greenSlide').addEventListener('mouseup', function () { g_selectedColor[1] = this.value / 100 });
    document.getElementById('blueSlide').addEventListener('mouseup', function () { g_selectedColor[2] = this.value / 100 });
    document.getElementById('sizeSlide').addEventListener('mouseup', function () { g_selectedSize = this.value; });
    document.getElementById('segmentSlider').addEventListener('mouseup', function () { g_segments = this.value; });

}

function cat() {
    gl.clearColor(0.529, 0.808, 0.922, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const catTriangles = [
        {
            // left     top         right
            vertices: [-0.9, 0.0, -0.9, 0.4, -0.5, 0.0],
            color: [0.0, 0.0, 0.0, 0.0], // left face 1
        },
        {
            vertices: [-0.5, 0.0, -0.9, 0.4, -0.5, 0.4],
            color: [0.0, 0.0, 0.0, 0.0], //right face 2 
        },
        {
            vertices: [-0.9, 0.4, -0.9, 0.6, -0.7, 0.4],
            color: [0.0, 0.0, 0.0, 1.0], //left ear 3 
        },
        {
            vertices: [-0.7, 0.4, -0.5, 0.6, -0.5, 0.4],
            color: [0.0, 0.0, 0.0, 1.0], //right ear 4 
        },
        {
            vertices: [-0.5, -0.2, -0.5, 0.2, 0.5, -0.2],
            color: [0.0, 0.0, 0.0, 0.0], //left body 5 
        },
        {
            vertices: [0.5, -0.2, 0.5, 0.2, -0.5, 0.2],
            color: [0.0, 0.0, 0.0, 1.0], //right body 6 
        },
        {
            vertices: [0.5, -0.1, 0.5, 0.2, 0.8, -0.6],
            color: [0.0, 0.0, 0.0, 1.0], //tail 7 
        },
        {
            vertices: [0.5, -0.2, 0.2, -0.2, 0.3, -0.6],
            color: [0.0, 0.0, 0.0, 1.0], //right hind leg 8 
        },
        {
            vertices: [0.5, -0.2, 0.3, -0.1, 0.4, -0.6],
            color: [0.0, 0.0, 0.0, 0.0], //right leg 9 
        },
        {
            vertices: [-0.5, -0.2, -0.3, -0.2, -0.4, -0.6],
            color: [0.0, 0.0, 0.0, 1.0], //left hind leg 10 
        },
        {
            vertices: [-0.5, -0.2, -0.3, -0.2, -0.6, -0.6],
            color: [0.0, 0.0, 0.0, 0.0], //left hind leg 11
        },
        {
            vertices: [-0.825, 0.2, -0.9, 0.3, -0.75, 0.3],
            color: [0.0, 0.0, 0.0, 1.0], //left eye 12
        },
        {
            vertices: [-0.625, 0.2, -0.7, 0.3, -0.55, 0.3],
            color: [0.0, 0.0, 0.0, 1.0], //right eye 13
        },
        {
            vertices: [-0.73, 0.15, -0.78, 0.2, -0.68, 0.2],
            color: [0.0, 0.0, 0.0, 1.0], //right eye 14
        },
        {
            vertices: [-0.73, 0.07, -0.80, 0.1, -0.66, 0.1],
            color: [0.0, 0.0, 0.0, 1.0], //mouth 15 
        },
        {
            // left     top         right
            vertices: [-0.9, 0.0, -0.7, -0.05, -0.5, 0.0],
            color: [0.0, 0.0, 0.0, 1.0], // left face 1
        },
        {
            vertices: [-0.88, 0.4, -0.88, 0.55, -0.72, 0.4],
            color: [0.0, 0.0, 0.0, 0.0], //left ear 16 
        },
        {
            vertices: [-0.68, 0.4, -0.52, 0.55, -0.52, 0.4],
            color: [0.0, 0.0, 0.0, 0.0], //right ear 17
        },
        {
            vertices: [1.0, -0.6, 1.0, -1.0, -1.0, -0.6],
            color: [0.486, 0.988, 0.0, 1.0], //ground  right  18
        },
        {
            vertices: [-1.0, -1.0, 1.0, -1.0, -1.0, -0.6],
            color: [0.486, 0.988, 0.0, 1.0], //ground left 19
        },

    ];

    catTriangles.forEach(triangleData => {
        gl.uniform4fv(u_FragColor, new Float32Array(triangleData.color));
        drawTriangle(triangleData.vertices);
    });
}



function main() {

    setupWebGl();
    connectVariablesToGLSL();
    addActionsForHtmlUI();


    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = click;
    //canvas.onmousemove = click;
    canvas.onmousemove = function (ev) { if (ev.buttons == 1) { click(ev) } }

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
}





// var g_points = [];  // The array for the position of a mouse press
// var g_colors = [];  // The array to store the color of a point
// var g_sizes = [];

function click(ev) {
    let [x, y] = convertCoordinatesEventToGl(ev);

    let shape;
    if (g_selectedType === POINT) {
        shape = new Point();
    } else if (g_selectedType === TRIANGLE) {
        shape = new Triangle();
    } else if (g_selectedType === CIRCLE) {
        shape = new Circle();  // Create Circle
        shape.segments = g_segments;
    } else {
        shape = new Cat();
    }

    shape.position = [x, y];
    shape.color = g_selectedColor.slice();
    shape.size = g_selectedSize;
    g_shapesList.push(shape);

    renderAllShapes();
}


function convertCoordinatesEventToGl(ev) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

    return ([x, y]);
}

function renderAllShapes() {
    // Clear <canvas>
    var startTime = performance.now();

    gl.clear(gl.COLOR_BUFFER_BIT);

    var len = g_shapesList.length;
    //var len = g_points.length;
    for (var i = 0; i < len; i++) {
        g_shapesList[i].render();
    }

    var duration = performance.now() - startTime;
    sendTextToHTML("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000 / duration) / 10, "numdot");

}

function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}

let generatedShapesCopy = [];  
function snakeGame() {
    gameAct = true;

    g_shapesList = [];
    generatedShapesCopy = [];  
    gl.clearColor(0.0, 0.0, 0.0, 1.0); 
    gl.clear(gl.COLOR_BUFFER_BIT); 

    for (let i = 0; i < 10; i++) {
        let shapeType = Math.floor(Math.random() * 3);
        let shape;

        if (shapeType === POINT) {
            shape = new Point();
        } else if (shapeType === TRIANGLE) {
            shape = new Triangle();
        } else if (shapeType === CIRCLE) {
            shape = new Circle();
            shape.segments = Math.floor(Math.random() * 10) + 3; 
        }

        shape.position = [Math.random() * 2 - 1, Math.random() * 2 - 1]; 
        shape.color = [Math.random(), Math.random(), Math.random(), 1.0];
        shape.size = Math.random() * 20 + 5; 

        g_shapesList.push(shape);
        generatedShapesCopy.push(shape); 
    }

    renderAllShapes(); 

    canvas.onmousemove = function (ev) { if (ev.buttons == 1) { handleSnakeDrawing(ev); }};
}

function handleSnakeDrawing(ev) {
    if (!gameAct) return; 

    let [x, y] = convertCoordinatesEventToGl(ev);

    g_shapesList = g_shapesList.filter(shape => {
        if (checkCollision(shape, x, y)) { return false; }
        return true; 
    });

    if (genShapes()) { //all removed
        console.log("win");
        gameAct = false;  
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        canvas.onmousemove = function (ev) { if (ev.buttons == 1) { click(ev); } };
    }

    let shape = new Point();
    shape.position = [x, y]; 
    shape.color = g_selectedColor.slice();
    shape.size = g_selectedSize; 
    g_shapesList.push(shape); 
    renderAllShapes();
}


function checkCollision(shape, x, y) {
    if (!gameAct) return false; 

    let [sx, sy] = shape.position;
    let size = shape.size / 200.0; 

    if (shape.type === 'point') {
        return Math.abs(x - sx) < size && Math.abs(y - sy) < size;
    } else if (shape.type === 'triangle') {
        return isPointInTriangle([x, y], [sx, sy], [sx + size, sy], [sx, sy + size]);
    } else if (shape.type === 'circle') {
        let dx = x - sx;
        let dy = y - sy;
        return Math.sqrt(dx * dx + dy * dy) < size;
    }
    return false;
}
function isPointInTriangle(p, p0, p1, p2) {
    if (!gameAct) return false; 

    let area = 0.5 * (-p1[1] * p2[0] + p0[1] * (-p1[0] + p2[0]) + p0[0] * (p1[1] - p2[1]) + p1[0] * p2[1]);
    let s = 1 / (2 * area) * (p0[1] * p2[0] - p0[0] * p2[1] + (p2[1] - p0[1]) * p[0] + (p0[0] - p2[0]) * p[1]);
    let t = 1 / (2 * area) * (p0[0] * p1[1] - p0[1] * p1[0] + (p0[1] - p1[1]) * p[0] + (p1[0] - p0[0]) * p[1]);
    return s > 0 && t > 0 && 1 - s - t > 0;
}

function genShapes() {
    if (!gameAct) return false; 
    return generatedShapesCopy.every(shape => !g_shapesList.includes(shape));
}
