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

import {SurfSplitRouter, setIsSplitted} from './SurfRouter';

const tabStateToStackOne = ({history, ...rest}) => {
  const {index} = rest;
  const routes = [rest.routes[0]];
  return {
    ...rest,
    type: 'stack',
    routes: index > 0 ? routes.concat(rest.routes[index]) : routes,
  };
};

const getIsSplitted = ({width}) => width > 600;

export const SurfSplitNavigator = ({
  children,
  initialRouteName,
  screenOptions,
}) => {
  const dimensions = useWindowDimensions();
  const isSplitted = getIsSplitted(dimensions);
  setIsSplitted(isSplitted);

  let mainScreen;

  const {state, navigation, descriptors} = useNavigationBuilder(
    SurfSplitRouter,
    {
      children: isSplitted
        ? React.Children.toArray(children).filter(child => {
            if (child.props.name !== 'main') {
              return true;
            }
            mainScreen = child.props.component;
            return false;
          })
        : children,
      initialRouteName: isSplitted ? initialRouteName : 'main',
      screenOptions: {
        ...screenOptions,
        headerShown: false,
      },
    },
  );

  const loadedRef = React.useRef([]);

  React.useEffect(() => {
    if (!loadedRef.current.includes(state.index)) {
      loadedRef.current = [...loadedRef.current, state.index];
    }
  }, [state]);

  if (isSplitted) {
    const MainScreen = mainScreen;
    return (
      <NavigationHelpersContext.Provider>
        <View style={styles.body}>
          <View style={styles.main}>
            <MainScreen navigation={navigation} />
          </View>
          <View style={styles.detail}>
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
      state={state}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
