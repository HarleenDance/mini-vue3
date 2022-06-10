
import { reactive, proxyRefs } from "@vue/reactivity";
import { isFunction, hasOwn, isObject } from "@vue/shared";
import { initProps } from "./componentProps";
/*
 * @Descripttion: 
 * @version: 
 * @Author: sueRimn
 * @Date: 2022-06-09 21:33:48
 * @LastEditors: sueRimn
 * @LastEditTime: 2022-06-10 16:16:57
 */
export function createComponentInstance(vnode) {
    const instance = { // 组件的实例
        data: null,
        vnode, // vue2的源码中组件的虚拟节点叫$node   渲染的内容叫_vnode
        subTree: null,   // vnode组件的虚拟节点    subTree渲染的组件内容
        isMounted: false,
        update: null,
        propsOptions: vnode.type.props,
        props: {},
        // slots,
        attrs: {},
        proxy: null,
        render: null,
        setupState: {},
    }
    return instance;
}

const publicPropertyMap = {
    $attrs: (i) => i.attrs
}
const publicInstanceProxy = {
    get(target, key) {
        const { data, props, setupState } = target;
        if (data && hasOwn(data, key)) {
            return data[key];
        } else if (hasOwn(setupState, key)) {
            return setupState[key];
        } else if (props && hasOwn(props, key)) {
            return props[key];
        }
        //  this.$attrs
        let getter = publicPropertyMap[key]; // this.$attrs
        if (getter) {
            console.log(getter(target));

            return getter(target);
        }
    },
    set(target, key, value) {
        const { data, props, setupState } = target;
        if (data && hasOwn(data, key)) {
            data[key] = value;
            return true;
            // 用户操作的属性是代理对象，这里面被屏蔽了
            // 我们可以通过instance.props  拿到真实的props
        } else if (hasOwn(setupState, key)) {
            setupState[key] = value;
            return true;
        } else if (props && hasOwn(props, key)) {
            console.warn('attempting to mutate prop ' + (key as string));
            return false;
        }
        return true;
    }
}

export function setupComponent(instance) {
    let { props, type } = instance.vnode

    // 实例  用户传入的props
    initProps(instance, props);

    instance.proxy = new Proxy(instance, publicInstanceProxy)

    let data = type.data;

    if (data) {
        if (!isFunction(data)) return console.warn('data option must be a function');
        instance.data = reactive(data.call(instance.proxy));// pinia 源码就是 reactive({})  作为组件状态
    }

    let setup = type.setup;
    if (setup) {
        const setupContext = {}
        const setupResult = setup(instance.props, setupContext);

        // 是函数计算render  不是函数就是对象 ，对对象进行处理
        if (isFunction(setupResult)) {
            instance.render = setupResult;
        } else if (isObject(setupResult)) {
            // 对内部的ref 进行取消.value
            instance.setupState = proxyRefs(setupResult)
        }
    }

    if (!instance.render) {
        instance.render = type.render;
    }


    // instance.render = type.render


}