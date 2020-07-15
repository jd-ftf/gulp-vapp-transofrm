const through = require('through2');
const {parse, traverse, print} = require("@humanwhocodes/momoa");

/**
 * @description 将 京东小程序配置文件中的 usingComponents 下的 "xxx/yyy/index.js" 转为 "xxx/yyy"
 * @param {String} source
 * @return {String} source
 */
function compile(source) {
    /** 源码转成 ast 语法树 **/
    const ast = parse(source);
    /** 深度优先遍历 ast 语法树 **/
    traverse(ast, {
        enter(node) {
            try {
                // 拦截节点名为 usingComponents 的遍历
                const members = node.name.value === 'usingComponents' && node.value.members
                // 仅当发现有子节点才进行一下操作
                if (!members instanceof Array || members.length === 0) return;
                // 遍历每一个子节点
                members.forEach(item => {
                    // 取其前缀
                    const target = item.value.value.match(/(.+)\/index(\.js)?$/)[1];
                    if (!target) return
                    // 值重置为前缀
                    item.value.value = target
                })
            } catch (e) {
            }
        }
    })
    /** 使用修改后的 ast 语法树重新生成 json 字符串 **/
    return print(ast)
}

module.exports = function () {
    return through.obj((file, encoding, callback) => {
        const source = file.contents.toString();
        try {
            file.contents = Buffer.from(compile(source));
            callback(null, file);
        } catch (e) {
            callback(e, null);
        }
    })
}