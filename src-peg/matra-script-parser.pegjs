// MatraMagica flavored MatraScript Grammar
// ==========================
//
// Accepts expressions like "matra`(rectangle) [ coord => (8, 3), size => (3, 5) ]`" and computes their value.

Package
  = "matra" _ "`" block:Block+ _ "`" _ { return block }

Block
  = _ tag:Tag _ prop:Property _ body:Body {
    var tagProp = {}
    if (prop === null && body === null) {
      return [tag]
    } else if (prop === null) {
      return [tag, body]
    } else if (body === null) {
      tagProp[tag] = [prop]
      return tagProp
    }
    tagProp[tag] = prop
    return [tagProp].concat(body)
  }
  / _ tag:Tag _ prop:Property {
    if (prop === null) {
      return [tag]
    }
    var tagProp = {}
    tagProp[tag] = prop
    return [tagProp]
  }
  / _ tag:Tag _ body:Body {
    var tagProp = {}
    
    tagProp[tag] = {}
    if (body === null) {
      return tagProp
    }
    return [tagProp].concat(body)
  }
  / _ tag:Tag {
    var tagProp = {}
    
    tagProp[tag] = {}
    return [tagProp]
  }
  / _ str:String {
    return str
  }

Tag
  = "(" _ expr:TagExpression _ ")" {
    return expr
  }
  / "(" _ ")"

Property
  = "[" _ expr:PropertyExpression _ "]" {
    return expr
  }
  / "[" _ "]"

Body
  = "{" _ expr:BodyExpression _ "}" {
    return expr
  }
  / "{" _ "}" { return null }

TagExpression
  = tag:[^\)]+ {
      return tag.join("")
    }

PropertyExpression
  = map:Map? {
      return map
    }

BodyExpression
  = expr:(Expression _ ","? _)* {
    var exprArr = expr.map(expr => expr[0])
    return exprArr
  }

Expression
  = str:String {
    return str
  }
  / Map
  / Number
  / Vector
  / Property
  / Body
  / Block

Map
  = rule:(Rule _ ","? _)+ {
    var ruleArr = rule.map(rule => rule[0])
    var ret = {}
    ruleArr.forEach(rule => {
      ret[rule[0]] = rule[1]
    })
    return ret
  }

Rule
  = _ key:Key _ "=>" _ val:Expression {
    return [key, val]
  }

Key
  = _ str:[a-zA-Z\-]+ {
    return str.join("")
  }

Vector
  = _ "(" xStr:[0-9]+ _ "," _ yStr:[0-9]+ ")" {
    var x = parseInt(xStr.join(""))
    var y = parseInt(yStr.join(""))
    return [{ vector: { x, y } }]
  }

String
  = "\"" _ str:[^"]+ _ "\"" {
    return str.join("")
  }

Number
  = _ num:[0-9]+ {
    return parseInt(num.join(""))
  }

_ "whitespace"
  = [ \t\n\r]*