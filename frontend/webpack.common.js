const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HappyPack = require('happypack');
// const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
  entry: {
    app: './src/index.js'
  },
  output: {
    filename: '[name].[chunkhash:6].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/static/'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)[x]?$/,
        exclude: /node_modules/,
        use: 'happypack/loader'
      },
      {
        test: /\.s?css$/,
        exclude: /node_modules/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: './'
            }
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true
            }
          },
          {
            loader: 'resolve-url-loader',
            options: {
              sourceMap: true
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              sassOptions: {
                outputStyle: 'compressed'
              }
            }
          }
        ]
      },
      {
        test: /\.(woff2?|ttf|eot|otf)(\?.*$|$)/,
        use: {
          loader: 'file-loader',
          options: {
            name: 'fonts/[name].[ext]'
          }
        }
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|ico)(\?.*$|$)/,
        use: {
          loader: 'file-loader',
          options: {
            name: 'images/[name].[ext]'
          }
        }
      }
    ]
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 50000,
      maxSize: Infinity,
      minChunks: 1,
      maxAsyncRequests: 3,
      maxInitialRequests: 2,
      automaticNameDelimiter: '~',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          chunks: 'initial'
        },
        async_vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -5,
          chunks: 'async',
          enforce: true
        },
        common: {
          minChunks: 2,
          priority: -20
        }
      }
    }
  },
  plugins: [
    // runs loaders in multiple parallel threads
    // significantly speed up app build with moderate to big code base
    new HappyPack({
      loaders: ['babel-loader']
    }),
    // new ForkTsCheckerWebpackPlugin({
    //   async: false,
    //   checkSyntacticErrors: true,
    //   measureCompilationTime: true,
    //   tslint: false,
    //   useTypescriptIncrementalApi: false
    // }),
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    new MiniCssExtractPlugin({
      filename: 'app-bundle.[contenthash:6].css'
    })
  ]
};
