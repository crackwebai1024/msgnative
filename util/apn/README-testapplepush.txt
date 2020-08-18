# If you dont have pew, install it.
pip install pew

# Create env
pew new -r requirements.txt testapplepush


# Push to device (dopush.py)
from testapplepush import TestApplePush
device_token = '79a7c4f1f4d47902d575d80e63f43d5aad414c2234b6ae19ba9ce67906b060f1'
cfg = {'cert_file': '/home/bblack/apn/APNPushCert.pem', 'key_file': '/home/bblack/apn/APNPushKey.nopass.pem'}

o = TestApplePush(use_sandbox=True, cfg=cfg)
o.push_device(device_token, alert='Wake up Wake up!')


# Run it outside of pew
pew in testapplepush python ./dopush.py

# Run it inside pew
pew workon testapplepush
python ./dopush.py
