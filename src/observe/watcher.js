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
        this.get(); //重新渲染
    }
}

//需要给每个属性增加一个dep，目的就是收集watcher

//一个组件中 有多少个属性 （n个属性会对应一个视图）n个dep对应一个watcher
//1个属性 对应着多个组件 1个dep对应多个watcher
//多对多的关系

export default Watcher;
