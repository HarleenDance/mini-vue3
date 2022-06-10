/*
 * @Descripttion: 
 * @version: 
 * @Author: sueRimn
 * @Date: 2022-05-26 21:35:56
 * @LastEditors: sueRimn
 * @LastEditTime: 2022-05-26 22:46:04
 */
import { isArray, isObject } from "@vue/shared";
import { trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";
function toReactive(value) {
    return isObject(value) ? reactive(value) : value
}
class RegImpI {
    public dep = new Set();
    public _value;
    public __v_isRef = true;
    constructor(public rawValue) {
        this._value = toReactive(rawValue)
    }
    get value() {
        trackEffects(this.dep)
        return this._value
    }
    set value(newValue) {
        if (newValue !== this.rawValue) {
            this._value = toReactive(newValue)
            this.rawValue = newValue;
            triggerEffects(this.dep)
        }
    }
}



export function ref(value) {
    return new RegImpI(value)
}

// 只是将.value属性代理到原始类型上
class ObjectRefImpl {
    constructor(public object, public key) {

    }
    get value() {
        return this.object[this.key];
    }
    set value(newValue) {
        this.object[this.key] = newValue
    }
}

function toRef(object, key) {
    return new ObjectRefImpl(object, key);
}

export function toRefs(Object) {
    // 判断是否是数组
    const result = isArray(Object) ? new Array(Object.length) : {}

    // 遍历  取值  （做数据代理）
    for (let key in Object) {
        result[key] = toRef(Object, key);
    }

    return result
}
// toRefs把所有属性变成ref
// proxyRefs把所有属性变回proxy
// Reflect Reflect 是一个内置的对象，它提供拦截 JavaScript 操作的方法。
// 这些方法与proxy handlers的方法相同。Reflect不是一个函数对象，因此它是不可构造的。  https://cloud.tencent.com/developer/article/1738679
export function proxyRefs(object) {
    return new Proxy(object, {
        get(target, key, recevier) {
            let r = Reflect.get(target, key, recevier);
            return r.__v_isRef ? r.value : r
        },
        set(target, key, value, recevier) {
            let oldValue = target[key];
            if (oldValue.__v_isRef) {
                oldValue.value = value;
                return true;
            } else {
                return Reflect.set(target, key, value, recevier);
            }
        }
    })
}