import { IAuthState } from './IAuthStateService';
export const UnauthorizedRedirect: string = 'pipUnauthorizedRedirect';
export const AccessDenyRedirect: string = 'pipAccessDenyRedirect';

class AuthHttpResponseInterceptor implements ng.IHttpInterceptor {
    constructor(
        private $q: ng.IQService, 
        private $rootScope: ng.IRootScopeService,
        private $location: ng.ILocationService,
        private $log: ng.ILogService
    ) {
        "ngInject";
    }

    public responseError = (rejection: any): ng.IPromise<any> => {
        let toState: IAuthState = this.$rootScope[pip.services.StateVar] && this.$rootScope[pip.services.StateVar].name ? this.$rootScope[pip.services.StateVar].name : null;
        let toParams: any = this.$rootScope[pip.services.StateVar] && this.$rootScope[pip.services.StateVar].params ? this.$rootScope[pip.services.StateVar].params : null;
        // When server sends Non-authenticated response
        switch (rejection.status) {
            case 401:
            case 440:
                this.$log.error("Response Error 401", rejection);
                // Redirect to unauthorized state
                this.$rootScope.$emit(UnauthorizedRedirect, { // todo var event end event params
                    redirect_to: toState && toParams && toParams.redirect_to ? '' : this.$location.url(),
                    toState: toState,
                    toParams: toParams
                });

                break;
            case 403:
                this.$log.error("Response Error 403", rejection);
                // Redirect to unauthorized state
                this.$rootScope.$emit(AccessDenyRedirect);

                break;                
            default:
                this.$log.error("errors_unknown", rejection);
                break;
        }

        return this.$q.reject(rejection);
    }
}

function configureAuthState($httpProvider: ng.IHttpProvider) {
    $httpProvider.interceptors.push('pipAuthHttpResponseInterceptor');
}

angular
    .module('pipAuthState')
    .config(configureAuthState)
    .service('pipAuthHttpResponseInterceptor', AuthHttpResponseInterceptor);



