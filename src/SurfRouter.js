// @flow strict-local
import {nanoid} from 'nanoid/non-secure';
import {BaseRouter, StackRouter, TabRouter} from '@react-navigation/native';

let isSplitted = true;
export const setIsSplitted = s => {
  isSplitted = s;
};

export function SurfSplitRouter(options) {
  const tabRouter = TabRouter(options);
  const stackRouter = StackRouter(options);
  const router = {
    ...BaseRouter,

    get type() {
      return isSplitted ? tabRouter.type : stackRouter.type;
    },

    getInitialState(...args) {
      return isSplitted
        ? tabRouter.getInitialState(...args)
        : stackRouter.getInitialState(...args);
    },

    getRehydratedState(...args) {
      if (isSplitted) {
        return tabRouter.getRehydratedState(...args);
      }
      const stackState = stackRouter.getRehydratedState(...args);
      const mainRoute = stackState.routes.find(({name}) => name === 'main');
      if (!mainRoute) {
        stackState.index = stackState.index + 1;
        stackState.routes = [{name: 'main', key: `main-${nanoid()}`}].concat(
          stackState.routes,
        );
      }
      return stackState;
    },

    getStateForRouteNamesChange(...args) {
      return isSplitted
        ? tabRouter.getStateForRouteNamesChange(...args)
        : stackRouter.getStateForRouteNamesChange(...args);
    },

    getStateForRouteFocus(...args) {
      return isSplitted
        ? tabRouter.getStateForRouteFocus(...args)
        : stackRouter.getStateForRouteFocus(...args);
    },

    getStateForAction(...args) {
      return isSplitted
        ? tabRouter.getStateForAction(...args)
        : stackRouter.getStateForAction(...args);
    },

    shouldActionChangeFocus(action) {
      return tabRouter.shouldActionChangeFocus(action);
    },
  };

  return router;
}
