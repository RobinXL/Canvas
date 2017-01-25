var canvas,
    context,
    dragging = false,
    dragStartLocation,
    snapshot,
    points = [],
    point = [[],[]];


function getCanvasCoordinates(event) {
    var x = event.clientX - canvas.getBoundingClientRect().left,
        y = event.clientY - canvas.getBoundingClientRect().top;

    return {x: x, y: y};
}

function takeSnapshot() {
    snapshot = context.getImageData(0, 0, canvas.width, canvas.height);
}

function restoreSnapshot() {
    context.putImageData(snapshot, 0, 0);
}

function drawLine(position) {
    context.beginPath();
    context.moveTo(dragStartLocation.x, dragStartLocation.y);
    context.lineTo(dragStartLocation.x, position.y);
    context.lineTo(position.x, position.y);
    context.lineTo(position.x, dragStartLocation.y);
    context.lineTo(dragStartLocation.x, dragStartLocation.y);
    //context.lineTo(position.x, position.y);
    context.stroke();
}

function dragStart(event) {
    dragging = true;
    dragStartLocation = getCanvasCoordinates(event);
    takeSnapshot();
    console.log('dragStart');
    point[0]=[dragStartLocation.x, dragStartLocation.y];
}

function drag(event) {
    var position;
    if (dragging === true) {
        restoreSnapshot();
        position = getCanvasCoordinates(event);
        drawLine(position);
    }
    console.log('drag');
}

function dragStop(event) {
    dragging = false;
    restoreSnapshot();
    var position = getCanvasCoordinates(event);
    drawLine(position);
    console.log('dragStop');
    point[1]=[position.x, position.y];
    DisplayCrop(point);
    points.push(point);
    point = [[],[]];
    var record_point = document.getElementById('record_point');
    record_point.innerHTML = points.join(" * ");
    var Coordinate = document.getElementById('points_Coor');
    Coordinate.value = points.join(" * ");
}

function DisplayCrop(location) {
    canvas = document.getElementById("canvas2");
    context = canvas.getContext('2d');
    crop_width = location[1][0] - location[0][0];
    crop_height = location[1][1] - location[0][1];
    img1.onload = function(){
      context.drawImage(img1, location[0][0], location[0][1], crop_width, crop_height);
    };
    img1.src = "./image/test_formula.jpg";

}

function init() {
    canvas = document.getElementById("canvas");
    context = canvas.getContext('2d');
    var img1 = new Image();
    img1.onload = function(){
      context.drawImage(img1, 0, 0, img1.width, img1.height);
    };
    img1.src = "./image/test_formula.jpg";


    context.strokeStyle = 'purple';
    context.lineWidth = 1;
    context.lineCap = 'round';

    canvas.addEventListener('mousedown', dragStart, false);
    canvas.addEventListener('mousemove', drag, false);
    canvas.addEventListener('mouseup', dragStop, false);
}

function readMouseMove(event){
  var result_x = document.getElementById('x_result');
  var result_y = document.getElementById('y_result');
  result_x.innerHTML = event.clientX;
  result_y.innerHTML = event.clientY;
}

document.onmousemove = readMouseMove;

window.addEventListener('load', init, false);
