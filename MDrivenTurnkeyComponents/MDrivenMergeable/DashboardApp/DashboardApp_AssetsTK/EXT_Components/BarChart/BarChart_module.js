function InstallDirectiveForBarChart(streamingAppController) {
  streamingAppController.directive("barChart", function () {
    return function (scope, element, attrs) {
      // Google charts packages promise
      const chartLibrary = google.charts.load("current", {
        packages: ["corechart"],
      });

      var dataTable = []; // chart data array
      var options = {
        title: "",
        hAxis: { format: "#,### Ugx", minorGridlines: {color: '#ffffff'} },
        vAxis: { title: "Inventory"},
        animation: {
          duration: 2000,
          easing: 'out'
        },
        bars: "horizontal",
        legend: { position: "none" },
      }; // google charts settings
      var chart;
      var data;

      // watch for changes to PerformanceData List ngModel attribute

      scope.$watchCollection(attrs.ngModel, function (newValue, oldValue) {
        if (newValue) {
          refreshChart(newValue);
        } else {
          var noDataElement = document.createElement("div");
          noDataElement.innerHTML =
            "<h5 class='no-data-label' style='padding: 50px 80px'>No data is available</h5>";
          element[0].append(noDataElement);
        }
      });

      function refreshChart(data) {
        setTimeout(() => {
          
          // set chart title
          const chartTitle = scope.data[attrs.ngModel.split(".")[1] + "_Title"];
          if (chartTitle) {
            options["title"] = chartTitle;
          }
          dataTable = [["Inventory", "Sales"]];
          for (var i = 0; i < data.length; i++) {
            const { Label, Value } = data[i];
            dataTable.push([Label, Value]);
          }

          // (re)draw chart when there are changes to chart data
          chartLibrary.then(drawChart);
        }, 1000);
      }

      function drawChart() {
        const noDataLabel = element[0].querySelector('h5.no-data-label')
        if(noDataLabel !== null){
          element[0].innerHTML = "";
          chart = new google.visualization.BarChart(element[0]);
        }
        data = google.visualization.arrayToDataTable(dataTable);
        
        chart.draw(data, options);
      }
    };
  });
}
InstallDirectiveForBarChart(angular.module(MDrivenAngularAppModule));
