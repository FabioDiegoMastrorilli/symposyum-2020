const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
	mode: 'development',
	devServer: {
		historyApiFallback: true,
		contentBase: path.resolve(__dirname, './public'),
		open: true,
		compress: true,
		hot: true,
		port: 3000,
	},
	entry: {
		app: './src/scripts/index.js',
	},
	devtool: 'inline-source-map',
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: ['babel-loader'],
			},
			{
				test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
				type: 'asset/resource',
			},
			{
				test: /\.(woff(2)?|eot|ttf|otf|svg|)$/,
				type: 'asset/inline',
			},
			{
				test: /\.(scss|css)$/,
				use: [
					'style-loader',
					'css-loader',
					'postcss-loader',
					'sass-loader',
				],
			},
		],
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: 'webpack Boilerplate',
			template: path.resolve(__dirname, './src/templates/index.html'),
			filename: 'index.html', // output file
		}),
		new CleanWebpackPlugin(),
	],
	output: {
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'dist'),
	},
};
