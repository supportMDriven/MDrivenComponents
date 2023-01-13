
/// <reference path="../../Scripts/typings/jquery/jquery.d.ts" />
/// <reference path="../../Scripts/typings/angularjs/angular.d.ts" />
/// <reference path="../../js/MDrivenAngularApp.ts" />


namespace svgComponentNamespace {

var  _TheSVG =null;
var _ViewData=null;

function makeDraggable(svg:HTMLBaseElement) {

  svg.addEventListener('mousedown', startDrag);
  svg.addEventListener('mousemove', drag);
  svg.addEventListener('mouseup', endDrag);
  svg.addEventListener('mouseleave', endDrag);

  var selectedElement = null;
  var selectedobject=null;
  var offset;

  function getMousePosition(evt) {
    var CTM = svg.getScreenCTM();
    return {
      x: (evt.clientX - CTM.e) / CTM.a,
      y: (evt.clientY - CTM.f) / CTM.d
    };
  }

  function startDrag(evt) {
    var target=evt.target;
    if (target.tagName!="g")
    {
     target=evt.target.parentElement;
    }
    if (target.classList.contains('draggable')) {
      selectedElement =target;
      var vmclassid=selectedElement.attributes['vmclassid'].value;
      selectedobject=_ViewData.VMClassIdMap[vmclassid];
      if (selectedobject) {
        offset = getMousePosition(evt);
        offset.x -= selectedobject.x;
        offset.y -= selectedobject.y;
        selectedobject.SelectRow();
      }
    }
  }
  function drag(evt) {
    if (selectedobject) {
      evt.preventDefault();
      var coord = getMousePosition(evt);
      selectedobject.x=coord.x - offset.x;
      selectedobject.y=coord.y - offset.y;
      _ViewData.StreamingAppClient.CancelTimerForSending();
    }
  }
  function endDrag(evt) {
    if (selectedobject) {
      _ViewData.StreamingAppClient.ScheduleTimerForSending(1);
    }
    selectedElement = null;
    selectedobject = null;
    evt.preventDefault();
  }
}

  

   function InstallTheDirectiveFor_svgComponent(streamingAppController) {
    streamingAppController.directive('thesvg', ['$document', function ($document) {
      return {
        link: function (scope, element: HTMLDivElement[], attr) {
          console.trace("svgComponent component Loaded");
          _TheSVG=element[0];
          _ViewData=scope.ViewData;
           makeDraggable(_TheSVG);
        }
      };
    }]);


  }


  InstallTheDirectiveFor_svgComponent(angular.module(MDrivenAngularAppModule));
}