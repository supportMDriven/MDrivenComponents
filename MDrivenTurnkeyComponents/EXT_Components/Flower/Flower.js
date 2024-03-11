function InstallTheDirectiveFor_flower(streamingAppController) {
    streamingAppController.directive('flower', ['$document', function ($document) {
            return {
                link: function (scope, element, attr) {
                    // THIS IS WHERE YOU SEE THE HTML(element) AND THE DATA (scope) FOR EVERYTHING THAT USE OUR DIRECTIVE (test1)
                    var c = document.createElement('canvas');
                    element[0].appendChild(c);
                }
            };
        }]);
  console.trace("flower component Loaded");
}
InstallTheDirectiveFor_flower(angular.module(MDrivenAngularAppModule));