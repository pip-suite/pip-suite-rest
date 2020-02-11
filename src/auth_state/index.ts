angular
    .module('pipAuthState', [
        'ngResource',
        'pipServices', 
        'LocalStorageModule'
    ]);


import './AuthHttpResponseInterceptor';
import './AuthStateDecorator';
import './AuthStateInit';
import './IAuthStateService';
import './AuthStateService';



export * from './AuthHttpResponseInterceptor'
export * from './IAuthStateService'
