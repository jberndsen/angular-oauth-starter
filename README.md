# angular-oauth-starter
Starter pack for integrating JWT token security in your Angular application.

## Installation
Perform one of the following to add the package to your project.

````bash
bower install angular-oauth-starter
````

````bash
npm install angular-oauth-starter
````

## Using it
First, add the package as a module dependency and set up the token endpoint. The token endpoint is
a url to which a username/password combination will posted and a JWT token will be returned. Be sure
to use https when sending sensitive user credentials.

Second, add the AuthInterceptor to the $httpProvider interceptor list, as shown below. This ensures
that if a user has a token, it will be added to the Authorization header of each request.

````js
var app = angular.module('app', ['angular-oauth-starter']);

app.config(function (AuthServiceProvider, $httpProvider) {
		AuthServiceProvider.setTokenEndpoint('https://example.net/token');
		
		$httpProvider.interceptors.push('AuthInterceptor');
});
````

## providing login functionality for your users
Build a regular login page, with a controller that can read the username and password from the scope.
Then, use the AuthService to attempt a login:

````js
angular.module('app').controller('LoginController', function (AuthService) {
	var vm = this;
	
	// attach this method to a login button
	vm.login = function() {
		AuthService.login(vm.username, vm.password).then(function (result) {
			if (result && result.isAuthenticated) {
				// login succesful! Redirect the user to a success path
			} else {
				// login failed, show an error message here	
			}
		}, function (error) {
			// an error occurred while attempting to login, please check console for further details
			console.debug(error);
		});
	}
});
````

## Logging out
Simply call the logout() method on the AuthService. This will remove any auth caching and the token from memory,
effectively logging out the user.

## Programatically check if a user has certain claims
Call the userHasClaim(CLAIM_NAME) method on the AuthService:

````js
vm.userHasAccess = AuthService.userHasClaim('personalAccess');
````

## Hiding restricted elements
Can be done using the claimsRequired directive as follows:

````html
<a href="/personal" claims-required="personalAccess">Go to personal page</a>
````

This element will be shown/hidden based on the roles encapsulated in the returned JWT token (role property).

## Restricting access to controllers
Can be done using the default Angular routing resolver as follows:

````js
angular.module('app').config(function($routeProvider) {
	$routeProvider.when('/home', {
		templateUrl: 'home.html',
		controller: 'HomeController',
	}
	
	$routeProvider.when('/personal', {
		templateUrl: 'personal.html',
		controller: 'PersonalController',
		resolve: {
			authentication: function (AuthService) { return AuthService.getAuth(); }	
		}
	}
});
````
##Contributing

Just clone the repo, run npm install, bower install and gulp.

##Author

[Jeroen Berndsen](https://github.com/jberndsen/)

##License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.