/* global angular */

(function () {
    'use strict';

    var thisModule = angular.module('appRestServices.Rest', []);

    thisModule.controller('RestController',
        function ($scope, pipRest, pipSession) {
            $scope.serverUrl = 'http://alpha.pipservices.net';
            $scope.name = 'Sampler User';
            $scope.login = 'stas15';
            $scope.password = '123456';

            $scope.output = '';
            $scope.processing = false;

            var writeLine = function (line) {
                $scope.output += line + '<br/>';
            },
                processError = function (error) {
                    console.log('processError result', error);
                    writeLine(angular.toJson(error, true));
                    $scope.processing = false;
                };

            $scope.onSignin = function () {
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
                    })
            };

            $scope.onSignout = function () {
                $scope.processing = true;

                var disconnected = function () {
                    writeLine('Disconnected from server');
                    $scope.processing = false;
                };

                pipRest.getResource('signout').call({}, disconnected);
            };

            $scope.onAbout = function () {
                pipRest.getResource('about').get({},
                    function (about) {
                        writeLine(angular.toJson(about, true));
                        $scope.processing = false;
                    },
                    processError
                );
            };

            $scope.onClearOutput = function () {
                $scope.output = '';
            };
        }
    );

})();
