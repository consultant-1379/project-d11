#!/bin/sh
#chmod777 main.js
k6 run  --summary-export /tmp/test-output.json main.js
cat main.js
while true ; do sleep 600s ; done > /dev/null
