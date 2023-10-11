module.exports = {
  dependencies: {
    'react-native-bootsplash': {
      platforms: {
        android: null // disable Android platform, other platforms will still autolink if provided
      }
    },
    'react-native-tracking-transparency': {
      platforms: {
        android: null
      }
    },
    'react-native-splash-screen': {
      platforms: {
        ios: null // disable Android platform, other platforms will still autolink if provided
      }
    }
  },
  assets: [
    './src/assets/fonts/'
  ]
}
