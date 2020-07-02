// @flow strict-local
import {nanoid} from 'nanoid/non-secure';
import {BaseRouter} from '@react-navigation/native';

type Route<RouteName: string> = {
  key: string,
  name: RouteName,
  params?: Object,
};

type NavigationState = {
  key: string,
  index: number,
  stale: false,
  routeNames: string[],
  routes: (Route<string> & {
    state?: NavigationState | $Shape<NavigationState>,
  })[],
};

type SurfNavigationState = NavigationState & {
  type: 'surf',
  // history: {type: 'route', key: string}[],
};

type SurfActionType = {
  type: 'JUMP_TO',
  payload: {name: string, params?: Object},
  source?: string,
  target?: string,
};

export function SurfRouter({initialRouteName, backBehavior = 'history'}) {
  const router = {
    ...BaseRouter,

    type: 'surf',

    getInitialState({routeNames, routeParamList}) {
      const index =
        initialRouteName !== undefined && routeNames.includes(initialRouteName)
          ? routeNames.indexOf(initialRouteName)
          : 0;

      const routes = routeNames.map(name => ({
        name,
        key: `${name}-${nanoid()}`,
        params: routeParamList[name],
      }));

      return {
        key: `surf-${nanoid()}`,
        type: 'surf',
        stale: false,
        index,
        routeNames,
        routes,
      };
    },

    getRehydratedState(partialState, {routeNames, routeParamList}) {
      return partialState;
    },

    getStateForRouteNamesChange(state, {routeNames, routeParamList}) {
      // TODO
    },

    getStateForRouteFocus(state, key) {
      // TODO
    },

    getStateForAction(
      state: SurfNavigationState,
      action: SurfActionType,
    ): ?SurfNavigationState {
      switch (action.type) {
        case 'JUMP_TO':
        case 'NAVIGATE': {
          let index = -1;

          if (action.type === 'NAVIGATE' && action.payload.key) {
            index = state.routes.findIndex(
              route => route.key === action.payload.key,
            );
          } else {
            index = state.routes.findIndex(
              route => route.name === action.payload.name,
            );
          }

          if (index === -1) {
            return null;
          }

          return {
            ...state,
            index,
            routes:
              action.payload.params == null
                ? state.routes
                : state.routes.map((route, i) =>
                    i === index
                      ? {
                          ...route,
                          params: {...route.params, ...action.payload.params},
                        }
                      : route,
                  ),
          };
        }
        default:
          return BaseRouter.getStateForAction(state, action);
      }
    },
  };

  return router;
}
