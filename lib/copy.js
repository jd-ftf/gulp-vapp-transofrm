const { src, dest } = require('gulp')

module.exports = function (entry, toPath) {
  return function () {
    return src(entry)
      .pipe(dest(toPath))
  }
}
