const canvas = []
const content = []

pdfMake.fonts = {
    Roboto: {
        normal: 'Roboto-Regular.ttf',
    },
}

const docDefinition = {
    content,
    defaultStyle: {
        color: 'gray',
    },
}

const btnCreateElm = document.getElementById('button-create')
btnCreateElm.addEventListener('click', _evt => {
    pdfMake.createPdf(docDefinition).open()
})
mdc.ripple.MDCRipple.attachTo(btnCreateElm)

const tabMenuElmArr = document.querySelectorAll('.mdc-tab')
const tabContentElmArr = document.querySelectorAll('[data-tab-content]')

tabMenuElmArr.forEach(tabMenuElm => {
    const label = tabMenuElm.getAttribute('data-tab-label')

    tabMenuElm.addEventListener('click', _evt => {
        tabContentElmArr.forEach(tabContentElm => {
            if (tabContentElm.getAttribute('data-tab-label') === label) {
                tabContentElm.style.display = 'block'
            } else {
                tabContentElm.style.display = 'none'
            }
        })
    })
})

const baseWidth = 377
const baseHeight = 610

const svgNs = 'http://www.w3.org/2000/svg'

const drawBaseElm = document.querySelector('.draw-base')
drawBaseElm.style.position = 'relative'
drawBaseElm.style.width = `${baseWidth}px`
drawBaseElm.style.height = `${baseHeight}px`

const svgElm = document.createElementNS(svgNs, 'svg')
svgElm.setAttribute('width', baseWidth)
svgElm.setAttribute('height', baseHeight)
svgElm.setAttribute('viewBox', `0 0 ${baseWidth} ${baseHeight}`)
svgElm.style.position = 'absolute'

const canvasElm = document.createElement('canvas')
canvasElm.width = baseWidth
canvasElm.height = baseHeight
canvasElm.style.position = 'absolute'

const g = document.createElementNS(svgNs, 'g')
svgElm.appendChild(g)

let svgContentTxt = ''

// 一応3次元以上も見越している
const vector = (...argArr) => {
    if (argArr.length === 0) {
        return vector(0, 0)
    } else if (argArr.length === 1) {
        const arg = argArr[0]

        if (typeof arg === 'number') {
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
        return {
            x: argArr[0] || 0,
            y: argArr[1] || 0,
        }
    }
}

const vec = (x = 0, y = 0, z = 0, w = 0) => {
    return {
        x,
        y,
        z,
        w,
    }
}

const angleVector = (...argArr) => {
    let ret = vector(0, 0)

    if (argArr.length === 0) {
        ret = vector(1, 0)
    } else if (argArr.length === 1) {
        const arg = argArr[0]

        if (typeof arg === 'number') {
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

        if (typeof arg0 === 'number') {
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

const ctx = {
    unit: 25,
    font: {
        size: 1,
        // face: undefined,
    },
    stroke: {
        // color: undefined,
        // width: undefined,
    },
    face: {
        // color: undefined,
    },
}

const convertSize = arg => {
    if (typeof arg === 'undefined') {
        return ctx.unit
    } else if (typeof arg === 'number') {
        return arg * ctx.unit
    } else if (typeof arg === 'string') {
        return arg
    } else {
        return ctx.unit
    }
}

const getStroke = stroke => {
    const ret = {}

    if (stroke === undefined) {
        stroke = {
            color: ctx.stroke.color,
            width: ctx.stroke.width,
        }
    } else if (stroke === null) {
        stroke = {
            color: null,
            width: null,
        }
    }

    if (stroke.color === undefined) {
        ret.color = ctx.stroke.color
    } else if (stroke.color !== null) {
        ret.color = stroke.color
    }

    if (stroke.width === undefined) {
        ret.width = ctx.stroke.width
    } else if (stroke.width !== null) {
        ret.width = stroke.width
    }

    return ret
}

const getFace = face => {
    const ret = {}

    if (face === undefined) {
        face = {
            color: ctx.face.color,
        }
    } else if (face === null) {
        face = {
            color: null,
        }
    }

    if (face.color === undefined) {
        ret.color = ctx.face.color
    } else if (face.color !== null) {
        ret.color = face.color
    }

    return ret
}

const getFont = font => {
    const ret = {}

    if (font === undefined) {
        font = {
            size: ctx.font.size,
        }
    } else if (font === null) {
        font = {
            size: null,
        }
    }

    if (font.size === undefined) {
        ret.size = ctx.font.size
    } else if (font.size !== null) {
        ret.size = font.size
    }

    return ret
}

const createSvgElement = obj => {
    const [head, body] = obj
    const [tag, prop] = Object.entries(head)[0]

    let ret

    const elm = document.createElementNS(svgNs, tag)

    Object.entries(prop).forEach(([key, val]) => {
        elm.setAttribute(key, val)
    })

    if (body != null) {
        elm.innerHTML = body
    }

    const xml = `<${tag} ${Object.entries(prop)
        .map(([key, val]) => {
            return `${key}="${val}"`
        })
        .join(' ')}>${body != null ? content : ''}</${tag}>`

    svgContentTxt += xml

    g.appendChild(elm)

    ret = [
        {
            createElement: {
                obj,
                elm,
                xml,
            },
        },
    ]

    return ret
}

const setContext = obj => {
    const [head, body] = obj
    const [tag, prop] = Object.entries(head)[0]

    let ret

    Object.entries(prop).forEach(([key, val]) => {
        ctx[tag][key] = val
    })

    ret = [
        {
            setContext: obj,
        },
    ]

    return ret
}

const funcLi = {
    Unit:
        (prop = 1) =>
        body => {
            ctx.unit = prop

            return [{ Unit: propObj }]
        },

    Font: prop => body => {
        if (propObj.face != null) {
            ctx.font.face = propObj.face
        }

        if (propObj.size != null) {
            ctx.font.size = propObj.size
        }

        const propObj = {}

        const { size = 1, family } = prop

        propObj.size = size
        propObj.family = family

        return [{ Font: propObj }]
    },

    Stroke: prop => _body => {
        const propObj = {}

        if (prop === undefined) {
            propObj.color = tinycolor(0x000000).toRgbString()
            propObj.width = 1
        } else if (prop === undefined) {
        } else {
            const { color, width } = prop

            if (color !== null) {
                propObj.color = tinycolor(color).toRgbString()
            }

            if (width !== null) {
                propObj.width = width
            }
        }

        return setContext([
            {
                stroke: propObj,
            },
        ])
    },

    Face: prop => _body => {
        const propObj = {}

        const { color } = prop

        if (color !== null) {
            propObj.color = tinycolor(color).toRgbString()
        }

        return setContext([
            {
                face: propObj,
            },
        ])
    },

    Line: prop => body => {
        const coordArray = (body.length > 0
            ? body
            : prop['coord-array'] || []
        ).map(coord => vector(coord)) || [vector(0, 0), vector(1, 0)]

        const stroke = getStroke(prop.stroke)
        const face = getFace(prop.face)

        let attrObj

        if (coordArray.length < 3) {
            elmName = 'line'

            attrObj = {
                x1: convertSize(coordArray[0].x),
                y1: convertSize(coordArray[0].y),
                x2: convertSize(coordArray[1].x),
                y2: convertSize(coordArray[1].y),
            }
        } else {
            const len = coordArray.length

            if (
                coordArray[0].x === coordArray[len - 1].x &&
                coordArray[0].y === coordArray[len - 1].y
            ) {
                elmName = 'polygon'

                coordArray.length = len - 1
            } else {
                elmName = 'polyline'
            }

            attrObj = {
                points: coordArray
                    .map(c => `${convertSize(c.x)},${convertSize(c.y)}`)
                    .join(' '),
                ...(stroke.color !== null && { stroke: stroke.color }),
                ...(stroke.width !== null && { 'stroke-width': stroke.width }),
                ...(face.color !== null && { fill: face.color }),
            }
        }

        return createSvgElement([{ [elmName]: attrObj }])
    },

    Rectangle: prop => body => {
        const coord = vector(body[0]) || vector(prop.coord) || vector(0, 0)
        const size = vector(body[1]) || vector(prop.size) || vector(1, 1)

        const stroke = getStroke(prop.stroke)
        const face = getFace(prop.face)

        const attrObj = {
            x: convertSize(coord.x),
            y: convertSize(coord.y),
            width: convertSize(size.x),
            height: convertSize(size.y),
            ...(stroke.color !== null && { stroke: stroke.color }),
            ...(stroke.width !== null && { 'stroke-width': stroke.width }),
            ...(face.color !== null && { fill: face.color }),
        }

        return createSvgElement([{ rect: attrObj }])
    },

    Circle: prop => body => {
        const coord = vector(body[0]) || vector(prop.coord) || vector(0, 0)
        const radius = body[1] || prop.radius || 1

        const stroke = getStroke(prop.stroke)
        const face = getFace(prop.face)

        const attrObj = {
            cx: convertSize(coord.x),
            cy: convertSize(coord.y),
            r: convertSize(radius),
            ...(stroke.color !== null && { stroke: stroke.color }),
            ...(stroke.width !== null && { 'stroke-width': stroke.width }),
            ...(face.color !== null && { fill: face.color }),
        }

        return createSvgElement([{ circle: attrObj }])
    },

    Text: prop => body => {
        const coord = vector(body[0]) || vector(prop.coord)
        const content = body[1] != null ? body[1] : prop.content || ''
        const align = prop.align || 0

        const stroke = getStroke(prop.stroke)
        const face = getFace(prop.face)
        const font = getFont(prop.font)

        const attrObj = {
            x: convertSize(coord.x),
            y: convertSize(coord.y),
            ...(stroke.color !== null && { stroke: stroke.color }),
            ...(stroke.width !== null && { 'stroke-width': stroke.width }),
            ...(face.color !== null && { fill: face.color }),
            ...(font.size !== null && { 'font-size': convertSize(font.size) }),
        }

        if (align != null) {
            attrObj['text-anchor'] = {
                '-1': 'start',
                0: 'middle',
                1: 'end',
            }[((align + 4) % 3) - 1]
            attrObj['dominant-baseline'] = {
                '-1': 'text-top',
                0: 'middle',
                1: 'baseline',
            }[Math.floor((align + 1) / 3)]
        }

        return createSvgElement([{ text: attrObj }, content])
    },

    Group: prop => body => {
        const transform = prop.transform

        const attrObj = {
            ...(transform && { transform: transform }),
        }

        return createSvgElement([{ rect: attrObj }, body])
    },
}

const cmdColorLi = {
    Black: 'black',
    White: 'white',
    Red: 'red',
    Green: 'green',
    Blue: 'blue',
    Yellow: 'yellow',
}

Object.entries(cmdColorLi).forEach(([cmd, col]) => {
    const prop = {
        color: tinycolor(col).toRgbString(),
    }

    funcLi[cmd] = _body => funcLi.Face(prop)
})

const evalJSON = obj => {
    const arr = obj

    return arr.map(seq => {
        const [head, ...body] = seq

        const [tag, prop] =
            typeof head === 'string' ? [head, {}] : Object.entries(head)[0]

        return funcLi[tag](prop)(body)
    })
}

const json = strArr => eval(strArr.join(''))
const yaml = strArr => jsyaml.load(strArr.join(''))

const codeElm = document.getElementById('matra-script-code')
codeElm.style.fontFamily = `"Courier New", monospace`
codeElm.style.fontSize = `${11}px`

const jsonElm = document.getElementById('matra-json')
jsonElm.style.fontFamily = `"Courier New", monospace`
jsonElm.style.fontSize = `${11}px`

const yamlElm = document.getElementById('matra-yaml')
yamlElm.style.fontFamily = `"Courier New", monospace`
yamlElm.style.fontSize = `${11}px`

const inputHandler = (evt = {}) => {
    canvas.length = 0
    content.length = 0
    content.push({ canvas })
    g.innerHTML = ''
    svgContentTxt = ''

    const val = (evt.target && evt.target.value) || codeElm.innerHTML

    const mScr = val.replaceAll('&lt;', '<').replaceAll('&gt;', '>')

    try {
        const obj = globalThis.matraScript.parse(mScr)

        jsonElm.innerHTML = JSON5.stringify(obj, null, 2)
        yamlElm.innerHTML = jsyaml.dump(obj)

        evalJSON(obj).map(line => {
            // console.log(line)
        })

        content.push({
            svg: `<svg width="610" height="377" viewBox="0 0 610 377"><g>${svgContentTxt}</g></svg>`,
            width: 610,
            height: 377,
        })
    } catch (e) {
        console.log(e)
    }
}

codeElm.addEventListener('input', inputHandler)

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

const exampleStr =
    'matra`' +
    `
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
` +
    '`'

codeElm.innerHTML = exampleStr

drawBaseElm.appendChild(canvasElm)
drawBaseElm.appendChild(svgElm)

inputHandler()