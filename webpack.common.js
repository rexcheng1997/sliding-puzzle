const path = require('path');

module.exports = {
    entry: './src/index.ts',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'public/js')
    },
    resolve: {
        alias: {
            assets: path.resolve('public', ''),
            algorithms: path.resolve('src', 'algorithms'),
            classes: path.resolve('src', 'classes'),
            components: path.resolve('src', 'components')
        }
    },
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/,
            resolve: {
                extensions: ['.tsx', '.ts', '.js']
            }
        }, {
            test: /\.scss$/,
            use: ['style-loader', {
                loader: 'css-loader',
                options: { url: false }
            }, 'sass-loader']
        }, {
            test: /\.svg$/,
            use: ['@svgr/webpack']
        }]
    }
};
