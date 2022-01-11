Promise.race

`Promise.race()` 方法返回一个 promise，一旦迭代器中的某个promise解决或拒绝，返回的 promise就会解决或拒绝。

```javascript
Promise.prototype.race = function(arr) {
  return new Promise((resolve, reject) => {
    for(item of arr) {
      Promise.resolve(item).then(resolve, reject)
    }
  })
}
```
