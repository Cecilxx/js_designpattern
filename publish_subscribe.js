//全局发布-订阅
let Event1 = (function() {
  let clientList = {}
  let listen = function(key, fn) {
    if (!clientList[key]) {
      clientList[key] = []
    }
    clientList[key].push(fn)
  }
  let trigger = function() {
    let key = Array.prototype.shift.call(arguments)
    let fns = clientList[key]

    if (!fns || fns.length === 0) return false

    for (let i = 0, fn; (fn = fns[i++]); ) {
      fn.apply(this, arguments)
    }
  }
  let remove = function(key, fn) {
    if (!key) return false

    let fns = clientList[key]

    if (!fns) return false

    if (!fn) {
      fns.length = 0
    } else {
      for (let i = fns.length - 1; i >= 0; i--) {
        if (fns[i] === fn) {
          fns.splice(i, 1)
        }
      }
    }
  }

  return {
    listen,
    trigger,
    remove
  }
})()

// Event1.listen('88ping', price => console.log('价格：' + price))
// Event1.listen('100ping', (price, danwei) =>
//   console.log('价格：' + price, '单位:' + danwei)
// )
// Event1.remove('88ping')
// Event1.trigger('88ping', 20000)
// Event1.trigger('100ping', 40000, '每平米')

//全局事件的命名冲突及可以先订阅后发布(完整的发布-订阅模式)
let Event2 = (function() {
  let global = this
  let Event
  let _default = 'default'

  Event = function() {
    let _listen
    let _trigger
    let _remove
    let _create
    let _slice = Array.prototype.slice
    let _shift = Array.prototype.shift
    let _unshift = Array.prototype.unshift
    let namespaceCache = {}
    let find
    let each = function(ary, fn) {
      let ret
      for (let i = 0, l = ary.length; i < l; i++) {
        let n = ary[i]
        ret = fn.call(n, i, n)
      }
      return ret
    }

    _listen = function(key, fn, cache) {
      if (!cache[key]) {
        cache[key] = []
      }
      cache[key].push(fn)
    }

    _trigger = function() {
      let cache = _shift.call(arguments)
      let key = _shift.call(arguments)
      let args = arguments
      let _self = this
      let stack = cache[key]

      if (!stack || !stack.length) return
      return each(stack, function() {
        return this.apply(_self, args)
      })
    }

    _remove = function(key, cache, fn) {
      if (cache[key]) {
        if (fn) {
          for (let i = cache[key].length; i >= 0; i--) {
            if (cache[key][i] === fn) {
              cache[key].splice(i, 1)
            }
          }
        } else {
          cache[key] = []
        }
      }
    }

    _create = function(namespace) {
      let nameSpace = namespace || _default
      let cache = {}
      let offlineStack = []
      let ret = {
        listen: function(key, fn, last) {
          _listen(key, fn, cache)
          if (offlineStack === null) return
          if (last === 'last') {
            offlineStack && offlineStack.pop()
          } else {
            each(offlineStack, function() {
              this()
            })
          }
          offlineStack = null
        },
        one: function(key, fn, last) {
          _remove(key, cache)
          this.listen(key, fn, last)
        },
        remove: function(key, fn) {
          _remove(key, cache, fn)
        },
        trigger: function() {
          let fn
          let args
          let _self = this

          _unshift.call(arguments, cache)
          args = arguments

          fn = function() {
            return _trigger.apply(_self, args)
          }
          if (offlineStack) {
            return offlineStack.push(fn)
          }
          return fn()
        }
      }

      return nameSpace
        ? namespaceCache[nameSpace]
          ? namespaceCache[nameSpace]
          : (namespaceCache[namespace] = ret)
        : ret
    }

    return {
      create: _create,
      one: function(key, fn, last) {
        let event = this.create()
        event.remove(key, fn)
      },
      listen: function(key, fn, last) {
        let event = this.create()
        event.listen(key, fn, last)
      },
      trigger: function() {
        let event = this.create()
        event.trigger.apply(this, arguments)
      },
      remove: function(key, fn) {
        let event = this.create()
        event.remove(key, fn)
      }
    }
  }

  return Event()
})()

Event2.create('namespace1').listen('click', function(a) {
  console.log(a) // 输出:1
})

Event2.create('namespace1').trigger('click', 1)
