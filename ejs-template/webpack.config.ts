import path from 'path'
import { Configuration } from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import globule from 'globule'

const config: Configuration = {
  mode: 'development',
  entry: path.resolve(__dirname, 'src/entry.ts'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.ejs$/,
        use: [
          {
            loader: 'ejs-compiled-loader',
            options: {
              htmlmin: true,
              htmlminOptions: {
                removeComments: true,
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [],
}

export default config

const getEntriesList = (targetTypes: { [key: string]: string }) => {
  const entriesList: { [key: string]: string } = {}
  for (const [srcType, targetType] of Object.entries(targetTypes)) {
    const filesMatched = globule.find([`**/*.${srcType}`, `!**/_*.${srcType}`], { cwd: `${__dirname}/src` })

    for (const srcName of filesMatched) {
      const targetName = srcName.replace(new RegExp(`.${srcType}$`, 'i'), `.${targetType}`)
      entriesList[targetName] = `${__dirname}/src/${srcName}`
    }
  }

  return entriesList
}

const removeDir = (fileName: string) => {
  return fileName.replace('ejs/', '')
}

if (config.plugins) {
  for (const [fileName, srcName] of Object.entries(getEntriesList({ ejs: 'html' }))) {
    config.plugins.push(
      new HtmlWebpackPlugin({
        template: srcName as string,
        filename: removeDir(fileName),
      })
    )
  }
}
