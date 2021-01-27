const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  entry: './src/shamir.ts',
  mode: 'development',
  output: {
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    plugins: [new TsconfigPathsPlugin()],
    fallback: {
      buffer: require.resolve('buffer/'),
      crypto: false,
      // crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
    },
  },
  module: {
    rules: [{ test: /\.tsx?$/, loader: 'ts-loader' }],
  },
};
