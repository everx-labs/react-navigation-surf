// @flow
/* eslint-disable max-classes-per-file */
import * as React from 'react';
import { Keyboard } from 'react-native';
import {
    NavigationHelpersContext,
    useNavigationBuilder,
    createNavigatorFactory,
} from '@react-navigation/native';
// $FlowExpectedError
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

type ModalControllerProps = {
    state: SurfModalNavigationState,
    descriptors: {| +[key: string]: Descriptor<empty, empty> |},
    navigation: NavigationProp<ParamListBase>,
};

export class SurfModalController extends React.Component<ModalControllerProps> {
    static instance: ?SurfModalController;

    static show(name: string, params?: { [key: string]: mixed }) {
        if (SurfModalController.instance) {
            SurfModalController.instance.show(name, params);
        }
    }

    static hide(name: string) {
        if (SurfModalController.instance) {
            SurfModalController.instance.hide(name);
        }
    }

    componentDidMount() {
        SurfModalController.instance = this;
    }

    componentWillUnmount() {
        SurfModalController.instance = null;
    }

    show(name: string, params?: { [key: string]: mixed }) {
        Keyboard.dismiss();
        this.props.navigation.dispatch(SurfModalActions.show(name, params));
    }

    hide(name: string) {
        Keyboard.dismiss();
        this.props.navigation.dispatch(SurfModalActions.hide(name));
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
    isShown: boolean,
    needToHide: boolean,
    needToShow: boolean,
};

type ModalSceneInstance = {
    +show: (params: { [key: string]: any }) => void | Promise<void>,
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
            const { isShown } = props.route?.params || {};
            if (state.isShown && !isShown) {
                return {
                    needToShow: false,
                    needToHide: true,
                    isShown: false,
                };
            }
            if (!state.isShown && isShown) {
                return {
                    needToHide: false,
                    needToShow: true,
                    isShown: true,
                };
            }
            return {
                ...state,
                needToHide: false,
                needToShow: false,
            };
        }

        state = {
            isShown: false,
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
