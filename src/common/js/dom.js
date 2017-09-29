export function hasClass(el, className) {    //获取dom对象的class
  let reg = new RegExp('(^|\\s)' + className + '(\\s|$)')     //前后可以包括空白字符
  return reg.test(el.className)
}

export function addClass(el, className) {
  if (hasClass(el, className)) {   //如果有这个class
    return
  }
  //console.log(className)
  let newClass = el.className.split(' ')
 //console.log(newClass)
  newClass.push(className)
//console.log(newClass)
  el.className = newClass.join(' ')      //把样式加进去
  //console.log(el.className)
}

export function getData(el, name, val) {
  const prefix = 'data-'
  if (val) {
    return el.setAttribute(prefix + name, val)
  }
  return el.getAttribute(prefix + name)       //getAttribute() 方法返回指定属性名的属性值。
}

let elementStyle = document.createElement('div').style

let vendor = (() => {         //浏览器兼容性封装
  let transformNames = {
    webkit: 'webkitTransform',
    Moz: 'MozTransform',
    O: 'OTransform',
    ms: 'msTransform',
    standard: 'transform'
  }

  for (let key in transformNames) {
    if (elementStyle[transformNames[key]] !== undefined) {
      return key
    }
  }

  return false
})()

export function prefixStyle(style) {
  if (vendor === false) {
    return false
  }

  if (vendor === 'standard') {
    return style
  }

  return vendor + style.charAt(0).toUpperCase() + style.substr(1)
}
