// @flow
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/state-in-constructor */
/* eslint-disable max-classes-per-file */
import * as React from 'react';
import { Keyboard } from 'react-native';
import {
    NavigationHelpersContext,
    useNavigationBuilder,
    createNavigatorFactory,
} from '@react-navigation/native';
import type {
    Descriptor,
    RouteProp,
    NavigationProp,
    ParamListBase,
    EventMapBase,
    ExtraNavigatorPropsBase,
} from '@react-navigation/native';

import { SurfModalRouter, SurfModalActions } from './SurfModalRouter';
import type { SurfModalNavigationState } from './SurfModalRouter';

type SurfModalControllerProps = {
    state: SurfModalNavigationState,
    descriptors: {| +[key: string]: Descriptor<empty, empty> |},
    navigation: NavigationProp<ParamListBase>,
};

export class SurfModalController extends React.Component<SurfModalControllerProps> {
    static instance: ?SurfModalController;

    static show<Params: { [key: string]: any }>(name: string, params?: Params) {
        if (SurfModalController.instance) {
            SurfModalController.instance.show(name, params);
        }
    }

    static hide(name: string) {
        if (SurfModalController.instance) {
            SurfModalController.instance.hide(name);
        }
    }

    static hideAll() {
        if (SurfModalController.instance) {
            SurfModalController.instance.hideAll();
        }
    }

    componentDidMount() {
        SurfModalController.instance = this;
    }

    componentWillUnmount() {
        SurfModalController.instance = null;
    }

    show<Params: { [key: string]: any }>(name: string, params?: Params) {
        Keyboard.dismiss();
        this.props.navigation.dispatch(SurfModalActions.show(name, params));
    }

    hide(name: string) {
        Keyboard.dismiss();
        this.props.navigation.dispatch(SurfModalActions.hide(name));
    }

    hideAll() {
        Keyboard.dismiss();
        this.props.navigation.dispatch(SurfModalActions.hideAll());
    }

    render() {
        return this.props.state.routes.map<React$Node>(route => {
            const descriptor = this.props.descriptors[route.key];

            if (descriptor == null) {
                return null;
            }

            return descriptor.render();
        });
    }
}

type ModalSceneWrapperProps = {
    navigation: NavigationProp<ParamListBase>,
    route: RouteProp<*, *>,
};

type ModalSceneWrapperState = {
    visible: boolean,
    needToHide: boolean,
    needToShow: boolean,
};

type ModalSceneInstance = {
    +show: <Params: { [key: string]: any }>(
        params: Params,
    ) => void | Promise<void>,
    +hide: () => void,
};

export const withModalSceneWrapper = (
    WrappedComponent: React.AbstractComponent<
        React.Config<ModalSceneWrapperProps, ModalSceneWrapperProps>,
        ModalSceneInstance,
    >,
) => {
    return class ModalSceneWrapper extends React.Component<
        ModalSceneWrapperProps,
        ModalSceneWrapperState,
    > {
        static getDerivedStateFromProps(
            props: ModalSceneWrapperProps,
            state: ModalSceneWrapperState,
        ) {
            const { visible } = props.route?.params || {};
            if (state.visible && !visible) {
                return {
                    needToShow: false,
                    needToHide: true,
                    visible: false,
                };
            }
            if (!state.visible && visible) {
                return {
                    needToHide: false,
                    needToShow: true,
                    visible: true,
                };
            }
            return {
                ...state,
                needToHide: false,
                needToShow: false,
            };
        }

        state = {
            visible: false,
            needToHide: false,
            needToShow: false,
        };

        ref = React.createRef<ModalSceneInstance>();

        componentDidMount() {
            if (this.state.needToShow && this.ref.current) {
                this.ref.current.show(this.props.route.params);
            }
            if (this.state.needToHide && this.ref.current) {
                this.ref.current.hide();
            }
        }

        componentDidUpdate() {
            if (this.state.needToShow && this.ref.current) {
                this.ref.current.show(this.props.route.params);
            }
            if (this.state.needToHide && this.ref.current) {
                this.ref.current.hide();
            }
        }

        render() {
            return (
                <WrappedComponent
                    ref={this.ref}
                    navigation={this.props.navigation}
                    route={this.props.route}
                />
            );
        }
    };
};

const ModalNavigator = ({
    children,
}: {
    children: React.ChildrenArray<any>,
}) => {
    const { state, navigation, descriptors } = useNavigationBuilder(
        SurfModalRouter,
        {
            children,
            childrenForConfigs: children,
        },
    );

    return (
        <NavigationHelpersContext.Provider value={navigation}>
            <SurfModalController
                descriptors={descriptors}
                state={state}
                navigation={navigation}
            >
                {children}
            </SurfModalController>
        </NavigationHelpersContext.Provider>
    );
};

type ModalScreenOptions = {|
    defaultProps: {},
|};

export const createSurfModalNavigator = createNavigatorFactory<
    SurfModalNavigationState,
    ModalScreenOptions,
    EventMapBase,
    *,
    ExtraNavigatorPropsBase,
>(ModalNavigator);
