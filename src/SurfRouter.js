// @flow strict-local
import { nanoid } from 'nanoid/non-secure';
import { BaseRouter, StackRouter, TabRouter } from '@react-navigation/native';
import type {
    RouterFactory,
    NavigationState,
    GenericNavigationAction,
    TabRouterOptions,
} from '@react-navigation/native';

const SURF_ACTION_TYPES = {
    SET_SPLITTED: 'SET_SPLITTED',
};

export const SurfSplitActions = {
    setSplitted(isSplitted: boolean, initialRouteName: string) {
        return {
            type: SURF_ACTION_TYPES.SET_SPLITTED,
            isSplitted,
            initialRouteName,
        };
    },
};

const MAIN_SCREEN_NAME = 'main';

type SurfRouterOptions = {|
    ...TabRouterOptions,
    isSplitted: boolean,
|};

const stackStateToTab = (state, options: SurfRouterOptions) => {
    let { index } = state;

    const currentRoute = state.routes[index];
    if (currentRoute.name !== MAIN_SCREEN_NAME) {
        index = state.routeNames.indexOf(currentRoute.name);
    } else if (options.initialRouteName != null) {
        index = state.routeNames.indexOf(options.initialRouteName);
    }

    const routes = state.routeNames.map(name => {
        return (
            state.routes.find(({ name: routeName }) => routeName === name) || {
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

const tabStateToStack = state => {
    let { index } = state;
    const mainRoute = state.routes.find(
        ({ name }) => name === MAIN_SCREEN_NAME,
    ) || {
        name: MAIN_SCREEN_NAME,
        key: `${MAIN_SCREEN_NAME}-${nanoid()}`,
    };
    let routes;
    const currentRoute = state.routes[index];
    if (currentRoute.name === MAIN_SCREEN_NAME) {
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

export const SurfSplitRouter: RouterFactory<
    NavigationState,
    GenericNavigationAction,
    SurfRouterOptions,
> = routerOptions => {
    // eslint-disable-next-line prefer-const
    let { isSplitted, initialRouteName, ...tabOptions } = routerOptions;
    const { backBehavior, ...stackOptions } = tabOptions;
    const tabRouter = TabRouter({
        ...tabOptions,
        initialRouteName,
    });
    const stackRouter = StackRouter({
        ...stackOptions,
        initialRouteName: MAIN_SCREEN_NAME,
    });
    let isInitialized = false;
    const router = {
        // $FlowExpectedError
        ...BaseRouter,

        // Every router in react-navigation should have a type
        // And it should be consistent between re-renders
        // Or library will try to re-initialize the state
        // with every re-render
        type: 'surf',

        ensureTabState(newState, params) {
            // Move from "main" route in splitted version
            const currentRouteName = newState.routeNames[newState.index];
            if (currentRouteName === MAIN_SCREEN_NAME) {
                if (initialRouteName != null) {
                    newState.index = newState.routeNames.indexOf(
                        routerOptions.initialRouteName,
                    );
                } else {
                    newState.index += 1;
                }
            }

            return newState;
        },

        ensureStackState(newState, params) {
            const mainRoute = newState.routes.find(
                ({ name }) => name === MAIN_SCREEN_NAME,
            ) || {
                name: MAIN_SCREEN_NAME,
                key: `${MAIN_SCREEN_NAME}-${nanoid()}`,
            };
            const currentRoute = newState.routes[newState.index];
            if (currentRoute.name === MAIN_SCREEN_NAME) {
                newState.index = 0;
                newState.routes = [mainRoute];
            } else {
                newState.index = 1;
                newState.routes = [mainRoute, currentRoute];
            }

            return newState;
        },

        getInitialState(params) {
            let newState;

            if (isSplitted) {
                newState = tabRouter.getInitialState(params);
                newState = this.ensureTabState(newState, params);
            } else {
                newState = stackRouter.getInitialState(params);
                newState = this.ensureStackState(newState, params);
            }

            Object.assign(newState, { type: router.type });
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
                newState = this.ensureTabState(newState, params);
            } else {
                newState = stackRouter.getRehydratedState(state, params);
                newState = this.ensureStackState(newState, params);
            }

            Object.assign(newState, { type: router.type });
            return newState;
        },

        getStateForRouteNamesChange(...args) {
            const newState = isSplitted
                ? tabRouter.getStateForRouteNamesChange(...args)
                : stackRouter.getStateForRouteNamesChange(...args);

            Object.assign(newState, { type: router.type });
            return newState;
        },

        getStateForRouteFocus(...args) {
            const newState = isSplitted
                ? tabRouter.getStateForRouteFocus(...args)
                : stackRouter.getStateForRouteFocus(...args);

            Object.assign(newState, { type: router.type });
            return newState;
        },

        getStateForAction(state, action, options) {
            let newState;
            if (action.type === SURF_ACTION_TYPES.SET_SPLITTED) {
                isSplitted = action.isSplitted;
                if (!isInitialized) {
                    isInitialized = true;
                    return state;
                }

                if (action.initialRouteName) {
                    initialRouteName = action.initialRouteName;
                }

                if (isSplitted) {
                    newState = stackStateToTab(state, routerOptions);
                } else {
                    newState = tabStateToStack(state);
                }
            } else {
                newState = isSplitted
                    ? tabRouter.getStateForAction(state, action, options)
                    : stackRouter.getStateForAction(state, action, options);
            }

            // $FlowFixMe
            Object.assign(newState, { type: router.type });
            return newState;
        },

        shouldActionChangeFocus(action) {
            return tabRouter.shouldActionChangeFocus(action);
        },
    };

    return router;
};
