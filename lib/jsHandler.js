const { src, dest } = require('gulp')
const pipeline = require('readable-stream').pipeline
const filter = require('gulp-filter')
const rename = require('gulp-rename')
const preprocess = require('gulp-preprocess')
const through = require('through2')
const PluginError = require('plugin-error')
const path = require('path')
const transform = require('@babel/core').transform
const babel = require('gulp-babel')
const fileCheck = require('../utils/check')

const PLUGIN_NAME = 'gulp-transform-vapp'
const platform = process.env.PLATFORM

/**
 * JS Task
 * @param entry 入口文件全路径
 * @param toPath 生成文件全路径
 * @param ignoreExpressList 屏蔽表达式列表
 * @param openBabel 是否开启babel
 */
module.exports = function ({ entry, toPath, ignoreExpressList = [], openBabel = false }) {
  if (!entry || !toPath) {
    throw Error(`\n Error Message - ${PLUGIN_NAME}：\n entry path or dist path can not be empty !`)
  }

  const srcPath = [entry + '/**/*.js']
  // 全局变量名替换
  const replaceVarStr = platform === 'wx' ? 'jd' : 'wx'
  const varStr = platform === 'wx' ? 'wx' : 'jd'

  // 表单字符串替换
  let replaceField = [
    {
      from: `${replaceVarStr}://form-field`,
      to: `${varStr}://form-field`
    }, {
      from: `${replaceVarStr}://form-field-group`,
      to: `${varStr}://form-field-group`
    }, {
      from: `${replaceVarStr}://form-field-button`,
      to: `${varStr}://form-field-button`
    }
  ]

  const changeName = rename(path => {
    const { basename, dirname } = path
    // 文件检测
    fileCheck(entry, dirname, 'js')

    if (basename.indexOf('.jd') > -1 || basename.indexOf('.wx') > -1) {
      path.basename = basename.replace(basename.indexOf('.jd') > -1 ? '.jd' : '.wx', '')
    }
  })
  const filterFile = [`${entry}/**`, `!${entry}/**/*.${platform === 'wx' ? 'jd' : 'wx'}.js`]

  ignoreExpressList && ignoreExpressList.length !== 0 && ignoreExpressList.forEach(ifile => {
    srcPath.push(ifile)
    filterFile.push(ifile)
  })

  const platFilter = filter(filterFile)
  const replaceTask = []
  openBabel && replaceTask.push(babel({ presets: ['@babel/env'] }))

  return () => {
    return pipeline(
      src(srcPath),
      platFilter,
      preprocess({
        context: {
          NODE_ENV: process.env.NODE_ENV || 'production',
          PLATFORM: process.env.PLATFORM || 'jd'
        }
      }),
      through.obj((file, enc, cb) => {
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
                      if (path.node.name === replaceVarStr) {
                        path.node.name = varStr
                      }
                    },
                    StringLiteral: function (path) {
                      replaceField.forEach(item => {
                        if (path.node.value === item.from) {
                          path.node.value = item.to
                        }
                      })
                    }
                  }
                }
              }]
            })
            code = result.code
          }
    
          file.contents = Buffer.from(code)
        } catch (err) {
          throw new PluginError(PLUGIN_NAME, err.message)
        }
    
        cb(null, file)
      }),
      ...replaceTask,
      changeName,
      dest(toPath)
    )
  }
}