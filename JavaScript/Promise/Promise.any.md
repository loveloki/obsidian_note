Promise.any

`Promise.any()` 接收一个Promise可迭代对象，只要其中的一个 promise 成功，就返回那个已经成功的 promise 。如果可迭代对象中没有一个 promise 成功（即所有的 promises 都失败/拒绝），就返回一个失败的 promise 和AggregateError类型的实例，它是 Error 的一个子类，用于把单一的错误集合在一起。本质上，这个方法和Promise.all()是相反的。

```javascript
Promise.prototype.any = function(arr) {
  return new Promise((resolve, reject) => {
    const rejecteds = []

    arr.forEach(item => {
      Promise.resolve(item).then(value => {
        resolve(value)
      }).catch(e => {
        rejecteds.push(e)

        if(rejecteds.length === arr.length) {
          reject(new AggregateError(rejected, 'All Promises rejected'))
        }
      })
    })
  })
}
```
