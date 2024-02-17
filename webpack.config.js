const path = require('path')

module.exports = {
    mode: 'development',
    // entry: '.docs/src/index.js',
    entry: ['./docs/src/index.js', './docs/src/jquery.js'],
    output: {
        path: path.resolve(__dirname, 'docs'),
        filename: 'bundle.js'
    },
    watch:true
}

