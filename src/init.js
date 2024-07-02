import { initState } from './state';
import { compileToFunction } from './compiler';

export function initMixin(Vue) { //就是给Vue增加init方法的
    Vue.prototype._init = function(options) { //用于初始化操作
        //vue vm.$options就是获取用户的配置
        //我们使用的vue的时候 $nextTick $data $attr......
        const vm = this;
        vm.$options = options; //将用户的选项挂在到实列上

        //初始化状态
        initState(vm);

        if (options.el) {
            vm.$mount(options.el); //实现数据的挂载
        }
    }

    Vue.prototype.$mount = function(el) {
        const vm = this;
        el = document.querySelector(el);
        let ops = vm.$options;
        if (!ops.render) { //先进行查找有没有render函数
            let template; //没有render看一下是否写了template， 没写template采用外部的template
            if (!ops.template && el) { //没有写模板 但写了el
                template = el.outerHTML;
            } else {
                if (el) {
                    template = ops.template; //如果有el 则采用模板内容
                }
            }

            //写了template 就用写了的template
            if (template) {
                //这里需要对模板进行编译
                const render = compileToFunction(template);
                ops.render = render; //jsx最终会被编译成h('xxx')
            }
        }

        ops.render; //最终就可以获取render方法

        //script标签引用的vue.global.js这个编译过程是在浏览器运行的
        //runtime是不包含模板编译的，整个编译是打包的时候通过loader来转义.vue文件的，用runtime的时候不能使用template
    }
}