const path = require('path')

module.exports = {
    mode: 'development',
    entry: './docs/src/index.js',
    output: {
        path: path.resolve(__dirname, 'docs'),
        filename: 'bundle.js'
    },
    watch:true
}

