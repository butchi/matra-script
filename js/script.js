'use strict';

const svgNs = 'http://www.w3.org/2000/svg';

const svgCanvasElm = document.querySelector('.svg-canvas');

const svgElm = document.createElementNS(svgNs, 'svg');
svgElm.setAttribute('width', '610');
svgElm.setAttribute('height', '377');
svgElm.setAttribute('viewBox', '0 0 610 377');

const g = document.createElementNS(svgNs, 'g');
svgElm.appendChild(g);

const vector = (...argArr) => {
  if (argArr.length === 0) {
    return vector(0, 0);
  } else if (argArr.length === 1) {
    const arg = argArr[0];

    if (typeof arg === 'number') {
      return vector(arg, 0);
    } else if (arg instanceof Array) {
      return vector(arg[0], arg[1]);
    } else {
      return arg;
    }
  } else if (argArr.length >= 2) {
    return ({
      x: argArr[0],
      y: argArr[1],
    });
  }
};

const unit = 25;

const stroke = {
  color: null,
  width: null,
};

let color = '#000';

const convertSize = arg => {
  if (typeof arg === 'undefined') {
    return unit;
  } else if (typeof arg === 'number') {
    return arg * unit;
  } else if (typeof arg === 'string') {
    return arg;
  } else {
    return unit;
  }
}

const setStroke = args => {
  const color = args.color;
  const width = args.width;

  if (color) {
    stroke.color = color;
  }

  if (width) {
    stroke.width = width;
  }
}

const setColor = arg => {
  return color = arg;
}

const red = _ => setColor('red');
const green = _ => setColor('green');
const blue = _ => setColor('blue');
const yellow = _ => setColor('yellow');

const rectangle = (...argArr) => {
  let coord;
  let size;

  if (argArr.length === 0) {
    coord = vector(0, 0);
    size = vector(1, 1);
  } else if (argArr.length === 1){
    coord = vector(argArr[0].coord) || vector(0, 0);
    size = vector(argArr[0].size) || vector(1, 1);
  } else if (argArr.length === 2){
    coord = vector(argArr[0]) || vector(0, 0);
    size = vector(argArr[1]) || vector(1, 1);
  } else {
    coord = vector(0, 0);
    size = vector(1, 1);
  }

  const elm = document.createElementNS(svgNs, 'rect');
  elm.setAttribute('x', convertSize(coord.x));
  elm.setAttribute('y', convertSize(coord.y));
  elm.setAttribute('width', convertSize(size.x));
  elm.setAttribute('height', convertSize(size.y));

  if (stroke.color != null) {
    elm.setAttribute('stroke', stroke.color);
  }

  if (stroke.width != null) {
    elm.setAttribute('stroke-width', convertSize(stroke.width));
  }

  if (color != null) {
    elm.setAttribute('fill', color);
  }

  return g.appendChild(elm);
};

const circle = (...argArr) => {
  let coord;
  let radius;

  if (argArr.length === 0) {
    coord = vector(0, 0);
    radius = 1;
  } else if (argArr.length === 1){
    coord = vector(argArr[0].coord) || vector(0, 0);
    radius = vector(argArr[0].radius) || 1;
  } else if (argArr.length === 2){
    coord = vector(argArr[0]) || vector(0, 0);
    radius = vector(argArr[1]) || 1;
  } else {
    coord = vector(0, 0);
    radius = 1;
  }

  const elm = document.createElementNS(svgNs, 'circle');
  elm.setAttribute('cx', convertSize(coord.x));
  elm.setAttribute('cy', convertSize(coord.y));
  elm.setAttribute('r', convertSize(radius));

  if (stroke.color != null) {
    elm.setAttribute('stroke', stroke.color);
  }

  if (stroke.width != null) {
    elm.setAttribute('stroke-width', convertSize(stroke.width));
  }

  if (color != null) {
    elm.setAttribute('fill', color);
  }

  return g.appendChild(elm);
};

[
  red(),
  setStroke({ width: 0.1, color: 'black' }),
  rectangle({ coord: vector(8, 1), size: vector(3, 5) }),
  green(),
  rectangle([1, 3], [3, 3]),
  blue(),
  circle([6, 3], 1)
];

svgCanvasElm.appendChild(svgElm);
