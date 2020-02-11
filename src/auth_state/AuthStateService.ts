import { IAuthStateService, IAuthStateProvider, AuthStateConfig, IAuthState } from './IAuthStateService';

class AuthStateProvider implements IAuthStateProvider {
    private _service: IAuthStateService;
    private _config: AuthStateConfig;
    private _redirectedStates: any = {};

    public state: Function;

    constructor(
        private $stateProvider: ng.ui.IStateProvider
    ) {
        "ngInject";

        this._config = new AuthStateConfig();


        this.state = (stateName: string, stateConfig: IAuthState) => {
            if (stateName == null) {
                throw new Error('stateName cannot be null');
            }
            if (stateConfig == null) {
                throw new Error('stateConfig cannot be null');
            }

            // add resolver
            if (stateConfig && (stateConfig.auth || stateConfig.authenticate)) {
                stateConfig.resolve = stateConfig.resolve || {};
            }

            this.$stateProvider.state(stateName, stateConfig);

            return this;
        }
    }

    public redirect(fromState: string, toState: string) {
        this._redirectedStates[fromState] = toState;
    }

    public get signinState(): string {
        return this._config.signinState;
    }

    public set signinState(value: string) {
        this._config.signinState = value || null;
    }

    public get signoutState(): string {
        return this._config.signoutState;
    }

    public set signoutState(value: string) {
        this._config.signoutState = value || null;
    }
    public get authorizedState(): string {
        return this._config.authorizedState;
    }

    public set authorizedState(value: string) {
        this._config.authorizedState = value || '/';
    }
    public get unauthorizedState(): string {
        return this._config.unauthorizedState;
    }

    public set unauthorizedState(value: string) {
        this._config.unauthorizedState = value || '/';
    }

    public $get($state: ng.ui.IStateService, $timeout: ng.ITimeoutService) {
        "ngInject";

        if (this._service == null) {
            $state['_config'] = this._config;
            $state['_redirectedStates'] = this._redirectedStates;
            $state['redirect'] = redirect;
        }

        this._service = <IAuthStateService>$state;

        return this._service;

        function redirect(event, state, params) {
            let toState = this._redirectedStates[state.name];
            if (_.isFunction(toState)) {
                toState = toState(state.name, params);

                if (_.isNull(toState))
                    throw new Error('Redirected toState cannot be null');
            }
            if (!!toState) {
                $timeout(() => {
                    event.preventDefault();
                    this.transitionTo(toState, params, { location: 'replace' });
                });

                return true;
            }

            return false;
        }
    }
}

angular
    .module('pipAuthState')
    .provider('pipAuthState', AuthStateProvider);