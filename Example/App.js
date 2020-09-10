/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import 'react-native-gesture-handler';
import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    Button,
    SafeAreaView,
    TextInput,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useReduxDevToolsExtension } from '@react-navigation/devtools';
import { createSurfSplitNavigator } from 'react-navigation-surf';
import { enableScreens } from 'react-native-screens';
import { createNativeStackNavigator } from 'react-native-screens/native-stack';

enableScreens();

const SurfSplit = createSurfSplitNavigator();

const Main = ({ navigation }) => (
    <SafeAreaView>
        <Text style={styles.title}>Main</Text>
        <Button onPress={() => navigation.navigate('first')} title="Go to 1" />
        <Button onPress={() => navigation.navigate('second')} title="Go to 2" />
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

const Detail1Stack = createNativeStackNavigator();
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
        <>
            <NavigationContainer ref={navRef} linking={{ prefixes: ['/'] }}>
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
        </>
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
    modalWrapper: {
        flex: 1,
        paddingHorizontal: '20%',
        paddingVertical: '5%',
        backgroundColor: 'rgba(0,0,0,.1)',
    },
    modal: {
        flex: 1,
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
    },
});

export default App;
