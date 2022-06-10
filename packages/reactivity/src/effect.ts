// import { ReactiveEffect } from "vue";

/*
 * @Descripttion: 
 * @version: 
 * @Author: sueRimn
 * @Date: 2022-05-21 14:05:54
 * @LastEditors: sueRimn
 * @LastEditTime: 2022-05-23 22:38:22
 */
export let activeEffect = undefined

function cleanupEffect(effect) {
    const { deps } = effect; // deps 里面装的是name对应的effect
    for (let i = 0; i < deps.length; i++) {
        deps[i].delete(effect); // 解除effect 重新依赖收集
    }
    effect.deps.length = 0
}

export class ReactiveEffect {
    // 树形结构 父节点存储
    public parent = null;
    // 记录里面所有依赖的属性,稍后把它清空掉 ---- 多对多
    public deps = [];
    // 这个表示在实例上新增了active属性
    public active = true;//这个effect默认是激活状态
    constructor(public fn, public scheduler) {  // 用户传递的参数也会当this上this.fn = fn
    }
    run() { // run就是执行effect
        if (!this.active) {
            return this.fn() // 这里表示如果是非激活的情况，只需要执行函数，不需要进行依赖收集
        }
        // 这里就要依赖收集了  核心计算将当前的effect和 稍后渲染的函数关联在一起
        try {
            // 保存
            this.parent = activeEffect
            activeEffect = this

            // 这里我们需要在执行用户函数之前将之前收集的内容清空   
            cleanupEffect(this)

            return this.fn()  // 当稍后调用取值操作的时候 就可以获取到这个全局的activeEffect了
        } finally {
            // 取
            activeEffect = this.parent
            // this.parent = null
        }
    }

    stop() {
        if (this.active) {
            this.active = false
            cleanupEffect(this) // 停止effect的收集
        }
    }
}
export function effect(fn, options: any = {}) {
    // 这里fn可以根据状态变化 重新执行 ，effect可以嵌套着写

    const _effect = new ReactiveEffect(fn, options.scheduler); // 创建响应式的effect

    _effect.run();// 默认先执行一次


    const runner = _effect.run.bind(_effect) // 绑定this执行

    runner.effect = _effect // 将effect挂载到runner函数上
    return runner
}


// 一个effect  对应多个属性,一个属性对应多个effect
// 结论: 多对多
// 防止内存占用,如果属性被干掉的时候就会自动垃圾回收
const targetMap = new WeakMap();
export function track(target, type, key) {
    if (!activeEffect) return;
    let depsMap = targetMap.get(target);//第一次没有
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()))
    }
    let dep = depsMap.get(key) // key-> name/age
    if (!dep) {
        depsMap.set(key, (dep = new Set()))
    }
    trackEffects(dep);
    // 单向指的是 属性记录了effect 方向记录
    // 应该让effect也记录他被哪些属性收集过,这样做的好处是为了可以清理
    // 对象 某个属性-》多个effect
    // WeakMap = {对象：Map{name：Set}}
    // {对象：{name：[]}}
}

export function trackEffects(dep) {
    if (activeEffect) {
        let shouldTrack = !dep.has(activeEffect) // 去重了
        if (shouldTrack) {
            dep.add(activeEffect)
            activeEffect.deps.push(dep) // 让effect记录住对应的dep,稍后清理的时候会用到
        }
    }
}

export function trigger(target, type, key, value, oldValue) {
    let depsMap = targetMap.get(target);
    if (!depsMap) return // 触发的值不在模板中使用

    let effects = depsMap.get(key) // 找到了属性对应的effect

    if (effects) {
        triggerEffects(effects)
    }

}

export function triggerEffects(effects) {
    effects = new Set(effects)
    effects.forEach(effect => {
        // 我们在执行effect的时候 又要执行自己,那我们需要屏蔽掉,不要无线调用
        if (effect !== activeEffect) {
            if (effect.scheduler) {
                effect.scheduler();  // 如果用户传入了调度函数，则用户的
            } else {
                effect.run() // 否则默认刷新视图
            }
        }
    });
}

/*
* 1) 我们先搞一个响应式对象 new Proxy
* 2) effect 默认数据变化要能更新,我们先将正在执行的effect 作为
    全局变量,渲染(取值) 我们在get方法中进行依赖收集
* 3) weakMap(对象) :map(属性 :set(effect))
* 4) 稍后用户发生数据变化,会通过对象属性来查找对应的effect集合,
找到effect全部执行
 */











