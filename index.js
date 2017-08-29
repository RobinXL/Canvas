var canvas,
    canvas2,
    context,
    context2,
    dragging = false,
    dragStartLocation,
    snapshot,
    // snapshot_old,
    points = [],
    point = [[],[]];

var number_cropped=[0,[],[]]; //number_cropped = [num_of_pics, [x_position list], [y_position list]]
//var dataURL=[];
var canvases=[];

function getCanvasCoordinates(event) {
    var x = event.clientX - canvas.getBoundingClientRect().left,
        y = event.clientY - canvas.getBoundingClientRect().top;

    return {x: x, y: y};
}

function takeSnapshot() {
    // snapshot_old = snapshot;
    snapshot = context.getImageData(0, 0, canvas.width, canvas.height);
    // snapshot2 = context2.getImageData(0, 0, canvas2.width, canvas2.height);
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
    // context.moveTo(position.x, 0);
    // context.lineTo(position.x, window.innerHeight)
    //context.lineTo(position.x, position.y);
    context.strokeStyle = 'purple';
    context.stroke();
}

var undo_num = 0;
var attention = document.getElementById('att');

function undo() {
  if (undo_num == 0){
    restoreSnapshot();
    canvases.pop();
    imageData_list.pop();
    DrawCropped();
    display_num_crops();
  } else {
    attention.innerHTML = 'You can only undo one time.';
  }
  undo_num += 1;
}

function dragStart(event) {
    dragging = true;
    dragStartLocation = getCanvasCoordinates(event);
    takeSnapshot();
    console.log('dragStart');
    attention.innerHTML = '';
    point[0]=[dragStartLocation.x, dragStartLocation.y];
    undo_num = 0;
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
    // restoreSnapshot();
    point[1]=[position.x, position.y];
    DisplayCrop(point);
    points.push(point);
    point = [[],[]];

    display_num_crops();
    // var record_point = document.getElementById('record_point');
    // record_point.innerHTML = canvases.length;

    //passing points Coordinate to cgi form, python process
    var Coordinate = document.getElementById('points_Coor');
    Coordinate.value = points.join(" * ");
    // undo();
}

function display_num_crops(){
  var record_point = document.getElementById('record_point');
  record_point.innerHTML = canvases.length;
}

var imageData_list=[];
var imageData;

function DisplayCrop(location=point) {
    console.log('start DisplayCrop');
    // canvas2 = document.getElementById("canvas2");
    // coor_list = [[],[]]; //[['x1,x2'],['y1,y2']]
    // coor_list[0].push(location)
    crop_width = Math.abs(location[1][0] - location[0][0]);
    crop_height = Math.abs(location[1][1] - location[0][1]);
    if (location[0][0] <= location[1][0] && location[0][1] <= location[1][1]){
      imageData = context.getImageData(location[0][0]+1, location[0][1]+1, crop_width-2, crop_height-2);
    } else if (location[0][0] > location[1][0] && location[0][1] < location[1][1]) {
      imageData = context.getImageData(location[1][0]+1, location[0][1]+1, crop_width-2, crop_height-2);
    } else if (location[0][0] < location[1][0] && location[0][1] > location[1][1]) {
      imageData = context.getImageData(location[0][0]+1, location[1][1]+1, crop_width-2, crop_height-2);
    } else if (location[0][0] > location[1][0] && location[0][1] > location[1][1]) {
      imageData = context.getImageData(location[1][0]+1, location[1][1]+1, crop_width-2, crop_height-2);
    }

    imageData_list.push(imageData);
    console.log("imageData length:", imageData_list.length);
    console.log("imageData: ", imageData);
    console.log("width & height:", crop_width, crop_height);
    console.log(imageData.width);
    number_cropped[1].push(crop_width);

    // context2.putImageData(imageData, location[0][0], location[0][1]);
    number_cropped[0] += 1;
    // number_cropped[1].push(crop_width);
    number_cropped[2].push(crop_height);
    // console.log(imageData);
    var canvas_tmp = document.createElement('canvas');
    canvas_tmp.width = crop_width
    canvas_tmp.height = crop_height
    console.log(canvas_tmp.width, canvas_tmp.height);
    var context_tmp = canvas_tmp.getContext('2d');
    // console.log(context_tmp.width, context_tmp.height);
    context_tmp.putImageData(imageData, 0, 0);
    var dataURL = canvas_tmp.toDataURL();
    canvases.push(dataURL);
    console.log(canvases);

    var ExportCroppedImages = document.getElementById("Images");
    ExportCroppedImages.value = canvases;
    DrawCropped();
}

var position_y = 0;

function DrawCropped(){
  //snapshot restore blank here
  context2.putImageData(snapshot2, 0, 0);
  // canvas2.height = 20;
  for(i=0; i<imageData_list.length; i++){
    // i = imageData_list.length-1;
    console.log(i);
    context2.putImageData(imageData_list[i], 0, position_y);
    position_y += number_cropped[2][i];
  }
  // canvas2.height = 200;
  position_y = 0;
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
    img1.src = "./image/test_formula.jpg?"+new Date().getTime();

    canvas2 = document.getElementById("canvas2");
    context2 = canvas2.getContext('2d');
    snapshot2 = context2.getImageData(0, 0, canvas2.width, canvas2.height);
    // canvas2.width = img1.width;
    // canvas2.height = 200;

    // context.strokeStyle = 'purple';
    context.lineWidth = 1;
    context.lineCap = 'round';

    canvas.addEventListener('mousedown', dragStart, false);
    canvas.addEventListener('mousemove', drag, false);
    canvas.addEventListener('mouseup', dragStop, false);
    // canvas.addEventListener('mousemove', dragStop, false);

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
