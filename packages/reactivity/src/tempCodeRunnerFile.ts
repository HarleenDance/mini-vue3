let target = {
    name: 'harleens',
    get alias() {
        return this.name
    }
}

const proxy = new Proxy(target, {
    get(target, key, receiver) {
        // 去代理对象上取值 就走get
        // return target[key]
        console.log(key)
        return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver) {
        // 去代理上设置值 执行set
        // target[key] = value
        return Reflect.set(target, key, value, receiver)
    }
})
proxy.alias;