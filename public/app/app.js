angular.module('MyApp',['appRoutes','mainController','authService','userService'])

.config(function($httpProvider) {

	$httpProvider.interceptors.push('AuthInterceptor');


})