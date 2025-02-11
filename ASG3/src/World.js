// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
    precision mediump float;
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    varying vec2 v_UV;
    uniform mat4  u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;
    void main() {
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
    }`

// Fragment shader program
var FSHADER_SOURCE = `
    precision mediump float;
    varying vec2 v_UV;
    uniform vec4 u_FragColor;
    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    uniform int u_whichTexture;

    void main() {   
        if(u_whichTexture == -2) {
            gl_FragColor = u_FragColor;
        } else if(u_whichTexture == -1) {
            gl_FragColor = vec4(v_UV, 1.0, 1.0);        
        } else if (u_whichTexture == 0) {
            gl_FragColor = texture2D(u_Sampler0, v_UV);     
        } else if (u_whichTexture == 1) {
            gl_FragColor = texture2D(u_Sampler1, v_UV);     
        }else {
            gl_FragColor = vec4(1, .2, .2, 1); 
        }
    }`

//Global Variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_whichTexture;

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

    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get the storage location of a_UV');
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

    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log('Failed to get the storage location of u_ViewMatrix');
        return;
    }

    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log('Failed to get the storage location of u_ProjectionMatrix');
        return;
    }

    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
        console.log('Failed to get the storage location of u_Sampler0');
        return;
    }

    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler1) {
        console.log('Failed to get the storage location of u_Sampler1');
        return;
    }



    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
        console.log('Failed to get the storage location of u_whichTexture');
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

function initTextures() {
    var image0 = new Image();
    var image1 = new Image();

    if (!image0 || !image1) {
        console.log('Failed to create image objects');
        return false;
    }

    image0.onload = function () { sendTextureToTEXTURE(image0, 0); };
    image1.onload = function () { sendTextureToTEXTURE(image1, 1); };

    image0.src = 'stone.jpg';
    image1.src = 'dirt.jpg';

    return true;
}


function sendTextureToTEXTURE(image, textureUnit) {
    var texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

    if (textureUnit === 0) {
        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(u_Sampler0, 0);
    } else if (textureUnit === 1) {
        gl.activeTexture(gl.TEXTURE1);
        gl.uniform1i(u_Sampler1, 1);
    }

    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    console.log(`Finished loading texture ${textureUnit}`);
}


function main() {

    setupWebGl();

    connectVariablesToGLSL();
    addActionsForHtmlUI();
    initTextures();

    document.onkeydown = keydown;
    setupMouseControls();

    document.addEventListener("keydown", (event) => {
        if (event.key === "f") {
            addBlock();
        } else if (event.key === "g") { 
            removeBlock();
        }
    });
    

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    //gl.clear(gl.COLOR_BUFFER_BIT);

    //renderAllShapes();
    requestAnimationFrame(tick);
}

function setupMouseControls() {
    let isMouseHeld = false;
    let prevMouseX = null;
    let prevMouseY = null;
    let mouseSensitivity = 0.2; 

    document.addEventListener("mousedown", (event) => {
        isMouseHeld = true;
        prevMouseX = event.clientX; 
        prevMouseY = event.clientY;
    });

    document.addEventListener("mouseup", () => {
        isMouseHeld = false;
        prevMouseX = null;
        prevMouseY = null;
    });

    document.addEventListener("mousemove", (event) => {
        if (isMouseHeld) {
            if (prevMouseX !== null && prevMouseY !== null) {
                let deltaX = event.clientX - prevMouseX;
                let deltaY = event.clientY - prevMouseY;

                g_yaw += deltaX * mouseSensitivity; 
                g_pitch -= deltaY * mouseSensitivity; 
                
                g_pitch = Math.max(-89, Math.min(89, g_pitch));
            }
            prevMouseX = event.clientX;
            prevMouseY = event.clientY;
        }
    });
}

let g_blocks = []; 


function addBlock() {
    let { x, y, z } = getBlockInFront();
    
    for (let block of g_blocks) {
        if (block.x === x && block.y === y && block.z === z) {
            return; 
        }
    }

    let newBlock = new Cube();
    newBlock.textureNum = 0; 
    newBlock.matrix.translate(x, y, z);
    newBlock.x = x;
    newBlock.y = y;
    newBlock.z = z;

    g_blocks.push(newBlock);
    renderAllShapes();
}

function removeBlock() {
    let { x, y, z } = getBlockInFront();

    for (let i = 0; i < g_blocks.length; i++) {
        if (g_blocks[i].x === x && g_blocks[i].y === y && g_blocks[i].z === z) {
            g_blocks.splice(i, 1); 
            renderAllShapes();
            return;
        }
    }
}



function getBlockInFront() {
    let radianYaw = (g_yaw * Math.PI) / 180;
    let radianPitch = (g_pitch * Math.PI) / 180;

    let forwardX = Math.cos(radianPitch) * Math.sin(radianYaw);
    let forwardY = Math.sin(radianPitch);
    let forwardZ = -Math.cos(radianPitch) * Math.cos(radianYaw);

    let targetX = Math.floor(g_eye[0] + forwardX);
    let targetY = Math.floor(g_eye[1] + forwardY);
    let targetZ = Math.floor(g_eye[2] + forwardZ);

    return { x: targetX, y: targetY, z: targetZ };
}






var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

function tick() {

    g_seconds = performance.now() / 1000.0 - g_startTime;
    //console.log(performance.now());

    updateAnimationAngles();

    renderAllShapes();
    requestAnimationFrame(tick);

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

let moveSpeed = 0.05; 
let rotationSpeed = 5; 

var g_pitch = 0;

var g_eye = [0, 0, 3];   
var g_yaw = 0;           
var g_up = [0, 1, 0];    

function keydown(ev) {
    let radianYaw = (g_yaw * Math.PI) / 180;
    let radianPitch = (g_pitch * Math.PI) / 180;

    let forwardX = Math.cos(radianPitch) * Math.sin(radianYaw);
    let forwardY = Math.sin(radianPitch);
    let forwardZ = -Math.cos(radianPitch) * Math.cos(radianYaw);

    let rightX = Math.cos(radianYaw);
    let rightZ = Math.sin(radianYaw);

    let upX = 0, upY = 1, upZ = 0;

    switch (ev.key) {
        case 'w': case 'W':
            g_eye[0] += forwardX * moveSpeed;
            g_eye[1] += forwardY * moveSpeed;
            g_eye[2] += forwardZ * moveSpeed;
            break;
        case 's': case 'S':
            g_eye[0] -= forwardX * moveSpeed;
            g_eye[1] -= forwardY * moveSpeed;
            g_eye[2] -= forwardZ * moveSpeed;
            break;
        case 'a': case 'A': 
            g_eye[0] -= rightX * moveSpeed;
            g_eye[2] -= rightZ * moveSpeed;
            break;
        case 'd': case 'D': 
            g_eye[0] += rightX * moveSpeed;
            g_eye[2] += rightZ * moveSpeed;
            break;
        case 'q': case 'Q': 
            g_yaw -= rotationSpeed;
            break;
        case 'e': case 'E':
            g_yaw += rotationSpeed;
            break;
    }

    renderAllShapes();
}


var g_terrain = [
    [0, 0, 1, 2, 1, 0, 0, 0],
    [0, 1, 2, 3, 2, 1, 0, 0],
    [1, 2, 3, 4, 3, 2, 1, 0],
    [2, 3, 4, 5, 4, 3, 2, 1],
    [1, 2, 3, 4, 3, 2, 1, 0],
    [0, 1, 2, 3, 2, 1, 0, 0],
    [0, 0, 1, 2, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
];

function drawTerrain() {
    for (let z = 0; z < g_terrain.length; z++) {
        for (let x = 0; x < g_terrain[z].length; x++) {
            let height = g_terrain[z][x]; 

            let block = new Cube();
            block.color = [0.5, 0.3, 0.1, 1.0]; 
            block.textureNum = 1; 
            block.matrix.translate(x - (g_terrain[0].length / 2), -0.75 + height * 0.2, z - (g_terrain.length / 2)); // Scale height
            block.matrix.scale(1, 0.2, 1); 
            block.renderfast();
        }
    }
}



var g_map = [
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 2, 3, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 2, 4, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 2, 3, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
];

function drawMap(map, texNum) {
    for (let y = 0; y < 32; y++) {
        for (let x = 0; x < 32; x++) {
            let height = map[y][x]; 

            for (let h = 0; h < height; h++) { 
                var block = new Cube();
                block.color = [1, 1, 1, 1]; 
                block.textureNum = texNum;
                block.matrix.translate(
                    x - (map[0].length / 2),
                    -0.75 + (h * 1), 
                    y - (map.length / 2) 
                );
                block.matrix.scale(1, 1, 1);
                block.renderfast();
            }
        }
    }
}

function drawCat(x,y,z, scale, rotatex, rotatey, rotatez, tex) {
    var body = new Cube();
    body.color = [1, 1, 1, 1];
    body.textureNum = tex;
    body.matrix.setTranslate(x + -0.3, y + 0 + (scale*0.5), z + -0.3);
    body.matrix.rotate(rotatex, rotatey, rotatez, 0);
    body.matrix.scale(0.5 + scale, 0.5 + scale, 1 + scale);
    var bodyCoordMat = new Matrix4(body.matrix); 
    body.renderfast();

    var tail = new Cube();
    tail.color = [0, 0, 0, 1];
    tail.textureNum = tex;
    tail.matrix = new Matrix4(bodyCoordMat);
    tail.matrix.translate(0.35, 0.2 + g_ExpoAngle, 1);
    tail.matrix.scale(0.3, 0.3, 0.3);
    tail.renderfast();

    var legF = new Cube();
    legF.color = [0, 0, 0, 1];
    legF.matrix = new Matrix4(bodyCoordMat);
    legF.textureNum = tex;
    legF.matrix.translate(-0.01 - g_ExpoAngle, -0.3, 0.01);
    legF.matrix.rotate(-g_walkAngle, 1, 0, 0);
    legF.matrix.translate(0, -0.5, 0);
    legF.matrix.scale(0.3, 1.3, 0.2);
    legF.renderfast();


    var legB = new Cube();
    legB.color = [0, 0, 0, 1];
    legB.matrix = new Matrix4(bodyCoordMat);
    legB.textureNum = tex;
    legB.matrix.translate(-0.01 - g_ExpoAngle, -0.3, 0.7);
    legB.matrix.rotate(g_walkAngle, 1, 0, 0);
    legB.matrix.translate(0, -0.5, 0);
    legB.matrix.rotate(0, 1, 0, 0);
    legB.matrix.scale(0.3, 1.2, 0.2);
    legB.renderfast();

    var legF2 = new Cube();
    legF2.color = [0, 0, 0, 1];
    legF2.matrix = new Matrix4(bodyCoordMat);
    legF2.textureNum = tex;
    legF2.matrix.translate(0.71 + g_ExpoAngle, -0.3, 0.01);
    legF2.matrix.rotate(g_walkAngle, 1, 0, 0);
    legF2.matrix.translate(0, -0.5, 0);
    legF2.matrix.scale(0.3, 1.3, 0.2);
    legF2.renderfast();

    var legB2 = new Cube();
    legB2.color = [0, 0, 0, 1];
    legB2.matrix = new Matrix4(bodyCoordMat);
    legB2.textureNum = tex;
    legB2.matrix.translate(0.71 + g_ExpoAngle, -0.3, 0.7);
    legB2.matrix.rotate(-g_walkAngle, 1, 0, 0);
    legB2.matrix.translate(0, -0.5, 0);
    legB2.matrix.rotate(0, 1, 0, 0);
    legB2.matrix.scale(0.3, 1.2, 0.2);
    legB2.renderfast();

    var head = new Cube();
    head.color = [0, 0, 0, 1];
    head.matrix = new Matrix4(bodyCoordMat);
    head.textureNum = tex;
    head.matrix.translate(0, 0.3, -0.5);
    head.matrix.rotate(g_headRotAngle, 0, 0);
    head.matrix.scale(1, 1, 0.5);
    var headCoordMat = new Matrix4(head.matrix);
    head.renderfast();




    var earL = new Cube();
    earL.color = [1, 1, 1, 1];
    earL.matrix = new Matrix4(headCoordMat);
    earL.textureNum = tex;
    earL.matrix.translate(0.1 - g_ExpoAngle, 0.83 + g_ExpoAngle, 0.5);
    earL.matrix.scale(0.3, 0.4, 0.4);
    earL.renderfast();

    var earR = new Cube();
    earR.color = [1, 1, 1, 1];
    earR.matrix = new Matrix4(headCoordMat);
    earR.textureNum = tex;
    earR.matrix.translate(0.6 + g_ExpoAngle, 0.83 + g_ExpoAngle, 0.5);
    earR.matrix.scale(0.3, 0.4, 0.4);
    earR.renderfast();

    var eyeL = new Cube();
    eyeL.color = [1, 1, 0, 1];
    eyeL.matrix = new Matrix4(headCoordMat);
    eyeL.textureNum = tex;
    eyeL.matrix.translate(0.2 - g_ExpoAngle, 0.6, -0.1);
    eyeL.matrix.scale(0.2, 0.2, 0.4);
    eyeL.renderfast();

    var eyeR = new Cube();
    eyeR.color = [1, 1, 0, 1];
    eyeR.matrix = new Matrix4(headCoordMat);
    eyeR.textureNum = tex;
    eyeR.matrix.translate(0.6 + g_ExpoAngle, 0.6, -0.1);
    eyeR.matrix.scale(0.2, 0.2, 0.4);
    eyeR.renderfast();

    var mouth = new Cube();
    mouth.color = [1, 0, 0.83, 1];
    mouth.matrix = new Matrix4(headCoordMat);
    mouth.textureNum = tex;
    mouth.matrix.translate(0.2, 0.2, -0.2);
    mouth.matrix.scale(0.6, 0.4, 0.2);
    var MouthCoordMat = new Matrix4(mouth.matrix);
    mouth.renderfast();

    var tounge = new Cube();
    tounge.color = [1, 1, 0, 1];
    tounge.matrix = new Matrix4(MouthCoordMat);
    tounge.textureNum = tex;
    tounge.matrix.translate(0.25, 0, -0.2 - g_toungeAngle);
    tounge.matrix.scale(0.5, 0.2, 1);
    tounge.renderfast();
}



function renderAllShapes() {
    var startTime = performance.now();

    var projMat = new Matrix4();
    projMat.setPerspective(50, canvas.width / canvas.height, 1, 100);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

    var viewMat = new Matrix4();

    let radianYaw = (g_yaw * Math.PI) / 180;
    let radianPitch = (g_pitch * Math.PI) / 180;

    let forwardX = Math.cos(radianPitch) * Math.sin(radianYaw);
    let forwardY = Math.sin(radianPitch);
    let forwardZ = -Math.cos(radianPitch) * Math.cos(radianYaw);

    let atX = g_eye[0] + forwardX;
    let atY = g_eye[1] + forwardY;
    let atZ = g_eye[2] + forwardZ;

    viewMat.setLookAt(g_eye[0], g_eye[1], g_eye[2], atX, atY, atZ, g_up[0], g_up[1], g_up[2]);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    var globalRotMat = new Matrix4();
    globalRotMat.setIdentity();
    globalRotMat.rotate(g_globalAngle, 0, 1, 0);
    globalRotMat.rotate(g_globalXAngle, 1, 0, 0);
    globalRotMat.rotate(g_globalYAngle, 0, 1, 0);

    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    for (let block of g_blocks) {
        block.renderfast();
    }

    // drawTriangle( [-1.0,0.0,0.0,    -0.5,-1.0,0.0,  0.0,0.0,0.0] );

    drawMap(g_map, 1);
    //drawMap(g_house, 0);

    drawCat(2,0,5, 1, 0, 1, 0, -2);
    drawCat(0,0,5, 1, 0, 1, 0, -2);
    drawCat(-2,0,5, 1, 0, 1, 0, -2);

    drawCat(0,0,-5, 2, 180, 0, 1, 0);

    var sky = new Cube();
    sky.color = [0.376, 0.419, 0.812, 1.0];
    sky.textureNum=-2;
    sky.matrix.translate(0, -.75, 0.0);
    sky.matrix.scale(50,50,50);
    sky.matrix.translate(-.5, -.5, -0.5);
    sky.renderfast();


    var floor = new Cube();
    floor.color = [0.553, 0.733, 0.322, 1.0];
    floor.textureNum=-2;
    floor.matrix.translate(0, -.75, 0.0);
    floor.matrix.scale(32,0,32);
    floor.matrix.translate(-.5, 0, -0.5);
    floor.renderfast();


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

