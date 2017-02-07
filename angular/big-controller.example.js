(function() {
	'use strict';
	angular
		.module('app.act-form')
		.controller('ActFormController', ActFormController);

	ActFormController.$inject = ['API_CONFIG', '$scope', '$rootScope', 'ApiService', 'ModalsService', '$stateParams'];
	function ActFormController(API_CONFIG, $scope, $rootScope, api, modals, $stateParams) {

		$scope.stepsCount = 5;

		$scope.step = 1;
		$scope.disablePrev = $scope.step === 1;

		$scope.generateErrorMessages = (form) => {
			let errorMessages = [];
			if (form.$error.required !== undefined) {
				errorMessages.push('Все поля обязательны к заполнению');
			}
			if (form.$error.minlength !== undefined) {
				errorMessages.push('Значения должны быть не менее 10');
			}
			if (form.$error.maxlength !== undefined) {
				errorMessages.push('Значения должны быть не более 99999');
			}
			if (form.$error.pattern !== undefined) {
				errorMessages.push('Номер должен быть вида а123аа177 у автомобилей и аа1234177 у прицепов и полуприцепов');
			}
			return errorMessages;
			//return form.$error;
		};

		$scope.next = () => {
			if ($scope.step === 1 && !$scope.vehicleForm.$valid) return;
			if ($scope.step === 2 && !$scope.weightsForm.$valid) return;
			if ($scope.step === 3 && !$scope.dateForm.$valid) return;
			if ($scope.step === 4 && !$scope.scalesForm.$valid) return;
			if ($scope.step === 5 && !$scope.orgForm.$valid) return;
			if ($scope.step < $scope.stepsCount) $scope.step++;
			$scope.disableNext = $scope.step === $scope.stepsCount;
			$scope.disablePrev = $scope.step === 1;
			if ($scope.step === 2) getPermittedWeights($scope.vehicle)
		};

		$scope.previous = () => {
			if ($scope.step > 1) $scope.step--;
			$scope.disablePrev = $scope.step === 1;
			$scope.disableNext = $scope.step === $scope.stepsCount;
		};

		$scope.act = {
			roadType: '10'
		};

		$scope.scales = $stateParams.act.scales || {};
		$scope.vehicle = $stateParams.act.vehicle || {};
		$scope.org = $stateParams.act.org || {};

		$scope.vehicleParts = [];

		$scope.numberRegexp = {
			'single-axis': '[а-яА-Яa-zA-Z]\\d\\d\\d[а-яА-Яa-zA-Z][а-яА-Яa-zA-Z]\\d\\d\\d?',
			'truck-axis': '[а-яА-Яa-zA-Z]\\d\\d\\d[а-яА-Яa-zA-Z][а-яА-Яa-zA-Z]\\d\\d\\d?',
			'trailer-axis': '[а-яА-Яa-zA-Z][а-яА-Яa-zA-Z]\\d\\d\\d\\d\\d\\d\\d?',
			'semitrailer-axis': '[а-яА-Яa-zA-Z][а-яА-Яa-zA-Z]\\d\\d\\d\\d\\d\\d\\d?'
		};

		$scope.axisLengthsOptions = [
			{
				label: 'менее 1 метра',
				value: '<1'
			},
			{
				label: 'от 1 до 1,3 метра',
				value: '1-13'
			},
			{
				label: 'от 1,3 до 1,8 метра',
				value: '13-18'
			},
			{
				label: 'более 1,8 метра',
				value: '>18'
			}
		];

		$scope.roadTypesOptions = [
			{
				label: 'Нагрузка до 6 тонн на ось',
				value: '6'
			},
			{
				label: 'Нагрузка до 10 тонн на ось',
				value: '10'
			},
			{
				label: 'Нагрузка до 11,5 тонн на ось',
				value: '11-5'
			}
		];

		$scope.tireTypesOptions = [
			{
				label: 'Односкатные',
				value: 'singleWheel'
			},
			{
				label: 'Двускатные',
				value: 'dualWheel'
			}
		];

		$scope.vehicleTypesOptions = [
			{
				label: 'Одиночное ТС',
				value: 'single'
			},
			{
				label: 'ТС с прицепом',
				value: 'single-trailer'
			},
			{
				label: 'Тягач с полуприцепом',
				value: 'truck-semitrailer'
			}
		];

		function getPermittedWeights (vehicle) {
			angular.forEach($scope.vehicleParts, part => {
				for (let i in vehicle[part.name].bridges) {
					if (vehicle[part.name].bridges[i] === null) continue;
					angular.forEach(vehicle[part.name].bridges[i].axisWeights, axisWeight => {
						api.getWeight(
							$scope.act['roadType'],
							vehicle[part.name].bridges[i]['axisCount'],
							vehicle[part.name].bridges[i]['tireType'],
							vehicle[part.name].bridges[i]['axisLength']
						)
						.then(weight => {
							axisWeight.permitted = weight;
							$scope.$apply();
						})
						.catch(e => console.log(e));
					})
				}
			});
		}


		$scope.getVehicleType = (name) => {
			api.getVehicleType(name)
				.then(vehicle => {
					$scope.vehicleParts = vehicle.subMenus;
					angular.forEach($scope.vehicleParts, part => {
						$scope.vehicle[part.name] = {};
						$scope.vehicle[part.name].value = part.values[0].value;
						$scope.vehicle[part.name].img = part.values[0].img;
						$scope.vehicle[part.name].bridges = part.values[0].bridges;
						//$scope.vehicle[part.name].numberFormat = part.values[0].numberFormat;
					});
					$scope.$apply();
				})
				.catch(error => console.warn(error));
		};

		$scope.setAxis = (part) => {
			angular.forEach(part.values, (value) => {
				if (value.value === $scope.vehicle[part.name].value) {
					$scope.vehicle[part.name].bridges = value.bridges;
					$scope.vehicle[part.name].img = value.img;
				}
			})
		};

		$scope.isLengthNeed = function(bridge) {
			return !(bridge === null || bridge.axisWeights.length === 1)
		};

		$scope.date = {
			opened: false,
			open: function () {
				$scope.date.opened = true;
			},
			options: {
				formatYear: 'yy',
				startingDay: 1
			}
		};

		$scope.setNow = () => {
			$scope.act.time = new Date();
			$scope.act.date = new Date();
		};

		$scope.setNow();

		$scope.getVehicles = type => {
			if ($rootScope.appUser !== undefined) return api.getVehicles(`${type}-axis`);
		};

		$scope.vehicleSelect = (vehicle) => {
			let part = $scope.vehicle[vehicle.type];
			part.gosNumber = vehicle.gosNumber;
			part.value = vehicle.value;
			part.bridges = vehicle.bridges;
			part.selected = true;
			if (vehicle.type === 'single-axis') $scope.vehicle.model = vehicle.model;
		};

		$scope.getScales = () => {
			if ($rootScope.appUser !== undefined) return api.getScales();
		};

		$scope.scalesSelect = (scales) => {
			$scope.scales.number = scales.number;
			$scope.scales.isInRegister = scales.isInRegister;
			$scope.scales.numberRegister = scales.numberRegister;
			$scope.scales.dateCheck = new Date(scales.dateCheck);
			$scope.scales.selected = true;
		};

		$scope.saveScales = scales => api.saveScales(scales);

		$scope.getOrgs = () => {
			if ($rootScope.appUser !== undefined) return api.getOrgs();
		};

		$scope.orgSelect = (org) => {
			$scope.org.number = org.number;
			$scope.org.inn = org.inn;
			$scope.org.kpp = org.kpp;
			$scope.org.address = org.address;
			$scope.org.email = org.email;
			$scope.org.phone = org.phone;
			$scope.org.operatorName = org.operatorName;
			$scope.org.leadName = org.leadName;
			$scope.org.leadPhone = org.leadPhone;
			$scope.org.selected = true;
		};

		$scope.saveOrg = org => api.saveOrg(org);

		$scope.formAct = function() {

			$scope.vehicleParts.forEach(part => {
				if (part.name === 'single-axis' || part.name === 'truck-axis')
					$scope.vehicle[part.name].model = $scope.vehicle.model;
			});

			$scope.act.vehicle = $scope.vehicle;
			$scope.act.org = $scope.org;
			$scope.act.scales = $scope.scales;
			Promise.resolve()
				.then(() => {
					if ($rootScope.appUser === undefined)
						return modals.openRegisterModal()
							.then(res => {
								if (res === 'registered') $rootScope.$broadcast('logged-in');
							});
					else return Promise.resolve();
				})
				.then(() => {
					let saves = [];
					if ($rootScope.appUser !== undefined) {
						if (!$scope.scales.selected) saves.push(api.saveScales($scope.scales));
						if (!$scope.org.selected) saves.push(api.saveOrg($scope.org));
						$scope.vehicleParts.forEach(part => {
							if (!$scope.vehicle[part.name].selected) saves.push(api.saveVehicle($scope.vehicle[part.name], part.name));
						})
					}
					return Promise.all(saves);
				})
				.then(() => api.saveAct($scope.act))
				.then(actId => {
					$scope.actId = actId;
					$scope.$apply();
				});
		};

		$scope.printAct = () => {
			window.open(API_CONFIG.address + 'public-act/pdf/' + $scope.actId)
		};

		$scope.setPopover = function(event) {
			if ($rootScope.appUser !== undefined) return;
			if (event === 'blur') $scope.showPopover = false;
			if (event === 'focus') $scope.showPopover = true;
		}
	}
})();
