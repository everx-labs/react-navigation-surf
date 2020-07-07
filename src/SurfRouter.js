// @flow strict-local
import {nanoid} from 'nanoid/non-secure';
import {BaseRouter, StackRouter, TabRouter} from '@react-navigation/native';

export const SurfSplitActions = {
  setSplitted(isSplitted: boolean, initialRouteName: string) {
    return {type: 'SET_SPLITTED', isSplitted, initialRouteName};
  },
};

const stackStateToTab = (state, options) => {
  let {index} = state;

  const currentRoute = state.routes[index];
  if (currentRoute.name !== 'main') {
    index = state.routeNames.indexOf(currentRoute.name);
  } else if (options.initialRouteName) {
    index = state.routeNames.indexOf(options.initialRouteName);
  }

  const routes = state.routeNames.map(name => {
    return (
      state.routes.find(({name: routeName}) => routeName === name) || {
        name,
        key: `${name}-${nanoid()}`,
      }
    );
  });

  return {
    ...state,
    index,
    routes,
    history: [],
  };
};

const tabStateToStack = (state, options) => {
  let {index} = state;
  const mainRoute = state.routes.find(({name}) => name === 'main') || {
    name: 'main',
    key: `main-${nanoid()}`,
  };
  let routes;
  const currentRoute = state.routes[index];
  if (currentRoute.name === 'main') {
    index = 0;
    routes = [mainRoute];
  } else {
    index = 1;
    routes = [mainRoute, currentRoute];
  }
  return {
    ...state,
    index,
    routes,
  };
};

export function SurfSplitRouter(routerOptions) {
  const tabRouter = TabRouter(routerOptions);
  const stackRouter = StackRouter(routerOptions);
  let isSplitted = routerOptions.isSplitted;
  let isInitialized = false;
  let initialRouteName = routerOptions.initialRouteName;
  const router = {
    ...BaseRouter,

    type: 'surf',

    getInitialState(...args) {
      const newState = isSplitted
        ? tabRouter.getInitialState(...args)
        : stackRouter.getInitialState(...args);

      Object.assign(newState, {type: router.type});
      return newState;
    },

    getRehydratedState(state, params) {
      const isStale = state.stale;
      let newState;

      if (isStale === false) {
        return state;
      }

      if (isSplitted) {
        newState = tabRouter.getRehydratedState(state, params);

        // Move from "main" route in splitted version
        const currentRouteName = newState.routeNames[newState.index];
        if (currentRouteName === 'main') {
          if (routerOptions.initialRouteName) {
            newState.index = newState.routeNames.indexOf(
              routerOptions.initialRouteName,
            );
          } else {
            newState.index = newState.index + 1;
          }
        }
      } else {
        newState = stackRouter.getRehydratedState(state, params);

        const mainRoute = newState.routes.find(({name}) => name === 'main') || {
          name: 'main',
          key: `main-${nanoid()}`,
        };
        const currentRoute = newState.routes[newState.index];
        if (currentRoute.name === 'main') {
          newState.index = 0;
          newState.routes = [mainRoute];
        } else {
          newState.index = 1;
          newState.routes = [mainRoute, currentRoute];
        }
      }

      Object.assign(newState, {type: router.type});
      return newState;
    },

    getStateForRouteNamesChange(...args) {
      const newState = isSplitted
        ? tabRouter.getStateForRouteNamesChange(...args)
        : stackRouter.getStateForRouteNamesChange(...args);

      Object.assign(newState, {type: router.type});
      return newState;
    },

    getStateForRouteFocus(...args) {
      const newState = isSplitted
        ? tabRouter.getStateForRouteFocus(...args)
        : stackRouter.getStateForRouteFocus(...args);

      Object.assign(newState, {type: router.type});
      return newState;
    },

    getStateForAction(state, action, options) {
      if (action.type === 'SET_SPLITTED') {
        isSplitted = action.isSplitted;
        if (!isInitialized) {
          isInitialized = true;
          return state;
        }

        if (action.initialRouteName) {
          initialRouteName = action.initialRouteName;
        }

        if (isSplitted) {
          return stackStateToTab(state, routerOptions);
        }
        return tabStateToStack(state, routerOptions);
      }

      const newState = isSplitted
        ? tabRouter.getStateForAction(state, action, options)
        : stackRouter.getStateForAction(state, action, options);

      Object.assign(newState, {type: router.type});
      return newState;
    },

    shouldActionChangeFocus(action) {
      return tabRouter.shouldActionChangeFocus(action);
    },
  };

  return router;
}
