class Observer {
    constructor(data) {
        //Object.defineProperty只能劫持已经存在的属性（vue里面会为此单独写一些api $set $delete）
        this.walk(data);
    }

    walk(data) { //循环对象 对属性依次劫持
        //"重新定义"属性
        Object.keys(data).forEach(key => defineReactive(data, key, data[key]));

    }
}

export function defineReactive(target, key, value) { //闭包 劫持属性
    observe(value); //如果value是object，需要递归劫持
    Object.defineProperty(target, key, {
        get() { //取值的时候会执行get
            return value;
        },
        set(newValue) { //修改的时候会执行set
            if (newValue === value) return;
            observe(newValue);
            value = newValue;
        }
    });
}

export function observe(data) {
    //对这个对象进行劫持
    if (typeof data != 'object' || data === null) {
        return; //只对对象进行劫持
    }

    //如果一个对象被劫持过了，那就不需要再被劫持了（要判断一个对象是否被劫持过，可以增添一个实例，用实例来判断是否被劫持过）
    return new Observer(data);
}
