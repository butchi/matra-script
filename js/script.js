'use strict';

const canvas = [];
const content = [{
  canvas,
}];

const docDefinition = {
	content,
	defaultStyle: {
		color: 'gray',
	}
};

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

const face = {
  color: '#000'
};

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

const setStroke = arg => {
  const { color, width } = arg;

  stroke.color = color;
  stroke.width = width;

  return stroke;
}

const setFace = arg => {
  const { color } = arg;

  face.color = color;

  return face;
}

const createSvgElement = ({ elementName, attribute, content }) => {
  let ret;

  let svgElm;

  svgElm = document.createElementNS(svgNs, elementName);

  Object.keys(attribute).forEach(key => {
    svgElm.setAttribute(key, attribute[key]);
  });

  if (content) {
    svgElm.innerHTML = content;
  }

  ret = svgElm;

  return ret;
};

const black = _ => setFace({
  color: 'black',
});
const white = _ => setFace({
  color: 'white',
});
const red = _ => setFace({
  color: 'red',
});
const green = _ => setFace({
  color: 'green',
});
const blue = _ => setFace({
  color: 'blue',
});
const yellow = _ => setFace({
  color: 'yellow',
});

const rectangle = (...argArr) => {
  const propObj = {
    coord: vector(0, 0),
    size: vector(1, 1),
    stroke: Object.assign({}, stroke),
    face: Object.assign({}, face),
  };

  if (argArr.length === 0) {
  } else if (argArr.length === 1){
    propObj.coord = vector(argArr[0].coord) || vector(0, 0);
    propObj.size = vector(argArr[0].size) || vector(1, 1);
  } else if (argArr.length === 2){
    propObj.coord = vector(argArr[0]) || vector(0, 0);
    propObj.size = vector(argArr[1]) || vector(1, 1);
  } else {
  }

  const attrObj = {
    "x": convertSize(propObj.coord.x),
    "y": convertSize(propObj.coord.y),
    "width": convertSize(propObj.size.x),
    "height": convertSize(propObj.size.y),
  };

  if (stroke.color != null) {
    attrObj['stroke'] = propObj.stroke.color;
  }

  if (stroke.width != null) {
    attrObj['stroke-width'] = propObj.stroke.width;
  }

  if (face.color != null) {
    attrObj['fill'] = propObj.face.color;
  }

  const pdfObj = {
    type: 'rect',
    x: convertSize(propObj.coord.x),
    y: convertSize(propObj.coord.y),
    w: convertSize(propObj.size.x),
    h: convertSize(propObj.size.y),
  }

  if (propObj.stroke.color != null) {
    pdfObj.lineColor = propObj.stroke.color;
  }

  if (propObj.stroke.width != null) {
    pdfObj.lineWidth = propObj.stroke.width;
  }

  if (propObj.face.color != null) {
    pdfObj.color = propObj.face.color;
  }

  const svgElm = createSvgElement({
    elementName: 'rect',
    attribute: attrObj,
  });

  g.appendChild(svgElm);
  canvas.push(pdfObj);

  return propObj;
};

const circle = (...argArr) => {
  const propObj = {
    coord: vector(0, 0),
    radius: 1,
    stroke: Object.assign({}, stroke),
    face: Object.assign({}, face),
  };

  if (argArr.length === 0) {
  } else if (argArr.length === 1){
    propObj.coord = vector(argArr[0].coord) || vector(0, 0);
    propObj.radius = argArr[0].radius || 1;
  } else if (argArr.length === 2){
    propObj.coord = vector(argArr[0]) || vector(0, 0);
    propObj.radius = argArr[1] || 1;
  } else {
  }

  const attrObj = {
    "cx": convertSize(propObj.coord.x),
    "cy": convertSize(propObj.coord.y),
    "r": convertSize(propObj.radius),
  };

  if (stroke.color != null) {
    attrObj['stroke'] = propObj.stroke.color;
  }

  if (stroke.width != null) {
    attrObj['stroke-width'] = propObj.stroke.width;
  }

  if (face.color != null) {
    attrObj['fill'] = propObj.face.color;
  }

  const pdfObj = {
    type: 'ellipse',
    x: convertSize(propObj.coord.x),
    y: convertSize(propObj.coord.y),
    r1: convertSize(propObj.radius),
    r2: convertSize(propObj.radius),
  };

  if (stroke.color != null) {
    pdfObj.lineColor = propObj.stroke.color;
  }

  if (stroke.width != null) {
    pdfObj.lineWidth = propObj.stroke.width;
  }

  if (face.color != null) {
    pdfObj.color = propObj.face.color;
  }

  const svgElm = createSvgElement({
    elementName: 'circle',
    attribute: attrObj,
  });

  g.appendChild(svgElm);
  canvas.push(pdfObj);

  return propObj;
};

const text = (...argArr) => {
  const propObj = {
    text: '',
    coord: vector(0, 0),
    size: 1,
    font: {},
    stroke: Object.assign({}, stroke),
    face: Object.assign({}, face),
  };

  if (argArr.length === 0) {
  } else if (argArr.length === 1){
    propObj.text = argArr[0].text || '';
    propObj.coord = vector(argArr[0].coord) || vector(0, 0);
    propObj.font.size = argArr[0].size || 1;
  } else if (argArr.length === 2){
    propObj.text = vector(argArr[0]) || '';
    propObj.coord = vector(argArr[1]) || vector(0, 0);
    propObj.font.size = 1;
  } else if (argArr.length === 3){
    propObj.text = vector(argArr[0]) || '';
    propObj.coord = vector(argArr[1]) || vector(0, 0);
    propObj.font.size = argArr[2];
  } else {
  }

  const attrObj = {
    "x": convertSize(propObj.coord.x),
    "y": convertSize(propObj.coord.y),
    "font-size": convertSize(propObj.font.size),
  }

  if (stroke.color != null) {
    attrObj['stroke'] = propObj.stroke.color;
  }

  if (stroke.width != null) {
    attrObj['stroke-width'] = propObj.stroke.width;
  }

  if (face.color != null) {
    attrObj['fill'] = propObj.face.color;
  }

  const svgElm = createSvgElement({
    elementName: 'text',
    attribute: attrObj,
    content: propObj.text,
  });

  const pdfObj = {
    type: 'text',
    color: propObj.face.color,
    // pdfObj.font = `15pt Arial`;
    // pdfObj.font = `${convertSize(size)}pt ${fontName}`;
    text: propObj.text,
    absolutePosition: {
      x: convertSize(propObj.coord.x),
      y: convertSize(propObj.coord.y),
    },
  };

  if (propObj.stroke.color != null) {
    pdfObj.lineColor = propObj.stroke.color;
  }

  if (propObj.stroke.width != null) {
    pdfObj.lineWidth = propObj.stroke.width;
  }

  if (propObj.face.color != null) {
    pdfObj.color = propObj.face.color;
  }

  g.appendChild(svgElm);
  content.push(pdfObj);

  return propObj;
};

const $code = $('#code');

$code.on('input', evt => {
  canvas.length = 0;
  content.length = 0;
  content.push({ canvas });
  g.innerHTML = '';

  try {
    eval(evt.target.value);
  } catch (e) {
    console.log(e);
  }
})

$code.val(`[
  red(),
  setStroke({ width: 3, color: 'black' }),
  rectangle({ coord: vector(8, 1), size: vector(3, 5) }),
  green(),
  rectangle([1, 3], [3, 3]),
  blue(),
  circle([6, 3], 1),
  setStroke({ width: 0 }),
  black(),
  text('Thanks, world!', [1, 1], 1),
];`);

$code.trigger('input');

svgCanvasElm.appendChild(svgElm);
