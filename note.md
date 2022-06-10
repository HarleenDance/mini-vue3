<!--
 * @Descripttion:
 * @version:
 * @Author: sueRimn
 * @Date: 2022-05-29 12:41:00
 * @LastEditors: sueRimn
 * @LastEditTime: 2022-05-29 12:43:08
-->

## Vue 中为了解耦，将逻辑分成两个模块

-   运行时 核心 （不依赖于平台的 browser test 小程序 app canvas.....）靠的是虚拟 dom
-   针对不同平台的运行时 vue 就是针对浏览器平台的
-   渲染器
