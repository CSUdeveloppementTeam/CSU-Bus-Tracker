const path = require('path');
// const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  // The entry point file described above
  entry: './public/src/index.js',
  // plugins: [
  //   new HtmlWebpackPlugin({
  //     title: "My Web Application",
  //   }),
  // ],
  // The location of the build folder described above
  output: {
    path: path.resolve("public", 'dist'),
    filename: 'bundle.js'
    // filename: "[name].[contenthash].js",
  },
  // Optional and for development only. This provides the ability to
  // map the built code back to the original source format when debugging.
  devtool: 'eval-source-map',
};

