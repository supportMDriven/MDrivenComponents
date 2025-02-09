function InstallDirectiveForPieChart(streamingAppController) {
  streamingAppController.directive("pieChart", [
    "$filter",
    function ($filter) {
      return function (scope, element, attrs) {
        // Google charts packages promise

        const chartLibrary = google.charts.load("current", {
          packages: ["corechart"],
        });

        var dataTable = []; // chart data array
        var options = {}; // google charts settings
        var chart;
        var data;

        // watch for changes to TotalRevenue value ngModel attribute
        scope.$watch(attrs.ngModel, function (value) {
          element[0].innerHTML = "";
          if (value) {
            setTimeout(()=>{
              const { TotalRevenue, TotalCOGS } = scope.data;
              const profit = TotalRevenue - TotalCOGS
              dataTable = [
                ["Section", "Amount"],
                ["Profit", profit > 0 ? profit: 0],
                ["COGS", TotalCOGS],
              ];
  
              options = {
                title: `Revenue ${$filter("currency")(TotalRevenue, "UGX ", 0)}`,
                legend: "none",
                pieSliceText: "label",
                chartArea: {width:'100%',height:'100%'},
                slices: {
                  0: { offset: 0.2 },
                },
              };
  
              // (re)draw chart when there are changes to chart data
              chartLibrary.then(drawChart);
            },1000)
            
          } else {
            var noDataElement = document.createElement("div");
            noDataElement.innerHTML = "<h5 class='no-data-label' style='padding: 50px 80px'>No data is available</h5>";
            element[0].append(noDataElement);
          }
        });

        function drawChart() {
          const noDataLabel = element[0].querySelector('h5.no-data-label')
          if(noDataLabel !== null){
            element[0].innerHTML = "";
            chart = new google.visualization.PieChart(element[0]);
          }
          data = google.visualization.arrayToDataTable(dataTable);
          
          chart.draw(data, options);
        }
      };
    },
  ]);
}
InstallDirectiveForPieChart(angular.module(MDrivenAngularAppModule));
