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