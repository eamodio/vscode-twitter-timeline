//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

'use strict';
const path = require('path');
const { ESBuildPlugin, ESBuildMinifyPlugin } = require('esbuild-loader');
const ForkTsCheckerPlugin = require('fork-ts-checker-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports =
	/**
	 * @param {{ esbuild?: boolean; } | undefined } env
	 * @param {{ mode: 'production' | 'development' | 'none' | undefined; }} argv
	 * @returns { WebpackConfig }
	 */
	function (env, argv) {
		const mode = argv.mode || 'none';

		env = {
			esbuild: false,
			...env,
		};

		/**
		 * @type WebpackConfig['plugins'] | any
		 */
		const plugins = [
			new ForkTsCheckerPlugin({
				async: false,
				eslint: { enabled: true, files: 'src/**/*.ts', options: { cache: true } },
				formatter: 'basic',
			}),
		];

		if (env.esbuild) {
			plugins.push(new ESBuildPlugin());
		}

		return {
			name: 'extension',
			entry: './src/extension.ts',
			mode: mode,
			target: 'node',
			node: {
				__dirname: false,
			},
			devtool: 'source-map',
			output: {
				path: path.join(__dirname, 'dist'),
				libraryTarget: 'commonjs2',
				filename: 'extension.js',
				chunkFilename: 'feature-[name].js',
			},
			optimization: {
				minimizer: [
					// @ts-ignore
					env.esbuild
						? new ESBuildMinifyPlugin({
								format: 'cjs',
								minify: true,
								treeShaking: true,
								// Keep the class names otherwise @log won't provide a useful name
								keepNames: true,
								target: 'es2019',
						  })
						: new TerserPlugin({
								parallel: true,
								terserOptions: {
									ecma: 2019,
									// Keep the class names otherwise @log won't provide a useful name
									keep_classnames: true,
									module: true,
								},
						  }),
				],
				splitChunks: {
					cacheGroups: {
						defaultVendors: false,
					},
				},
			},
			externals: {
				vscode: 'commonjs vscode',
			},
			module: {
				rules: [
					{
						exclude: /node_modules/,
						include: path.join(__dirname, 'src'),
						test: /\.tsx?$/,
						use: env.esbuild
							? {
									loader: 'esbuild-loader',
									options: {
										loader: 'ts',
										target: 'es2019',
										tsconfigRaw: require('./tsconfig.json'),
									},
							  }
							: {
									loader: 'ts-loader',
									options: {
										experimentalWatchApi: true,
										transpileOnly: true,
									},
							  },
					},
				],
			},
			resolve: {
				extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
				symlinks: false,
			},
			plugins: plugins,
			stats: {
				preset: 'errors-warnings',
				assets: true,
				colors: true,
				env: true,
				errorsCount: true,
				warningsCount: true,
				timings: true,
			},
		};
	};
