function getRandomInt(min, max) {         
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function shuffle(arr) {             //数组数据打乱
  let _arr = arr.slice()   //把数组进行处理
  for (let i = 0; i < _arr.length; i++) {
    let j = getRandomInt(0, i)
    let t = _arr[i]
    _arr[i] = _arr[j]
    _arr[j] = t
  }
  return _arr
}

export function debounce(func, delay) {      //截留函数
  let timer

  return function (...args) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}