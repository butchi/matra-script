const canvas = []
const content = []

pdfMake.fonts = {
  Roboto: {
    normal: "Roboto-Regular.ttf",
  },
}

const docDefinition = {
  content,
  defaultStyle: {
    color: "gray",
  },
}

const btnCreateElm = document.getElementById("button-create")
btnCreateElm.addEventListener("click", _evt => {
  pdfMake.createPdf(docDefinition).open()
})
mdc.ripple.MDCRipple.attachTo(btnCreateElm);


const tabMenuElmArr = document.querySelectorAll(".mdc-tab")
const tabContentElmArr = document.querySelectorAll("[data-tab-content]")

tabMenuElmArr.forEach(tabMenuElm => {
  const label = tabMenuElm.getAttribute("data-tab-label")

  tabMenuElm.addEventListener("click", _evt => {
    tabContentElmArr.forEach((tabContentElm) => {
      if (tabContentElm.getAttribute("data-tab-label") === label) {
        tabContentElm.style.display = "block"
      } else {
        tabContentElm.style.display = "none"
      }
    })
  })
})

const baseWidth = 377
const baseHeight = 610

const svgNs = "http://www.w3.org/2000/svg"

const drawBaseElm = document.querySelector(".draw-base")
drawBaseElm.style.position = "relative"
drawBaseElm.style.width = `${baseWidth}px`
drawBaseElm.style.height = `${baseHeight}px`

const svgElm = document.createElementNS(svgNs, "svg")
svgElm.setAttribute("width", baseWidth)
svgElm.setAttribute("height", baseHeight)
svgElm.setAttribute("viewBox", `0 0 ${baseWidth} ${baseHeight}`)
svgElm.style.position = "absolute"

const canvasElm = document.createElement("canvas")
canvasElm.width = baseWidth
canvasElm.height = baseHeight
canvasElm.style.position = "absolute"

const g = document.createElementNS(svgNs, "g")
svgElm.appendChild(g)

let svgContentTxt = ""

// 一応3次元以上も見越している
const vector = (...argArr) => {
  if (argArr.length === 0) {
    return vector(0, 0)
  } else if (argArr.length === 1) {
    const arg = argArr[0]

    if (typeof arg === "number") {
      return vector({
        x: arg,
        y: 0,
      })
    } else if (arg instanceof Array) {
      if (arg[0] && arg[0].vector) {
        return vector(arg[0].vector)
      }

      return vec(...arg)
    } else if (arg instanceof Object) {
      if (Object.keys(arg).length === 0) {
        return vector({
          x: 0,
          y: 0,
        })
      } else if (arg.vector != null) {
        return vector(arg.vector)
      } else if (arg.x != null && arg.y != null) {
        return arg
      }
    } else {
      return arg
    }
  } else if (argArr.length >= 2) {
    return ({
      x: argArr[0] || 0,
      y: argArr[1] || 0,
    })
  }
}

const vec = (x = 0, y = 0, z = 0, w = 0) => {
  return ({
    x,
    y,
    z,
    w,
  })
}

const angleVector = (...argArr) => {
  let ret = vector(0, 0)

  if (argArr.length === 0) {
    ret = vector(1, 0)
  } else if (argArr.length === 1) {
    const arg = argArr[0]

    if (typeof arg === "number") {
      ret = vector(Math.cos(arg), Math.sin(arg))
    } else if (arg instanceof Array) {
      ret = angleVector(arg[0], arg[1])
    } else {
      ret = arg
    }
  } else if (argArr.length === 2) {
    const arg0 = argArr[0]
    const arg1 = argArr[1]

    let origin = vector(0, 0)
    let offset = vector(1, 0)

    if (typeof arg0 === "number") {
      const v = angleVector(arg1)
      offset = vector(arg0 * v.x, arg0 * v.y)
    } else {
      origin = vector(arg0)
      offset = angleVector(arg1)
    }

    ret = vector(origin.x + offset.x, origin.y + offset.y)
  }

  return ret
}

let unit = 25

const font = {
  size: 1,
}

const stroke = {
  color: null,
  width: null,
}

const face = {
  color: "#000",
}

const convertSize = arg => {
  if (typeof arg === "undefined") {
    return unit
  } else if (typeof arg === "number") {
    return arg * unit
  } else if (typeof arg === "string") {
    return arg
  } else {
    return unit
  }
}


const execFuncLi = {
  setUnit: prop => {
    unit = prop

    return prop
  },

  setFont: propObj => {
    if (propObj.face != null) {
      font.face = propObj.face
    }

    if (propObj.size != null) {
      font.size = propObj.size
    }

    return propObj
  },

  setStroke: propObj => {
    if (propObj.width != null) {
      stroke.width = propObj.width
    }

    if (propObj.color != null) {
      stroke.color = tinycolor(propObj.color).toRgbString()
    }

    return propObj
  },

  setFace: propObj => {
    if (propObj.color != null) {
      face.color = tinycolor(propObj.color).toRgbString()
    }

    return propObj
  },

  line: propObj => {
    let elmName
    let attrObj

    if (propObj.coordArray.length < 3) {
      elmName = "line"

      attrObj = {
        "x1": convertSize(propObj.coordArray[0].x),
        "y1": convertSize(propObj.coordArray[0].y),
        "x2": convertSize(propObj.coordArray[1].x),
        "y2": convertSize(propObj.coordArray[1].y),
      }
    } else {
      const len = propObj.coordArray.length

      if (propObj.coordArray[0].x === propObj.coordArray[len - 1].x && propObj.coordArray[0].y === propObj.coordArray[len - 1].y) {
        elmName = "polygon"

        propObj.coordArray.length = len - 1
      } else {
        elmName = "polyline"
      }

      attrObj = {
        "points": propObj.coordArray.map(c => `${convertSize(c.x)},${convertSize(c.y)}`).join(" "),
      }

      if (propObj.stroke.color != null || stroke.color != null) {
        attrObj.stroke = propObj.stroke.color || stroke.color
      }

      if (propObj.stroke.width != null || stroke.width != null) {
        attrObj["stroke-width"] = propObj.stroke.width || stroke.width
      }

      if (propObj.face.color != null || face.color != null) {
        attrObj.fill = propObj.face.color || face.color
      }
    }

    const { element: svgElm, text: svgTxt } = createSvgElement({
      elementName: elmName,
      attribute: attrObj,
    })

    svgContentTxt += svgTxt

    g.appendChild(svgElm)

    return svgElm
  },

  rectangle: propObj => {
    const attrObj = {
      "x": convertSize(propObj.coord.x),
      "y": convertSize(propObj.coord.y),
      "width": convertSize(propObj.size.x),
      "height": convertSize(propObj.size.y),
    }

    if (propObj.stroke.color != null || stroke.color != null) {
      attrObj.stroke = propObj.stroke.color || stroke.color
    }

    if (propObj.stroke.width != null || stroke.width != null) {
      attrObj["stroke-width"] = propObj.stroke.width || stroke.width
    }

    if (propObj.face.color != null || face.color != null) {
      attrObj.fill = propObj.face.color || face.color
    }

    const { element: svgElm, text: svgTxt } = createSvgElement({
      elementName: "rect",
      attribute: attrObj,
    })

    svgContentTxt += svgTxt

    g.appendChild(svgElm)
  },

  circle: propObj => {
    const attrObj = {
      "cx": convertSize(propObj.coord.x),
      "cy": convertSize(propObj.coord.y),
      "r": convertSize(propObj.radius),
    }

    if (propObj.stroke.color != null || stroke.color != null) {
      attrObj.stroke = propObj.stroke.color || stroke.color
    }

    if (propObj.stroke.width != null || stroke.width != null) {
      attrObj["stroke-width"] = propObj.stroke.width || stroke.width
    }

    if (propObj.face.color != null || face.color != null) {
      attrObj.fill = propObj.face.color || face.color
    }

    const { element: svgElm, text: svgTxt } = createSvgElement({
      elementName: "circle",
      attribute: attrObj,
    })

    svgContentTxt += svgTxt

    g.appendChild(svgElm)
  },

  text: propObj => {
    const attrObj = {
      "x": convertSize(propObj.coord.x),
      "y": convertSize(propObj.coord.y),
    }

    if (propObj.stroke.color != null || stroke.color != null) {
      attrObj["stroke"] = propObj.stroke.color || stroke.color
    }

    if (propObj.stroke.width != null || stroke.width != null) {
      attrObj["stroke-width"] = convertSize(propObj.stroke.width || stroke.width)
    }

    if (propObj.face.color != null || face.color != null) {
      attrObj["fill"] = propObj.face.color || face.color
    }

    if (propObj.font.family != null || font.family != null) {
      attrObj["font-family"] = propObj.font.family || font.family
    }

    if (propObj.font.size != null || font.size != null) {
      attrObj["font-size"] = convertSize(propObj.font.size || font.size)
    }

    if (propObj.align != null) {
      attrObj["text-anchor"] = {
        "-1": "start",
        "0": "middle",
        "1": "end",
      }[(propObj.align + 4) % 3 - 1]
      attrObj["dominant-baseline"] = {
        "-1": "text-top",
        "0": "middle",
        "1": "baseline",
      }[Math.floor((propObj.align + 1) / 3)]
    }

    const { element: svgElm, text: svgTxt } = createSvgElement({
      elementName: "text",
      attribute: attrObj,
      content: propObj.content,
    })

    svgContentTxt += svgTxt

    g.appendChild(svgElm)
  },

  group: propObj => {
    const attrObj = {
      "transform": propObj.transform,
    }

    const { element: svgElm, text: svgTxt } = createSvgElement({
      elementName: "g",
      attribute: attrObj,
      content: propObj.content,
    })

    svgContentTxt += svgTxt

    g.appendChild(svgElm)
  },
}


const setFunctionList = {
  Unit: (prop = 1) => body => {
    const propObj = prop

    return ({
      setUnit: propObj,
    })
  },

  Font: prop => body => {
    const propObj = {}

    const { size = 1, family } = prop

    propObj.size = size
    propObj.family = family

    return ({
      setFont: propObj,
    })
  },

  Stroke: prop => body => {
    const propObj = {}

    if (prop === undefined) {
      propObj.color = tinycolor(0x000000).toRgbString()
      propObj.width = 1
    } else if (prop == null) {
    } else {
      const { color, width } = prop

      if (color != null) {
        propObj.color = tinycolor(color).toRgbString()
      }

      if (width != null) {
        propObj.width = width
      }
    }

    return ({
      setStroke: propObj,
    })
  },

  Face: prop => body => {
    const propObj = {}

    const { color } = prop

    if (color != null) {
      propObj.color = tinycolor(color).toRgbString()
    }

    return ({
      setFace: propObj,
    })
  },
}


const createSvgElement = ({ elementName, attribute, content }) => {
  let ret

  const element = document.createElementNS(svgNs, elementName)

  Object.keys(attribute).forEach(key => {
    element.setAttribute(key, attribute[key])
  })

  if (content != null) {
    element.innerHTML = content
  }

  const text = `<${elementName} ${Object.keys(attribute).map(key => {
    return `${key}="${attribute[key]}"`
  }).join(" ")}>${content != null ? content : ""}</${elementName}>
  `

  ret = { element, text }

  return ret
}


const colorFunctionList = {
}

const colorLi = {
  "Black": "black",
  "White": "white",
  "Red": "red",
  "Green": "green",
  "Blue": "blue",
  "Yellow": "yellow",
}

Object.keys(colorLi).forEach(key => {
  colorFunctionList[key] = _ => setFunctionList.Face({
    color: tinycolor(colorLi[key]).toRgbString(),
  });
})

const drawFunctionList = {
  Line: prop => body => {
    const propObj = {
      coordArray: [vector(0, 0), vector(1, 0)],
      stroke: {},
      face: {},
    }

    propObj.coordArray = (prop["coord-array"] || body).map(coord => vector(coord)) || [vector(0, 0), vector(1, 0)]
    propObj.stroke = Object.assign({}, propObj.stroke, prop.stroke)
    propObj.face = Object.assign({}, propObj.face, prop.face)

    return ({
      line: propObj,
    })
  },

  Rectangle: prop => body => {
    const propObj = {
      coord: vector(0, 0),
      size: vector(1, 1),
      stroke: {},
      face: {},
    }

    propObj.coord = vector(prop.coord) || vector(body[0]) || vector(0, 0)
    propObj.size = vector(prop.size) || vector(body[1]) || vector(1, 1)
    propObj.stroke = Object.assign({}, propObj.stroke, prop.stroke)
    propObj.face = Object.assign({}, propObj.face, prop.face)

    return ({
      rectangle: propObj,
    })
  },

  Circle: prop => body => {
    const propObj = {
      coord: vector(0, 0),
      radius: 1,
      stroke: {},
      face: {},
    }

    propObj.coord = vector(prop.coord) || vector(body[0]) || vector(0, 0)
    propObj.radius = prop.radius || body[1] || 1
    propObj.stroke = Object.assign({}, propObj.stroke, prop.stroke)
    propObj.face = Object.assign({}, propObj.face, prop.face)

    return ({
      circle: propObj,
    })
  },

  Text: prop => body => {
    const propObj = {
      content: "",
      coord: vector(0, 0),
      font: {},
      stroke: {},
      face: {},
      align: 0,
    }

    if (content != null) {
      propObj.content = prop.content || vector(body[1])
    }
    propObj.coord = vector(prop.coord) || vector(body[0]) || propObj.coord
    propObj.stroke = Object.assign({}, propObj.stroke, prop.stroke)
    propObj.face = Object.assign({}, propObj.face, prop.face)
    propObj.font = Object.assign({}, propObj.font, prop.font)
    propObj.align = prop.align || propObj.align

    return ({
      text: propObj,
    })
  },

  Group: prop => body => {
    const propObj = {
      transform: "",
      content: "",
    }

    propObj.transform = prop.transform || propObj.transform

    if (content != null) {
      propObj.content = prop.content
    }

    return ({
      group: propObj,
    })
  },
}

const funcLi = Object.assign({}, setFunctionList, colorFunctionList, drawFunctionList)

const evalJSON = obj => {
  const arr = obj

  return arr.map(seq => {
    const [head, ...body] = seq

    const [tag, prop] = Object.entries(head)[0]

    let drawObj = {}

    drawObj = funcLi[tag](prop)(body)

    return drawObj
  })
    .map(item => {
      Object.keys(item).map(key => {
        const propObj = item[key]

        if (Object.keys(execFuncLi).includes(key)) {
          return execFuncLi[key](propObj)
        } else {
          return {}
        }
      })
    })
}


const json = strArr => eval(strArr.join(""))
const yaml = strArr => jsyaml.load(strArr.join(""))

const codeElm = document.getElementById("matra-script-code")
codeElm.style.fontFamily = `"Courier New", monospace`
codeElm.style.fontSize = `${11}px`


const jsonElm = document.getElementById("matra-json")
jsonElm.style.fontFamily = `"Courier New", monospace`
jsonElm.style.fontSize = `${11}px`


const yamlElm = document.getElementById("matra-yaml")
yamlElm.style.fontFamily = `"Courier New", monospace`
yamlElm.style.fontSize = `${11}px`


const inputHandler = (evt = {}) => {
  canvas.length = 0
  content.length = 0
  content.push({ canvas })
  g.innerHTML = ""
  svgContentTxt = ""

  const val = evt.target && evt.target.value || codeElm.innerHTML

  const mScr = val.replaceAll("&lt;", "<").replaceAll("&gt;", ">")

  try {
    const obj = globalThis.matraScript.parse(mScr)

    jsonElm.innerHTML = JSON5.stringify(obj, null, 2)
    yamlElm.innerHTML = jsyaml.dump(obj)

    evalJSON(obj)

    content.push({
      svg: `<svg width="610" height="377" viewBox="0 0 610 377"><g>${svgContentTxt
        }</g></svg>`,
      width: 610,
      height: 377,
    })
  } catch (e) {
    console.log(e)
  }
}

codeElm.addEventListener("input", inputHandler)


const range = (...argArr) => {
  let ret = []
  let start = 1
  let end = 1

  if (argArr.length === 0) {
    start = 1
    end = 1
  } else if (argArr.length === 1) {
    start = 1
    end = argArr[0]
  } else {
    start = argArr[0]
    end = argArr[1]
  }

  for (let i = start; i <= end; i++) {
    ret.push(i)
  }

  return ret
}

const color = arg => {
  return tinycolor(arg)
}

const exampleStr = "matra`" + `
(Text) [ content => "Hello, world!", coord => (5, 1), font => [ size => 1 ], face => [ color => "red" ], align => 0 ]
(Red)
(Stroke) [ width => 3, color => "black" ]
(Rectangle) [ coord => (8, 3), size => (3, 5) ]
(Green)
(Rectangle) { (1, 5), (3, 3) }
(Blue)
(Circle) [
  coord => (6, 3)
  radius => 1
  face => [
    color => "#ff0"
  ]
  stroke => [
    width => 8
  ]
]
(Circle) { (6, 6), 1 }
(Line) [ coord-array => {
  (1, 11)
  (3, 11)
  (3, 13)
}]
(Line) { (6, 11), (7, 13), (8, 11), (6, 11) }
(Stroke) [ width => 0 ]
(Text) { (5, 15), "Thanks, world!" }
` + "`"

codeElm.innerHTML = exampleStr

drawBaseElm.appendChild(canvasElm)
drawBaseElm.appendChild(svgElm)

inputHandler()