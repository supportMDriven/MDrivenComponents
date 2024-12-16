function InstallDirectiveForColumnChart(streamingAppController) {
  streamingAppController.directive("columnChart", function () {
    return function (scope, element, attrs) {
      // Google charts packages promise
      const chartLibrary = google.charts.load("current", {
        packages: ["corechart", "bar"],
      });

      var dataTable = []; // chart data array
      var options = {
        title: "",
        vAxis: { format: "#,### Ugx", minorGridlines: {color: '#ffffff'} },
        hAxis: { title: "Year" },
        animation: {
          duration: 2000,
          easing: 'out'
        },
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
          dataTable = [["Year", "Revenue", "Expenses"]];
          for (var i = 0; i < data.length; i++) {
            const { Label, Value1, Value2 } = data[i];
            dataTable.push([Label, Value1, Value2]);
          }

          // (re)draw chart when there are changes to chart data
          chartLibrary.then(drawChart);
        }, 1000);
      }

      function drawChart() {
        const noDataLabel = element[0].querySelector('h5.no-data-label')
        if(noDataLabel !== null){
          element[0].innerHTML = "";
          chart = new google.visualization.ColumnChart(element[0]);
        }
        data = google.visualization.arrayToDataTable(dataTable);
        
        chart.draw(data, options);
      }
    };
  });
}
InstallDirectiveForColumnChart(angular.module(MDrivenAngularAppModule));
