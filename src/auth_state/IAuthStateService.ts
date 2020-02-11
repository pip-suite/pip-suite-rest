export interface IAuthState extends angular.ui.IState {
    auth?: boolean;
    authenticate?: any;
}

export class AuthStateConfig {
    signinState: string = null;
    signoutState: string = null;
    authorizedState: string = '/';
    unauthorizedState: string = '/';
}

export interface IAuthStateService extends ng.ui.IStateService  {
    signinState(value?: string): string;
    signoutState(value?: string): string;
    authorizedState(value?: string): string;
    unauthorizedState(value?: string): string;

    redirect(event: ng.IAngularEvent, toState: IAuthState, toParams: any, $rootScope: ng.IRootScopeService): any;
    state(stateName: string, stateConfig: IAuthState): any;

    goToSignin(params: any): void;
    goToSignout(params: any): void;
    goToAuthorized(params: any): void;
    goToUnauthorized(params: any): void;
}

export interface IAuthStateProvider extends ng.IServiceProvider {
    redirect(fromState: string, toState: string);
    signinState: string;
    signoutState: string;
    authorizedState: string;
    unauthorizedState: string;
}

