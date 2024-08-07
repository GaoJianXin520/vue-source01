import { newArrayProto } from './array';
import Dep from './dep';
class Observer {
    constructor(data) {
        //Object.defineProperty只能劫持已经存在的属性（vue里面会为此单独写一些api $set $delete）
        Object.defineProperty(data, '__ob__', { //给数据添加一个__ob__属性，值是当前的Observer实例
            value: this,
            enumerable: false //将__ob__变成不可枚举（递归的时候就不会死循环了）
        });
        if (Array.isArray(data)) {
            data.__proto__ = newArrayProto; //重写数组中的方法
            this.observeArray(data); //如果数组中放的是对象 可以监控到对象的变化
        } else {
            this.walk(data);
        }
    }

    walk(data) { //循环对象 对属性依次劫持
        //"重新定义"属性
        Object.keys(data).forEach(key => defineReactive(data, key, data[key]));
    }

    observeArray(data) { //观测数组
        data.forEach(item => observe(item));
    }
}

export function defineReactive(target, key, value) { //闭包 劫持属性
    observe(value); //如果value是object，需要递归劫持
    let dep = new Dep(); //每个属性都有一个dep属性
    Object.defineProperty(target, key, {
        get() { //取值的时候会执行get
            if (Dep.target) { //Dep.target有值的时候才收集
                dep.depend(); //让这个属性的收集器记住当前的watcher
            }
            return value;
        },
        set(newValue) { //修改的时候会执行set
            if (newValue === value) return;
            observe(newValue);
            value = newValue;
            dep.notify(); //通知更新
        }
    });
}

export function observe(data) {
    //对这个对象进行劫持
    if (typeof data != 'object' || data === null) {
        return; //只对对象进行劫持
    }

    if (data.__ob__ instanceof Observer) { //说明这个对象已经被劫持过了
        return data.__ob__;
    }

    //如果一个对象被劫持过了，那就不需要再被劫持了（要判断一个对象是否被劫持过，可以增添一个实例，用实例来判断是否被劫持过）
    return new Observer(data);
}
