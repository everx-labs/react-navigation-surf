const path = require('path');
const webpack = require('webpack');

module.exports = {
    devServer: {
        contentBase: path.join(__dirname, './web'),
        compress: true,
        port: 4000,
        disableHostCheck: true,
        historyApiFallback: true,
    },
    entry: path.join(__dirname, './index.web.js'),
    output: {
        path: path.join(__dirname, './web/assets'),
        publicPath: 'assets/',
        filename: '[name].bundle.js',
    },
    devtool: 'source-map',
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development'),
            __DEV__: true,
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: false,
            debug: true,
        }),
    ],
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                // exclude: /node_modules/,
                include: [
                    path.resolve('index.web.js'),
                    path.resolve('App.js'),
                    path.resolve(__dirname, './src/'),
                    // path.resolve(__dirname, './node_modules/react/'),
                    // path.resolve(__dirname, './node_modules/react-dom/'),
                    path.resolve(__dirname, './node_modules/react-native-web/'),
                    // path.resolve(__dirname, './node_modules/@react-navigation/'),
                    path.resolve(
                        __dirname,
                        './node_modules/react-navigation-surf/',
                    ),
                    path.resolve(
                        __dirname,
                        './node_modules/react-native-gesture-handler/',
                    ),
                ],
                loader: 'babel-loader',
                query: {
                    // cacheDirectory: true,
                    presets: [
                        '@babel/preset-flow',
                        '@babel/preset-react',
                        [
                            '@babel/preset-env',
                            {
                                loose: true,
                                exclude: ['transform-typeof-symbol'],
                                targets: '> 0.25%, not dead',
                            },
                        ],
                    ],
                    plugins: [
                        'babel-plugin-react-native-web',
                        '@babel/plugin-transform-flow-strip-types',
                        [
                            'babel-plugin-transform-react-remove-prop-types',
                            { mode: 'wrap' },
                        ],
                        // ['@babel/plugin-proposal-decorators', {legacy: true}],
                        [
                            '@babel/plugin-proposal-class-properties',
                            { loose: true },
                        ],
                        // ['@babel/plugin-proposal-object-rest-spread', {useBuiltIns: true}],
                        // '@babel/plugin-proposal-nullish-coalescing-operator',
                    ],
                },
            },
            {
                test: /\.(gif|jpe?g|png|svg)$/,
                loader: 'react-native-web-image-loader', // 'url-loader',
                query: { name: '[name].[hash:16].[ext]' },
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    resolve: {
        extensions: ['.web.js', '.js'],
        alias: {
            '@react-native-community/async-storage':
                'react-native-web/dist/exports/AsyncStorage',
            'react-native$': 'react-native-web',
        },
    },
};
