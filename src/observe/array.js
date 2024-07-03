//重写数组中的部分方法
let oldArrayProto = Array.prototype; //获取数组的原型

export let newArrayProto = Object.create(oldArrayProto);

let methods = [
    'push',
    'pop',
    'shift',
    'unshift',
    'reverse',
    'sort',
    'splice'
];

methods.forEach(method => {
    newArrayProto[method] = function(...args) { //这里重写了数组的方法
        const result = oldArrayProto[method].call(this, ...args); //内部调用原来的方法，函数的劫持 切片编程

        //需要对新增的数据再次进行劫持
        let inserted; //新增的数据
        let ob = this.__ob__;
        switch(method) {
            case 'push':
            case 'unshift':
                inserted = args;
                break;
            case 'splice':
                inserted = args.slice(2);
            default:
                break;
        }
        if (inserted) {
            ob.observeArray(inserted); //数组中新增的内容也要进行观测
        }
        return result;
    }
});