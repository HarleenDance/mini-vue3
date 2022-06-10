/*
 * @Descripttion: 
 * @version: 
 * @Author: sueRimn
 * @Date: 2022-05-29 15:11:10
 * @LastEditors: sueRimn
 * @LastEditTime: 2022-06-10 16:26:17
 */
import { hasOwn, isNumber, isString, ShapeFlags } from "@vue/shared";
import { ReactiveEffect, reactive } from "@vue/reactivity";
import { getSequence } from "./sequence";
import { queueJob } from "./scheduler";
import { updateProps, hasPropsChanged } from "./componentProps";
import { createComponentInstance, setupComponent } from "./component";
import { Text, createVnode, isSameVnode, Fragment } from "./vnode";
// 创建渲染器
export function createRenderer(renderOptions) {

    let {
        // 增加 删除 修改 查询
        insert: hostInsert,
        remove: hostRemove,
        // 修改文本内容
        setElementText: hostSetElementText,
        setText: hostSetText,
        // 获取当前元素(自己)
        // querySelector: hostCreateText,
        // 获取父亲节点
        parentNode: hostParentNode,
        // 获取兄弟
        nextSibling: hostNextSibling,
        // 创建元素
        createElement: hostCreateElement,
        // 创建一个文本节点
        createText: hostCreateText,
        patchProp: hostPatchProp,
    } = renderOptions;

    const normalize = (children, i) => {
        if (isString(children[i]) || isNumber(children[i])) {
            let vnode = createVnode(Text, null, children[i])
            children[i] = vnode
        }
        return children[i]
    }
    const mountChildren = (children, container) => {
        for (let i = 0; i < children.length; i++) {
            // console.log(children[i])
            let child = normalize(children, i)

            patch(null, child, container)
        }
    }

    const mountElement = (vnode, container, anchor) => {
        let { type, props, children, shapeFlag } = vnode;
        // 父元素   挂载vnode
        let el = vnode.el = hostCreateElement(type);//将真实元素挂载到这个虚拟节点上，后续用于复用节点和
        if (props) {
            // 处理属性
            for (let key in props) {
                hostPatchProp(el, key, null, props[key])
            }
        }
        // 17   16 & 1
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            //文本  处理子节点
            hostSetElementText(el, children);
        } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) { //数组
            mountChildren(children, el)  // 递归
        }

        // 放入服务器
        hostInsert(el, container, anchor)


    }

    const processText = (n1, n2, container) => {
        // 初始化
        if (n1 === null) {
            // 如果是文本节点，就创造文本节点
            hostInsert((n2.el = hostCreateText(n2.children)), container)
        } else {
            // 文本的内容变化了，可以复用老的节点
            const el = n2.el = n1.el;
            if (n1.children !== n2.children) {
                hostSetText(el, n2.children) // 文本的更新
            }
        }
    }
    const patchProps = (oldProps, newProps, el) => {
        // 取每个新的  新的里面有，直接用新的盖掉即可
        for (let key in newProps) {
            hostPatchProp(el, key, oldProps[key], newProps[key]);
        }
        // 如果老的里面有，新的没有，则是删除
        for (let key in oldProps) {
            if (newProps[key] == null) {
                hostPatchProp(el, key, oldProps[key], undefined)
            }
        }
    }

    // 删除子节点
    const unmountChildren = (children) => {
        for (let i = 0; i < children.length; i++) {
            unmount(children[i])
        }
    }

    // 
    const patchKeyedChildren = (c1, c2, el) => { // 比较两个儿子的差异
        let i = 0;
        let e1 = c1.length - 1;
        let e2 = c2.length - 1;

        // 特殊处理-----------

        // 两种优化   前比 后比

        // sync from start   
        while (i <= e1 && i <= e2) { // 有任何一方停止循环则直接跳出
            const n1 = c1[i]
            const n2 = c2[i]
            if (isSameVnode(n1, n2)) {
                patch(n1, n2, el) // 这样做就是比较两个节点的属性和子节点
            } else {
                break;
            }
            i++;
        }
        // sync from end
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1]
            const n2 = c2[e2]
            if (isSameVnode(n1, n2)) {
                patch(n1, n2, el)
            } else {
                break;
            }
            e1--;
            e2--;
        }


        // common  sequence  + mount
        // i要比e1大的说明有新增的
        // i和e2之间是新增的部分

        // 有一方全部比较完毕了，要么就删除，要么就添加
        if (i > e1) {
            if (i <= e2) {
                while (i <= e2) {
                    const nextPos = e2 + 1;
                    // 根据下一个人的索引来看参照物
                    const anchor = nextPos < c2.length ? c2[nextPos].el : null
                    patch(null, c2[i], el, anchor);// 创建新节点 扔到容器中
                    i++;
                }
            }
        } else if (i > e2) {
            if (i <= e1) {
                while (i <= e1) {
                    unmount(c1[i]);
                    i++;
                }
            }
        }
        // common  sequence  + unmount
        // i要比e2大的说明要卸载
        // i和e1之间是要卸载部分

        // 优化完毕------------------------
        // 乱序比对
        // console.log(i, e1, e2);
        let s1 = i;
        let s2 = i;
        const keyToNewIndexMap = new Map();  // key -> newIndex
        for (let i = s2; i <= e2; i++) {
            keyToNewIndexMap.set(c2[i].key, i);
        }

        // 循环老的元素  看一下新的里面有没有，如果有说明要比较差异，没有要添加到列表中，老的有新的没有要删除
        const toBePatched = e2 - s2 + 1  // 新的总个数
        const newIndexToOldIndexMap = new Array(toBePatched).fill(0); // 一个记录是否比对过的映射表



        for (let i = s1; i <= e1; i++) {
            const oldChild = c1[i]; // 老的孩子
            let newIndex = keyToNewIndexMap.get(oldChild.key); // 用老的孩子去新的里面找
            if (newIndex == undefined) {
                unmount(oldChild); // 多余的删掉
            } else {
                // 新的位置对应老的位置  ,如果数组里放的值 >0 说明 已经patch过了
                newIndexToOldIndexMap[newIndex - s2] = i + 1; // 用来标记当前patch过的结果
                patch(oldChild, c2[newIndex], el)
            }
        } // 到这里只是新老属性和儿子的比对，没有移动位置
        console.log(newIndexToOldIndexMap);

        // 获取最长递增子序列
        let increment = getSequence(newIndexToOldIndexMap)

        // 需要移动位置
        let j = increment.length - 1
        for (let i = toBePatched - 1; i >= 0; i--) {
            const nextIndex = s2 + i; // [ecdh]  找到h的索引
            const nextChild = c2[nextIndex]  // 找到h
            let anchor = nextIndex + 1 < c2.length ? c2[nextIndex + 1].el : null;
            if (newIndexToOldIndexMap[i] === 0) { // 创建  [5 3 4 0]  -> [1,2]  区间
                patch(null, nextChild, el, anchor)
            } else { // 不是0  说明是已经比对过属性和儿子的了
                if (i != increment[j]) {
                    // 目前无论如何都做了一遍倒叙插入,其实可以不用的  可以根据刚才的数组来减少插入次数
                    hostInsert(nextChild.el, el, anchor)  // 复用了节点   插入
                } else {
                    console.log('这里不做插入了');

                    j--;
                }
            }
            // 这里发现缺失逻辑  我需要看一下nextChild有没有el。如果没有el说明是新增的逻辑
            // 最长递增子序列来实现   vue2 在移动元素的时候会有浪费  优化

        }





    }

    const patchChildren = (n1, n2, el) => {
        // 比较两个虚拟节点的儿子的差异，el就是当前的父节点
        const c1 = n1.children;
        const c2 = n2.children;
        const prevShapeFlag = n1.shapeFlag;  // 之前的
        const shapeFlag = n2.shapeFlag;  // 之后的


        // 文本  空的null 数组

        // 比较两个儿子列表的差异了
        /*
        * 新儿子    旧日子       操作方式
        **  文本     数组       （删除老儿子，设置文本内容）
        **  文本     文本       （更新文本即可）
        *   文本     空         （更新文本讲课）
        **  数组     数组       （diff算法）
        **  数组     文本       （清空文本，进行挂载）
        *   数组     空         （进行挂载）与上面的类似 
        **  空       数组      （删除所有儿子）
        **  空       文本       （清空文本）
        *   空       空         （无需处理）
        */
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {// 文本     数组       （删除老儿子，设置文本内容）
                // 删除所有子节点
                unmountChildren(c1)
            }
            if (c1 !== c2) { // 文本   文本  （更新文本即可） 包括了文本和空
                hostSetElementText(el, c2)
            }
        } else {
            // 现在为数组或者为空
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {//数组     数组       （diff算法）
                    // diff算法
                    // debugger
                    patchKeyedChildren(c1, c2, el)       // 全量比对
                } else {
                    // 现在不是数组  文本和空
                    unmountChildren(c1)  // 空       数组      （删除所有儿子）
                }


            } else {
                if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                    hostSetElementText(el, "")  //数组     文本       （清空文本，进行挂载）
                }
                // 空       文本       （清空文本）
                if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                    mountChildren(c2, el)  //数组     文本       （清空文本，进行挂载）
                }
            }
        }

    }

    // 先复用节点  在比较属性   在比较儿子
    const patchElement = (n1, n2) => {
        // debugger;
        let el = n2.el = n1.el;
        let oldProps = n1.props || {}// 对象
        let newProps = n2.props || {}// 对象
        // 比较属性
        patchProps(oldProps, newProps, el);


        // 比较儿子   n2需要做处理
        // n2 = normalize()
        debugger
        patchChildren(n1, n2, el);
    }
    const processElement = (n1, n2, container, anchor) => {
        // console.log(n2);

        if (n1 === null) {
            // 初始渲染
            // 后续还有组件的初次渲染，目前是元素的初始化渲染
            mountElement(n2, container, anchor)
        } else {

            // 更新流程  元素比对
            patchElement(n1, n2)
        }
    }
    const processFragment = (n1, n2, container, anchor) => {
        if (n1 == null) {
            mountChildren(n2.children, container)
        } else {
            debugger
            patchChildren(n1, n2, container)  // 走的是diff算法
        }
    }

    const mountComponent = (vnode, container, anchor) => {
        // 1）要创造一个组件的实例
        let instance = vnode.component = createComponentInstance(vnode);
        // 2）给实例上赋值
        setupComponent(instance);
        // 3）创建一个effect
        setupRenderEffect(instance, container, anchor)
    }

    const updateComponentPreRender = (instance, next) => {
        instance.next = null;  // next清空
        instance.vnode = next;  // 实例上最新的虚拟节点
        updateProps(instance.props, next.props);
    }

    const setupRenderEffect = (instance, container, anchor) => {
        const { render } = instance
        const componentUpdateFn = () => { // 区分是初始化  还是要更新
            console.log("更新");

            if (!instance.isMounted) {  // 初始化
                const subTree = render.call(instance.proxy); // 作为this，后续this会改
                patch(null, subTree, container, anchor); // 创造了subTree的真实节点并且插入了
                instance.subTree = subTree
                instance.isMounted = true
            } else { // 组件内部更新
                let { next } = instance;
                if (next) {
                    // 更新前 ，也需要拿到最新的属性来进行更新
                    updateComponentPreRender(instance, next);
                }



                const subTree = render.call(instance.proxy); // 作为this，后续this会改
                patch(instance.subTree, subTree, container, anchor); // 创造了subTree的真实节点并且插入了
                instance.subTree = subTree
            }
        }
        // 组件的异步更新
        const effect = new ReactiveEffect(componentUpdateFn, () => queueJob(instance.update))
        // 将组件强制更新的逻辑保存到了组件的实例上，后续可以使用
        let update = instance.update = effect.run.bind(effect);  // 调用effect.run可以让组件强制重新渲染
        update();
    }
    const shouldUpdateComponent = (n1, n2) => {
        // 对于元素而已，复用的是dom节点，对于组件来说复用的是实例
        const { props: prevProps, children: prevChildren } = n1;
        const { props: nextProps, children: nextChildren } = n2;
        if (prevProps === nextProps) return false;
        // 插槽
        if (prevChildren || nextChildren) {
            return true
        };
        return hasPropsChanged(prevProps, nextProps)

    }

    const updateComponent = (n1, n2) => {
        // instance.props  是响应式的，而且可以更改  属性的更新会导致页面重新渲染
        const instance = (n2.component = n1.component);

        // 判断是否更新节点    需要更新就强制调用组件update方法
        if (shouldUpdateComponent(n1, n2)) {
            instance.next = n2;  // 将新的虚拟节点放到next属性上   存起来才能对比虚拟节点
            instance.update();  // 统一调用update方法来更新
        }


        // updateProps(instance, prevProps, nextProps);   // 属性更新


        // 后续插槽发生了变化  逻辑和updatePorps肯定不一样的

    }


    // vue2中函数式组件主要两个场景：1）作为性能优化，因为它们的初始化速度比有状态组件快得多
    // 返回多个根节点
    // 在vue3中,有状态组件的性能已经提高到它们之间的区别可以忽略不计的程度,有状态组件也支持返回多个根节点
    // 函数式组件剩下唯一应用场景就是简单组件,比如创建动态标题的组件
    const processComponent = (n1, n2, container, anchor) => { // 统一处理组件，里面在区分是普通的还是  函数式组件
        if (n1 == null) {
            mountComponent(n2, container, anchor)
        } else {
            // 组件更新靠的是props
            updateComponent(n1, n2)
        }
    }

    const patch = (n1, n2, container, anchor = null) => { // 核心的patch方法
        if (n1 === n2) return;
        if (n1 && !isSameVnode(n1, n2)) {// 判断两个元素是否相同，不相同卸载在添加
            unmount(n1) // 删除老的
            n1 = null
        }

        const { type, shapeFlag } = n2

        switch (type) {

            // 区分类型
            case Text: //文本标识
                processText(n1, n2, container)
                break;
            case Fragment: //无用的标签
                processFragment(n1, n2, container, anchor)
            default:
                // 元素
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(n1, n2, container, anchor)
                } else if (shapeFlag & ShapeFlags.COMPONENT) {
                    // 文档只能在你会的时候看，不会的时候很难看懂
                    processComponent(n1, n2, container, anchor)
                }
        }

    }

    const unmount = (vnode) => {
        hostRemove(vnode.el)
    }

    // vnode 虚拟dom
    const render = (vnode, container) => {  // 渲染过程是用你传入的renderOptions来渲染
        // 如果当前vnode是空的话
        if (vnode == null) {
            // 卸载逻辑
            if (container._vnode) { // 之前确实渲染过了,那么就卸载掉dom
                unmount(container._vnode)  //el
            }

        } else {
            // 这里既有初始化的逻辑，又有更新的逻辑
            patch(container._vnode || null, vnode, container);
        }
        container._vnode = vnode

    }
    return {
        render
    }
}
// 文本的处理,需要组件增加类型,因为不能通过document.createElement('文本')
// 如果传入null的时候在渲染时,则是卸载逻辑,需要将dom节点删掉

// 1)  更新的逻辑思考
//  - 如果前后完全没关系，删除老的  添加新的
//  - 老的和新的一样，复用，属性可以不一样，再比对属性，更新属性
//  - 比儿子