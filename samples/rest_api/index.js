/* global angular */

(function () {
    'use strict';

    var content = [
        { title: 'Areas', state: 'auth', url: '/areas', controller: 'AreasController', templateUrl: 'areas.html' },
        { title: 'Goals', state: 'rest', url: '/goals', controller: 'GoalsController', templateUrl: 'goals.html' },
        { title: 'Entry', state: 'entry', url: '/entry', controller: 'EntryController', templateUrl: 'entry.html' }
    ];

    var thisModule = angular.module('appRestServices',
        [
            // 3rd Party Modules
            'ui.router', 'ui.utils', 'ngResource', 'ngAria', 'ngCookies', 'ngSanitize', 'ngMessages',
            'ngMaterial', 'wu.masonry', 'LocalStorageModule', 'angularFileUpload', 'ngAnimate',
            'pipServices', 'pipCommonRest',
            // 'pipData',
            'appRestServices.Areas', 'appRestServices.Goals', 'appRestServices.Entry'
        ]
    );

    thisModule.config(function (pipTranslateProvider, $stateProvider, $urlRouterProvider, $mdThemingProvider) {

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
            'APPLICATION_TITLE': 'WebUI пример',

            'blue': 'Голубая тема',
            'green': 'Зелёная тема',
            'pink': 'Розовая тема',
            'grey': 'Серая тема'
        });

        for (var i = 0; i < content.length; i++) {
            var contentItem = content[i];
            $stateProvider.state(contentItem.state, contentItem);
        }

        $urlRouterProvider.otherwise('/translate');
    }
    );

    thisModule.controller('AppController',
        function ($scope, $rootScope, $state, $mdSidenav, pipTranslate, pipRest, pipSession) {
            $scope.languages = ['en', 'ru'];
            $scope.themes = ['blue', 'green', 'pink', 'grey'];

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
                console.log('Reloading...');
                console.log($state.current);
                console.log($state.params);

                $state.reload();
            });

            // Update page after theme changed
            $rootScope.$on('themeChanged', function (event) {
                $state.reload();
            });

            // Connect to server
            openConnection();

            return;

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
                return $state.current.name == state;
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

})();
