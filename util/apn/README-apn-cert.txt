#
#https://developer.apple.com/library/content/documentation/IDEs/Conceptual/AppDistributionGuide/AddingCapabilities/AddingCapabilities.html#//apple_ref/doc/uid/TP40012582-CH26-SW6
#

On apple developer, head over to certificates.

1) Click the + sign (top right)
2) Select Production + Apple Push Notification service SSL (Sandbox & Production)
3) Follow steps thru Keychain / CSR workflow. Once you have a .p12 generated, export below:


# Extract just the key.
openssl pkcs12 -in ~/Desktop/APN.p12 -out APNPushKey.pem -nocerts

# Extract just the cert.
openssl pkcs12 -in ~/Desktop/APN.p12 -out APNPushCert.pem -clcerts -nokeys

# Strip passphrase
openssl rsa -in APNPushKey.pem -out APNPushKey.nopass.pem

