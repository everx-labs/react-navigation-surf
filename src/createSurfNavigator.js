// @flow strict-local
import * as React from 'react';
import {
  useWindowDimensions,
  StyleSheet,
  View,
  Text,
  Dimensions,
} from 'react-native';
import {
  NavigationHelpersContext,
  useNavigationBuilder,
  createNavigatorFactory,
  TabRouter,
} from '@react-navigation/native';
import {StackView} from '@react-navigation/stack';
import ResourceSavingScene from '@react-navigation/bottom-tabs/lib/module/views/ResourceSavingScene';

import {SurfSplitRouter, SurfSplitActions} from './SurfRouter';

const getIsSplitted = ({width}, mainWidth) => width > mainWidth;

export const SurfSplitNavigator = ({
  children,
  initialRouteName,
  screenOptions,
  mainWidth,
}) => {
  const dimensions = useWindowDimensions();
  const isSplitted = getIsSplitted(dimensions, mainWidth);

  const {splitStyles, headerShown, ...restScreenOptions} = screenOptions || {
    splitStyles: {
      body: styles.body,
      main: styles.main,
      detail: styles.detail,
    },
  };
  const {state, navigation, descriptors} = useNavigationBuilder(
    SurfSplitRouter,
    {
      children,
      initialRouteName: initialRouteName,
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
    const mainRoute = state.routes.find(({name}) => name === 'main');
    return (
      <NavigationHelpersContext.Provider>
        <View style={splitStyles.body}>
          <View style={splitStyles.main}>
            {descriptors[mainRoute.key].render()}
          </View>
          <View style={splitStyles.detail}>
            {state.routes.map((route, index) => {
              const descriptor = descriptors[route.key];
              const isFocused = state.index === index;

              if (!isSplitted && !loadedRef.current.includes(index)) {
                return null;
              }

              return (
                <ResourceSavingScene
                  key={route.key}
                  style={StyleSheet.absoluteFill}
                  isVisible={isFocused}>
                  {descriptor.render()}
                </ResourceSavingScene>
              );
            })}
          </View>
        </View>
      </NavigationHelpersContext.Provider>
    );
  }
  return (
    <StackView
      state={{...state, type: 'stack'}}
      navigation={navigation}
      descriptors={descriptors}
    />
  );
};

export const createSurfSplitNavigator = createNavigatorFactory(
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
