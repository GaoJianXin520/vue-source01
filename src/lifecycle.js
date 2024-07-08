import { createElementVNode, createTextVNode } from './vdom';

function createElm(vnode) {
    let { tag, data, children, text } = vnode;
    if (typeof tag === 'string') { //标签
        vnode.el = document.createElement(tag); //这里将真实节点和虚拟节点对应起来，后续如果修改了属性
        patchProps(vnode.el, data);
        children.forEach(child => {
            vnode.el.appendChild(createElm(child));
        });
    } else {
        vnode.el = document.createTextNode(text);
    }
    return vnode.el;
}

function patchProps(el, props) {
    for (let key in props) {
        if (key === 'style') {
            for (let styleName in props.style) {
                el.style[styleName] = props.style[styleName];
            }
        } else {
            el.setAttribute(key, props[key]);
        }
    }
}

function patch(oldVNode, vnode) {
    //写的是初渲染流程
    const isRealElement = oldVNode.nodeType;
    if (isRealElement) {
        const elm = oldVNode; //获取真实元素

        const parentElm = elm.parentNode; //获取父元素
        let newElm = createElm(vnode);
        parentElm.insertBefore(newElm, elm.nextSibling);
        parentElm.removeChild(elm); //删除老节点
    } else {
        //diff算法
    }
}

export function initLicycle(Vue) {
    Vue.prototype._update = function(vnode) {
        const vm = this;
        const el = vm.$el;

        //patch既有初始化的功能 又有更新
        patch(el, vnode);
    }

    Vue.prototype._c = function() {
        return createElementVNode(this, ...arguments);
    }

    Vue.prototype._v = function() {
        return createTextVNode(this, ...arguments);
    }

    Vue.prototype._s = function(value) {
        if (typeof value != 'object') return value;
        return JSON.stringify(this);
    }

    Vue.prototype._render = function() {
        //当渲染的时候会去实例中取值，我们就可以将属性和史图绑定在一起
        return this.$options.render.call(this); //通过ast语法转义后生成的render方法
    }
}

export function mountComponent(vm, el) {
    vm.$el = el;
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
