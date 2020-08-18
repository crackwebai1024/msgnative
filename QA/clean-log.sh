#!/bin/bash

react-native log-ios |grep -E -v 'libnet|nw_|CoreSimu|pasted|libdispatch|Initializ|websocketFailed|SocketRocket|last message|already defined|Deprecation'
