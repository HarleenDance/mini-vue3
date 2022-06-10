/*
 * @Descripttion: 
 * @version: 
 * @Author: sueRimn
 * @Date: 2022-05-29 13:24:30
 * @LastEditors: sueRimn
 * @LastEditTime: 2022-05-29 13:24:30
 */
// el.setAttribute   dom属性的操作api

import { patchAttr } from "./modules/attr";
import { patchClass } from "./modules/class";
import { patchEvent } from "./modules/event";
import { patchStyle } from "./modules/style";

// null ,值
// 值  值
// 值  null 

export function patchProp(el, key, prevValue, nextValue) {
    // 类名  el.className
    if (key === 'class') {
        patchClass(el, nextValue)
        // el style  {color:'red'}  {color:'blue}
    } else if (key === 'style') {// 样式 el.style
        patchStyle(el, prevValue, nextValue);
    } else if (/^on[^a-z]/.test(key)) {// events  addEventListener
        patchEvent(el, key, nextValue);
    } else {  // 普通属性  el.setAttribute
        patchAttr(el, key, nextValue);
    }






}

// 加一下虚拟dom
// 如何创建真实dom
// domdiff 最长递增序列
// 组件的实现 模板渲染  核心的组件更新等等  组件 ...

// 模板编译编译原理 + 代码转换 + 代码生成  （编译优化）