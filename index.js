var canvas,
    canvas2,
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
    context.strokeStyle = 'purple';
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
    record_point.innerHTML = number_cropped[0];

    //passing points Coordinate to cgi form, python process
    var Coordinate = document.getElementById('points_Coor');
    Coordinate.value = points.join(" * ");
}

var number_cropped=[0,0]; //number_cropped = [num_of_pics, y_position]
//var dataURL=[];
var canvases=[];

function DisplayCrop(location) {
    console.log('start DisplayCrop');
    // var canvas2 = document.getElementById("canvas2");
    crop_width = location[1][0] - location[0][0];
    crop_height = location[1][1] - location[0][1];
    var imageData = context.getImageData(location[0][0], location[0][1], crop_width, crop_height);
    var context2 = canvas2.getContext('2d');
    context2.putImageData(imageData, location[0][0], location[0][1]);
    number_cropped[0] += 1;
    number_cropped[1] += crop_height + 5;

    console.log(imageData);
    var canvas_tmp = document.createElement('canvas');
    var context_tmp = canvas_tmp.getContext('2d');
    context_tmp.putImageData(imageData, 0, 0);
    var dataURL = canvas_tmp.toDataURL();
    canvases.push(dataURL);
    console.log(canvases);

    var ExportCroppedImages = document.getElementById("Images");
    ExportCroppedImages.value = canvases;
}

function init() {
    canvas = document.getElementById("canvas");
    context = canvas.getContext('2d');
    var img1 = new Image();
    img1.onload = function(){
      canvas.width = img1.width;
      canvas.height = img1.height;
      context.drawImage(img1, 0, 0, img1.width, img1.height);
    };
    img1.src = "./image/test_formula.jpg";

    canvas2 = document.getElementById("canvas2");
    canvas2.width = img1.width;
    canvas2.height = img1.height;

    // context.strokeStyle = 'purple';
    context.lineWidth = 1;
    context.lineCap = 'round';

    canvas.addEventListener('mousedown', dragStart, false);
    canvas.addEventListener('mousemove', drag, false);
    canvas.addEventListener('mouseup', dragStop, false);
}

function readMouseMove(event){
  var result_x = document.getElementById('x_result');
  var result_y = document.getElementById('y_result');
  if (event.clientX >= canvas.getBoundingClientRect().left && event.clientY >= canvas.getBoundingClientRect().top){
    result_x.innerHTML = Math.floor(event.clientX - canvas.getBoundingClientRect().left);
    result_y.innerHTML = Math.floor(event.clientY - canvas.getBoundingClientRect().top);
  }else {
    result_x.innerHTML = '--';
    result_y.innerHTML = '--';
  }
}

document.onmousemove = readMouseMove;

window.addEventListener('load', init, false);
