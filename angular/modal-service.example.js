(function() {
	'use strict';
	angular
		.module('app.modals')
		.service('ModalsService', ModalsService);

	ModalsService.$inject = ['$uibModal'];
	function ModalsService($uibModal) {

		this.openLoginModal = openLoginModal;
		this.openRegisterModal = openRegisterModal;
		this.openOrgEditModal = openOrgEditModal;
		this.openOrgDeleteModal = openOrgDeleteModal;


		function openLoginModal() {
			return $uibModal.open({
				animation: true,
				templateUrl: 'views/pages/login.html',
				controller: 'LoginController'
			}).result;
		}

		function openRegisterModal() {
			return $uibModal.open({
				animation: true,
				templateUrl: 'views/pages/register.html',
				controller: 'RegisterController'
			}).result;
		}

		function openOrgEditModal(org) {
			return $uibModal.open({
				animation: true,
				templateUrl: 'views/pages/org-edit.html',
				controller: 'ModifyOrgController',
				resolve: {
					org: org
				}
			}).result;
		}

		function openOrgDeleteModal(org) {
			return $uibModal.open({
				animation: true,
				templateUrl: 'views/pages/delete-confirm.html',
				controller: 'ModifyOrgController',
				resolve: {
					org: org
				}
			}).result;
		}

	}
})();
