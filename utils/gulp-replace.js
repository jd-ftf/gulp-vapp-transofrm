const through = require('through2')
const PluginError = require('plugin-error')
const path = require('path')
const transform = require('@babel/core').transform

const PLUGIN_NAME = 'gulp-replace'

module.exports = (replaceStr, str) => {
  return through.obj((file, enc, cb) => {
    if (!replaceStr || !str) {
      cb(null, file)
      return
    }

    if (file.isNull()) {
      cb(null, file)
      return
    }

    try {
      // 读取file文件夹下的元代码
      const { ext } = path.parse(file.basename)
      let code = file.contents.toString()

      // 后缀js
      if (ext === '.js') {
        const result = transform(code, {
          plugins: [function () {
            return {
              // 返回插件的访问者
              visitor: {
                Identifier: function (path) {
                  if (path.node.name === replaceStr) {
                    path.node.name = str
                  }
                }
              }
            }
          }]
        })
        code = result.code
      } else {
        code = code.replace(new RegExp(replaceStr, 'g'), str)
      }

      file.contents = Buffer.from(code)
    } catch (err) {
      throw new PluginError(PLUGIN_NAME, err.message)
    }

    cb(null, file)
  })
}