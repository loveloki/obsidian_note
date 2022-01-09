import  xPromise from './xPromise.js'
import promisesAplusTests from 'promises-aplus-tests'

const adapter = {
  resolved: xPromise.resolve,
  rejected: xPromise.reject,
  deferred () {
    const r = {}
    const promise = new xPromise((resolve, reject) => {
      r.resolve = resolve
      r.reject = reject
    })
    r.promise = promise
    return r
  }
}

promisesAplusTests(adapter, (err) => {
  console.error(err)
})
