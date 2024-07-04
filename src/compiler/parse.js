const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 匹配开始标签
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配结束标签 
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性
//第一个分组就是属性的key value就是分组3/分组4/分组5
const startTagClose = /^\s*(\/?)>/; // 匹配开始标签的结束

//vue3采用的不是使用正则
//对模板进行编译处理
export function parseHTML(html) { //html最开始肯定是一个<div>
    const ELEMENT_TYPE = 1; //元素类型
    const TEXT_TYPE = 3; //文本类型
    let stack = []; //用于存放所有的根元素
    let currentParent; //当前正在处理的元素,指向的是栈中的最后一个
    let root; //根元素

    //最终需要转化成一颗抽象语法树
    function createASTElement(tag, attrs) {
        return {
            tag,
            type: ELEMENT_TYPE,
            children: [],
            attrs,
            parent: null
        };
    }
    //利用栈型结构来构建一棵树
    function start(tag, attrs) {
        let node = createASTElement(tag, attrs); //创建一个ast节点
        if (!root) { //看一下是否为空树
            root = node; //如果是空树，那么当前的节点就是根节点
        }
        if (currentParent) {
            node.parent = currentParent; //将当前的节点作为父节点的子节点
            currentParent.children.push(node);
        }
        stack.push(node); //将当前的节点压入栈中
        currentParent = node; //将当前的节点作为父节点
    }

    function chars(text) { //文本直接放到当前指向的姐弟啊中
        text = text.replace(/\s/g, ''); //去除空格
        text && currentParent.children.push({
            type: TEXT_TYPE,
            text,
            parent: currentParent
        })
    }

    function end(tag) {
        stack.pop(); //将最后一个元素弹出
        currentParent = stack[stack.length - 1]; //更新当前的父节点
    };

    function advance(n) {
        html = html.substring(n);
    }

    function parseStartTag() {
        const start = html.match(startTagOpen);
        if (start) {
            const match = {
                tagName: start[1], //标签名
                attrs: []
            };
            advance(start[0].length);

            //如果不是开始标签的结束，就一直匹配下去
            let attr, end;
            while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                advance(attr[0].length);
                match.attrs.push({
                    name: attr[1],
                    value: attr[3] || attr[4] || attr[5] || true
                })
            }
            if (end) {
                advance(end[0].length);
            }
            return match;
        }

        return false; //不是开始标签
    }

    while (html) {
        //如果textEnd为0，说明是开始标签或者结束标签
        //如果textEnd > 0，说明 就是文本的结束位置
        let textEnd = html.indexOf('<'); //如果indexOf中的索引是0 则说明是个标签
        if (textEnd === 0) { 
            const startTagMatch = parseStartTag(); //开始标签的匹配结果
            if (startTagMatch) { //解析到的开始标签
                start(startTagMatch.tagName, startTagMatch.attrs);
                continue;
            }

            let endTagMatch = html.match(endTag); //结束标签的匹配结果
            if (endTagMatch) {
                advance(endTagMatch[0].length);
                end(endTagMatch[1]); //结束标签的标签名
                continue;
            }
        }

        if (textEnd > 0) {
            let text = html.substring(0, textEnd); //文本内容
            if (text) {
                chars(text);
                advance(text.length); //解析到的文本
            }
        }
    }

    return root;
}