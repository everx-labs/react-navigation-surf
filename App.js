/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import 'react-native-gesture-handler';
import React from 'react';
import {StyleSheet, View, Text, Button} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {useReduxDevToolsExtension} from '@react-navigation/devtools';

import {createSurfSplitNavigator} from './src/createSurfNavigator';

const SurfSplit = createSurfSplitNavigator();

const Main = ({navigation}) => (
  <View>
    <Text style={styles.title}>Main</Text>
    <Button onPress={() => navigation.navigate('first')} title="Go to 1" />
    <Button onPress={() => navigation.navigate('second')} title="Go to 2" />
  </View>
);

const Detail1Foo = ({navigation}) => (
  <View>
    <Text style={styles.title}>Detail 1 - foo</Text>
    <Button onPress={() => navigation.push('bar')} title="Go to bar" />
  </View>
);

const Detail1Bar = ({navigation}) => (
  <View>
    <Text style={styles.title}>Detail 1 - bar</Text>
    <Button onPress={() => navigation.push('foo')} title="Go to foo" />
  </View>
);

const Detail1Stack = createStackNavigator();
const Detail1 = () => (
  <Detail1Stack.Navigator initialRouteName="foo">
    <Detail1Stack.Screen name="foo" component={Detail1Foo} />
    <Detail1Stack.Screen name="bar" component={Detail1Bar} />
  </Detail1Stack.Navigator>
);

const Detail2 = () => <Text style={styles.title}>Detail 2</Text>;

const App: () => React$Node = () => {
  const navRef = React.useRef();
  useReduxDevToolsExtension(navRef);

  return (
    <NavigationContainer ref={navRef} linking={['/']}>
      <SurfSplit.Navigator initialRouteName="first">
        <SurfSplit.Screen name="main" component={Main} />
        <SurfSplit.Screen name="first" component={Detail1} />
        <SurfSplit.Screen name="second" component={Detail2} />
      </SurfSplit.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default App;
