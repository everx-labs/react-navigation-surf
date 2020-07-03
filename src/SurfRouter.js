// @flow strict-local
import {nanoid} from 'nanoid/non-secure';
import {BaseRouter, StackRouter, TabRouter} from '@react-navigation/native';

export const SurfSplitActions = {
  setSplitted(isSplitted: boolean, initialRouteName: string) {
    return {type: 'SET_SPLITTED', isSplitted, initialRouteName};
  },
};

export function SurfSplitRouter(options) {
  const tabRouter = TabRouter(options);
  const stackRouter = StackRouter(options);
  let isSplitted = options.isSplitted;
  let isInitialized = false;
  let initialRouteName = options.initialRouteName;
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

    getStateAfterSplitting(state) {
      if (isSplitted) {
        const routeName = state.routeNames[state.index];
        if (routeName === 'main') {
          let routeIndex;
          if (initialRouteName) {
            routeIndex = state.routeNames.indexOf(initialRouteName);
          } else {
            routeIndex = state.index + 1;
          }
          state.index = routeIndex;
        }

        return state;
      }
      const mainRoute = state.routes.find(({name}) => name === 'main');
      if (!mainRoute) {
        state.index = state.index + 1;
        state.routes = [{name: 'main', key: `main-${nanoid()}`}].concat(
          state.routes,
        );
      }
      return state;
    },

    getRehydratedState(...args) {
      let newState;

      if (isSplitted) {
        newState = tabRouter.getRehydratedState(...args);
      } else {
        newState = stackRouter.getRehydratedState(...args);
      }

      newState = this.getStateAfterSplitting(newState);

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
        state.stale = true;

        if (action.initialRouteName) {
          initialRouteName = action.initialRouteName;
        }

        state.routes = state.routes.slice(0, state.index);
        const newState = this.getRehydratedState(state, {
          routeNames: state.routeNames,
          routeParamList: {},
        });
        return newState;
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
