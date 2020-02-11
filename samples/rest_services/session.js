/* global angular */

(function () {
    'use strict';

    var thisModule = angular.module('appRestServices.Session', []);

    thisModule.controller('SessionController',
        function ($scope, $rootScope, pipRest, pipSession) {

            $scope.serverUrl = 'http://alpha.pipservices.net';
            $scope.name = 'Sampler User';
            $scope.login = 'stas15';
            $scope.password = '123456';

            $scope.processing = false;

            $scope.signIn = signIn;
            $scope.signOut = signOut;
            $scope.userState = pipSession.isOpened() ? 'SignIn' : 'SignOut';

            return;
            // -----------------------------------------------------------------------------------------------------

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

            function signOut() {
                $scope.processing = true;

                pipRest.getResource('signout').call({}, null, null);
                pipSession.close();
            }
        }
    );

})();
