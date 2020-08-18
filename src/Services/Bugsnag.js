import { Configuration, Client } from 'bugsnag-react-native'

import bsConfig from 'app/Config/BugsnagSettings'

const config = new Configuration()

config.releaseStage = bsConfig.releaseStage
config.appVersion = bsConfig.appVersion
config.notifyReleaseStages = bsConfig.notifyReleaseStages
config.autoCaptureSessions = true

export const bugsnag = new Client(config)

export const reportBreadcrumb = bugsnag.leaveBreadcrumb('load main view', { type: 'navigation' })
