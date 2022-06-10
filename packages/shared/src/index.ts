/*
 * @Descripttion: 
 * @version: 
 * @Author: sueRimn
 * @Date: 2022-05-21 10:14:06
 * @LastEditors: sueRimn
 * @LastEditTime: 2022-06-09 20:45:41
 */
export const isObject = (value) => {
    return typeof value === 'object' && value !== null;
}

export const isNumber = (value) => {
    return typeof value === 'number';
}

export const isString = (value) => {
    return typeof value === 'string';
}

export const isFunction = (value) => {
    return typeof value === 'function';
}

export const isArray = Array.isArray;
export const assign = Object.assign;
// 检测是否有属性
const hasOwnProperty = Object.prototype.hasOwnProperty;
export const hasOwn = (value, key) => hasOwnProperty.call(value, key)

// vue3提供的形状标识  << 向左边移动一位1 << N // 2的N次方
export const enum ShapeFlags {
    ELEMENT = 1,// 普通元素
    FUNCTIONAL_COMPONENT = 1 << 1, //2  函数组件
    STATEFUL_COMPONENT = 1 << 2, // 4  状态组件 // 二进制：10 => 100
    TEXT_CHILDREN = 1 << 3,  // 8 文本子节点
    ARRAY_CHILDREN = 1 << 4,  // 16  数组子节点
    SLOTS_CHILDREN = 1 << 5,  // 32  插槽子节点
    TELEPORT = 1 << 6,  // 传送组件
    SUSPENSE = 1 << 7,  // 悬念组件
    COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8,
    COMPONENT_KEPT_ALIVE = 1 << 9,
    COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT
}

// 位运算 & | 适合权限的组合  let user = 增加|删除   user&增加 >0
// &为0 不包含该权限
