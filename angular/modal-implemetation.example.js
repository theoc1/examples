(function() {
	'use strict';

	angular.module('app.navbar')
		.controller('NavbarController', NavbarController);

	NavbarController.$inject = ['$state', '$rootScope', 'ModalsService', 'ApiService'];
	function NavbarController($state, $rootScope, modals, api) {

		this.openLoginModal = () => {
			modals.openLoginModal()
				.then((res) => {
					if (res === 'logged-in') $rootScope.$broadcast('logged-in');
				})
				.catch(err => console.log('Error: ', err));
		};

		this.openRegisterModal = () => {
			modals.openRegisterModal()
				.then((res) => {
					if (res === 'registered') $rootScope.$broadcast('logged-in');
				})
				.catch(err => console.log('Error: ', err));
		};

		this.logout = () => {
			api.logout();
			$rootScope.appUser = undefined;
			$rootScope.$broadcast('logged-out');
			$state.go('app.start');
		};
	}
})();