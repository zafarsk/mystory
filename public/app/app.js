angular.module('MyApp',['appRoutes','mainController','userController', 'authService','userService','storyService','storyController','reverseDirective'])

.config(function($httpProvider) {

	$httpProvider.interceptors.push('AuthInterceptor');


})