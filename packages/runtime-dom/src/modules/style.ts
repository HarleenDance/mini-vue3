/*
 * @Descripttion: 
 * @version: 
 * @Author: sueRimn
 * @Date: 2022-05-29 13:24:56
 * @LastEditors: sueRimn
 * @LastEditTime: 2022-06-04 18:09:09
 */
export function patchStyle(el, prevValue, nextValue = {}) {
    // 样式需要比对差异

    for (let key in nextValue) {
        // 用新的直接覆盖即可
        el.style[key] = nextValue[key];
    }

    if (prevValue) {
        for (let key in prevValue) {
            if (nextValue[key] == null) {
                el.style[key] = null;
            }
        }
    }
}