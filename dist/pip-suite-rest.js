(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.pip || (g.pip = {})).rest = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
configureAuthState.$inject = ['$httpProvider'];
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnauthorizedRedirect = 'pipUnauthorizedRedirect';
exports.AccessDenyRedirect = 'pipAccessDenyRedirect';
var AuthHttpResponseInterceptor = (function () {
    AuthHttpResponseInterceptor.$inject = ['$q', '$rootScope', '$location', '$log'];
    function AuthHttpResponseInterceptor($q, $rootScope, $location, $log) {
        "ngInject";
        var _this = this;
        this.$q = $q;
        this.$rootScope = $rootScope;
        this.$location = $location;
        this.$log = $log;
        this.responseError = function (rejection) {
            var toState = _this.$rootScope[pip.services.StateVar] && _this.$rootScope[pip.services.StateVar].name ? _this.$rootScope[pip.services.StateVar].name : null;
            var toParams = _this.$rootScope[pip.services.StateVar] && _this.$rootScope[pip.services.StateVar].params ? _this.$rootScope[pip.services.StateVar].params : null;
            switch (rejection.status) {
                case 401:
                case 440:
                    _this.$log.error("Response Error 401", rejection);
                    _this.$rootScope.$emit(exports.UnauthorizedRedirect, {
                        redirect_to: toState && toParams && toParams.redirect_to ? '' : _this.$location.url(),
                        toState: toState,
                        toParams: toParams
                    });
                    break;
                case 403:
                    _this.$log.error("Response Error 403", rejection);
                    _this.$rootScope.$emit(exports.AccessDenyRedirect);
                    break;
                default:
                    _this.$log.error("errors_unknown", rejection);
                    break;
            }
            return _this.$q.reject(rejection);
        };
    }
    return AuthHttpResponseInterceptor;
}());
function configureAuthState($httpProvider) {
    $httpProvider.interceptors.push('pipAuthHttpResponseInterceptor');
}
angular
    .module('pipAuthState')
    .config(configureAuthState)
    .service('pipAuthHttpResponseInterceptor', AuthHttpResponseInterceptor);
},{}],2:[function(require,module,exports){
"use strict";
decorateStatesAuthStateService.$inject = ['$delegate', '$timeout'];
addStatesAuthtateDecorator.$inject = ['$provide'];
Object.defineProperty(exports, "__esModule", { value: true });
var IAuthStateService_1 = require("./IAuthStateService");
function decorateStatesAuthStateService($delegate, $timeout) {
    "ngInject";
    $delegate.config = new IAuthStateService_1.AuthStateConfig();
    $delegate.signinState = signinState;
    $delegate.signoutState = signoutState;
    $delegate.authorizedState = authorizedState;
    $delegate.unauthorizedState = unauthorizedState;
    $delegate.goToSignin = goToSignin;
    $delegate.goToSignout = goToSignout;
    $delegate.goToAuthorized = goToAuthorized;
    $delegate.goToUnauthorized = goToUnauthorized;
    return $delegate;
    function signinState(value) {
        if (value) {
            this._config.signinState = value;
        }
        return this._config.signinState;
    }
    function signoutState(value) {
        if (value) {
            this._config.signoutState = value;
        }
        return this._config.signoutState;
    }
    function authorizedState(value) {
        if (value) {
            this._config.authorizedState = value;
        }
        return this._config.authorizedState;
    }
    function unauthorizedState(value) {
        if (value) {
            this._config.unauthorizedState = value;
        }
        return this._config.unauthorizedState;
    }
    function setSigninParams(params) {
        if (!params)
            return params;
        if (!params.toParams)
            return params;
        params.server_url = params.toParams.server_url ? params.toParams.server_url : null;
        params.email = params.toParams.email ? params.toParams.email : null;
        params.language = params.toParams.language ? params.toParams.language : 'en';
        return params;
    }
    function goToSignin(params) {
        if (this._config.signinState == null) {
            throw new Error('Signin state was not defined');
        }
        params = setSigninParams(params);
        this.go(this._config.signinState, params);
    }
    function goToSignout(params) {
        if (this._config.signoutState == null) {
            throw new Error('Signout state was not defined');
        }
        this.go(this._config.signoutState, params);
    }
    function goToAuthorized(params) {
        if (this._config.authorizedState == null) {
            throw new Error('Authorized state was not defined');
        }
        this.go(this._config.authorizedState, params);
    }
    function goToUnauthorized(params) {
        if (this._config.unauthorizedState == null) {
            throw new Error('Signin state was not defined');
        }
        this.go(this._config.unauthorizedState, params);
    }
}
function addStatesAuthtateDecorator($provide) {
    "ngInject";
    $provide.decorator('pipAuthState', decorateStatesAuthStateService);
}
angular
    .module('pipAuthState')
    .config(addStatesAuthtateDecorator);
},{"./IAuthStateService":5}],3:[function(require,module,exports){
"use strict";
configureAuthState.$inject = ['pipTranslateProvider'];
initAuthState.$inject = ['$log', '$rootScope', '$state', 'pipSession', 'pipAuthState'];
Object.defineProperty(exports, "__esModule", { value: true });
function initAuthState($log, $rootScope, $state, pipSession, pipAuthState) {
    $rootScope.$on('$stateChangeStart', stateChangeStart);
    $rootScope.$on('pipUnauthorizedRedirect', unauthorizedRedirect);
    $rootScope.$on('$stateChangeSuccess', stateChange);
    function stateChange(event, toState, toParams, fromState, fromParams) {
        $rootScope[pip.services.RoutingVar] = false;
    }
    function stateChangeStart(event, toState, toParams, fromState, fromParams) {
        if (pipAuthState.redirect && pipAuthState.redirect(event, toState, toParams, $rootScope)) {
            return;
        }
        if ((toState.auth || toState.auth === undefined) && !pipSession.isOpened()) {
            event.preventDefault();
            var redirectTo = pipAuthState.href(toState.name, toParams);
            if (redirectTo.length > 0 && redirectTo[0] == '#') {
                redirectTo = redirectTo.substring(1);
            }
            pipAuthState.goToSignin({ redirect_to: redirectTo, toState: toState, toParams: toParams });
            return;
        }
        if (toState.name == pipAuthState.unauthorizedState() && pipSession.isOpened()) {
            event.preventDefault();
            pipAuthState.goToAuthorized({});
            return;
        }
    }
    function unauthorizedRedirect(event, params) {
        pipAuthState.goToSignout(params);
    }
}
function configureAuthState(pipTranslateProvider) {
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
},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var IAuthStateService_1 = require("./IAuthStateService");
var AuthStateProvider = (function () {
    AuthStateProvider.$inject = ['$stateProvider'];
    function AuthStateProvider($stateProvider) {
        "ngInject";
        var _this = this;
        this.$stateProvider = $stateProvider;
        this._redirectedStates = {};
        this._config = new IAuthStateService_1.AuthStateConfig();
        this.state = function (stateName, stateConfig) {
            if (stateName == null) {
                throw new Error('stateName cannot be null');
            }
            if (stateConfig == null) {
                throw new Error('stateConfig cannot be null');
            }
            if (stateConfig && (stateConfig.auth || stateConfig.authenticate)) {
                stateConfig.resolve = stateConfig.resolve || {};
            }
            _this.$stateProvider.state(stateName, stateConfig);
            return _this;
        };
    }
    AuthStateProvider.prototype.redirect = function (fromState, toState) {
        this._redirectedStates[fromState] = toState;
    };
    Object.defineProperty(AuthStateProvider.prototype, "signinState", {
        get: function () {
            return this._config.signinState;
        },
        set: function (value) {
            this._config.signinState = value || null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AuthStateProvider.prototype, "signoutState", {
        get: function () {
            return this._config.signoutState;
        },
        set: function (value) {
            this._config.signoutState = value || null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AuthStateProvider.prototype, "authorizedState", {
        get: function () {
            return this._config.authorizedState;
        },
        set: function (value) {
            this._config.authorizedState = value || '/';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AuthStateProvider.prototype, "unauthorizedState", {
        get: function () {
            return this._config.unauthorizedState;
        },
        set: function (value) {
            this._config.unauthorizedState = value || '/';
        },
        enumerable: true,
        configurable: true
    });
    AuthStateProvider.prototype.$get = ['$state', '$timeout', function ($state, $timeout) {
        "ngInject";
        if (this._service == null) {
            $state['_config'] = this._config;
            $state['_redirectedStates'] = this._redirectedStates;
            $state['redirect'] = redirect;
        }
        this._service = $state;
        return this._service;
        function redirect(event, state, params) {
            var _this = this;
            var toState = this._redirectedStates[state.name];
            if (_.isFunction(toState)) {
                toState = toState(state.name, params);
                if (_.isNull(toState))
                    throw new Error('Redirected toState cannot be null');
            }
            if (!!toState) {
                $timeout(function () {
                    event.preventDefault();
                    _this.transitionTo(toState, params, { location: 'replace' });
                });
                return true;
            }
            return false;
        }
    }];
    return AuthStateProvider;
}());
angular
    .module('pipAuthState')
    .provider('pipAuthState', AuthStateProvider);
},{"./IAuthStateService":5}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AuthStateConfig = (function () {
    function AuthStateConfig() {
        this.signinState = null;
        this.signoutState = null;
        this.authorizedState = '/';
        this.unauthorizedState = '/';
    }
    return AuthStateConfig;
}());
exports.AuthStateConfig = AuthStateConfig;
},{}],6:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
angular
    .module('pipAuthState', [
    'ngResource',
    'pipServices',
    'LocalStorageModule'
]);
require("./AuthHttpResponseInterceptor");
require("./AuthStateDecorator");
require("./AuthStateInit");
require("./IAuthStateService");
require("./AuthStateService");
__export(require("./AuthHttpResponseInterceptor"));
__export(require("./IAuthStateService"));
},{"./AuthHttpResponseInterceptor":1,"./AuthStateDecorator":2,"./AuthStateInit":3,"./AuthStateService":4,"./IAuthStateService":5}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DataCache = (function () {
    DataCache.$inject = ['$q', 'pipDataModel'];
    function DataCache($q, pipDataModel) {
        "ngInject";
        this.$q = $q;
        this.pipDataModel = pipDataModel;
        this.CACHE_TIMEOUT = 10 * 60000;
        this._cache = {};
    }
    DataCache.prototype.hash = function (data) {
        var filteredData = {};
        if (data != null) {
            filteredData.filter = data.filter;
            filteredData.search = data.search;
            filteredData.start = data.start;
            filteredData.take = data.take;
            filteredData.skip = data.skip;
        }
        var serializedFilter = angular.toJson(filteredData);
        if (serializedFilter == null || serializedFilter.length === 0)
            return 0;
        var h = 0;
        for (var i = 0, len = serializedFilter.length; i < len; i++) {
            var chr = serializedFilter.charCodeAt(i);
            h = ((h << 5) - h) + chr;
            h |= 0;
        }
        return h;
    };
    DataCache.prototype.generateKey = function (resource, params) {
        var h = this.hash(params);
        return resource + (h != 0 ? '_' + h : '');
    };
    ;
    DataCache.prototype.clear = function (resource) {
        if (resource == null) {
            this._cache = {};
        }
        else {
            for (var key in this._cache) {
                if (key == resource || key.startsWith(resource + '_')) {
                    delete this._cache[key];
                }
            }
        }
    };
    DataCache.prototype.retrieve = function (resource, params) {
        if (resource == null)
            throw new Error('Resource cannot be null');
        if (resource == '')
            throw new Error('Resource cannot be empty');
        var key = this.generateKey(resource, params);
        var holder = this._cache[key];
        if (holder == null)
            return null;
        if (holder.expire && _.now() - holder.expire > this.CACHE_TIMEOUT) {
            delete this._cache[key];
            return null;
        }
        return holder.data;
    };
    DataCache.prototype.store = function (resource, data, params) {
        if (resource == null)
            throw new Error('Resource cannot be null');
        if (resource == '')
            throw new Error('Resource cannot be empty');
        this._cache[this.generateKey(resource, params)] = {
            expire: _.now(),
            data: data
        };
    };
    DataCache.prototype.storePermanently = function (resource, data, params) {
        if (resource == null)
            throw new Error('Resource cannot be null');
        if (resource == '')
            throw new Error('Resource cannot be empty');
        this._cache[this.generateKey(resource, params)] = {
            expire: null,
            data: data
        };
    };
    DataCache.prototype.remove = function (resource, params) {
        if (resource == null)
            throw new Error('Resource cannot be null');
        if (resource == '')
            throw new Error('Resource cannot be empty');
        delete this._cache[this.generateKey(resource, params)];
    };
    ;
    DataCache.prototype.updateOne = function (resource, item, params) {
        if (resource == null)
            throw new Error('Resource cannot be null');
        if (item == null)
            return;
        var data = this.retrieve(resource, params);
        if (data != null) {
            var isAdded = false;
            var size = data.length;
            for (var i = 0; i < size; i++) {
                if (data[i].id == item.id) {
                    data[i] = item;
                    isAdded = true;
                    return;
                }
            }
            if (!isAdded)
                data.push(item);
            this.store(resource, data, params);
        }
    };
    DataCache.prototype.retrieveOrLoad = function (params, successCallback, errorCallback) {
        var _this = this;
        if (params == null)
            throw new Error('params cannot be null');
        var resource = params.resource;
        var filter = params.filter;
        var force = !!params.force;
        var result = !force ? this.retrieve(resource, params) : null;
        var deferred = this.$q.defer();
        var method;
        if (!!params.paging) {
            method = 'page';
        }
        else {
            method = params.singleResult ? 'readOne' : 'read';
        }
        if (result) {
            if (filter) {
                if (result.data) {
                    result.data = filter(result.data);
                }
                else {
                    result = filter(result);
                }
            }
            if (_.isFunction(successCallback)) {
                successCallback(result);
            }
            deferred.resolve(result);
            return deferred.promise;
        }
        this.pipDataModel[method](params, function (data) {
            params.updatedItem ?
                _this.updateOne(resource, data, params) :
                _this.store(resource, data, params);
            if (filter)
                data = filter(data);
            deferred.resolve(data);
            if (_.isFunction(successCallback)) {
                successCallback(data);
            }
        }, function (err) {
            deferred.reject(err);
            if (_.isFunction(errorCallback))
                errorCallback(err);
        });
        return deferred.promise;
    };
    DataCache.prototype.removeOne = function (resource, item) {
        if (resource == null)
            throw new Error('Resource cannot be null');
        if (item == null)
            return;
        for (var key in this._cache) {
            if (key == resource || key.startsWith(resource + '_')) {
                var data = this._cache[key].data;
                if (angular.isArray(data)) {
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].id == item.id) {
                            data.splice(i, 1);
                            i--;
                        }
                    }
                }
            }
        }
    };
    DataCache.prototype.decorateAddCallback = function (resource, params, successCallback) {
        var _this = this;
        return function (item) {
            if (!params || !params.notClearedCache) {
                _this.clear(resource);
            }
            if (_.isFunction(successCallback)) {
                successCallback(item);
            }
        };
    };
    DataCache.prototype.decorateRemoveCallback = function (resource, params, successCallback) {
        var _this = this;
        return function (item) {
            _this.removeOne(resource, params);
            if (_.isFunction(successCallback)) {
                successCallback(item);
            }
        };
    };
    DataCache.prototype.decorateUpdateCallback = function (resource, params, successCallback) {
        var _this = this;
        return function (item) {
            for (var key in _this._cache) {
                if (key == resource || key.startsWith(resource + '_')) {
                    var data = _this._cache[key].data;
                    if (angular.isArray(data)) {
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].id == item.id) {
                                data[i] = item;
                            }
                        }
                    }
                }
            }
            if (_.isFunction(successCallback)) {
                successCallback(item);
            }
        };
    };
    DataCache.prototype.setTimeout = function (newTimeout) {
        if (newTimeout) {
            this.CACHE_TIMEOUT = newTimeout;
        }
        return this.CACHE_TIMEOUT;
    };
    return DataCache;
}());
var DataCacheProvider = (function () {
    function DataCacheProvider() {
    }
    DataCacheProvider.prototype.$get = ['$q', 'pipDataModel', function ($q, pipDataModel) {
        "ngInject";
        if (this._service == null) {
            this._service = new DataCache($q, pipDataModel);
        }
        return this._service;
    }];
    return DataCacheProvider;
}());
angular
    .module('pipDataCache', [])
    .provider('pipDataCache', DataCacheProvider);
},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CacheParams = (function () {
    function CacheParams() {
    }
    return CacheParams;
}());
exports.CacheParams = CacheParams;
},{}],9:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
angular
    .module('pipDataCache', ['pipDataModel']);
require("./DataCacheService");
require("./IDataCacheService");
__export(require("./IDataCacheService"));
},{"./DataCacheService":7,"./IDataCacheService":8}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DataModel = (function () {
    DataModel.$inject = ['$stateParams', 'pipRest'];
    function DataModel($stateParams, pipRest) {
        "ngInject";
        this.$stateParams = $stateParams;
        this.pipRest = pipRest;
        this.save = this.update;
        this.remove = this.delete;
        this.query = this.read;
        this.get = this.readOne;
        this.readPage = this.page;
        this.queryPage = this.page;
    }
    DataModel.prototype.execute = function (params, successCallback, errorCallback) {
        var t = params.transaction, tid;
        if (t && !params.skipTransactionBegin) {
            tid = params.transactionId = t.begin(params.transactionOperation || 'PROCESSING');
            if (!tid)
                return;
        }
        return this.pipRest.getResource(params.resource)[params.operation](params.item, function (result) {
            if (t && tid && t.aborted(tid))
                return;
            if (t && !params.skipTransactionEnd)
                t.end();
            if (successCallback)
                successCallback(result);
        }, function (error) {
            if (t)
                t.end(error);
            if (errorCallback)
                errorCallback(error);
        });
    };
    DataModel.prototype.create = function (params, successCallback, errorCallback) {
        params.transactionOperation = params.transactionOperation || 'SAVING';
        params.operation = params.operation || 'save';
        return this.execute(params, function (result) {
            if (params.itemCollection)
                params.itemCollection.push(result);
            if (successCallback)
                successCallback(result);
        }, function (error) {
            if (errorCallback)
                errorCallback(error);
        });
    };
    DataModel.prototype.update = function (params, successCallback, errorCallback) {
        params.transactionOperation = params.transactionOperation || 'SAVING';
        params.operation = params.operation || 'update';
        return this.execute(params, function (result) {
            if (params.itemCollection)
                var index = _.findIndex(params.itemCollection, function (item) {
                    return item.id == result.id;
                });
            if (index > -1) {
                params.itemCollection[index] = result;
            }
            if (successCallback)
                successCallback(result);
        }, function (error) {
            if (errorCallback)
                errorCallback(error);
        });
    };
    DataModel.prototype.delete = function (params, successCallback, errorCallback) {
        params.transactionOperation = params.transactionOperation || 'SAVING';
        params.operation = params.operation || 'remove';
        return this.execute(params, function (result) {
            if (params.itemCollection)
                _.remove(params.itemCollection, { id: result.id || (params.object || {}).id || (params.item || {}).id });
            if (successCallback)
                successCallback(result);
        }, function (error) {
            if (errorCallback)
                errorCallback(error);
        });
    };
    DataModel.prototype.read = function (params, successCallback, errorCallback) {
        params.transactionOperation = params.transactionOperation || 'READING';
        params.operation = params.operation || 'query';
        return this.execute(params, function (result) {
            if (successCallback)
                successCallback(result);
        }, function (error) {
            if (errorCallback)
                errorCallback(error);
        });
    };
    DataModel.prototype.readOne = function (params, successCallback, errorCallback) {
        params.transactionOperation = params.transactionOperation || 'READING';
        params.operation = params.operation || 'page';
        return this.execute(params, function (result) {
            if (params.itemCollection && result) {
                var index = _.findIndex(params.itemCollection, { id: result.id });
                if (index >= 0)
                    params.itemCollection[index] = result;
                else
                    params.itemCollection.push(result);
            }
            if (successCallback)
                successCallback(result);
        }, function (error) {
            if (errorCallback)
                errorCallback(error);
        });
    };
    DataModel.prototype.page = function (params, successCallback, errorCallback) {
        params.transactionOperation = params.transactionOperation || 'READING';
        params.operation = params.operation || 'page';
        return this.execute(params, function (result) {
            if (params.itemCollection && result.data) {
                for (var i = 0; i < result.data.length; i++)
                    params.itemCollection.push(result.data[i]);
            }
            if (successCallback)
                successCallback(result);
        }, function (error) {
            if (errorCallback)
                errorCallback(error);
        });
    };
    DataModel.prototype.uploadFiles = function (params, successCallback, errorCallback) {
        var t = params.transaction, tid;
        if (t && !params.skipTransactionBegin) {
            tid = params.transactionId = t.begin(params.transactionOperation || 'SAVING');
            if (!tid)
                return;
        }
        var uploadFiles = [{
                pictures: params.pictures,
                documents: params.documents
            }];
        if (params.item && params.item.content) {
            var saveResult = true;
            async.eachSeries(_.union(params.item.content, uploadFiles), function (obj, callback) {
                if (!obj.pictures && !obj.documents) {
                    callback();
                }
                else {
                    if (obj.pictures) {
                        obj.pictures.save(function () {
                            if (t && tid && t.aborted(tid)) {
                                saveResult = false;
                                callback('aborted');
                            }
                            if (obj.documents) {
                                obj.documents.save(function () {
                                    if (t && tid && t.aborted(tid)) {
                                        saveResult = false;
                                        callback('aborted');
                                    }
                                    callback();
                                }, function (error) {
                                    saveResult = false;
                                    callback(error);
                                });
                            }
                            else {
                                callback();
                            }
                        }, function (error) {
                            saveResult = false;
                            callback(error);
                        });
                    }
                    else {
                        if (obj.documents) {
                            obj.documents.save(function () {
                                if (t && tid && t.aborted(tid)) {
                                    saveResult = false;
                                    callback('aborted');
                                }
                                callback();
                            }, function (error) {
                                saveResult = false;
                                callback(error);
                            });
                        }
                    }
                }
            }, function (error) {
                if (!error && saveResult) {
                    if (t && !params.skipTransactionEnd)
                        t.end();
                    _.each(params.item.content, function (item) {
                        delete item.pictures;
                        delete item.documents;
                    });
                    if (successCallback)
                        successCallback();
                }
                else {
                    if (t)
                        t.end(error);
                    if (errorCallback) {
                        errorCallback(error);
                    }
                }
            });
        }
        else {
            if (params.pictures) {
                params.pictures.save(function () {
                    if (t && tid && t.aborted(tid))
                        return;
                    if (params.documents) {
                        params.documents.save(function () {
                            if (t && tid && t.aborted(tid))
                                return;
                            if (t && !params.skipTransactionEnd)
                                t.end();
                            if (successCallback)
                                successCallback();
                        }, function (error) {
                            if (t)
                                t.end(error);
                            if (errorCallback)
                                errorCallback(error);
                        });
                    }
                    else {
                        if (t && !params.skipTransactionEnd)
                            t.end();
                        if (successCallback)
                            successCallback();
                    }
                }, function (error) {
                    if (t)
                        t.end(error);
                    if (errorCallback)
                        errorCallback(error);
                });
            }
            else if (params.documents) {
                params.documents.save(function () {
                    if (t && tid && t.aborted(tid))
                        return;
                    if (t && !params.skipTransactionEnd)
                        t.end();
                    if (successCallback)
                        successCallback();
                }, function (error) {
                    if (t)
                        t.end(error);
                    if (errorCallback)
                        errorCallback(error);
                });
            }
            else {
                if (t && !params.skipTransactionEnd)
                    t.end();
                if (successCallback)
                    successCallback();
            }
        }
    };
    DataModel.prototype.abortFilesUpload = function (params) {
        if (params.pictures)
            params.pictures.abort();
        if (params.documents)
            params.documents.abort();
        if (params.transaction)
            params.transaction.abort();
    };
    return DataModel;
}());
var DataModelProvider = (function () {
    function DataModelProvider() {
        "ngInject";
    }
    DataModelProvider.prototype.$get = ['$stateParams', 'pipRest', function ($stateParams, pipRest) {
        "ngInject";
        if (this._service == null) {
            this._service = new DataModel($stateParams, pipRest);
        }
        return this._service;
    }];
    return DataModelProvider;
}());
angular
    .module('pipDataModel')
    .provider('pipDataModel', DataModelProvider);
},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
angular
    .module('pipDataModel', ['pipRest']);
require("./IDataModelService");
require("./DataModelService");
},{"./DataModelService":10,"./IDataModelService":11}],13:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
require("./rest");
require("./data");
require("./cache");
require("./auth_state");
angular
    .module('pipCommonRest', [
    'pipDataCache',
    'pipRest',
    'pipDataModel',
    'pipAuthState'
]);
__export(require("./cache"));
__export(require("./auth_state"));
},{"./auth_state":6,"./cache":9,"./data":12,"./rest":16}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
},{}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RestResourceConfig = (function () {
    function RestResourceConfig() {
    }
    return RestResourceConfig;
}());
;
var RestService = (function () {
    RestService.$inject = ['$resource', '$http', '$stateParams', 'serverUrl', 'lockServerUrl', 'resourceConfigs'];
    function RestService($resource, $http, $stateParams, serverUrl, lockServerUrl, resourceConfigs) {
        "ngInject";
        this.$resource = $resource;
        this.$http = $http;
        this.$stateParams = $stateParams;
        this.resourceConfigs = resourceConfigs;
        this._resources = {};
        this._serverUrl = serverUrl;
        this._lockServerUrl = lockServerUrl;
        this.initResources(resourceConfigs);
    }
    RestService.prototype.reInitResource = function () {
        this._resources = {};
        this.initResources(this.resourceConfigs);
    };
    RestService.prototype.initResources = function (resourceConfigs) {
        var _this = this;
        _.each(resourceConfigs, function (resourceConfig) {
            var resource;
            switch (resourceConfig.operation) {
                case 'createResource':
                    resource = _this.createResource(_this._serverUrl, resourceConfig.path, resourceConfig.defaultParams, resourceConfig.actions);
                    break;
                case 'createOperation':
                    resource = _this.createOperation(_this._serverUrl, resourceConfig.path);
                    break;
                case 'createCollection':
                    resource = _this.createCollection(_this._serverUrl, resourceConfig.path, resourceConfig.defaultParams);
                    break;
                case 'createPagedCollection':
                    resource = _this.createPagedCollection(_this._serverUrl, resourceConfig.path, resourceConfig.defaultParams);
                    break;
                case 'createPartyCollection':
                    resource = _this.createPartyCollection(_this._serverUrl, resourceConfig.path, resourceConfig.defaultParams);
                    break;
            }
            if (resource) {
                _this._resources[resourceConfig.name] = resource;
            }
        });
    };
    RestService.prototype.createResource = function (url, path, defaultParams, actions) {
        url = url || this._serverUrl;
        return this.$resource(this._serverUrl + path, defaultParams, actions);
    };
    RestService.prototype.createOperation = function (url, path) {
        url = url || this._serverUrl;
        return this.$resource(url + path, {}, {
            call: { method: 'POST' }
        });
    };
    RestService.prototype.createCollection = function (url, path, defaultParams) {
        url = url || this._serverUrl;
        return this.$resource(url + path, defaultParams || { id: '@id' }, {
            update: { method: 'PUT' }
        });
    };
    RestService.prototype.createPagedCollection = function (url, path, defaultParams) {
        url = url || this._serverUrl;
        return this.$resource(url + path, defaultParams || { id: '@id' }, {
            page: { method: 'GET', isArray: false },
            update: { method: 'PUT' }
        });
    };
    RestService.prototype.createPartyCollection = function (url, path, paramDefaults) {
        return this.createPagedCollection(url, path, paramDefaults ||
            {
                id: '@id',
                party_id: '@party_id'
            });
    };
    Object.defineProperty(RestService.prototype, "serverUrl", {
        get: function () {
            return this._serverUrl;
        },
        set: function (value) {
            this._serverUrl = value;
            this.reInitResource();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RestService.prototype, "lockServerUrl", {
        get: function () {
            return this._lockServerUrl;
        },
        set: function (value) {
            this._lockServerUrl = value;
        },
        enumerable: true,
        configurable: true
    });
    RestService.prototype.setHeaders = function (headers) {
        for (var header in headers) {
            if (headers.hasOwnProperty(header) && !_.isObject(headers[header])) {
                this.$http.defaults.headers.common[header] = headers[header];
            }
        }
    };
    RestService.prototype.getResource = function (name) {
        var resource = this._resources[name];
        if (!resource)
            throw new Error('Resource not found');
        return resource;
    };
    return RestService;
}());
var RestProvider = (function () {
    RestProvider.$inject = ['$httpProvider'];
    function RestProvider($httpProvider) {
        this._resourceConfigs = [];
        this._http = $httpProvider;
    }
    Object.defineProperty(RestProvider.prototype, "serverUrl", {
        get: function () {
            return this._serverUrl;
        },
        set: function (value) {
            this._serverUrl = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RestProvider.prototype, "lockServerUrl", {
        get: function () {
            return this._lockServerUrl;
        },
        set: function (value) {
            this._lockServerUrl = value;
        },
        enumerable: true,
        configurable: true
    });
    RestProvider.prototype.setHeaders = function (headers) {
        for (var header in headers) {
            if (headers.hasOwnProperty(header))
                this._http.defaults.headers.common[header] = headers[header];
        }
    };
    RestProvider.prototype.registerResource = function (name, path, defaultParams, actions) {
        this._resourceConfigs.push({
            operation: 'createResource',
            name: name,
            path: path,
            defaultParams: defaultParams || null,
            actions: actions || null
        });
    };
    RestProvider.prototype.registerOperation = function (name, path, defaultParams, actions) {
        this._resourceConfigs.push({
            operation: 'createOperation',
            name: name,
            path: path,
            defaultParams: defaultParams || null,
            actions: actions || null
        });
    };
    RestProvider.prototype.registerCollection = function (name, path, defaultParams, actions) {
        this._resourceConfigs.push({
            operation: 'createCollection',
            name: name,
            path: path,
            defaultParams: defaultParams || null,
            actions: actions || null
        });
    };
    RestProvider.prototype.registerPagedCollection = function (name, path, defaultParams, actions) {
        this._resourceConfigs.push({
            operation: 'createPagedCollection',
            name: name,
            path: path,
            defaultParams: defaultParams || null,
            actions: actions || null
        });
    };
    RestProvider.prototype.registerPartyCollection = function (name, path, defaultParams, actions) {
        this._resourceConfigs.push({
            operation: 'createPartyCollection',
            name: name,
            path: path,
            defaultParams: defaultParams || null,
            actions: actions || null
        });
    };
    RestProvider.prototype.$get = ['$resource', '$http', '$stateParams', function ($resource, $http, $stateParams) {
        "ngInject";
        if (this._service == null)
            this._service = new RestService($resource, $http, $stateParams, this._serverUrl, this._lockServerUrl, this._resourceConfigs);
        return this._service;
    }];
    return RestProvider;
}());
angular
    .module('pipRest')
    .provider('pipRest', RestProvider);
},{}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
angular
    .module('pipRest', ['ngResource']);
require("./IRestService");
require("./RestService");
},{"./IRestService":14,"./RestService":15}]},{},[13])(13)
});

//# sourceMappingURL=pip-suite-rest.js.map
