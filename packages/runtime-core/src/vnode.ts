/*
 * @Descripttion: 
 * @version: 
 * @Author: sueRimn
 * @Date: 2022-05-30 21:28:54
 * @LastEditors: sueRimn
 * @LastEditTime: 2022-06-07 21:44:52
 */
// type, props, children

import { isArray, isObject, isString, ShapeFlags } from "@vue/shared";

export const Text = Symbol('Text')
// 多个节点标识
export const Fragment = Symbol('Fragment')

export function isVnode(value) {
    return !!(value && value.__v_isVnode)
}

// 判断两个虚拟节点是否相同节点，套路是1）标签名相同 2）key是一样的
export function isSameVnode(n1, n2) {
    return (n1.type === n2.type) && (n1.key === n2.key)
}

// 虚拟节点有很多：组件的，元素的，文本的  h('h1')

export function createVnode(type, props, children = null) {
    // 组合方案  shapeFlag   我想找到应该元素中包含的是多个儿子还是一个儿子  标识

    let shapeFlag =
        isString(type) ? ShapeFlags.ELEMENT :
            isObject(type) ? ShapeFlags.STATEFUL_COMPONENT : 0;

    // 虚拟dom就是一个对象，diff算法   真实dom的属性比较多
    const vnode = {  //key
        type,
        props,
        children,
        el: null, // 虚拟节点上对应的真实节点，后续diff算法
        key: props?.['key'],
        __v_isVnode: true,
        shapeFlag
    }
    // 判断是否有节点
    if (children) {
        let type = 0;
        if (isArray(children)) {
            // 属性节点
            type = ShapeFlags.ARRAY_CHILDREN;
        } else {
            // 转字符串类型，避免报错
            children = String(children)
            // 文本节点
            type = ShapeFlags.TEXT_CHILDREN
        }
        vnode.shapeFlag |= type

    }
    // h和createVnode都是创建虚拟dom的，只不过h调用了createVnode

    return vnode



}