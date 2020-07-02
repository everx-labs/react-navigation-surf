// @flow strict-local
import {nanoid} from 'nanoid/non-secure';
import {BaseRouter, StackRouter, TabRouter} from '@react-navigation/native';

let isSplitted = true;
export const setIsSplitted = s => {
  isSplitted = s;
};

export function SurfRouter(options) {
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
      return isSplitted
        ? tabRouter.getRehydratedState(...args)
        : stackRouter.getRehydratedState(...args);
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
