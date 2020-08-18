import sys
import yaml
from testapplepush import TestApplePush

def load_config(path='devices.yml'):
    try:
        with open(path, 'r') as b:
            cfg = yaml.load(b)
            return cfg
    except Exception as e:
        print('Exception=%s (failed to load path=%s)' % (repr(e), repr(path)))
        return None
    return None


if __name__ == '__main__':

    if len(sys.argv) < 3:
        print('ERROR: missing arguments')
        print('\nUsage: %s [device-name-in-yml] [message]' % (sys.argv[0]))
        print('Example: %s bblack_ipod HelloApn\n' % (sys.argv[0]))
        sys.exit(1)

    cfg = load_config()
    if not cfg:
        sys.exit(1)

    device_name = sys.argv[1]
    if device_name not in cfg['devices']:
        print('WARNING: missing %s device-name in yaml' % (repr(device_name)))
        sys.exit(1)

    token = cfg['devices'][device_name]['device_token']
    push_cfg = {
        'use_sandbox': True,
        'cert_file': cfg['apple']['apn_cert'],
        'key_file': cfg['apple']['apn_key']
    }
    custom = {
        'key': 'val'
    }
    o = TestApplePush(**push_cfg)
    o.push_device(token, alert=sys.argv[2], custom=custom)
