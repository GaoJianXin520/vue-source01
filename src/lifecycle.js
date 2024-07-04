export function initLicycle(Vue) {
    Vue.prototype._update = function() {
        console.log('update');
    }
    Vue.prototype._render = function() {
        console.log('render');
    }
}

export function mountComponent(vm, el) {
    //1.调用render方法产生虚拟节点 虚拟DOM
    vm._update(vm._render());

    //2.根据虚拟DOM产生真实DOM

    //3.插入到el元素中

}

/**
 * vue核心流程
 * 1）创造了响应式数据 
 * 2）模板转换成ast语法树
 * 3) 将ast语法树转换成render函数
 * 4）后续每次数据更新可以只执行render函数（无需再次执行ast转化的过程）
 * render函数会去产生虚拟节点（使用响应式数据）
 * 根据生成的虚拟节点创造真是的DOM
 */
