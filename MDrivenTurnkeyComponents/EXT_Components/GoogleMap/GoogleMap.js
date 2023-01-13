

function initMap() {
  
}

function UpdatePosition(row)
{
  var markertoUpdate = dictionaryOfIdsAndMarkers[row.VMClassId.asString];
  if (row.lat != null && row.lng != null) {
    markertoUpdate.setPosition({ lat: row.lat, lng: row.lng });
    markertoUpdate.setMap(map);
    if (row.color != null )
      markertoUpdate.setIcon('http://maps.google.com/mapfiles/ms/icons/' + row.color+'-dot.png');
    if (row.title != null )
      markertoUpdate.setTitle(row.title);
    }
  else
  {
    markertoUpdate.setMap(null);
  }
}

function placeMarker(location, scope) {

  scope.data.VM_Variables.vLat = location.lat();
  scope.data.VM_Variables.vLng = location.lng();
  scope.data.Execute('AddMarker');
/*  var marker = new google.maps.Marker({
    position: location,
    map: map
  });*/
}

var map;
var dictionaryOfIdsAndMarkers = {};

function InstallTheDirectiveFor_GoogleMap(streamingAppController) {
  streamingAppController.directive('googlemap', ['$document', function ($document) {
    return {
      link: function (scope, element, attr) {
        // THIS IS WHERE YOU SEE THE HTML(element) AND THE DATA (scope) FOR EVERYTHING THAT USE OUR DIRECTIVE (test1)
        var theposition = { lat: 59.325, lng: 18.073 };
        var thezoom=4;
        if ((scope.data.Zoom!=undefined) && (scope.data.CenterLat!=undefined) && (scope.data.CenterLng!=undefined))
        {
           theposition.lat=scope.data.CenterLat;
           theposition.lng=scope.data.CenterLng;
           thezoom=scope.data.Zoom;
  
        }
        map = new google.maps.Map(element[0], {
          zoom: thezoom,
          center: theposition
        });

          google.maps.event.addListener(map, 'click', function (event) {
            placeMarker(event.latLng, scope);
          });

          google.maps.event.addListener(map, 'center_changed', function () {
            scope.data.CenterLat=map.getCenter().lat();
            scope.data.CenterLng=map.getCenter().lng();
            scope.data.Zoom=map.getZoom();
          });
          
      }
    };
  }]);

  streamingAppController.directive('googlemapmarker', ['$document', function ($document) {
    return {
      link: function (scope, element, attr) {
        // THIS IS WHERE YOU SEE THE HTML(element) AND THE DATA (scope) FOR EVERYTHING THAT USE OUR DIRECTIVE (test1)


        scope.$watch('row.lat', function (newv, oldval, thescope) {
          UpdatePosition(thescope.row);
        });
        scope.$watch('row.lng', function (newv, oldval, thescope) {
          UpdatePosition(thescope.row);
        });
        scope.$watch('row.color', function (newv, oldval, thescope) {
          UpdatePosition(thescope.row);
        });
        scope.$watch('row.VMClassId.asString', function (newv, oldval, thescope) {
          var marker = dictionaryOfIdsAndMarkers[oldval];
          dictionaryOfIdsAndMarkers[oldval] = null;
          dictionaryOfIdsAndMarkers[newv] = marker;
        });
        scope.$on('$destroy', function (thescope) {
          dictionaryOfIdsAndMarkers[thescope.currentScope.row.VMClassId.asString].setMap(null);
        });

        var newmarker = new google.maps.Marker();
        newmarker.setDraggable(true),
        newmarker.setTitle("Drag me!");
        dictionaryOfIdsAndMarkers[scope.row.VMClassId.asString] = newmarker;

        newmarker.addListener('dragend', function (event) {
          scope.row.lat = event.latLng.lat();
          scope.row.lng = event.latLng.lng();
        });

        UpdatePosition(scope.row);

      }
    };
  }]);

  console.trace("googlemap component Loaded");
}
InstallTheDirectiveFor_GoogleMap(angular.module(MDrivenAngularAppModule));







