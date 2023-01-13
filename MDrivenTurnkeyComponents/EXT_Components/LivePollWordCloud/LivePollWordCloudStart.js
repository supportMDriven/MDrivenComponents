/// <reference path="../../Scripts/typings/jquery/jquery.d.ts" />
/// <reference path="../../Scripts/typings/angularjs/angular.d.ts" />
/// <reference path="../../js/MDrivenAngularApp.ts" />


var wordCloudNamespace;
(function (wordCloudNamespace) {

  function UpdateCloud(scope) {
    let copy = [];
    if (scope.data && scope.data.WordCloud) {
      let list = scope.data.WordCloud;
      for (var i = 0, len = list.length; i < len; ++i)
        copy.push({ text: list[i].text, size: (list[i].weight * 30) + i }); // add i it seems important to be unique

      d3.select("#wordSpace").selectAll("*").remove();
      d3.layout.cloud().size([800, 300])
        .words(copy)
        .rotate(0)
        .fontSize(function (d) { return d.size; })
        .on("end", draw)
        .start();

      console.trace("word cloud refreshed");

    }

  }

  function InstallTheDirectiveFor_wordCloud(streamingAppController) {


    streamingAppController.directive('wordCloud', ['$document', function ($document) {
      return {
        link: function (scope, element, attr) {
          scope.$watch('data.CloudNeedsUpdate', function (newv, oldval, thescope) {
            UpdateCloud(thescope);
          });
        }
      };
    }]);





    console.trace("wordCloud component Loaded, inside module");
  }
  InstallTheDirectiveFor_wordCloud(angular.module(MDrivenAngularAppModule));

})(wordCloudNamespace || (wordCloudNamespace = {}));
//# sourceMappingURL=file.js.map