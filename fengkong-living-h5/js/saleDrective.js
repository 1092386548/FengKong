angular.module('saleDrective.directives', [])
    .directive('rjCloseBackDrop', [function () {
        return {
            scope: false,
            restrict: 'A',
            replace: false,
            link: function ($scope, iElm, iAttrs, controller) {
                var htmlEl = angular.element(document.querySelector('html'));
                htmlEl.on("click", function (event) {
                    if (event.target.nodeName === "HTML" & $scope.myPopup) {
                        $scope.myPopup.close();
                    }
                });
            }
        };
    }])