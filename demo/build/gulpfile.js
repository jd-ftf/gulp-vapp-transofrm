const { src, dest, parallel, series, watch } = require('gulp')
const path = require('path')
const del = require('del')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const { htmlTransform, jsTransform, styleTransform, copyNoChange } = require('@ftf/gulp-vapp-transform')
require('events').EventEmitter.defaultMaxListeners = 0

const cleanTask = function (filepath) {
  return function () {
    return exec(`npx rimraf ${filepath}`)
  }
}

const watchDelTask = (stats, changePath) => {
  function filters (ext) {
    if (ext === '.jxml' || ext === '.wxml') {
      return isToWx ? '.wxml' : '.jxml'
    } else if (ext === '.scss' || ext === '.jxss' || ext === '.wxss') {
      return isToWx ? '.wxss' : '.jxss'
    } else {
      return ext
    }
  } 

  if (stats === 'unlink' || stats === 'unlinkDir') {
    const file = path.parse(changePath)
    const { name, ext, dir } = file
    // 存在一个问题，如果替换文件前方有重名文件夹，可能会造成替换错误，因此建议使用不重名的文件夹名作为入口
    const pre = dir.replace(entryName, outputName)
    const final = pre + '/' + name + filters(ext)

    del.sync(final, { force: true })
  }
}

// 后期修改做准备
const isToWx = process.env.PLATFORM === 'wx'
const entryName = 'src' // 入口文件名
const outputName = isToWx ? 'dist-wx' : 'dist-jd' // 生成文件名
const entry = path.resolve(__dirname, '../' + entryName)
const toPath = path.resolve(__dirname, '../' + outputName)

const srcPath = [
  `${entry}/**`,
  `!${entry}/**/*.js`,
  `!${entry}/**/*.jxml`,
  `!${entry}/**/*.wxml`,
  `!${entry}/**/*.scss`,
  `!${entry}/**/*.jxss`,
  `!${entry}/**/*.wxss`
]

const scssTask = () => styleTransform({ entry, toPath, replaceExt: 'scss' })()
const jxssTask = () => styleTransform({ entry, toPath, replaceExt: 'jxss' })()
const wxssTask = () => styleTransform({ entry, toPath, replaceExt: 'wxss' })()

const jxmlTask = () => htmlTransform({ entry, toPath, replaceExt: 'jxml' })()
const wxmlTask = () => htmlTransform({ entry, toPath, replaceExt: 'wxml' })()
const jsTask = () => jsTransform({ entry, toPath })()
const packagesCopy = () => copyNoChange(srcPath, toPath)()

const baseTask = [
  parallel(scssTask, jxssTask, wxssTask, jsTask, jxmlTask, wxmlTask, packagesCopy)
]

const watchTask = function () {
  return watch(`${entry}/**`, ...baseTask)
    .on('all', (stats, changePath) => {
      watchDelTask(stats, changePath)
    })
}

const dev = series(cleanTask(toPath), ...baseTask, parallel(watchTask))
const build = series(cleanTask(toPath), ...baseTask)

exports[process.argv[2]] = process.env.NODE_ENV === 'development' ? dev : build