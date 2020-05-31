const fs = require('fs')
const chalk = require('chalk')
const PLUGIN_NAME = 'gulp-transform-vapp'

// 文件检测
module.exports = function fileCheck (entry, dirname, ext) {
  // 不带.
  const dir = `${entry}/${dirname !== '.' ? dirname : ''}`
  const files = fs.readdirSync(dir).filter(f => f.endsWith(ext))
  const err = {
    dir
  }
  let hasBaseFile = false
  let hasPlatFile = false

  files.forEach(file => {
    if (file.indexOf('.jd.' + ext) === -1 && file.indexOf('.wx.' + ext) === -1) {
      hasBaseFile = true
      err.fileName = file
    } else {
      hasPlatFile = true
    }
  })

  if (hasPlatFile && hasBaseFile) {
    console.log(chalk.red(`\n Warning Message - ${PLUGIN_NAME}：\n 检测到当前文件夹 --- ${err.dir}  \n 已经存在 ${err.fileName}!`))
  }
}
