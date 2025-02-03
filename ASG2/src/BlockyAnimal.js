// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform mat4  u_ModelMatrix;
     uniform mat4 u_GlobalRotateMatrix;
    void main() {
      gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
     
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
let u_ModelMatrix;
let u_GlobalRotateMatrix;

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

    gl.enable(gl.DEPTH_TEST);
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

    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModeMatrix');
        return;
    }

    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}





const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_segments = 1;

let g_globalAngle = 0;
let g_globalXAngle = 0;
let g_globalYAngle = 0;

let g_walkAngle = 0;
let g_toungeAngle = 0;
let g_ExpoAngle = 0;
let g_headRotAngle = 0;

let g_walkAnimation = false;
let g_toungeAnimation = false;

let g_expoAnimation = false;

function addActionsForHtmlUI() {

    document.getElementById('animationYellowOffButton').onclick = function () { g_walkAnimation = false; };
    document.getElementById('animationYellowOnButton').onclick = function () { g_walkAnimation = true; };

    document.getElementById('animationMagentaOffButton').onclick = function () { g_toungeAnimation = false; };
    document.getElementById('animationMagentaOnButton').onclick = function () { g_toungeAnimation = true; };

    document.getElementById('animationExpoOffButton').onclick = function () { g_expoAnimation = false; };
    document.getElementById('animationExpoOnButton').onclick = function () { g_expoAnimation = true; };

    document.getElementById('ExpoSlide').addEventListener('mousemove', function () { g_ExpoAngle = this.value * 0.1; renderAllShapes(); });
    document.getElementById('yellowSlide').addEventListener('mousemove', function () { g_walkAngle = this.value * 0.1; renderAllShapes(); });
    document.getElementById('magentaSlide').addEventListener('mousemove', function () { g_toungeAngle = this.value * 0.01; renderAllShapes(); });

    //document.getElementById('angleSlide').addEventListener('mouseup', function () { g_globalAngle = this.value; renderAllShapes(); });
    document.getElementById('angleSlide').addEventListener('mousemove', function () { g_globalAngle = this.value; renderAllShapes(); });
}




function main() {

    setupWebGl();
    connectVariablesToGLSL();
    addActionsForHtmlUI();


    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = click;
    //canvas.onmousemove = click;
    // canvas.onmousemove = function (ev) { if (ev.buttons == 1) { click(ev) } }
    canvas.addEventListener('mousemove', function (ev) {
        // Check if the left mouse button is held down:
        if (ev.buttons === 1) {
            // Get the mouse position relative to the canvas
            let rect = ev.target.getBoundingClientRect();
            let mouseX = ev.clientX - rect.left;
            let mouseY = ev.clientY - rect.top;

            // Map the horizontal (x) position to a rotation around the y-axis.
            // For example, if the mouse is at the far right, rotate 360°, at far left -360°.
            g_globalYAngle = (mouseX / canvas.width) * 360;

            // Map the vertical (y) position to a rotation around the x-axis.
            // (You might adjust the scaling factor as desired.)
            g_globalXAngle = (mouseY / canvas.height) * 360;

            // Re-render the scene with the new global rotation.
            renderAllShapes();
        }
    });

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    //gl.clear(gl.COLOR_BUFFER_BIT);

    //renderAllShapes();
    requestAnimationFrame(tick);
}

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

function tick() {

    g_seconds = performance.now() / 1000.0 - g_startTime;
    console.log(performance.now());

    updateAnimationAngles();

    renderAllShapes();
    requestAnimationFrame(tick);

}


var g_shapesList = [];


function click(ev) {
    if (ev.shiftKey) {
        g_expoAnimation = !g_expoAnimation;
        g_startTime = performance.now() / 1000.0;
        renderAllShapes();
    }
    canvas.addEventListener('mousemove', function (ev) {
        if (ev.buttons === 1) {
            let rect = ev.target.getBoundingClientRect();
            let mouseX = ev.clientX - rect.left;
            let mouseY = ev.clientY - rect.top;

            g_globalYAngle = (mouseX / canvas.width) * 360;
            g_globalXAngle = (mouseY / canvas.height) * 360;

            renderAllShapes();
        }
    });

    // let [x, y] = convertCoordinatesEventToGl(ev);

    // let shape;
    // if (g_selectedType === POINT) {
    //     shape = new Point();
    // } else if (g_selectedType === TRIANGLE) {
    //     shape = new Triangle();
    // } else {
    //     shape = new Circle();  // Create Circle
    // } 

    // shape.position = [x, y];
    // shape.color = g_selectedColor.slice();
    // shape.size = g_selectedSize;
    // g_shapesList.push(shape);

    // renderAllShapes();
}

function convertCoordinatesEventToGl(ev) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

    return ([x, y]);
}

function updateAnimationAngles() {
    if (g_walkAnimation) {
        g_walkAngle = 5 * Math.sin(3 * g_seconds);
        g_headRotAngle = 30 * Math.sin(3 * g_seconds);

    }
    if (g_toungeAnimation) {
        g_toungeAngle = 0.2 * Math.sin(3 * g_seconds);
    }
    if (g_expoAnimation) {
        g_ExpoAngle = ((Math.sin(3 * g_seconds) + 1) / 2) * 90;
    }
    
}



function renderAllShapes() {
    // Clear <canvas>
    var startTime = performance.now();

    var globalRotMat = new Matrix4();
    globalRotMat.setIdentity();
    globalRotMat.rotate(g_globalAngle, 0, 1, 0);
    globalRotMat.rotate(g_globalXAngle, 1, 0, 0);
    globalRotMat.rotate(g_globalYAngle, 0, 1, 0);

    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // drawTriangle( [-1.0,0.0,0.0,    -0.5,-1.0,0.0,  0.0,0.0,0.0] );

    var body = new Cube();
    body.color = [1, 0, 0, 1];
    body.matrix.setTranslate(-0.3, 0, -0.3);
    body.matrix.rotate(0, 1, 0, 0);
    body.matrix.scale(0.5, 0.5, 1);
    var bodyCoordMat = new Matrix4(body.matrix);  // base transformation for the body
    body.render();

    var tail = new Cube();
    tail.color = [0, 1, 1, 1];
    tail.matrix = new Matrix4(bodyCoordMat);
    tail.matrix.translate(0.35, 0.2 + g_ExpoAngle, 1);
    tail.matrix.scale(0.3, 0.3, 0.3);
    tail.render();

    var legF = new Cube();
    legF.color = [1, 0, 0, 0];
    legF.matrix = new Matrix4(bodyCoordMat);
    legF.matrix.translate(-0.01 - g_ExpoAngle, -0.3, 0.01);
    legF.matrix.rotate(-g_walkAngle, 1, 0, 0);
    legF.matrix.translate(0, -0.5, 0);
    legF.matrix.scale(0.3, 1.3, 0.2);
    legF.render();


    var legB = new Cube();
    legB.color = [1, 0, 0, 0];  
    legB.matrix = new Matrix4(bodyCoordMat);
    legB.matrix.translate(-0.01 - g_ExpoAngle, -0.3, 0.7);
    legB.matrix.rotate(g_walkAngle, 1, 0, 0);
    legB.matrix.translate(0, -0.5, 0);
    legB.matrix.rotate(0, 1, 0, 0);
    legB.matrix.scale(0.3, 1.2, 0.2);
    legB.render();

    var legF2 = new Cube();
    legF2.color = [1, 0, 0, 0]; 
    legF2.matrix = new Matrix4(bodyCoordMat);
    legF2.matrix.translate(0.71 + g_ExpoAngle, -0.3, 0.01); 
    legF2.matrix.rotate(g_walkAngle, 1, 0, 0);
    legF2.matrix.translate(0, -0.5, 0);
    legF2.matrix.scale(0.3, 1.3, 0.2);
    legF2.render();

    var legB2 = new Cube();
    legB2.color = [1, 0, 0, 0];
    legB2.matrix = new Matrix4(bodyCoordMat);
    legB2.matrix.translate(0.71 + g_ExpoAngle, -0.3, 0.7);
    legB2.matrix.rotate(-g_walkAngle, 1, 0, 0);
    legB2.matrix.translate(0, -0.5, 0);
    legB2.matrix.rotate(0, 1, 0, 0);
    legB2.matrix.scale(0.3, 1.2, 0.2);
    legB2.render();

    var head = new Cube();
    head.color = [1, 0, 1, 1];
    head.matrix = new Matrix4(bodyCoordMat);
    head.matrix.translate(0, 0.3, -0.5);     
    head.matrix.rotate(g_headRotAngle, 0, 0);
    head.matrix.scale(1, 1, 0.5);
    var headCoordMat = new Matrix4(head.matrix);
    head.render();




    var earL = new Cube();
    earL.color = [0, 1, 1, 1];
    earL.matrix = new Matrix4(headCoordMat);
    earL.matrix.translate(0.1 - g_ExpoAngle, 0.83 + g_ExpoAngle, 0.5);
    earL.matrix.scale(0.3, 0.4, 0.4);
    earL.render();

    var earR = new Cube();
    earR.color = [0, 1, 1, 1];
    earR.matrix = new Matrix4(headCoordMat);
    earR.matrix.translate(0.6 + g_ExpoAngle, 0.83 + g_ExpoAngle, 0.5);
    earR.matrix.scale(0.3, 0.4, 0.4);
    earR.render();

    var eyeL = new Cube();
    eyeL.color = [0, 1, 0 , 1];
    eyeL.matrix = new Matrix4(headCoordMat);
    eyeL.matrix.translate(0.2 - g_ExpoAngle, 0.6, -0.1);
    eyeL.matrix.scale(0.2, 0.2, 0.4);
    eyeL.render();

    var eyeR = new Cube();
    eyeR.color = [0, 1, 0, 1];
    eyeR.matrix = new Matrix4(headCoordMat);
    eyeR.matrix.translate(0.6 + g_ExpoAngle, 0.6, -0.1);
    eyeR.matrix.scale(0.2, 0.2, 0.4);
    eyeR.render();

    var mouth = new Cube();
    mouth.color = [0, 1, 1, 1];
    mouth.matrix = new Matrix4(headCoordMat);
    mouth.matrix.translate(0.2, 0.2, -0.2);
    mouth.matrix.scale(0.6, 0.4, 0.2);
    var MouthCoordMat = new Matrix4(mouth.matrix);
    mouth.render();

    var tounge = new Cube();
    tounge.color = [1, 1, 0, 1];
    tounge.matrix = new Matrix4(MouthCoordMat);
    tounge.matrix.translate(0.25, 0, -0.2 - g_toungeAngle);
    tounge.matrix.scale(0.5, 0.2, 1);
    tounge.render();



    // var yellow = new Cube();
    // yellow.color = [1,1,0,1];
    // yellow.matrix.setTranslate(0,-.5,0.0);
    // yellow.matrix.rotate(-5, 1,0,0);
    // yellow.matrix.rotate(-g_walkAngle, 0, 0, 1);

    // var yellowCoordMat=new Matrix4(yellow.matrix);
    // yellow.matrix.scale(0.25,.7,.5);
    // yellow.matrix.translate(-.5,0,0);
    // yellow.render();

    // var box = new Cube();
    // box.color = [1, 0, 1, 1];
    // box.matrix  = yellowCoordMat;
    // box.matrix.translate(0,0.65,0);
    // box.matrix.rotate(g_toungeAngle,0,0,1);
    // box.matrix.scale(.3,.3,.3);
    // box.matrix.translate(-.5,0, -0.001);
    // box.render();

    var duration = performance.now() - startTime;
    sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000 / duration) / 10, "numdot");

}

function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}

