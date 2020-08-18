#!/usr/bin/env python3
import logging
import argparse
import requests
import json
import platform
import subprocess

lfmt = '%(asctime)s %(levelname)s %(name)s %(funcName)s %(lineno)d %(message)s'
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
logging.basicConfig(level=logging.DEBUG, format=lfmt)


def get_args():
    parser = argparse.ArgumentParser(
        description='msgsafe-native bugsnag release announcement')

    parser.add_argument("-v", "--verbose", action="count", default=0)
    parser.add_argument('--version', type=str, default='1.0.1')
    parser.add_argument('--buildnumber', type=str)
    parser.add_argument('--commit', type=str, required=True)
    parser.add_argument('--stage', type=str, default='production')

    parser.add_argument(
        '--notifier', type=str,
        default='323d3322da613caedd0362f5bce64ca9')
    parser.add_argument(
        '--repository', type=str, default='https://git.trustcorsystems.com'
        '/msgsafe/msgsafe-native')
    args = parser.parse_args()
    if args.verbose > 0:
        print(args)
    return args


def bugsnag_build(args):
    headers = {
        'Content-Type': 'application/json'
    }

    data = {
        'apiKey': args.notifier,
        'appVersion': args.version,
        'builderName': 'TrustCor Systems S de RL',
        'sourceControl': {
            'provider': 'github-enterprise',
            'repository': args.repository,
            'revision': args.commit
        },
        'releaseStage': args.stage,
        'autoAssignRelease': True,
        'metadata': {
            'build_os': 'Mac OS X %s' % (platform.mac_ver()[0]),
            'build_node': platform.node().split('.')[0],
            'build_platform': platform.platform(),
            'node': subprocess.getstatusoutput('node -v')[1],
            'npm': subprocess.getstatusoutput('npm -v')[1],
            'yarn': subprocess.getstatusoutput('yarn -v')[1],
            'git': subprocess.getstatusoutput('git --version')[1],
            'netperf': subprocess.getstatusoutput("sed 's/[^0-9]*//g' "
                "./android/netperf-lib/build.gradle")[1]
        }
    }
    if args.buildnumber:
        data['appVersionCode'] = args.buildnumber

    r = requests.post(
        'https://build.bugsnag.com', headers=headers, data=json.dumps(data))
    return r


def main():
    args = get_args()
    print(bugsnag_build(args))


if __name__ == "__main__":
    main()
