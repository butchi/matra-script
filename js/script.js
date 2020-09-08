'use strict';

document.getElementById('button-create').addEventListener('click', _evt => {
  pdfMake.createPdf(docDefinition).open();
});

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

const createObject = ({ elementName, attribute }) => {
  const ret = {};

  const elm = document.createElementNS(svgNs, elementName);

  Object.keys(attribute).forEach(key => {
    elm.setAttribute(key, attribute[key]);
  });

  ret.svgElement = elm;

  return ret;
};

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

  const attrObj = {
    x: convertSize(coord.x), 
    y: convertSize(coord.y),
    width: convertSize(size.x),
    height: convertSize(size.y),
  };

  if (stroke.color != null) {
    attrObj['stroke'] = stroke.color;
  }

  if (stroke.width != null) {
    attrObj['stroke-width'] = convertSize(stroke.width);
  }

  if (color != null) {
    attrObj['fill'] = color;
  }

  const { svgElement } = createObject({
    elementName: 'rect',
    attribute: attrObj,
  });

  return g.appendChild(svgElement);
};

const circle = (...argArr) => {
  let coord;
  let radius;

  if (argArr.length === 0) {
    coord = vector(0, 0);
    radius = 1;
  } else if (argArr.length === 1){
    coord = vector(argArr[0].coord) || vector(0, 0);
    radius = argArr[0].radius || 1;
  } else if (argArr.length === 2){
    coord = vector(argArr[0]) || vector(0, 0);
    radius = argArr[1] || 1;
  } else {
    coord = vector(0, 0);
    radius = 1;
  }

  const attrObj = {
    cx: convertSize(coord.x), 
    cy: convertSize(coord.y),
    r: convertSize(radius),
  };

  if (stroke.color != null) {
    attrObj['stroke'] = stroke.color;
  }

  if (stroke.width != null) {
    attrObj['stroke-width'] = convertSize(stroke.width);
  }

  if (color != null) {
    attrObj['fill'] = color;
  }

  const { svgElement } = createObject({
    elementName: 'circle',
    attribute: attrObj,
  });

  return g.appendChild(svgElement);
};

const $code = $('#code');

$code.on('input', evt => {
  g.innerHTML = '';

  try {
    eval(evt.target.value);
  } catch (e) {
    console.log(e);
  }
})

$code.val(`[
  red(),
  setStroke({ width: 0.1, color: 'black' }),
  rectangle({ coord: vector(8, 1), size: vector(3, 5) }),
  green(),
  rectangle([1, 3], [3, 3]),
  blue(),
  circle([6, 3], 1)
];`);

$code.trigger('input');

svgCanvasElm.appendChild(svgElm);
