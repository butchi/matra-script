import 'pdfmake'
import tinycolor from 'tinycolor2'
import JSON5 from 'JSON5'
import jsyaml from 'js-yaml'

import 'material-symbols'
import '@material/web/button/filled-button'
import '@material/web/tabs/tabs'
import '@material/web/tabs/primary-tab'
import '@material/web/tabs/secondary-tab'
import '@material/web/icon/icon'
import { MdTabs } from '@material/web/tabs/tabs'

import matraScript from './js/lib/matra-script-parser'

import './style.css'

declare global {
    interface Window {
        pdfMake: any,
    }
}

const pdfMake = window!.pdfMake

const content: string | string[] = []

pdfMake.fonts = ({
    Roboto: {
      normal: 'Roboto-Regular.ttf',
    },
})

const docDefinition = {
    content,
    defaultStyle: {
        color: 'gray',
    },
}

const btnCreateElm = document.getElementById('button-create')
btnCreateElm?.addEventListener('click', _evt => {
    pdfMake.createPdf(docDefinition).open()
})

const menuTabParent = document.querySelector('md-tabs.menu-tab')
const tabContentElmArr = document.querySelectorAll('[data-tab-content]')

menuTabParent?.addEventListener('change', evt => {
    const tabParentElm = evt.target as MdTabs
    const label = ['json', 'yaml', 'svg'][tabParentElm.activeTabIndex]

    tabContentElmArr.forEach(tabContentElm => {
        const elm = tabContentElm as HTMLDivElement
        if (elm.getAttribute('data-tab-label') === label) {
            elm.style.display = 'block'
        } else {
            elm.style.display = 'none'
        }
    })
})

const baseWidth = 377
const baseHeight = 610

const svgNs = 'http://www.w3.org/2000/svg'

const drawBaseElm = document.querySelector('.draw-base') as HTMLDivElement
drawBaseElm.style.position = 'relative'
drawBaseElm.style.width = `${baseWidth}px`
drawBaseElm.style.height = `${baseHeight}px`

const svgElm = document.createElementNS(svgNs, 'svg') as SVGElement
svgElm.setAttribute('width', baseWidth.toString())
svgElm.setAttribute('height', baseHeight.toString())
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
const vector: any = (...argArr: any[]) => {
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

const angleVector = (...argArr: any[]) => {
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

interface FontContext {
    size: number | null,
    face: string | null,
    family: string | null,
}

interface StrokeContext {
    color: string | null,
    width: number | null,
}

interface FaceContext {
    color: string | null,
    width: number | null,
}

interface LineProp {
    'coord-array': string[],
    stroke: StrokeContext,
    face: FaceContext,
}

interface RectangleProp {
    coord: string[],
    size: number | null,
    stroke: StrokeContext,
    face: FaceContext,
}

interface CircleProp {
    coord: string[],
    radius: number | null,
    stroke: StrokeContext,
    face: FaceContext,
}

interface TextProp {
    coord: string[],
    content: string[],
    align: number | null,
    stroke: StrokeContext,
    face: FaceContext,
    font: FontContext,
}

interface TextAttr {
    x: number | null,
    y: number | null,
    color: string,
    width: number | null,
    size: number | null,
    'text-anchor': string,
    'dominant-baseline': string,
}

interface GroupProp {
    transform: Function,
}

interface Context {
    unit: number | null,
    size: number | null,
    font: FontContext,
    stroke: StrokeContext,
    face: FaceContext,
}

const ctx: Context = {
    unit: 25,
    size: null,
    font: {
        size: 1,
        face: 'sans-serif',
        family: null,
    },
    stroke: {
        color: '0x000000',
        width: 1,
    },
    face: {
        color: '0x000000',
        width: 0,
    },
}

const convertSize = (arg: any) => {
    if (typeof arg === 'string') {
        return arg
    } else {
        return (arg ?? 1) * (ctx.unit ?? 1)
    }
}

const getFont = (font: FontContext) => {
    const ret = {
        size: font?.size ?? ctx.font?.size ?? 1,
        face: font?.face ?? ctx.font?.face ?? 1,
        family: font?.family ?? ctx.font?.family ?? 'sans-serif',
    } as FontContext

    return ret
}

const getStroke = (stroke: StrokeContext) => {
    const ret = {
        color: stroke?.color ?? ctx.stroke?.color ?? '0x000000',
        width: stroke?.width ?? ctx.stroke?.width ?? 0,
    } as StrokeContext

    return ret
}

const getFace = (face: FaceContext) => {
    const ret = {
        color: face?.color ?? ctx.face?.color ?? '0xffffff',
        width: face?.width ?? ctx.face?.width ?? 1,
    } as FaceContext

    return ret
}

const createSvgElement = (obj: unknown[]) => {
    const [head, body] = obj
    const [tag, prop] = Object.entries(head as object)[0]

    let ret

    const elm = document.createElementNS(svgNs, tag) as SVGElement

    Object.entries(prop as object).forEach(([key, val]) => {
        elm.setAttribute(key, val)
    })

    if (body != null) {
        elm.innerHTML = body as string
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

const setContext = (obj: unknown[]) => {
    const [head, _body] = obj
    const [tag, prop] = Object.entries(head as object)[0]

    let ret

    Object.entries(prop).forEach(([_key, val]) => {
        if (tag == null) {
        } if (tag === 'unit' || tag === 'size') {
            ctx[tag] = val as number
        } else if (tag === 'font') {
            ctx.font = prop as FontContext
        } else if (tag === 'stroke') {
            ctx.stroke = prop as StrokeContext
        } else if (tag === 'face') {
            ctx.face = prop as FaceContext
        }
    })

    ret = [{
        setContext: obj,
    }]

    return ret
}

const funcLi = {
    Unit: (prop = 1) => (_body: string[]) => {
        ctx.unit = prop

        return setContext([{ Unit: prop }])
    },

    Size: (prop = 1) => (_body: string[]) => {
        ctx.size = prop

        return setContext([{ Unit: prop }])
    },

    Font: (prop: FontContext) => (_body: string[]) => {
        const propObj = {} as FontContext

        propObj.face = prop.face ?? ctx.font.face ?? 1
        propObj.size = prop.size ?? ctx.font.size ?? 1
        propObj.family = prop.family ?? ctx.font.family ?? 'sans-serif'

        return setContext([{
            font: propObj,
        }])
    },

    Stroke: (prop: StrokeContext) => (_body: string[]) => {
        const propObj = {} as StrokeContext

        propObj.color =  tinycolor(prop.color).toRgbString() ?? tinycolor('#000000').toRgbString()
        propObj.width = prop.width ?? 1

        return setContext([{
            stroke: propObj,
        }])
    },

    Face: (prop: FaceContext) => (_body: string[]) => {
        const propObj = {} as FaceContext

        propObj.color = tinycolor(prop.color ?? '0xffffff').toRgbString()

        return setContext([{
            face: propObj,
        }])
    },

    Line: (prop: LineProp) => (body: string[] | null) => {
        let elmName

        const coordArray = (body.length && body || (prop['coord-array'] ?? []))
            .map((coord: { vector: {x: number, y: number} }) => vector(coord)) || [vector(0, 0), vector(1, 0)]

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

    Rectangle: (prop: RectangleProp) => (body: string[]) => {
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

    Circle: (prop: CircleProp) => (body: string[]) => {
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

    Text: (prop: TextProp) => (body: string[]) => {
        const coord = vector(body[0]) || vector(prop.coord)
        const content = (body[1] ?? prop.content) || ''
        const align = prop.align || 0

        const stroke = getStroke(prop.stroke)
        const face = getFace(prop.face)
        const font = getFont(prop.font)

        const attrObj = {
            x: convertSize(coord.x),
            y: convertSize(coord.y),
            ...(stroke.color !== null && { stroke: stroke?.color }),
            ...(stroke.width !== null && { 'stroke-width': stroke?.width }),
            ...(face.color !== null && { fill: face?.color }),
            ...(font.size !== null && { 'font-size': convertSize(font?.size) }),
        } as TextAttr

        if (align != null) {
            attrObj['text-anchor'] = {
                '-1': 'start',
                0: 'middle',
                1: 'end',
            }[((align + 4) % 3) - 1] ?? 'middle'
            attrObj['dominant-baseline'] = {
                '-1': 'text-top',
                0: 'middle',
                1: 'baseline',
            }[Math.floor((align + 1) / 3)] ?? 'middle'
        }

        return createSvgElement([{ text: attrObj }, content])
    },

    Group: (prop: GroupProp) => (body: string) => {
        const transform = prop.transform

        const attrObj = {
            ...(transform && { transform: transform }),
        }

        return createSvgElement([{ rect: attrObj }, body])
    },
    Black: (_body: string[]) => funcLi.Face({
        color: tinycolor('black').toRgbString(),
    } as FaceContext),
    White: (_body: string[]) => funcLi.Face({
        color: tinycolor('white').toRgbString(),
    } as FaceContext),
    Red: (_body: string[]) => funcLi.Face({
        color: tinycolor('red').toRgbString(),
    } as FaceContext),
    Green: (_body: string[]) => funcLi.Face({
        color: tinycolor('green').toRgbString(),
    } as FaceContext),
    Blue: (_body: string[]) => funcLi.Face({
        color: tinycolor('blue').toRgbString(),
    } as FaceContext),
    Yellow: (_body: string[]) => funcLi.Face({
        color: tinycolor('yellow').toRgbString(),
    } as FaceContext),
}

const evalJSON = (obj: object[][]) => {
    const arr = obj

    return arr.map(seq => {
        const [head, ...body] = seq

        const [tag, prop] =
            typeof head === 'string' ? [head, {}] : Object.entries(head)[0]

        return funcLi[tag](prop)(body)
    })
}

// const json = strArr => eval(strArr.join(''))
// const yaml = strArr => jsyaml.load(strArr.join(''))

const codeElm = document.getElementById('matra-script-code') as HTMLTextAreaElement

const jsonElm = document.getElementById('matra-json') as HTMLTextAreaElement

const yamlElm = document.getElementById('matra-yaml') as HTMLTextAreaElement

const inputHandler = (evt: Event) => {
    content.length = 0
    g.innerHTML = ''
    svgContentTxt = ''

    const val = (evt?.target as HTMLTextAreaElement)?.value ?? codeElm.innerHTML

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
