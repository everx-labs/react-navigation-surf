// @flow strict-local
import * as React from 'react';
import {
    useWindowDimensions as useWindowDimensionsNative,
    StyleSheet,
    View,
    Dimensions,
} from 'react-native';
import type { ViewStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';
import {
    NavigationHelpersContext,
    useNavigationBuilder,
    createNavigatorFactory,
} from '@react-navigation/native';
import { StackView } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// $FlowExpectedError
import ResourceSavingScene from '@react-navigation/bottom-tabs/lib/module/views/ResourceSavingScene';

import { SurfSplitRouter, SurfSplitActions } from './SurfSplitRouter';

const getIsSplitted = ({ width }, mainWidth) => width > mainWidth;

const useWindowDimensions =
    useWindowDimensionsNative ||
    function useWindowDimensionsFallback() {
        const [dimensions, setDimensions] = React.useState(() =>
            Dimensions.get('window'),
        );

        React.useEffect(() => {
            function handleChange({ window }) {
                if (
                    dimensions.width !== window.width ||
                    dimensions.height !== window.height ||
                    dimensions.scale !== window.scale ||
                    dimensions.fontScale !== window.fontScale
                ) {
                    setDimensions(window);
                }
            }
            Dimensions.addEventListener('change', handleChange);
            // We might have missed an update between calling `get` in render and
            // `addEventListener` in this handler, so we set it here. If there was
            // no change, React will filter out this update as a no-op.
            handleChange({ window: Dimensions.get('window') });
            return () => {
                Dimensions.removeEventListener('change', handleChange);
            };
        }, [dimensions]);

        return dimensions;
    };

type SurfSplitNavigatorProps = {|
    +children?: React.Node,
    initialRouteName: string,
    mainWidth: number,
    screenOptions: {
        splitStyles?: {|
            body?: ViewStyleProp,
            main?: ViewStyleProp,
            detail?: ViewStyleProp,
        |},
        headerShown?: boolean,
        ...
    },
|};

export const SurfSplitNavigator = ({
    children,
    initialRouteName,
    mainWidth,
    screenOptions,
}: SurfSplitNavigatorProps) => {
    const dimensions = useWindowDimensions();
    const isSplitted = getIsSplitted(dimensions, mainWidth);

    const {
        splitStyles: splitStylesFromOptions,
        headerShown,
        ...restScreenOptions
    } = screenOptions || {};
    const splitStyles = splitStylesFromOptions || {
        body: styles.body,
        main: styles.main,
        detail: styles.detail,
    };
    const { state, navigation, descriptors } = useNavigationBuilder(
        SurfSplitRouter,
        {
            children,
            initialRouteName,
            screenOptions: {
                ...restScreenOptions,
                headerShown: false,
            },
            isSplitted,
        },
    );

    React.useEffect(() => {
        navigation.dispatch(
            SurfSplitActions.setSplitted(
                isSplitted,
                isSplitted ? initialRouteName : 'main',
            ),
        );
    }, [isSplitted]);

    const loadedRef = React.useRef([]);

    React.useEffect(() => {
        if (!loadedRef.current.includes(state.index)) {
            loadedRef.current = [...loadedRef.current, state.index];
        }
    }, [state]);

    if (isSplitted) {
        const mainRoute = state.routes.find(({ name }) => name === 'main');
        if (mainRoute == null) {
            throw new Error(`You should provide ${'main'} screen!`);
        }
        return (
            <NavigationHelpersContext.Provider value={navigation}>
                <SafeAreaProvider>
                    <View style={splitStyles.body}>
                        <View style={splitStyles.main}>
                            {descriptors[mainRoute.key].render()}
                        </View>
                        <View style={splitStyles.detail}>
                            {state.routes.map((route, index) => {
                                const descriptor = descriptors[route.key];
                                const isFocused = state.index === index;

                                if (
                                    !isSplitted &&
                                    !loadedRef.current.includes(index)
                                ) {
                                    return null;
                                }

                                return (
                                    <ResourceSavingScene
                                        key={route.key}
                                        style={StyleSheet.absoluteFill}
                                        isVisible={isFocused}
                                    >
                                        {descriptor.render()}
                                    </ResourceSavingScene>
                                );
                            })}
                        </View>
                    </View>
                </SafeAreaProvider>
            </NavigationHelpersContext.Provider>
        );
    }
    return (
        // $FlowExpectedError
        <StackView
            headerMode="none"
            state={state}
            navigation={navigation}
            descriptors={descriptors}
        />
    );
};

// $FlowFixMe
export const createSurfSplitNavigator = createNavigatorFactory(
    // $FlowFixMe
    SurfSplitNavigator,
);

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
});
