function main() {
  var canvas = document.getElementById('example');
  if (!canvas) {
    console.log('Failed to retrieve the <canvas> element');
    return;
  }

  var ctx = canvas.getContext('2d');
  if (!ctx) {
    console.log('Failed to get the rendering context for 2D graphics');
    return;
  }

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  var drawButton = document.getElementById('draw');
  drawButton.addEventListener('click', handleDrawEvent);

  var drawButtonOp = document.getElementById('drawScalar');
  drawButtonOp.addEventListener('click', handleDrawOperationEvent);
}

function handleDrawEvent() {
  var canvas = document.getElementById('example');
  var ctx = canvas.getContext('2d');
 
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  var V1_x = document.getElementById('V1_x').value;
  var V1_y = document.getElementById('V1_y').value;

  var V2_x = document.getElementById('V2_x').value;
  var V2_y = document.getElementById('V2_y').value;

  var v1 = new Vector3([V1_x, V1_y, 0]);
  var v2 = new Vector3([V2_x, V2_y, 0]);

  drawVector(v1, "red");
  drawVector(v2, "blue");

  
}

function handleDrawOperationEvent() {
  var canvas = document.getElementById('example');
  var ctx = canvas.getContext('2d');
  var selector = document.getElementById('selector').value;
  var scalar = document.getElementById('scalar').value;
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  handleDrawEvent();

  var V1_x = document.getElementById('V1_x').value;
  var V1_y = document.getElementById('V1_y').value;

  var V2_x = document.getElementById('V2_x').value;
  var V2_y = document.getElementById('V2_y').value;

  var v1 = new Vector3([V1_x, V1_y, 0]);
  var v2 = new Vector3([V2_x, V2_y, 0]);

  var v3;
  var v4;

  if (selector === "add") {
    v3 = v1.add(v2);
    drawVector(v3, "green");
  } 
  else if (selector === "sub") {
    v3 = v1.sub(v2);
    drawVector(v3, "green");
  } 
  else if (selector === "mul") {
    v3 = v1.mul(scalar);
    v4 = v2.mul(scalar);
    drawVector(v3, "green");
    drawVector(v4, "green");
  } 
  else if (selector === "div") {
    v3 = v1.div(scalar);
    v4 = v2.div(scalar);
    drawVector(v3, "green");
    drawVector(v4, "green");
  } 
  else if (selector === "mag") {
    console.log("Magnitude v1: " + v1.magnitude());
    console.log("Magnitude v2: " + v2.magnitude());
  } 
  else if (selector === "nor") {
    v1.normalize(); 
    v2.normalize();
    drawVector(v1, "green");
    drawVector(v2, "green");
  } 
  else if(selector === "ang") {
    angleBetween(v1,v2);
  }
  else if(selector === "are") {
    areaTriangle(v1,v2);
  }
 }

function areaTriangle(v1,v2) {
  let cross = Vector3.cross(v1,v2);
  let area = cross.magnitude() / 2;
  console.log("Area of the triangle: " + area);
}

function angleBetween(v1, v2) {
  // Use the definition of dot product dot(v1, v2) = ||v1|| * ||v2|| * cos(alpha).
 let cosAlp = Vector3.dot(v1,v2) / (v1.magnitude() * v2.magnitude()); 

 let angleRad = Math.acos(cosAlp);

 let angleDeg = angleRad * (180 / Math.PI);

 console.log("Angle: " + angleDeg);

 return angleDeg;
}


function drawVector(v, color) {
  var canvas = document.getElementById('example');
  var ctx = canvas.getContext('2d');
  ctx.strokeStyle = color;

  var originX = canvas.width / 2;
  var originY = canvas.height / 2;

  ctx.beginPath();
  ctx.moveTo(originX, originY);
  ctx.lineTo(originX + (v.elements[0] * 20), originY - (v.elements[1] * 20));
  ctx.stroke();
}
