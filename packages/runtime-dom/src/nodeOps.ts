/*
 * @Descripttion: 
 * @version: 
 * @Author: sueRimn
 * @Date: 2022-05-29 13:01:03
 * @LastEditors: sueRimn
 * @LastEditTime: 2022-06-07 21:05:47
 */
export const nodeOps = {
    // 增加 删除 修改 查询
    // anchor参照物
    insert(child, parent, anchor = null) {
        parent.insertBefore(child, anchor); // insertBefore 可以等价于appendChild
    },
    remove(child) { // 删除节点
        const parentNode = child.parentNode;
        if (parentNode) {
            parentNode.removeChild(child)
        }
    },
    // 修改文本内容
    setElementText(el, text) {
        el.textContent = text;
    },
    setText(node, text) { // document.createTextNode()
        node.nodeValue = text
    },
    // 获取当前元素(自己)
    querySelector(selector) {
        return doucment.querySelector(selector)
    },
    // 获取父亲节点
    parentNode(node) {
        return node.parentNode
    },
    // 获取兄弟
    nextSibling(node) {
        return node.nextSibling;
    },
    // 创建元素
    createElement(tagName) {
        return document.createElement(tagName)
    },
    // 创建一个文本节点
    createText(text) {
        return document.createTextNode(text)
    },
    // 文本节点，元素中的内容


}