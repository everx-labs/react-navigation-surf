// @flow
import * as React from 'react';
// $FlowExpectedError (can't find nanoid for some reason)
import { nanoid } from 'nanoid/non-secure';
import { BaseRouter } from '@react-navigation/native';
import type {
    RouterFactory,
    GenericNavigationAction,
    LeafRoute,
} from '@react-navigation/native';
import sortBy from 'lodash/sortBy';

type ModalScreenProps = {
    name: string,
    defaultProps: { [prop: string]: any },
};

const getModalConfigsFromChildren = (
    children: React.ChildrenArray<React$Element<any>>,
): ModalScreenProps[] => {
    const configs = React.Children.toArray(children).reduce((acc, child) => {
        if (React.isValidElement(child)) {
            if (child.props.name != null) {
                acc.push({
                    name: child.props.name,
                    defaultProps: child.props.options?.defaultProps,
                });
                return acc;
            }

            if (child.type === React.Fragment) {
                acc.push(...getModalConfigsFromChildren(child.props.children));
                return acc;
            }

            throw new Error(
                `A modal navigator can only contain 'Screen' component as its direct children (found '${
                    child.type && child.type.name
                        ? child.type.name
                        : String(child)
                }')`,
            );
        }
        return acc;
    }, []);

    return configs;
};

const MODAL_ACTION_TYPES = {
    JUMP_TO: 'JUMP_TO',
    NAVIGATE: 'NAVIGATE',
    SHOW: 'SHOW',
    HIDE: 'HIDE',
    HIDE_ALL: 'HIDE_ALL',
    GO_BACK: 'GO_BACK',
};

export const SurfModalActions = {
    show(name: string, params?: { +[key: string]: mixed }) {
        return {
            type: MODAL_ACTION_TYPES.SHOW,
            payload: {
                name,
                params,
            },
        };
    },
    hide(name: string) {
        return {
            type: MODAL_ACTION_TYPES.HIDE,
            payload: {
                name,
            },
        };
    },
    hideAll() {
        return {
            type: MODAL_ACTION_TYPES.HIDE_ALL,
        };
    },
};

type SurfModalRouterOptions = {
    initialRouteName?: string,
    childrenForConfigs: React.ChildrenArray<React$Element<any>>,
};

export type SurfModalNavigationState = {|
    +stale: false,
    +type: string,
    +key: string,
    +routeNames: $ReadOnlyArray<string>,
    +routes: $ReadOnlyArray<LeafRoute<> & { order: number }>,
    +index: number,
|};

const getRouteWithHighestOrder = (
    routes: $ReadOnlyArray<LeafRoute<> & { order: number }>,
) =>
    routes.reduce((acc, route) => {
        if (route.order > acc.order) {
            return route;
        }
        return acc;
    });

export const SurfModalRouter: RouterFactory<
    SurfModalNavigationState,
    GenericNavigationAction,
    SurfModalRouterOptions,
> = routerOptions => {
    const configs = getModalConfigsFromChildren(
        routerOptions.childrenForConfigs,
    );
    let orderCounter = 0;
    const router = {
        // $FlowExpectedError
        ...BaseRouter,

        type: 'surf-modals',

        getInitialState({ routeNames, routeParamList }) {
            const routes = routeNames.map(name => ({
                name,
                key: `${name}-${nanoid()}`,
                params: routeParamList[name],
                order: 0,
            }));

            return {
                stale: false,
                type: router.type,
                key: `${router.type}-${nanoid()}`,
                routeNames,
                routes,
                index: 0,
            };
        },

        getRehydratedState(partialState, { routeNames, routeParamList }) {
            const state = partialState;

            if (state.stale === false) {
                return state;
            }

            const routes = routeNames.map(name => {
                const route = state.routes.find(r => r.name === name);

                let params;

                if (routeParamList[name] !== undefined) {
                    params = {
                        ...routeParamList[name],
                        ...(route ? route.params : undefined),
                    };
                } else if (route) {
                    ({ params } = route);
                }

                return {
                    ...route,
                    name,
                    key:
                        route && route.name === name && route.key
                            ? route.key
                            : `${name}-${nanoid()}`,
                    params,
                    order: 0,
                };
            });

            return {
                stale: false,
                type: router.type,
                key: `${router.type}-${nanoid()}`,
                routeNames,
                routes,
                index: 0,
            };
        },

        getStateForRouteNamesChange(state, { routeNames, routeParamList }) {
            const routes = routeNames.map(
                name =>
                    state.routes.find(r => r.name === name) || {
                        name,
                        key: `${name}-${nanoid()}`,
                        params: routeParamList[name],
                        order: 0,
                    },
            );

            const activeRoute = state.routes.reduce((acc, route) => {
                if (route.order > acc.order) {
                    return route;
                }
                return acc;
            });

            let index = 0;

            if (activeRoute) {
                index = routes.findIndex(
                    route => route.name === activeRoute.name,
                );
            }

            return {
                ...state,
                routeNames,
                routes,
                index: index === -1 ? 0 : index,
            };
        },

        getStateForRouteFocus(state, key) {
            const index = state.routes.findIndex(r => r.key === key);

            if (index === -1 || index === state.index) {
                return state;
            }

            return {
                ...state,
                index,
            };
        },

        getStateForAction(state, action) {
            switch (action.type) {
                case MODAL_ACTION_TYPES.JUMP_TO:
                case MODAL_ACTION_TYPES.NAVIGATE:
                case MODAL_ACTION_TYPES.SHOW: {
                    let modalRouteIndex;

                    if (action.type === 'NAVIGATE' && action.payload.key) {
                        modalRouteIndex = state.routes.findIndex(
                            route => route.key === action.payload.key,
                        );
                    } else {
                        modalRouteIndex = state.routes.findIndex(
                            route => route.name === action.payload.name,
                        );
                    }

                    if (modalRouteIndex === -1) {
                        return null;
                    }

                    const modalRoute = state.routes[modalRouteIndex];
                    const modalRouteConfig = configs.find(
                        c => c.name === modalRoute.name,
                    );

                    const routes = sortBy(
                        state.routes.map((route, i) => {
                            let order = route.order ?? 0;
                            let params = {
                                ...route.params,
                                visible: order > 0,
                            };

                            if (modalRouteIndex === i) {
                                orderCounter += 1;
                                order = orderCounter;
                                params = Object.assign(
                                    modalRouteConfig?.defaultProps,
                                    action.payload.params,
                                    { visible: true },
                                );
                            }

                            return {
                                ...route,
                                params,
                                order,
                            };
                        }),
                        'order',
                    );

                    return {
                        ...state,
                        routes,
                        index: routes.findIndex(
                            route => route.key === modalRoute.key,
                        ),
                    };
                }

                case MODAL_ACTION_TYPES.HIDE: {
                    const activeRouteIndex = state.routes.findIndex(
                        route => route.name === action.payload.name,
                    );

                    if (activeRouteIndex === -1) {
                        return null;
                    }

                    const activeRoute = state.routes[activeRouteIndex];
                    const routes = state.routes.map(route => {
                        if (route.key === activeRoute.key) {
                            return {
                                ...route,
                                order: 0,
                                params: {
                                    ...route.params,
                                    visible: false,
                                },
                            };
                        }
                        return route;
                    });

                    const newActiveModalRoute = getRouteWithHighestOrder(
                        routes,
                    );
                    const newIndex =
                        newActiveModalRoute != null
                            ? state.routes.findIndex(
                                  r => r.name === newActiveModalRoute.name,
                              )
                            : 0;

                    return {
                        ...state,
                        routes,
                        index: newIndex,
                    };
                }

                case MODAL_ACTION_TYPES.HIDE_ALL: {
                    const routes = state.routes.map(route => ({
                        ...route,
                        params: {
                            ...route.params,
                            visible: false,
                        },
                    }));

                    return {
                        ...state,
                        routes,
                        index: 0,
                    };
                }

                case MODAL_ACTION_TYPES.GO_BACK: {
                    const activeRoute = getRouteWithHighestOrder(state.routes);

                    if (activeRoute == null) {
                        return null;
                    }

                    const routes = state.routes.map(route => {
                        if (route.key === activeRoute.key) {
                            return {
                                ...route,
                                order: 0,
                                params: {
                                    ...route,
                                    visible: false,
                                },
                            };
                        }
                        return route;
                    });

                    const newActiveModalRoute = getRouteWithHighestOrder(
                        routes,
                    );
                    const newIndex =
                        newActiveModalRoute != null
                            ? state.routes.findIndex(
                                  r => r.name === newActiveModalRoute.name,
                              )
                            : 0;

                    return {
                        ...state,
                        routes,
                        index: newIndex,
                    };
                }

                default:
                    // $FlowExpectedError
                    return BaseRouter.getStateForAction(state, action);
            }
        },

        shouldActionChangeFocus(action) {
            return action.type === 'NAVIGATE' || action.type === 'SHOW';
        },

        actionCreators: SurfModalActions,
    };
    return router;
};
