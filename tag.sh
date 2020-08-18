#!/usr/bin/env bash
base=`pwd`
paths="$base/commons $base/translations $base"
# apv update build  # increment build number
source getver.sh
# git commit -a -m "$tag" 
# git push
for task in $paths
do
  cd $task && git tag -a -m "$tag" $tag && git push --tags
done
