const Vinyl = require('vinyl');
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const jsonHandler = require('../lib/jsonHandler');
const {src, parallel, series, watch} = require('gulp')

it(`should delete '/index.js' behind Component's path`, (done) => {
    src(path.resolve(__dirname, 'fixtures', 'index.json'))
        .pipe(jsonHandler())
        .on('data', (file) => {
            assert.strictEqual(file.contents.toString(), JSON.stringify({
                "navigationBarTitleText": "Badge 角标",
                "usingComponents": {
                    "demo-block": "../../components/demo-block",
                    "wd-badge": "../../dist/badge",
                    "wd-button": "../../dist/button"
                }
            }));
            done()
        });


});
