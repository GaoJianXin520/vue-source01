let id = 0;
class Dep {
    constructor() {
        this.id = id++; //属性的dep要收集watcher
        this.subs = []; //这里存放着当前属性对应的watcher有哪些
    }

    depend() {
        //这里我们不希望放重复的watcher，而且刚才只是一个单向的关系 dep -> watcher，现在我们需要反过来，让watcher也保存dep
        // this.subs.push(Dep.target);

        Dep.target.addDep(this); //让watcher来收集dep

        //dep和watcher是一个多对多的关系（一个属性可以在多个组件中使用dep -> 多个watcher）
        //一个组件中由多个属性组成(一个watcher -> 多个dep)
    }

    addSub(watcher) {
        this.subs.push(watcher);
    }

    notify() { //当属性发生变化的时候，通知watcher更新
        this.subs.forEach(watcher => watcher.update());
    }
}

Dep.target = null; //全局属性，指向当前正在收集的watcher

export default Dep;
