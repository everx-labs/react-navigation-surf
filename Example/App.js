/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import 'react-native-gesture-handler';
import React from 'react';
import { StyleSheet, View, Text, Button, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useReduxDevToolsExtension } from '@react-navigation/devtools';

import { createSurfSplitNavigator } from 'react-navigation-surf';

const SurfSplit = createSurfSplitNavigator();

const Main = ({ navigation }) => (
    <SafeAreaView>
        <Text style={styles.title}>Main</Text>
        <Button onPress={() => navigation.navigate('first')} title="Go to 1" />
        <Button onPress={() => navigation.navigate('second')} title="Go to 2" />
        <Button
            onPress={() =>
                navigation.navigate('first', { params: { test: 'hello' } })
            }
            title="Go to first with params"
        />
    </SafeAreaView>
);

const Detail1Foo = ({ navigation }) => (
    <View>
        <Text style={styles.title}>Detail 1 - foo</Text>
        <Button onPress={() => navigation.push('bar')} title="Go to bar" />
    </View>
);

const Detail1Bar = ({ navigation }) => (
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

const Detail2 = () => (
    <SafeAreaView>
        <Text style={styles.title}>Detail 2</Text>
    </SafeAreaView>
);

const App: () => React$Node = () => {
    const navRef = React.useRef();
    useReduxDevToolsExtension(navRef);

    return (
        <NavigationContainer ref={navRef} linking={['/']}>
            <SurfSplit.Navigator
                initialRouteName="first"
                screenOptions={{
                    splitStyles: {
                        body: styles.body,
                        main: styles.main,
                        detail: styles.detail,
                    },
                }}
                mainWidth={900}
            >
                <SurfSplit.Screen name="main" component={Main} />
                <SurfSplit.Screen name="first" component={Detail1} />
                <SurfSplit.Screen name="second" component={Detail2} />
            </SurfSplit.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    body: {
        flex: 1,
        flexDirection: 'row',
        padding: 10,
    },
    main: {
        backgroundColor: 'white',
        minWidth: 300,
        marginRight: 10,
        borderRadius: 5,
    },
    detail: {
        backgroundColor: 'white',
        flex: 1,
        borderRadius: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
});

export default App;
