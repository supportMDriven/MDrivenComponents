/// <reference path="../../Scripts/typings/jquery/jquery.d.ts" />
/// <reference path="../../Scripts/typings/angularjs/angular.d.ts" />
/// <reference path="../../js/MDrivenAngularApp.ts" />


var chartNamespace;
(function (chartNamespace) {

  function UpdateChart(scope) {
    let copychart = [];
    if (scope.data && scope.data.PossibleAnswers) {
      let list = scope.data.PossibleAnswers;
      for (var i = 0, len = list.length; i < len; ++i)
        copychart.push({ text: list[i].AnswerAlternative, size: list[i].Percentage });

     
      d3.select(".chart").selectAll("*").remove();
      var x = d3.scale.linear()
        .domain([0, 100])
        .range([0, 820]);

      d3.select(".chart")
        .selectAll("div")
        .data(copychart)
        .enter().append("div")
        .style("width", function (d) { return x(d.size) + "px"; })
        .style("height", "60px")
        .style("margin", "5px")
        .text(function (d) { return d.text + " " + d.size+"%"; });

      console.trace("chart refreshed");

    }

  }

  function InstallTheDirectiveFor_chart(streamingAppController) {


    streamingAppController.directive('d3chart', ['$document', function ($document) {
      return {
        link: function (scope, element, attr) {
          scope.$watch('data.BarsNeedUpdate', function (newv, oldval, thescope) {
            UpdateChart(thescope);
          });
        }
      };
    }]);



    console.trace("chart component Loaded, inside module");
  }
  InstallTheDirectiveFor_chart(angular.module(MDrivenAngularAppModule));

})(chartNamespace || (chartNamespace = {}));