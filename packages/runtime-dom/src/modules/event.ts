function createInvoker(callback) {
    const invoker = (e) => invoker.value(e);
    invoker.value = callback;
    return invoker;
}
// 第一次绑定了onClick事件 “a”   缓存=> el._val = {click:onClick}  el.addEventListener(click, (e)=>a(e););
// 第二次绑定了onClick事件 “b”   el._val = {click:onClick}  el.addEventListener(click, (e)=>b(e););
// 第三次绑定了onClick事件 null  el.removeEventListener(click, (e)=>b(e););   el_val={}
export function patchEvent(el, eventName, nextValue) {
    // 可以先移除掉事件  在重新绑定事件
    // remove -> add  -》  add + 自定义事件  （里面调用绑定的方法）
    let invokers = el._val || (el._val = {}) // 换绑

    // 先看看有没有缓存过
    let exits = invokers[eventName];
    // 如果绑定的是一个空
    if (exits && nextValue) {
        // 没有卸载函数  只是改了invoker.value 属性
        exits.value = nextValue;
    } else { //onClick = click
        let event = eventName.slice(2).toLowerCase();


        if (nextValue) {
            const invoker = invokers[eventName] = createInvoker(nextValue);
            el.addEventListener(event, invoker);
        } else if (exits) { // 如果有老值，需要将老的绑定事件移除掉
            el.removeEventListener(event, exits);
            invokers[eventName] = undefined;
        }
    }
}