## 简易实现
> 需要注意的点：不需要实现 `promise`，而且在 `promise` 基础上实现 `Peomise.all`。

所以思路不能跑偏，应该注意的是：
- 顺序（通过遍历）。
- 何时返回（通过判断 result 的长度）。
- 要 `reject`。

什么时候返回因为已经用了 `promise` 了所以没有任何问题。

```javascript
const promise1 = 'value1';

const promise2 = Promise.resolve('value2');

const promise3 = new Promise((resolve, reject) => resolve('value3'));

const promise4 = Promise.reject('error');

  

/**

* 实现 Promise.all 函数

*/

Promise.all = function(arg){

  return new Promise((resolve, reject) => {

    let result = []

    
    for(let i = 0;i < arg.length; i++) {

      const item = arg[i]



      Promise.resolve(item).then(r => {

        result.push(r)

        if(result.length === arg.length) {

          resolve(result)

        }

      }).catch(e => {

        reject(e)

      })

    }

  })

}

  
  

// 期望以下测试用例能够正确运行

Promise.all([promise1, promise2])

.then((result)=> console.log(result))

  

Promise.all([promise2, promise3, promise1])

.then((result)=> console.log(result))

  

Promise.all([promise2, promise3, promise4])

.then((result)=> console.log(result))

.catch((error) => console.log(error))

  

/*

** 输出结果

["value1", "value2"]

["value2", "value3", "value1"]

"error"

*/
```