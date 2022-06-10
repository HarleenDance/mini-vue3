/*
 * @Descripttion: 
 * @version: 
 * @Author: sueRimn
 * @Date: 2022-05-21 22:23:32
 * @LastEditors: sueRimn
 * @LastEditTime: 2022-05-28 08:56:20
 */
import { isObject } from "@vue/shared";
import { reactive } from "./reactive";
import { activeEffect, track, trigger } from "./effect"
// 目标对象代理标记
export const enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive'
}
export const mutableHandlers = {
    get(target, key, receiver) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            return true
        }

        track(target, 'get', key)
        // 去代理对象上取值 就走get
        // 这里可以监控用户取值了 
        let res = Reflect.get(target, key, receiver)

        if (isObject(res)) {
            return reactive(res) //深度代理实现 性能好 取值就可以进行代理
        }

        return res;


    },
    set(target, key, value, receiver) {
        // 去代理上设置值 执行set
        let oldValue = target[key];
        let result = Reflect.set(target, key, value, receiver)
        if (oldValue != value) { // 值变化了
            // 要更新
            trigger(target, 'set', key, value, oldValue)
        }


        // 这里可以监控到用户设置值了
        return result
    }
}