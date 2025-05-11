const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './main.js', // Entry point is main.js
  output: {
    path: path.resolve(__dirname, 'dist'), // Output bundled files to 'dist' folder
    filename: 'bundle.js', // Name of the bundled JS file
    clean: true, // Clean the output directory before each build
  },
  mode: 'development', // Use 'production' for optimized builds
  module: {
    rules: [
      {
        test: /\.css$/, // Handle CSS files
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html', // Use your index.html as the template
    }),
  ],
  devServer: {
    static: path.join(__dirname, 'dist'), // Serve files from 'dist'
    compress: true,
    port: 8080, // Dev server port
  },
  resolve: {
    alias: {
      modules: path.resolve(__dirname, 'modules'), // Alias for your modules folder
    },
  },
};