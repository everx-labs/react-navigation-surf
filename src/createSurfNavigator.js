// @flow strict-local

import * as React from 'react';
import {useWindowDimensions, StyleSheet, View, Text} from 'react-native';
import {Screen} from '@react-navigation/native';
// import NavigationStateContext from '@react-navigation/core/NavigationStateContext';
// import NavigationRouteContext from '@react-navigation/core/NavigationRouteContext';
// import useRegisterNavigator from '@react-navigation/core/useRegisterNavigator';

const getStackRouteConfigFromChildren = (children: React.ReactNode) => {
  return React.Children.toArray(children).reduce((acc, child) => {
    if (React.isValidElement(child)) {
      if (child.type === Screen) {
        acc.push(child.props);
        return acc;
      }
      if (child.type === React.Fragment) {
        // When we encounter a fragment, we need to dive into its children to extract the configs
        // This is handy to conditionally define a group of screens
        acc.push(...getRouteConfigsFromChildren(child.props.children));
        return acc;
      }
    }

    throw new Error(
      `A navigator can only contain 'Screen' components as its direct children (found '${
        child.type && child.type.name ? child.type.name : String(child)
      }')`,
    );
  }, []);
};

class Section {}

const getRouteConfigsFromChildren = (children: React.ReactNode) => {
  return React.Children.toArray(children).reduce((acc, child) => {
    if (React.isValidElement(child)) {
      if (child.type === Section) {
        acc.push({
          name: child.props.name,
          config: getRouteConfigsFromChildren(child.props.children),
        });
        return acc;
      }
      if (child.type === React.Fragment) {
        // When we encounter a fragment, we need to dive into its children to extract the configs
        // This is handy to conditionally define a group of screens
        acc.push(...getRouteConfigsFromChildren(child.props.children));
        return acc;
      }
    }

    throw new Error(
      `A navigator can only contain 'Section' components as its direct children (found '${
        child.type && child.type.name ? child.type.name : String(child)
      }')`,
    );
  }, []);
};

// export default function useNavigationBuilder(createRouter, options) {
//   const navigatorKey = useRegisterNavigator();

//   const route = React.useContext(NavigationRouteContext);

//   const previousNestedParamsRef = React.useRef(route?.params);

//   React.useEffect(() => {
//     previousNestedParamsRef.current = route?.params;
//   }, [route]);

//   const {children, ...rest} = options;
// }

import {
  NavigationHelpersContext,
  useNavigationBuilder,
  createNavigatorFactory,
  TabRouter,
} from '@react-navigation/native';
import {StackView} from '@react-navigation/stack';

const tabStateToStackOne = state => ({
  type: 'tab',
  index: 0,
});

export const SurfNavigator = ({children, initialRouteName, screenOptions}) => {
  const {width: windowWidth} = useWindowDimensions();
  const isSplitted = windowWidth > 600;
  let mainScreen;

  const {state, navigation, descriptors} = useNavigationBuilder(TabRouter, {
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
    screenOptions,
  });

  if (isSplitted) {
    const MainScreen = mainScreen;
    return (
      <NavigationHelpersContext.Provider>
        <View style={styles.body}>
          <View style={styles.main}>
            <MainScreen navigation={navigation} />
          </View>
          <View style={styles.detail}>
            {descriptors[state.routes[state.index].key].render()}
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

export const createSurfNavigator = createNavigatorFactory(SurfNavigator);

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
    padding: 10,
  },
  detail: {
    backgroundColor: 'white',
    flex: 1,
    borderRadius: 5,
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
