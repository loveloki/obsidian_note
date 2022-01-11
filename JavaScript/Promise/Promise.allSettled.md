promise.allSettled

`Promise.allSettled()` 方法返回一个在所有给定的promise都已经fulfilled或rejected后的promise，并带有一个对象数组，每个对象表示对应的promise结果。

```javascript
Promise.prototype.allSettled = function(arr) {
  return new Promise((resolve, reject) => {
    const result = []

    for(item of arr) {
      Promise.resolve(item).then(value => {
        result.push({
          status: 'fulfilled',
          value
        })

        if(rejecteds.length === arr.length) {
          resolve(result)
        }
      }, reason => {
        result.push({
          status: 'rejected',
          reason
        })

        if(rejecteds.length === arr.length) {
          resolve(result)
        }
      })
    }
  })
}
```
