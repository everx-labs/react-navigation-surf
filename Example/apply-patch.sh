curl https://raw.githubusercontent.com/software-mansion/react-native-screens/563d3c05a9eb43a56fb143cec30a4b411ec7139d/ios/RNSScreenStack.m -o RNSScreenStack.m
curl https://raw.githubusercontent.com/software-mansion/react-native-screens/563d3c05a9eb43a56fb143cec30a4b411ec7139d/ios/RNSScreenStackHeaderConfig.m -o RNSScreenStackHeaderConfig.m

# TODO: create a proper PR to react-native-screens
sed -i '' -e '128s/$/  [navbar setLayoutMargins:UIEdgeInsetsMake(navbar.layoutMargins.top, 16, navbar.layoutMargins.bottom, 16)];\
/' RNSScreenStackHeaderConfig.m

sed -n 120,130p RNSScreenStackHeaderConfig.m

mv RNSScreenStack.m node_modules/react-native-screens/ios
mv RNSScreenStackHeaderConfig.m node_modules/react-native-screens/ios