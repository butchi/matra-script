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
  console.log(canvas);
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

const createObject = ({ elementName, attribute }) => {
  const ret = {};

  let svgElm;

  const pdfObj = {
  };

  const propObj = {
  };

  if (elementName === undefined) {
  } else if (elementName === 'rectangle') {
    const { coord, size, stroke, face } = attribute;

    svgElm = document.createElementNS(svgNs, 'rect')

    pdfObj.type = 'rect';

    propObj['x'] = pdfObj['x'] = convertSize(coord.x);
    propObj['y'] = pdfObj['y'] = convertSize(coord.y);
    propObj['width'] = pdfObj['w'] = convertSize(size.x);
    propObj['height'] =pdfObj['h'] = convertSize(size.y);

    if (stroke.color != null) {
      propObj['stroke'] = pdfObj['lineColor'] = stroke.color;
    }
  
    if (stroke.width != null) {
      propObj['stroke-width'] = pdfObj['lineWidth'] = stroke.width;
    }
  
    if (face.color != null) {
      propObj['fill'] = pdfObj['color'] = face.color;
    }
  } else if (elementName === 'circle') {
    const { coord, radius, stroke, face } = attribute;

    svgElm = document.createElementNS(svgNs, 'circle')

    pdfObj.type = 'ellipse';

    propObj['cx'] = pdfObj['x'] = convertSize(coord.x);
    propObj['cy'] = pdfObj['y'] = convertSize(coord.y);
    propObj['r'] = pdfObj['r1'] = propObj['r2'] = convertSize(radius);

    if (stroke.color != null) {
      propObj['stroke'] = pdfObj['lineColor'] = stroke.color;
    }
  
    if (stroke.width != null) {
      propObj['stroke-width'] = pdfObj['lineWidth'] = stroke.width;
    }
  
    if (face.color != null) {
      propObj['fill'] = pdfObj['color'] = face.color;
    }
  } else if (elementName === 'text') {
    const { text, coord, font, stroke, face} = attribute;

    svgElm = document.createElementNS(svgNs, 'text')

    pdfObj.type = 'text';

    propObj['x'] = pdfObj['x'] = convertSize(coord.x);
    propObj['y'] = pdfObj['y'] = convertSize(coord.y);
    propObj['font-size'] = convertSize(font.size);

    svgElm.innerHTML = text;

    pdfObj.color = face.color;
    // pdfObj.font = `15pt Arial`;
    // pdfObj.font = `${convertSize(size)}pt ${fontName}`;
    pdfObj.text = text;
    pdfObj.absolutePosition = {
      x: convertSize(coord.x),
      y: convertSize(coord.y),
    };

    if (stroke.color != null) {
      propObj['stroke'] = pdfObj['lineColor'] = stroke.color;
    }
  
    if (stroke.width != null) {
      propObj['stroke-width'] = pdfObj['lineWidth'] = stroke.width;
    }
  
    if (face.color != null) {
      propObj['fill'] = pdfObj['color'] = face.color;
    }

    console.log(pdfObj);
  }

  Object.keys(propObj).forEach(key => {
    svgElm.setAttribute(key, propObj[key]);
  });

  ret.svgElement = svgElm;
  ret.pdfObject = pdfObj;

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

  const elmName = 'rectangle';

  const attrObj = {
    coord,
    size,
    stroke,
    face,
  };

  const { svgElement, pdfObject } = createObject({
    elementName: elmName,
    attribute: attrObj,
  });

  g.appendChild(svgElement);
  canvas.push(pdfObject);

  return { svgElement, pdfObject };
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

  const elmName = 'circle';

  const attrObj = {
    coord,
    radius,
    stroke,
    face,
  };

  const { svgElement, pdfObject } = createObject({
    elementName: elmName,
    attribute: attrObj,
  });

  g.appendChild(svgElement);
  canvas.push(pdfObject);

  return { svgElement, pdfObject };
};

const text = (...argArr) => {
  let text;
  let coord;
  let font = {};

  if (argArr.length === 0) {
    text = '';
    coord = vector(0, 0);
    font.size = 1;
  } else if (argArr.length === 1){
    text = argArr[0].text || '';
    coord = vector(argArr[0].coord) || vector(0, 0);
    font.size = argArr[0].size || 1;
  } else if (argArr.length === 2){
    text = vector(argArr[0]) || '';
    coord = vector(argArr[1]) || vector(0, 0);
    font.size = 1;
  } else if (argArr.length === 3){
    text = vector(argArr[0]) || '';
    coord = vector(argArr[1]) || vector(0, 0);
    font.size = argArr[2];
  } else {
    text = '';
    coord = vector(0, 0);
    font.size = 1;
  }

  const elmName = 'text';

  const attrObj = {
    text,
    coord,
    font,
    stroke,
    face,
  };

  const { svgElement, pdfObject } = createObject({
    elementName: elmName,
    attribute: attrObj,
  });

  g.appendChild(svgElement);
  content.push(pdfObject);

  return { svgElement, pdfObject };
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
  black(),
  text('Thanks, world!', [1, 1], 1),
];`);

$code.trigger('input');

svgCanvasElm.appendChild(svgElm);
