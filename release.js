var slack = require('slack')
var token = 'xoxb-333993532096-q5awjEtoHKJmgkaMARbQ1H4s'
var build = require('build.json')

slack.chat.postMessage({ token: token, channel: '@wylie', text: build })
  .then(console.log)
  .catch(console.log)
