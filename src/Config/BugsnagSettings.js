const bsConfig = {
  enabled: !__DEV__,
  // key: '55778cea123d09ce1607a96b9bca000a',
  releaseStage: __DEV__ ? 'staging' : 'production',
  notifyReleaseStages: ['staging', 'production'],
  appVersion: require('../../package.json').version
}

export default bsConfig
