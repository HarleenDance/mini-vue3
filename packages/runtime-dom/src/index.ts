/*
 * @Descripttion: 
 * @version: 
 * @Author: sueRimn
 * @Date: 2022-05-29 12:58:33
 * @LastEditors: sueRimn
 * @LastEditTime: 2022-05-29 13:29:02
 */
import { createRenderer } from '@vue/runtime-core';
import { nodeOps } from './nodeOps'
import { patchProp } from './patchProp'

// domAPI 属性api
const renderOptions = Object.assign(nodeOps, { patchProp });

// console.log(renderOptions)


export function render(vnode, container) {
    // 在创建渲染器的时候  传入选项
    createRenderer(renderOptions).render(vnode, container)
}

export * from '@vue/runtime-core';
