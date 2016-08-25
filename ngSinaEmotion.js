(function(window, angular, undefined) {
	'use strict';

	angular.module('SinaEmotion', [])
		.directive('emotion', [
			'$timeout', '$log',
			function(uiSortableConfig, $timeout, $log) {
				return {
					require: '?ngModel',
					scope: {
						ngModel: '=',
					},
					link: function(scope, element, attrs, ngModel) {
						$log.debug('elem: ', element);
					}
				}
			}
		])
		.service('SinaEmotion', ['$document', '$rootScope', function($document, $rootScope) {

		}])
})(window, window.angular);