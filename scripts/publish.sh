##!/usr/bin/env bash
rm index.zip
zip -r index.zip * -X ".git* | .idea* | .DS_Store*"
aws lambda update-function-code --function-name alexa-jenkins --zip-file fileb://index.zip

