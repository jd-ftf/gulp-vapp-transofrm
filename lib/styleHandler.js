const { src, dest } = require('gulp')
const pipeline = require('readable-stream').pipeline
const base64 = require('gulp-base64')
const postcss = require('gulp-postcss')
const cssnano = require('gulp-cssnano')
const rename = require('gulp-rename')
const autoprefixer = require('autoprefixer')
const sass = require('gulp-sass')
const strReplace = require('../utils/gulp-replace')

const PLUGIN_NAME = 'gulp-transform-vapp'
const platform = process.env.PLATFORM

// css 替换逻辑
const cssReg = [
  {
    replaceStr: `\\.${platform === 'wx' ? 'jxss"' : 'wxss"'}`,
    str: `.${platform === 'wx' ? 'wxss"' : 'jxss"'}`
  },
  {
    replaceStr: `\\.${platform === 'wx' ? 'jxss\'' : 'wxss\''}`,
    str: `.${platform === 'wx' ? 'wxss\'' : 'jxss\''}`
  }
]

/**
 * CSS Task
 * @param entry 入口文件全路径
 * @param toPath 生成文件全路径
 * @param ignoreExpressList 屏蔽表达式列表
 * @param replaceExt 被解析替换的后缀名
 * @param toExt 生成目标后缀名,若定义该变量，则生成该后缀，若没有定义，按照生成平台判断生成目标后缀
 */
module.exports = function ({ entry, toPath, ignoreExpressList = [], replaceExt, toExt }) {
// const styleTransform = ({ entry, toPath, ignoreExpressList = [], replaceExt, toExt }) => {
  if (!entry || !toPath) {
    throw Error(`\n Error Message - ${PLUGIN_NAME}：\n entry path or dist path can not be empty !`)
  }

  const srcPath = [`${entry}/**/*.${replaceExt}`]
  const ext = toExt || (platform === 'wx' ? 'wxss' : 'jxss')
  const replaceTask = []
  const replaceCssImport = (cssReg || []).map(item => {
    return strReplace(item.replaceStr, item.str)
  })

  ignoreExpressList && ignoreExpressList.length !== 0 && ignoreExpressList.forEach(ifile => {
    srcPath.push(ifile)
  })

  replaceExt === 'scss' && replaceTask.push(sass().on('error', sass.logError))

  return () => {
    return pipeline(
      src(srcPath),
      ...replaceTask,
      ...replaceCssImport,
      base64({ extensions: ['ttf'] }),
      postcss([autoprefixer()]),
      cssnano({ discardComments: { removeAll: true } }),
      rename(toPath => { toPath.extname = `.${ext}` }),
      dest(toPath)
    )
  }
}