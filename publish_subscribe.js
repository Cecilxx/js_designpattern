var salesOffices = {} // 定义售楼处

salesOffices.clientList = {} // 缓存列表，存放订阅者的回调函数

salesOffices.listen = function(key, fn) {
  if (!this.clientList[key]) {
    this.clientList[key] = []
  }
  this.clientList[key].push(fn)
}

salesOffices.trigger = function() {
  var key = Array.prototype.shift.call(arguments)
  var fns = this.clientList[key]

  if (!fns || fns.length === 0) return false

  for (var i = 0, fn; (fn = fns[i++]); ) {
    fn.apply(this, arguments)
  } // (2) //
}

salesOffices.listen('xiaoming', function(price) {
  console.log('xiaoming 价格1= ' + price)
})

salesOffices.listen('xiaohong', function(price) {
  console.log('xiaohong 价格2= ' + price)
})

salesOffices.trigger('xiaoming', 2000000)
salesOffices.trigger('xiaohong', 3000000)
