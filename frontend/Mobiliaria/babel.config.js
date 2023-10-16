module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      require.resolve('babel-plugin-module-resolver'),
      {
        cwd: 'babelrc',
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.ios.js', '.android.js'],
        alias: {
          '@hooks': './src/hooks',
          '@assets': './src/assets',
          '@classes': './src/classes',
          '@components': './src/components',
          '@interfaces': './src/interfaces',
          '@navigation': './src/navigation',
          '@redux': './src/redux',
          '@screens': './src/screens',
          '@services': './src/services',
          '@shared': './src/shared',
          '@theme': './src/theme',
          '@utils': './src/utils',
          '@config': './src/config'
        }
      }
    ],
    'jest-hoist',
    'module:react-native-dotenv',
    'react-native-reanimated/plugin' // < debe estar al final
  ]
}