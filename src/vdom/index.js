export function createElementVNode(vm, tag, data, ...children) {
    data === null && (data = {});
    let { key, ...o } = data;
    return vnode(vm, tag, key, o, children);
}

export function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
}

//ast一样吗？ast做的是语法层面的转化，它描述的是语法本身（可以描述js css html)
//我们的虚拟dom是描述的dom元素 ，可以增加一些自定义属性（描述dom的）
function vnode(vm, tag, key, data, children, text) {
    return {
        vm,
        tag,
        key,
        data,
        children,
        text
    }
}
