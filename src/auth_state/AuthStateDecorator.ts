import { AuthStateConfig } from './IAuthStateService';

// Decorator function to add redirect method to pipAuthState service
function decorateStatesAuthStateService($delegate, $timeout) {
    "ngInject";

    $delegate.config = new AuthStateConfig();
    $delegate.signinState = signinState;
    $delegate.signoutState = signoutState;
    $delegate.authorizedState = authorizedState;
    $delegate.unauthorizedState = unauthorizedState;

    $delegate.goToSignin = goToSignin;
    $delegate.goToSignout = goToSignout;
    $delegate.goToAuthorized = goToAuthorized;
    $delegate.goToUnauthorized = goToUnauthorized;

    return $delegate;
    ////////////////////////////////

    function signinState(value?: string): string {
        if (value) {
            this._config.signinState = value;
        } return this._config.signinState;
    }
    function signoutState(value?: string): string {
        if (value) {
            this._config.signoutState = value;
        } return this._config.signoutState;
    }
    function authorizedState(value?: string): string {
        if (value) {
            this._config.authorizedState = value;
        } return this._config.authorizedState;
    }
    function unauthorizedState(value?: string): string {
        if (value) {
            this._config.unauthorizedState = value;
        } return this._config.unauthorizedState;
    }

    function setSigninParams(params: any): any {
        if (!params) return params;

        if (!params.toParams) return params;

        params.server_url = params.toParams.server_url ? params.toParams.server_url : null;
        params.email = params.toParams.email ? params.toParams.email : null;
        params.language = params.toParams.language ? params.toParams.language : 'en';

        return params;
    }

    function goToSignin(params: any): void {
        if (this._config.signinState == null) {
            throw new Error('Signin state was not defined');
        }

        params = setSigninParams(params);
        this.go(this._config.signinState, params);
    }
    function goToSignout(params: any): void {
        if (this._config.signoutState == null) {
            throw new Error('Signout state was not defined');
        }

        this.go(this._config.signoutState, params);
    }
    function goToAuthorized(params: any): void {
        if (this._config.authorizedState == null) {
            throw new Error('Authorized state was not defined');
        }

        this.go(this._config.authorizedState, params);
    }
    function goToUnauthorized(params: any): void {
        if (this._config.unauthorizedState == null) {
            throw new Error('Signin state was not defined');
        }

        this.go(this._config.unauthorizedState, params);
    }
}

// Config function to decorate pipAuthState service
function addStatesAuthtateDecorator($provide) {
    "ngInject";

    $provide.decorator('pipAuthState', decorateStatesAuthStateService);
}

angular
    .module('pipAuthState')
    .config(addStatesAuthtateDecorator);

