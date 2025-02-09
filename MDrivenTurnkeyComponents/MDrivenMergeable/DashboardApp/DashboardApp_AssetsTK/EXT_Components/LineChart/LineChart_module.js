function InstallDirectiveForLineChart(streamingAppController) {
  streamingAppController.directive("lineChart", function () {
    return function (scope, element, attrs) {
      // Google charts packages promise
      const chartLibrary = google.charts.load("current", {
        packages: ["corechart", "line"],
      });

      var dataTable = []; // chart data array
      var options = {
        vAxis: { format: "#,### Ugx", minorGridlines: {color: '#ffffff'}, },
        hAxis: { title: "Year" },
        animation: {
          duration: 2000,
          easing: 'out'
        }
      }; // google charts settings
      var chart;
      var data;

      // watch for changes to data ngModel attribute

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
        
        options["hAxis"] = { title: "Date", gridlines: {color: '#ffffff'}, format: 'MMM d'};
        setTimeout(() => {
          // set chart title
          const chartTitle = scope.data[attrs.ngModel.split(".")[1] + "_Title"];


          if (chartTitle) {
            options["title"] = chartTitle;
          }

          dataTable = [["Date", "Profit"]];
          
          for (var i = 0; i < data.length; i++) {
            const { Period, Value } = data[i];
            dataTable.push([new Date(Period), Value])
          }

          
          // (re)draw chart when there are changes to chart data
          chartLibrary.then(drawChart);
        }, 1000);
      }

      function drawChart() {
        const noDataLabel = element[0].querySelector('h5.no-data-label')
        if(noDataLabel !== null){
          element[0].innerHTML = "";
          chart = new google.visualization.LineChart(element[0]);
        }
        data = google.visualization.arrayToDataTable(dataTable);
        
        chart.draw(data, options);
      }
    };
  });
}
InstallDirectiveForLineChart(angular.module(MDrivenAngularAppModule));
