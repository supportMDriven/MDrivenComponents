function InstallDirectiveForComboChart(streamingAppController) {
  streamingAppController.directive("comboChart", [
    "$document",
    function ($document) {
      return {
        link: function (scope, element, attrs) {
          // Google charts packages promise
          const chartLibrary = google.charts.load("current", {
            packages: ["corechart"],
          });

          var dataTable = []; // chart data array
          var options = {
            title: "Annual Performance",
            vAxis: { format: "#,###" },
            hAxis: { title: "Items" },
            seriesType: "bars",
            series: { 2: { type: "line" } },
          }; // google charts settings
          var chart;
          var data;

          // watch for changes to ChartData ngModel attribute

          scope.$watchCollection(attrs.ngModel, function (newValue, oldValue) {
            
            if (newValue) {
              refreshChart(newValue);
            } else {
              var noDataElement = document.createElement("div");
              noDataElement.innerHTML =
                "<h5 style='padding: 50px 80px'>No data is available</h5>";
              element[0].append(noDataElement);
            }
          });

          function refreshChart(data) {
            dataTable = [["Category", "Budget", "Current", "Variation"]];

            setTimeout(() => {
              const value = data;

              // parse title of the chart from viewmodel
              const chartTitle =
                scope.data[attrs.ngModel.split(".")[1] + "_Title"];
              if (chartTitle) {
                options["title"] = chartTitle;
              }
              for (var i = 0; i < value.length; i++) {
                const { Name, BudgetAmount, CurrentAmount, Variation } =
                  value[i];
                dataTable.push([Name, BudgetAmount, CurrentAmount, Variation]);
              }

              element[0].innerHTML = "";
              // (re)draw chart when there are changes to chart data
              chartLibrary.then(drawChart);
            }, 1000);
          }

          function drawChart() {
            data = google.visualization.arrayToDataTable(dataTable);
            chart = new google.visualization.ComboChart(element[0]);
            chart.draw(data, options);
          }
        },
      };
    },
  ]);
}
InstallDirectiveForComboChart(angular.module(MDrivenAngularAppModule));
