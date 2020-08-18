from apns import APNs, Payload
import logging

lfmt = '%(asctime)s %(levelname)s %(name)s %(funcName)s %(lineno)d %(message)s'
logger = logging.getLogger(__name__)
logger.setLevel(logging.ERROR)
logging.basicConfig(level=logging.ERROR, format=lfmt)


class TestApplePush(object):
    def __init__(self, use_sandbox=True, cert_file=None, key_file=None):
        self.log = logger
        self.apns = APNs(
            use_sandbox=use_sandbox, cert_file=cert_file, key_file=key_file
        )

    def get_feedback(self):
        for(token_hex, fail_time) in self.apns.feedback_server.items():
            print('%s %s' % (repr(token_hex), repr(fail_time)))

    def push_device(self, token, alert=None, sound="default", badge=1,
                    content_available=0, custom={}):
        p = Payload(
            alert=alert, sound=sound, badge=badge,
            content_available=content_available,
            custom=custom
        )
        print(repr(p))
        self.apns.gateway_server.send_notification(token, p)
