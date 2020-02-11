(function (angular) {
    'use strict';

    var thisModule = angular.module('appRestServices.Auth', ['pipTranslate', 'pipCommonRest', 'pipAuthState']);

    thisModule.config(
        function (pipTranslateProvider, pipAuthStateProvider) {
            console.log('config pipAuthState', pipAuthStateProvider);

            // Configure module routes
            pipAuthStateProvider
                .state('signin', {
                    url: '/signin',
                    controller: 'SigninController',
                    templateUrl: 'auth.html',
                    params: {
                        toState: '',
                        toParams: ''
                    },
                    auth: false
                })
                .state('first_page', {
                    url: '/auth/first',
                    controller: 'FirstAuthController',
                    templateUrl: 'auth.html',
                    params: {
                        name: 'name',
                        url: 'http://www.rambler.ru'
                    },
                    auth: true
                })
                .state('second_page', {
                    url: '/auth/second',
                    controller: 'SecondAuthController',
                    templateUrl: 'auth.html',
                    auth: true
                })
                .state('redirect_page', {
                    url: '/auth/redirect',
                    controller: 'RedirectAuthController',
                    templateUrl: 'auth.html',
                    auth: true
                })
                .state('new_page', {
                    url: '/auth/new_page',
                    controller: 'NewAuthController',
                    templateUrl: 'auth.html',
                    auth: true
                });

            pipAuthStateProvider.redirect('redirect_page', function (stateName, params, $rootScope) {
                console.log('pipAuthStateProvider.redirect', stateName, params, $rootScope);
                return 'new_page';
            });

            // Set translation strings for the module
            pipTranslateProvider.translations('en', {});

            pipTranslateProvider.translations('ru', {});

            pipAuthStateProvider.unauthorizedState = 'signin';
            pipAuthStateProvider.authorizedState = 'auth';
            pipAuthStateProvider.signinState = 'signin';

        }
    );

    thisModule.controller('AuthController',
        function ($scope, $rootScope, pipRest, pipSession) {

            $scope.page = 'Auth Controller';
            $scope.processing = false;

            $scope.signOut = signOut;
            $scope.userState = pipSession.isOpened() ? 'SignIn' : 'SignOut';

            return;
            // ----------------------------------------------------------------------------------------------------

            function signOut() {
                $scope.processing = true;

                pipRest.getResource('signout').call({}, null, null);
                pipSession.close();
            }

        }
    );

    thisModule.controller('SigninController',
        function ($scope, $rootScope, pipRest, pipSession, pipAuthState, $state) {

            $scope.serverUrl = 'http://alpha.pipservices.net';
            $scope.name = 'Sampler User';
            $scope.login = 'stas15';
            $scope.password = '123456';

            $scope.page = 'Signin Controller';
            $scope.processing = false;

            $scope.signIn = signIn;
            $scope.userState = pipSession.isOpened() ? 'SignIn' : 'SignOut';

            return;
            // -------------------------------------------------------------------------------------------------

            function signIn() {
                $scope.processing = true;

                pipRest.getResource('signin').call({
                    login: $scope.login,
                    password: $scope.password
                },
                    (data) => {
                        $scope.processing = false;
                        pipRest.setHeaders({
                            'x-session-id': data.id
                        });
                        pipSession.open(data);

                    },
                    (error) => {
                        $scope.processing = false;
                    });
            }

        }
    );

    thisModule.controller('FirstAuthController',
        function ($scope) {

            $scope.page = 'First Auth Controller';
            $scope.processing = false;
        }
    );

    thisModule.controller('SecondAuthController',
        function ($scope, $state, $rootScope, pipRest) {

            $scope.page = 'Second Auth Controller';
            $scope.processing = false;

            $scope.expired = expired;
            $scope.goToFirst = goToFirst;
            $scope.onGetNotes = onGetNotes;

            return;
            // ---------------------------------------------------------------------------------------------------

            function expired() {
                $scope.processing = true;

                pipRest.getResource('signout').call({}, null, null);
                pipSession.close();
            }

            function goToFirst() {
                $state.go('first_page', {
                    name: 'new name',
                    url: $scope.expired
                });
            }

            function onGetNotes() {
                pipRest.getResource('notes').query(
                    {
                        party_id: pipRest.userId()
                    },
                    function (notes) {
                        $scope.processing = false;
                    },
                    function (/* error*/) {
                        // console.log(error);
                        $scope.processing = false;
                    }
                );
            }

        }

    );

    thisModule.controller('RedirectAuthController',
        function ($scope) {
            $scope.page = 'Redirected Controller';
            console.log('RedirectAuthController');
        }
    );

    thisModule.controller('NewAuthController',
        function ($scope) {
            $scope.page = 'New Auth Controller';
            console.log('NewAuthController');
        }
    );

})(window.angular);
