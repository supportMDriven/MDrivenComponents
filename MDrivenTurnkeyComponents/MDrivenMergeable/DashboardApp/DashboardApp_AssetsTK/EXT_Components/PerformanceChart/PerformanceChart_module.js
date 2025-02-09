function InstallDirectiveForPerformanceChart(streamingAppController) {
  streamingAppController.directive("performanceChart", function () {
    return function (scope, element, attrs) {
      // Google charts packages promise
      const chartLibrary = google.charts.load("current", {
        packages: ["corechart", "line"],
      });

      var dataTable = []; // chart data array
      var options = {
        title: "",
        vAxis: { format: "#,### Ugx", minorGridlines: {color: '#ffffff'}, },
        hAxis: { title: "Year" },
        animation: {
          duration: 2000,
          easing: 'out'
        }
      }; // google charts settings
      var chart;
      var data;

      // watch for changes to PerformanceData List ngModel attribute

      scope.$watch(attrs.chartFilter, function (_) {
        const data = scope.data[attrs.ngModel.split(".")[1]];
        if (data) {
          refreshChart(data);
        } else {
          var noDataElement = document.createElement("div");
          noDataElement.innerHTML =
            "<h5 style='padding: 50px 80px'>No data is available</h5>";
          element[0].append(noDataElement);
        }
      });
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
          const Filter = scope.data["Filter"];
          const ThisYear = scope.data["Year"];
          const ThisMonth = scope.data["Month"];
          // set chart title
          const chartTitle = scope.data[attrs.ngModel.split(".")[1] + "_Title"];
          if (chartTitle) {
            options["title"] = chartTitle;
          }
          if (Filter == "Today") {
            dataTable = [["Hours", "Sales", "Expenses"]];
            options["hAxis"] = { title: "Hours", gridlines: { color: '#ffffff'}, format: 'HH:mm' };

            for (var i = 0; i < data.length; i++) {
              const { Label, Value1, Value2 } = data[i];
              dataTable.push([[Label, 0, 0], Value1, Value2]);
            }
          } else if (Filter == "This Month") {
            dataTable = [["Day", "Sales", "Expenses"]];
            options["hAxis"] = { title: `Month of ${ThisMonth}`, maxValue: 31, gridlines: { color: '#ffffff'} };

            for (var i = 0; i < data.length; i++) {
              const { Label, Value1, Value2 } = data[i];
              dataTable.push([Label, Value1, Value2]);
            }
          } else if (Filter == "This Year") {
            dataTable = [["Month", "Sales", "Expenses"]];
            options["hAxis"] = { title: "Months",  gridlines: { color: '#ffffff'}, format: 'MMM' };

            for (var i = 0; i < data.length; i++) {
              const { Label, Value1, Value2 } = data[i];
              dataTable.push([new Date(ThisYear, Label - 1), Value1, Value2]);
            }
          } else {
            dataTable = [["Date", "Sales", "Expenses"]];
            options["hAxis"] = { title: "Date", gridlines: { color: '#ffffff'}, format: 'MMM d'};

            for (var i = 0; i < data.length; i++) {
              const { Label, Value1, Value2 } = data[i];
              dataTable.push([new Date(Label), Value1, Value2]);
            }
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
InstallDirectiveForPerformanceChart(angular.module(MDrivenAngularAppModule));
