#!/usr/bin/env bash
# ./changes.sh 1.0.1+build.796+20180817.beta+native 1.0.1+build.776+20180718.beta+native

base=`pwd`
latest=$1
previous=$2

{
  echo "# latest: $latest"
  echo "# previous: $previous"
  echo " "
  echo "## msgsafe-native"
  cd $base                ; git shortlog --no-merges $latest --not $previous
  echo "## msgsafe-commons"
  cd $base/commons        ; git shortlog --no-merges $latest --not $previous
  echo "## msgsafe-translations"
  cd $base/translations   ; git shortlog --no-merges $latest --not $previous
  cd $base
} > $base/changes.txt
