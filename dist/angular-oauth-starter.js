(function (angular) {
	'use strict';
	
	angular.module('auth-starter').directive('claimsRequired', ClaimsRequired);
	
	ClaimsRequired.$inject = ['AuthService'];
	
	function ClaimsRequired(AuthService) {
		return {
			restrict: 'A',
			link: function(scope, element, attr) {
				// update on load
				update();
				
				// update after auth cache updates
				scope.$on('authCacheUpdated', function () {
					update();
				});
				
				// update function:
				// this function hides an element and displays it if the user has the right permissions for displaying it
				function update() {
					// hide by default
					element.addClass('hidden');
					
					// read the required claims that allow access to this element
					var requiredClaims = attr.claimsRequired.split(",");
					
					// if the user is in one of the required roles, show the element
					if (_.some(requiredClaims, function (requiredClaim) { return AuthService.userHasClaim(requiredClaim); })) {
						element.removeClass('hidden');
					}
				}
			}
		}
	}
})(angular);
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
(function(angular) {
	'use strict';
	
	angular.module('auth-starter', ['angular-jwt', 'LocalStorageModule']);
})(angular);
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