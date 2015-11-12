(function(angular) {
	'use strict';
	
	// service declaration
	angular.module('auth-starter').factory('AuthInterceptor', AuthInterceptor);
	
	// manually define service dependencies
	AuthInterceptor.$inject = ['$q', '$location', 'localStorageService'];
	
	function AuthInterceptor($q, $location, localStorageService) {
		/////////////////////////////////////
		// service interface
		return {
			request: request,
			responseError: responseError
		}
		
		/////////////////////////////////////
		// service implementation
		
		function request(config) {
			config.header = config.headers || {};
			
			var authData = localStorageService.get('auth');
			if (authData) {
				config.headers.Authorization = 'Bearer ' + authData.token;
			}
			
			return config;
		}
		
		function responseError(response) {
			if (response.status === 401) {
				$location.path('/');
			}
			return $q.reject(response);
		}
	}
})(angular);