#!/usr/bin/env bash
base=`pwd`
if [ $# -eq 1 ] ; then
  branch=$1
else
  branch=master
fi

paths="$base/commons $base/translations $base"
for task in $paths
do
  echo $task
  cd $task && git checkout $branch && git pull
done
