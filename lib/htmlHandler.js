const { src, dest } = require('gulp')
const pipeline = require('readable-stream').pipeline
const filter = require('gulp-filter')
const rename = require('gulp-rename')
const postcss = require('gulp-postcss')
const preprocess = require('gulp-preprocess')
const strReplace = require('../utils/gulp-replace')
const fileCheck = require('../utils/check')

const PLUGIN_NAME = 'gulp-transform-vapp'
const platform = process.env.PLATFORM

// html 替换逻辑
const htmlReg = [
  {
    replaceStr: `\\.${platform === 'wx' ? 'jxs' : 'wxs'}`,
    str: `.${platform === 'wx' ? 'wxs' : 'jxs'}`
  }, {
    replaceStr: `<${platform === 'wx' ? 'jxs' : 'wxs'}`,
    str: `<${platform === 'wx' ? 'wxs' : 'jxs'}`
  }, {
    replaceStr: `${platform === 'wx' ? 'jd' : 'wx'}:`,
    str: `${platform === 'wx' ? 'wx' : 'jd'}:`
  }, {
    replaceStr: `\\.${platform === 'wx' ? 'jxml' : 'wxml'}`,
    str: `.${platform === 'wx' ? 'wxml' : 'jxml'}`
  }
]

/**
 * html Task 内部引入文件的时候替换文件后缀
 * @param entry 入口文件全路径
 * @param toPath 生成文件全路径
 * @param ignoreExpressList 屏蔽表达式列表
 * @param replaceExt 被解析替换的后缀名
 * @param toExt 生成目标后缀名,若定义该变量，则生成该后缀，若没有定义，按照生成平台判断生成目标后缀
 */
module.exports = function ({ entry, toPath, ignoreExpressList = [], replaceExt, toExt }) {
  if (!entry || !toPath) {
    throw Error(`\n Error Message - ${PLUGIN_NAME}：\n entry path or dist path can not be empty !`)
  }

  const ext = toExt || (platform === 'wx' ? 'wxml' : 'jxml')
  const pre = `${entry}/**/*.${replaceExt}`
  const srcPath = [pre]
  const filterFile = [`${entry}/**`, `!${entry}/**/*.${platform === 'wx' ? 'jd' : 'wx'}.${replaceExt}`]

  ignoreExpressList && ignoreExpressList.length !== 0 && ignoreExpressList.forEach(ifile => {
    srcPath.push(ifile)
    filterFile.push(ifile)
  })

  // 添加过滤，过滤需要转换的路径
  const platFilter = filter(filterFile)
  // 京东微信语法互转
  const replaceTask = (htmlReg || []).map(item => {
    return strReplace(item.replaceStr, item.str)
  })
  // 更换后缀名
  replaceTask.push(rename(path => {
    const { basename, dirname } = path
    fileCheck(entry, dirname, replaceExt)

    if (basename.indexOf('.jd') > -1 || basename.indexOf('.wx') > -1) {
      path.basename = basename.replace(basename.indexOf('.jd') > -1 ? '.jd' : '.wx', '')
    }
    path.extname = `.${ext}`
  }))

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
      ...replaceTask,
      dest(toPath)
    )
  }
}
