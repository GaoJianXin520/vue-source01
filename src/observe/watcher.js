import Dep from "./dep";

let id = 0;

//1、当我们创建渲染watcher的时候，我们会把当前的渲染watcher放到Dep.target上
//2、调用_render()会取值 走到get上

//每个属性有一个dep（属性就是被观察者），watcher就是观察者，当属性发生变化的时候会通知watcher，watcher就会执行对应的更新函数 -》观察者模式

class Watcher { //不同组件有不同的watcher 目前只有一个 渲染根实例的
    constructor(vm, fn, options) {
        this.id = id++;
        this.renderWatcher = options; //是一个渲染watcher
        this.getter = fn; //getter意味着调用这个函数可以发生取值操作
        this.deps = []; //存放dep的容器 后续我们实现计算属性，和一些清理工作需要用到
        this.depsId = new Set(); //存放dep的id
        this.get();
    }

    addDep(dep) { //一个组件 对应多个属性 重复的属性也不用记录
        let id = dep.id;
        if (!this.depsId.has(id)) {
            this.deps.push(dep);
            this.depsId.add(id);
            dep.addSub(this); //watcher已经记住了dep了而且去重了，此时让dep也记住watcher
        }
    }

    get() {
        Dep.target = this; //Dep.target 是一个全局变量 静态属性就是只有一份
        this.getter(); //会去vm上取值
        Dep.target = null; //渲染完毕之后需要清空
    }

    update() { //当属性发生变化的时候 会调用这个方法
        queueWatcher(this); //将当前的watcher放到队列中，异步更新
        // this.get(); //重新渲染
    }

    run() { //执行watcher的run方法
        this.get();
    }
}

let queue = []; //存放watcher的数组
let has = {}; //存放watcher的id
let pending = false; //标识队列是否已经处于等待状态

function flushSchedulerQueue() { //将队列中的watcher全部执行
    let flushQueue = queue.slice(0);
    queue = [];
    has = {};
    flushQueue.forEach(q => q.run()); //执行watcher的run方法
    pending = false;
}

function queueWatcher(watcher) { //将watcher放到队列中
    const id = watcher.id; //每个watcher都有一个唯一的id
    if (!has[id]) { //如果队列中没有这个watcher
        queue.push(watcher); //将watcher放到队列中
        has[id] = true; //标识这个watcher已经放到队列中
        if (!pending) { //如果队列没有处于等待状态
            nextTick(flushSchedulerQueue, 0); //将队列中的watcher全部执行
            pending = true; //标识队列已经处于等待状态
        }
    }
}


let callbacks = [];
let waiting = false;
function flushCallbacks() { 
    let cbs = callbacks.slice(0);
    waiting = true;
    callbacks = [];
    cbs.forEach(cb => cb());
}

//nextTick没有直接使用某个api，二十采用优雅降级的方式
//内部先采用的是promise（ie不兼容） MutationObserver（h5的api）可以考虑ie专享的setImmediate（ie10） setTimeout

let timerFunc; //异步方法
if (Promise) {
    timerFunc = () => {
        Promise.resolve().then(flushCallbacks);
    }
} else if (MutationObserver) {
    let observer = new MutationObserver(flushCallbacks);
    let textNode = document.createTextNode(1);
    observer.observe(textNode, {
        characterData: true
    });
    timerFunc = () => textNode.textContent = 2;
} else if (setImmediate) {
    timerFunc = () => setImmediate(flushCallbacks);
} else { 
    timerFunc = () => setTimeout(flushCallbacks, 0);
}

export function nextTick(cb) {
    callbacks.push(cb);
    if (!waiting) { //如果还没有处于等待状态
        timerFunc(); //将flushCallbacks放到异步队列中
        waiting = true;
    }
}

//需要给每个属性增加一个dep，目的就是收集watcher

//一个组件中 有多少个属性 （n个属性会对应一个视图）n个dep对应一个watcher
//1个属性 对应着多个组件 1个dep对应多个watcher
//多对多的关系

export default Watcher;
