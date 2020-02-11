
import './rest';
import './data';
import './cache';
import './auth_state';

angular
    .module('pipCommonRest', [
        'pipDataCache',
        'pipRest',
        'pipDataModel',
        'pipAuthState'

    ]);


export * from './rest';
export * from './data';
export * from './cache';
export * from './auth_state';
