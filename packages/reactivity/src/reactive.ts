/*
 * @Descripttion: 
 * @version: 
 * @Author: sueRimn
 * @Date: 2022-05-21 14:06:50
 * @LastEditors: sueRimn
 * @LastEditTime: 2022-05-24 20:17:30
 */
import { isObject } from "@vue/shared";
import { mutableHandlers, ReactiveFlags } from './baseHandler'
// 1) 将数据转换成响应式的数据  只能做对象的代理
const reactiveMap = new WeakMap(); // key只能是对象



// 1）实现同一个对象 代理多次，返回同一个代理
// 2）代理对象被再次代理 可以直接返回

// 判断是否是响应式
export function isReactive(value) {
    return !!(value && value[ReactiveFlags.IS_REACTIVE])
}



export function reactive(target) {
    if (!isObject(target)) {
        return
    }

    if (target[ReactiveFlags.IS_REACTIVE]) { // 如果目标是一个代理对象，一定是被代理过了，会走get
        return target
    }

    // 并没有重新定义属性，只是代理，在取值的时候会调用
    // get，当赋值值的时候会调用set
    // 缓存机制
    let exisitingProxy = reactiveMap.get(target);
    if (exisitingProxy) {
        return exisitingProxy
    }
    // 第一次普通对象代理，我们会通过new Proxy代理一次
    // 下一次传递的是proxy 我们看他有没有代理过
    // 如果访问着proxy有get方法的时候说明访问过了 

    const proxy = new Proxy(target, mutableHandlers)
    reactiveMap.set(target, proxy)
    return proxy
}

// let target = {
//     name: 'harleens',
//     get alias() {
//         return this.name
//     }
// }

// const proxy = new Proxy(target, {
//     get(target, key, receiver) {
//         // 去代理对象上取值 就走get
//         // return target[key]
//         console.log(key)
//         return Reflect.get(target, key, receiver)
//     },
//     set(target, key, value, receiver) {
//         // 去代理上设置值 执行set
//         // target[key] = value
//         return Reflect.set(target, key, value, receiver)
//     }
// })
// proxy.alias;// 去alais上取了值时，也去了name，当时没有监控到name

// 我在页面中使用了alias对应的值，稍后name变化了
// 要重新渲染么？


