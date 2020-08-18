echo "removing node_modules/"
rm -rf node_modules
echo "cleaning watchman"
watchman watch-del-all

echo "killing lingering node processes"
killall node

#echo "cleaning npm cache"
#npm cache clean

echo "running yarn"
yarn
echo "npm install complete."
echo
echo "You may need to run the following in a separate terminal"
echo
echo "Now, run the following in this terminal"
echo "1) react-native start --reset-cache"
echo
echo "In a separate terminal (same directory) run the simulator"
echo "1) react-native run-ios"
