(function (angular) {
    'use strict';

    var content = [
        {
            title: 'Authentication', state: 'auth', url: '/auth',
            controller: 'AuthController', templateUrl: 'auth.html'
        },
        {
            title: 'Rest', state: 'rest', url: '/rest',
            controller: 'RestController', templateUrl: 'rest.html'
        },
        {
            title: 'Session', state: 'session', url: '/session',
            controller: 'SessionController', templateUrl: 'session.html'
        }
    ],
        thisModule = angular.module('appRestServices',
            [
                // 3rd Party Modules
                'ui.router', 'ui.utils', 'ngResource', 'ngAria', 'ngCookies', 'ngSanitize', 'ngMessages',
                'ngMaterial', 'wu.masonry', 'LocalStorageModule', 'angularFileUpload', 'ngAnimate',
                'pipServices', 'pipCommonRest',
                // 'pipData', 
                // Sample Application Modules
                'appRestServices.Rest', 'appRestServices.Session', 'appRestServices.Auth'

            ]
        );

    thisModule.config(function (pipTranslateProvider, $stateProvider, $urlRouterProvider, pipRestProvider) {

        pipRestProvider.registerOperation('signin', '/api/1.0/signin');
        pipRestProvider.registerOperation('signout', '/api/1.0/signout');

        // String translations
        pipTranslateProvider.translations('en', {
            'APPLICATION_TITLE': 'WebUI Sampler',

            'blue': 'Blue Theme',
            'green': 'Green Theme',
            'pink': 'Pink Theme',
            'grey': 'Grey Theme'
        });

        pipTranslateProvider.translations('ru', {
            'APPLICATION_TITLE': 'WebUI Демонстратор',

            'blue': 'Голубая тема',
            'green': 'Зеленая тема',
            'pink': 'Розовая тема',
            'grey': 'Серая тема'
        });

        var i, contentItem;

        for (i = 0; i < content.length; i++) {
            contentItem = content[i];

            $stateProvider.state(contentItem.state, contentItem);
        }
        pipRestProvider.serverUrl = 'http://alpha.pipservices.net';
        $urlRouterProvider.otherwise('/auth');
    });

    thisModule.controller('AppController',
        function ($scope, $rootScope, $state, $mdSidenav, pipTranslate, pipRest, pipSession) {
            $scope.languages = ['en', 'ru'];
            $scope.themes = ['blue', 'green', 'pink', 'grey'];

            pipRest.serverUrl = 'http://alpha.pipservices.net';

            $scope.selected = {
                theme: 'blue',
                tab: 0
            };

            $scope.content = content;
            $scope.menuOpened = false;

            $scope.onLanguageClick = onLanguageClick;
            $scope.onThemeClick = onThemeClick;
            $scope.onSwitchPage = onSwitchPage;
            $scope.onToggleMenu = onToggleMenu;
            $scope.isActiveState = isActiveState;

            // Update page after language changed
            $rootScope.$on('languageChanged', function (event) {
                $state.reload();
            });

            // Update page after theme changed
            $rootScope.$on('themeChanged', function (event) {
                $state.reload();
            });

            // Connect to server
            openConnection();

            return;

            // --------------------------------------------------------------------------------------------------

            function onLanguageClick(language) {
                pipTranslate.use(language);
            }

            function onThemeClick(theme) {
                $rootScope.$theme = theme;
            }

            function onSwitchPage(state) {
                $mdSidenav('left').close();
                $state.go(state);
            }

            function onToggleMenu() {
                $mdSidenav('left').toggle();
            }

            function isActiveState(state) {
                return $state.current.name === state;
            }

            function openConnection() {
                $scope.serverUrl = 'http://alpha.pipservices.net';
                $scope.name = 'Sampler User';
                $scope.login = 'stas15';
                $scope.password = '123456';

                pipRest.getResource('signin').call({
                    login: $scope.login,
                    password: $scope.password
                },
                    (data) => {
                        pipRest.setHeaders({
                            'x-session-id': data.id
                        });
                        pipSession.open(data);

                    },
                    (error) => {

                    });
            }
        }
    );

})(window.angular);
