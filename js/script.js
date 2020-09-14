'use strict';

const canvas = [];
const content = [];

pdfMake.fonts = {
  Roboto: {
    normal: 'Roboto-Regular.ttf',
  },
}

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

let svgContentTxt = '';

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

const angleVector = (...argArr) => {
  let ret = vector(0, 0);

  if (argArr.length === 0) {
    ret = vector(1, 0);
  } else if (argArr.length === 1) {
    const arg = argArr[0];

    if (typeof arg === 'number') {
      ret = vector(Math.cos(arg), Math.sin(arg));
    } else if (arg instanceof Array) {
      ret = angleVector(arg[0], arg[1]);
    } else {
      ret = arg;
    }
  } else if (argArr.length === 2) {
    const arg0 = argArr[0];
    const arg1 = argArr[1];

    let origin = vector(0, 0);
    let offset = vector(1, 0);

    if (typeof arg0 === 'number') {
      const v = angleVector(arg1);
      offset = vector(arg0 * v.x, arg0 * v.y);
    } else {
      origin = vector(arg0);
      offset = angleVector(arg1);
    }

    ret = vector(origin.x + offset.x, origin.y + offset.y);
  }

  return ret;
};

let unit = 25;

const font = {
  size: 1,
};

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

const setUnit = arg => {
  unit = arg;

  return unit;
}

const setFont = arg => {
  const { size, family } = arg;

  font.size = size;
  font.family = family;

  return font;
}

const setStroke = arg => {
  if (arg === undefined) {
    stroke.color = 'black';
    stroke.width = 1;
  } else if (arg == null) {
    stroke.color = null;
    stroke.width = null;
  } else {
    const { color, width } = arg;

    if (color != null) {
      stroke.color = color;
    }

    if (width != null) {
      stroke.width = width;
    }
  }

  return stroke;
}

const setFace = arg => {
  const { color } = arg;

  face.color = color;

  return face;
}

const createSvgElement = ({ elementName, attribute, content }) => {
  let ret;

  const element = document.createElementNS(svgNs, elementName);

  Object.keys(attribute).forEach(key => {
    element.setAttribute(key, attribute[key]);
  });

  if (content != null) {
    element.innerHTML = content;
  }

  const text = `<${elementName} ${Object.keys(attribute).map(key => {
    return `${key}="${attribute[key]}"`;
  }).join(' ')}>${content != null ? content : ''}</${elementName}>
  `;
 
  ret = { element, text };

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

const line = (...argArr) => {
  const propObj = {
    coordArr: [vector(0, 0), vector(1, 0)],
    stroke: Object.assign({}, stroke),
  };

  if (argArr.length === 0) {
  } else if (argArr.length === 1){
    propObj.coordArr = argArr[0].coordArray || [vector(0, 0), vector(1, 0)];
  } else if (argArr.length === 2){
    propObj.coordArr = argArr;
  } else {
  }

  const attrObj = {
    "x1": convertSize(propObj.coordArr[0].x),
    "y1": convertSize(propObj.coordArr[0].y),
    "x2": convertSize(propObj.coordArr[1].x),
    "y2": convertSize(propObj.coordArr[1].y),
  };

  if (propObj.stroke.color != null) {
    attrObj['stroke'] = propObj.stroke.color;
  }

  if (propObj.stroke.width != null) {
    attrObj['stroke-width'] = propObj.stroke.width;
  }

  const { element: svgElm, text: svgTxt } = createSvgElement({
    elementName: 'line',
    attribute: attrObj,
  });

  svgContentTxt += svgTxt;

  g.appendChild(svgElm);

  return propObj;
};

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

  if (propObj.stroke.color != null) {
    attrObj['stroke'] = propObj.stroke.color;
  }

  if (propObj.stroke.width != null) {
    attrObj['stroke-width'] = propObj.stroke.width;
  }

  if (propObj.face.color != null) {
    attrObj['fill'] = propObj.face.color;
  }

  const { element: svgElm, text: svgTxt } = createSvgElement({
    elementName: 'rect',
    attribute: attrObj,
  });

  svgContentTxt += svgTxt;

  g.appendChild(svgElm);

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
    propObj.stroke = Object.assign({}, propObj.stroke, argArr[0].stroke);
    propObj.face = Object.assign({}, propObj.face, argArr[0].face);
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

  if (propObj.stroke.color != null) {
    attrObj['stroke'] = propObj.stroke.color;
  }

  if (propObj.stroke.width != null) {
    attrObj['stroke-width'] = propObj.stroke.width;
  }

  if (propObj.face.color != null) {
    attrObj['fill'] = propObj.face.color;
  }

  const pdfObj = {
    type: 'ellipse',
    x: convertSize(propObj.coord.x),
    y: convertSize(propObj.coord.y),
    r1: convertSize(propObj.radius),
    r2: convertSize(propObj.radius),
  };

  const { element: svgElm, text: svgTxt } = createSvgElement({
    elementName: 'circle',
    attribute: attrObj,
  });

  svgContentTxt += svgTxt;

  g.appendChild(svgElm);

  return propObj;
};

const text = (...argArr) => {
  const propObj = {
    content: '',
    coord: vector(0, 0),
    font: Object.assign({}, font),
    stroke: Object.assign({}, stroke),
    face: Object.assign({}, face),
    align: 0,
  };

  if (argArr.length === 0) {
  } else if (argArr.length === 1){
    if (content != null) {
      propObj.content = argArr[0].content;
    }
    propObj.coord = vector(argArr[0].coord) || propObj.coord;
    propObj.stroke = Object.assign({}, propObj.stroke, argArr[0].stroke);
    propObj.face = Object.assign({}, propObj.face, argArr[0].face);
    propObj.font = Object.assign({}, propObj.font, argArr[0].font);
    propObj.align = argArr[0].align || propObj.align;
  } else {
  }

  const attrObj = {
    "x": convertSize(propObj.coord.x),
    "y": convertSize(propObj.coord.y),
  };

  if (propObj.stroke.color != null) {
    attrObj['stroke'] = propObj.stroke.color;
  }

  if (propObj.stroke.width != null) {
    attrObj['stroke-width'] = convertSize(propObj.stroke.width);
  }

  if (propObj.face.color != null) {
    attrObj['fill'] = propObj.face.color;
  }

  if (propObj.font.family != null) {
    attrObj['font-family'] = propObj.font.family;
  }

  if (propObj.font.size != null) {
    attrObj['font-size'] = convertSize(propObj.font.size);
  }

  if (propObj.align != null) {
    attrObj['text-anchor'] = {
      "-1": 'start',
      "0": 'middle',
      "1": 'end',
    }[(propObj.align + 4) % 3 - 1];
    attrObj['dominant-baseline'] = {
      "-1": 'text-top',
      "0": 'middle',
      "1": 'baseline',
    }[Math.floor((propObj.align + 1) / 3)];
  }

  const { element: svgElm, text: svgTxt } = createSvgElement({
    elementName: 'text',
    attribute: attrObj,
    content: propObj.content,
  });

  svgContentTxt += svgTxt;

  g.appendChild(svgElm);

  return propObj;
};

const $code = $('#code');

$code.on('input', evt => {
  canvas.length = 0;
  content.length = 0;
  content.push({ canvas });
  g.innerHTML = '';
  svgContentTxt = '';

  try {
    eval(evt.target.value);
    content.push({
			svg: `<svg width="610" height="377" viewBox="0 0 610 377"><g>${
        svgContentTxt
      }</g></svg>`,
			width: 600,
			height: 400,
    });
  } catch (e) {
    console.log(e);
  }
});


const range = (...argArr) => {
  let ret = [];
  let start = 1;
  let end = 1;

  if (argArr.length === 0) {
    start = 1;
    end = 1;
  } else if (argArr.length === 1) {
    start = 1;
    end = argArr[0];
  } else {
    start = argArr[0];
    end = argArr[1];
  }

  for(let i = start; i <= end; i++) {
    ret.push(i);
  }

  return ret;
}

const color = arg => {
  return tinycolor(arg);
};

$code.val(`[
  red(),
  setStroke({ width: 3, color: "black" }),
  rectangle({ coord: vector(8, 3), size: vector(3, 5) }),
  green(),
  rectangle([1, 5], [3, 3]),
  blue(),
  circle([6, 3], 1),
  setStroke({ width: 0 }),
  black(),
  text({ content: "Thanks, world!", coord: vector(5, 1), font: { size: 1 }, align: 0 }),
];`);

svgCanvasElm.appendChild(svgElm);

$code.trigger('input');
 