(function(angular) {
	'use strict';
	
	angular.module('auth-starter').provider('AuthService', AuthServiceProvider);
	
	function AuthServiceProvider() {
		var tokenEndpoint = '';
		
		this.setTokenEndpoint = function (value) {
			tokenEndpoint = value;
		};
		
		this.$get = ['$http', '$q', 'jwtHelper', 'localStorageService', '$rootScope', function($http, $q, jwtHelper, localStorageService, $rootScope) {
			return new AuthService($http, $q, jwtHelper, localStorageService, $rootScope, tokenEndpoint);
		}];
		
	}
	
	function AuthService($http, $q, jwtHelper, localStorageService, $rootScope, tokenEndpoint) {
		//////////////////////////////////
		// Service globals
		var loginPromise, authenticationCache;
		
		//////////////////////////////////
		// Service interface
		return {
			login: login,
			logout: logout,
			getAuth: getAuth,
			userHasClaim: userHasClaim
		}
		
		//////////////////////////////////
		// Service implementation
		function login(username, password) {
			return $q.when(authenticationCache || (loginPromise ? loginPromise.promise : loginAsync(username, password)));
		}
		
		function loginAsync(username, password) {
			loginPromise = $q.defer();
			
			$http.post(tokenEndpoint, {username: username, password: password}).then(function (success) {
				localStorageService.set('jwt', {
					token: success.data.access_token // grab token from server response here
				});
				updateCache();
				
				$rootScope.$broadcast('authCacheUpdated');
				loginPromise.resolve(authenticationCache);
				loginPromise = null;
			}, function (error) {
				logout();
				loginPromise.reject(error);
				loginPromise = null;
			});
			
			return loginPromise.promise;
		}
		
		function getAuth() {
			return $q.when(authenticationCache || (loginPromise ? loginPromise.promise : null));
		}
		
		function logout() {
			localStorageService.remove('jwt');
			authenticationCache = null;
		}
		
		function userHasClaim(claim) {
			if (authenticationCache && authenticationCache.claims) {
				return _.contains(authenticationCache.claims, claim);
			}
			
			return false;
		}
		
		function updateCache() {
			authenticationCache = null;
			var jwt = localStorageService.get('jwt');
			if (jwt) {
				var token = jwtHelper.decodeToken(jwt.token);
				
				authenticationCache = {};
				authenticationCache.isAuthenticated = true;
				authenticationCache.username = token.sub;
				authenticationCache.claims = token.role; // get claims from token
			}
		}
	}
})(angular);