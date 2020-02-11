import { IAuthStateService, IAuthState } from './IAuthStateService';

function initAuthState(
    $log: ng.ILogService,
    $rootScope: ng.IRootScopeService,
    $state: ng.ui.IStateService,
    pipSession: pip.services.ISessionService,
    pipAuthState: IAuthStateService

) {

    // Intercept routes
    $rootScope.$on('$stateChangeStart', stateChangeStart);
    // Process unauthorized access error
    $rootScope.$on('pipUnauthorizedRedirect', unauthorizedRedirect);
    // Process after state changed
    $rootScope.$on('$stateChangeSuccess', stateChange);

    function stateChange(event: ng.IAngularEvent, toState: angular.ui.IState,
        toParams: any, fromState: angular.ui.IState, fromParams: any): void {
        // Unset routing variable to disable page transition
        $rootScope[pip.services.RoutingVar] = false;
    }

    function stateChangeStart(event: ng.IAngularEvent, toState: IAuthState, toParams: any,
        fromState: IAuthState, fromParams: any): void {

        // Implement redirect mechanism
        if (pipAuthState.redirect && pipAuthState.redirect(event, toState, toParams, $rootScope)) {
            return;
        }

        // If user is not authorized then switch to signin
        if ((toState.auth || toState.auth === undefined) && !pipSession.isOpened()) {
            event.preventDefault();

            let redirectTo: string = pipAuthState.href(toState.name, toParams);

            // Remove hashtag
            if (redirectTo.length > 0 && redirectTo[0] == '#') {
                redirectTo = redirectTo.substring(1);
            }

        //    <IAuthStateService>
           pipAuthState.goToSignin({ redirect_to: redirectTo, toState: toState, toParams: toParams });

            return;
        }

        // Move user to authorized page
        if (toState.name == pipAuthState.unauthorizedState() && pipSession.isOpened()) {
            event.preventDefault();
            pipAuthState.goToAuthorized({});

            return;
        }
    }

    function unauthorizedRedirect(event: ng.IAngularEvent, params: any): void {
        // pipAuthState.goToSignin(params);
        pipAuthState.goToSignout(params);
    }

}

function configureAuthState(pipTranslateProvider: pip.services.ITranslateProvider) {
    // Switch to HTML5 routing mode
    pipTranslateProvider.translations('en', {
        'ERROR_SWITCHING': 'Error while switching route. Try again.'
    });

    pipTranslateProvider.translations('ru', {
        'ERROR_SWITCHING': 'Ошибка при переходе. Попробуйте ещё раз.'
    });
}

angular
    .module('pipAuthState')
    .config(configureAuthState)
    .run(initAuthState);

