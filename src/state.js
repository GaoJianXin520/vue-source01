import { observe } from './observe';

export function initState(vm) {
    const opts = vm.$options;
    if (opts.data) {
        initData(vm);
    }
}

function proxy(vm, target, key) {
    Object.defineProperty(vm, key, { //vm.name
        get() {
            return vm[target][key]; //vm._data.name
        },
        set(newValue) {
            vm[target][key] = newValue;
        }
    });
}

function initData(vm) {
    let data = vm.$options.data;
    data = typeof data === 'function' ? data.call(vm) : data;

    vm._data = data;
    //对数据进行劫持 vue2里面采用一个api defineProperty
    observe(data);

    //将vm._data 用vm来代理就可以了
    for (let key in data) {
        proxy(vm, '_data', key);
    }
}
