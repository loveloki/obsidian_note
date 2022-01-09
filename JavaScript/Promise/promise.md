实现 [`Promise/A+` 规范](https://github.com/promises-aplus/promises-spec)

## 实现构造函数
初步实现构造函数，`xPromise` 对象拥有状态 `status`、执行结果 `value`、错误原因 `reason`。构造函数用于初始化状态并尝试执行 `resolver` 函数

```javascript
// Promise 的三种状态
const PromiseStatus = {
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected'
}

/**
 * status 存储目前的状态
 * value 存储 fulfilled 结果
 * reason 存储 rejected 错误原因
 * 或者 value 和 reason 可以用同一个字段
 * 因为 Promise 只会有一个状态，并且一旦确定就无法更改
 */
class xPromise {
  constructor(resolver) {
    if (typeof resolver !== 'function') {
      throw new TypeError('resolver 必须是函数')
    }

    this.status = PromiseStatus.PENDING
    this.value = undefined
    this.reason = undefined

    const resolve = (value) => {
      // pending 状态才能执行 resolve
      if(this.status === PromiseStatus.PENDING) {
        this.status = PromiseStatus.FULFILLED
        this.value = value
      }
    }

    const reject = (reason) => {
      // pending 状态才能执行 reject
      if(this.status === PromiseStatus.PENDING) {
        this.status = PromiseStatus.REJECTED
        this.reason = reason
      }
    }

    try {
      // 尝试执行 resolver
      resolver(resolve, reject)
    } catch (error) {
      reject(error)
    }
  }

  // Promise.resolve 静态函数
  static resolve(value) {
    return new xPromise(resolve => resolve(value))
  }

  // Promise.reject 静态函数
  static reject(reason) {
    return new xPromise((_, reject) => reject(reason))
  }
}
```

## 实现 `then` 等函数

根据规范，`then` 函数需要返回一个新的 `Promise`

```javascript
then(onFulfilled, onRejected) {
  return new xPromise((resolve, reject) => {
    
  })
}
```

不同状态下进行不同处理

```javascript
then(onFulfilled, onRejected) {
  return new xPromise((resolve, reject) => {
    // 如果 promise1 执行完成
    // 在下一个微任务执行 onSuccess 相关逻辑
    if(this.status === PromiseStatus.FULFILLED) {
      queueMicrotask(onSuccess)
    } else if(this.status === PromiseStatus.REJECTED) {
      // 如果 promise1 执行出错
      // 在下一个微任务执行 onFail 相关逻辑
      queueMicrotask(onFail)
    } else {
      // 如果 promise1 还没有执行
      // 将 onSuccess 和 onFail 推入数组，等候合适时机再执行
      this.successCallbacks.push(onSuccess)
      this.failCallbacks.push(onFail)
    }
  })
}
```

完善 `onSuccess` 和 `onFail`
```javascript
then(onFulfilled, onRejected) {
  return new xPromise((resolve, reject) => {
    // 如果 onFulfilled 和 onRejected 不是函数
    // 直接 resolve 和 reject 它们
    // 否则执行函数并且将结果进行 resolve
    const onSuccess = (() => {
      try {
        typeof onFulfilled === 'function' ? resolve(onFulfilled(this.value)) : resolve(this.value)
      } catch (error) {
        reject(error)
      }
    })

    const onFail = (() => {
      try {
        typeof onRejected === 'function' ? resolve(onRejected(this.reason)) : reject(this.reason)
      } catch (error) {
        reject(error)
      }
    })

    // 如果 promise1 执行完成
    // 在下一个微任务执行 onSuccess 相关逻辑
    if(this.status === PromiseStatus.FULFILLED) {
      queueMicrotask(onSuccess)
    } else if(this.status === PromiseStatus.REJECTED) {
      // 如果 promise1 执行出错
      // 在下一个微任务执行 onFail 相关逻辑
      queueMicrotask(onFail)
    } else {
      // 如果 promise1 还没有执行
      // 将 onSuccess 和 onFail 推入数组，等候合适时机再执行
      this.successCallbacks.push(onSuccess)
      this.failCallbacks.push(onFail)
    }
  })
}
```

在构造函数中添加 `successCallbacks` 和 `successCallbacks` 和相应的处理

```javascript
constructor(resolver) {
  if (typeof resolver !== 'function') {
    throw new TypeError('resolver 必须是函数')
  }

  this.status = PromiseStatus.PENDING
  this.value = undefined
  this.reason = undefined
  this.successCallbacks = []
  this.failCallbacks = []

  const resolve = (value) => {
    if(this.status === PromiseStatus.PENDING) {
      this.status = PromiseStatus.FULFILLED
      this.value = value

      // promise1 执行完后按顺序在下一个微任务中执行 promise2、promise3 的 onSuccess 函数
      queueMicrotask(() => {
        this.successCallbacks.forEach(cb => cb())
      })
    }
  }

  const reject = (reason) => {
    if(this.status === PromiseStatus.PENDING) {
      this.status = PromiseStatus.REJECTED
      this.reason = reason

      // promise1 执行完后按顺序在下一个微任务中执行 promise2、promise3 的 onFail 函数
      queueMicrotask(() => {
        this.failCallbacks.forEach(cb => cb())
      })
    }
  }

  try {
    resolver(resolve, reject)
  } catch (error) {
    reject(error)      
  }
}
```

完善 `resolve` 的逻辑

```javascript
// 提取 _resolve，只做最终的改变状态和回调处理
const _resolve = (value) => {
  this.status = PromiseStatus.FULFILLED
  this.value = value

  queueMicrotask(() => {
    this.successCallbacks.forEach(cb => cb())
  })
}

// 现在的 resolve 用于处理规范提出的解析过程
const resolve = (x) => {
  if(this.status === PromiseStatus.PENDING) {
    // resolve 不能用 promise1 作为参数来处理
    if(x === this) {
      reject(new TypeError('promise2 不能等于 promise1'))

      return
    }

    // 如果 x 是 object 或 function
    // 进行处理
    if((x !== null && typeof x === 'object') || typeof x === 'function') {

    } else {
      // x 不是 object 或 function
      // 直接执行最终的 _resolve
      _resolve(x)
    }
  }
}

```

对 `object` 和 `function` 情况进行处理
```javascript
if((x !== null && typeof x === 'object') || typeof x === 'function'){
  // 对 thenable 进行兼容处理
  // 尝试读取 x 的 then 属性
  let then

  try {
    then = x.then
  } catch (error) {
    reject(error)              

    return
  }

  // 如果 then 是函数，进行处理
  if(typeof then === 'function') {

  } else {
    // 否则直接执行最终的 _resolve
    _resolve(x)
  } 
}
```

对 `then` 是 `function` 情况进行处理
```javascript
if(typeof then === 'function') {
  // 因为只能处理一次，所以使用 called 用来做标记
  let called = false

  // 尝试以 x 作为 this 执行 then
  try {
    // 对于 resolve 情况，需要再次对参数 y 调用 resolve 的解析过程
    then.call(x, y => {
      if(called) {
        return
      }

      called = true

      resolve(y)
    }, e => {
      if(called) {
        return
      }

      called = true
      reject(e)
    })
  } catch (error) {
    if(called) {
      return
    }

    called = true
    reject(error)
  }
}
```

添加 `catch` 方法

```javascript
// catch 方法相当于没有 onFulfilled 的 then 方法
['catch'](onRejected) {
  return this.then(null, onRejected)
}
```

## 完整的实现代码
```javascript
// Promise 的三种状态
const PromiseStatus = {
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected'
}

/**
 * status 存储目前的状态
 * value 存储 fulfilled 结果
 * reason 存储 rejected 错误原因
 * 或者 value 和 reason 可以用同一个字段
 * 因为 Promise 只会有一个状态，并且一旦确定就无法更改
 */
class xPromise {
  constructor(resolver) {
    if (typeof resolver !== 'function') {
      throw new TypeError('resolver 必须是函数')
    }

    this.status = PromiseStatus.PENDING
    this.value = undefined
    this.reason = undefined
    this.successCallbacks = []
    this.failCallbacks = []

    // 提取 _resolve，只做最终的改变状态和回调处理
    const _resolve = (value) => {
      this.status = PromiseStatus.FULFILLED
      this.value = value

      queueMicrotask(() => {
        this.successCallbacks.forEach(cb => cb())
      })
    }

    // 现在的 resolve 用于处理规范提出的解析过程
    const resolve = (x) => {
      if(this.status === PromiseStatus.PENDING) {
        // resolve 不能用 promise1 作为参数来处理
        if(x === this) {
          reject(new TypeError('promise2 不能等于 promise1'))

          return
        }

        // 如果 x 是 object 或 function
        // 进行处理
        if((x !== null && typeof x === 'object') || typeof x === 'function') {
          // 对 thenable 进行兼容处理
          // 尝试读取 x 的 then 属性
          let then

          try {
            then = x.then
          } catch (error) {
            reject(error)              

            return
          }

          // 如果 then 是函数，进行处理
          if(typeof then === 'function') {
            // 因为只能处理一次，所以使用 called 用来做标记
            let called = false

            // 尝试以 x 作为 this 执行 then
            try {
              // 对于 resolve 情况，需要再次对参数 y 调用 resolve 的解析过程
              then.call(x, y => {
                if(called) {
                  return
                }

                called = true

                resolve(y)
              }, e => {
                if(called) {
                  return
                }

                called = true
                reject(e)
              })
            } catch (error) {
              if(called) {
                return
              }

              called = true
              reject(error)
            }
          } else {
            // 否则直接执行最终的 _resolve
            _resolve(x)
          } 
        } else {
          // x 不是 object 或 function
          // 直接执行最终的 _resolve
          _resolve(x)
        }
      }
    }

    const reject = (reason) => {
      // pending 状态才能执行 reject
      if(this.status === PromiseStatus.PENDING) {
        this.status = PromiseStatus.REJECTED
        this.reason = reason

        // promise1 执行完后按顺序在下一个微任务中执行 promise2、promise3 的 onFail 函数
        queueMicrotask(() => {
          this.failCallbacks.forEach(cb => cb())
        })
      }
    }

    try {
      // 尝试执行 resolver
      resolver(resolve, reject)
    } catch (error) {
      reject(error)
    }
  }

  // Promise.resolve 静态函数
  static resolve(value) {
    return new xPromise(resolve => resolve(value))
  }

  // Promise.reject 静态函数
  static reject(reason) {
    return new xPromise((_, reject) => reject(reason))
  }

  then(onFulfilled, onRejected) {
    return new xPromise((resolve, reject) => {
      // 如果 onFulfilled 和 onRejected 不是函数
      // 直接 resolve 和 reject 它们
      // 否则执行函数并且将结果进行 resolve
      const onSuccess = (() => {
        try {
          typeof onFulfilled === 'function' ? resolve(onFulfilled(this.value)) : resolve(this.value)
        } catch (error) {
          reject(error)
        }
      })

      const onFail = (() => {
        try {
          typeof onRejected === 'function' ? resolve(onRejected(this.reason)) : reject(this.reason)
        } catch (error) {
          reject(error)
        }
      })

      // 如果 promise1 执行完成
      // 在下一个微任务执行 onSuccess 相关逻辑
      if(this.status === PromiseStatus.FULFILLED) {
        queueMicrotask(onSuccess)
      } else if(this.status === PromiseStatus.REJECTED) {
        // 如果 promise1 执行出错
        // 在下一个微任务执行 onFail 相关逻辑
        queueMicrotask(onFail)
      } else {
        // 如果 promise1 还没有执行
        // 将 onSuccess 和 onFail 推入数组，等候合适时机再执行
        this.successCallbacks.push(onSuccess)
        this.failCallbacks.push(onFail)
      }
    })
  }

  // catch 方法相当于没有 onFulfilled 的 then 方法
  ['catch'](onRejected) {
    return this.then(null, onRejected)
  }
}
```
