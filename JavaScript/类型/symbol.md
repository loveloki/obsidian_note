用于对象的非字符串的属性名。[mdn 文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol)。

## 创建
－　**没有字面量语法**
－　可选的参数
－　每次返回的都是唯一值

```javascript
const sym = Symbol()

const sym1 = Symbol('sym name')
const sym2 = Symbol('sym name')

// symbol
typeof sym1

// false
sym1 === sym2
```

## 全局共享的 `Symbol`

使用 `Symbol.for()` 和 `Symbol.keyFor()` 从全局作用域设置和获取。

```javascript
const sym1 = Symbol.for('sym1')
const sym2 = Symbol.for('sym1')

// true
sym1 === sym2

// sym1
Symbol.keyFor(sym1)
```