/// <reference path="../../Scripts/typings/jquery/jquery.d.ts" />
/// <reference path="../../Scripts/typings/angularjs/angular.d.ts" />
/// <reference path="../../js/StreamingAppViewData.ts" />
/// <reference path="../../js/StreamingAppCtrl.ts" />
/// <reference path="tkDateScaler.ts" />
/// <reference path="tkGanttRow.ts" />




class GanttViewLogic {
  private _data: StreamingApp.VMClassObject;
  private _Element: HTMLDivElement;
  private _document: HTMLDocument
  private _datescaler: DateScaler;


  Init(data: StreamingApp.VMClassObject, element: HTMLDivElement[], document: HTMLDocument[]): void {
    this._data = data;
    this._Element = element[0];
    this._document = document[0];

    let tree: any = this._Element;
    if (typeof tree != 'undefined') {
      if (typeof tree.openedClass != 'undefined') {
        GanttViewLogic._openedClass = tree.openedClass;
      }
      if (typeof tree.closedClass != 'undefined') {
        GanttViewLogic._closedClass = tree.closedClass;
      }

      let lookfordatescaler: NodeListOf<Element> = this._Element.getElementsByClassName('tkDateScaler');
      if (lookfordatescaler.length > 0) {
        this._datescaler = new DateScaler();
        this._datescaler.Start = new Date(2017, 6, 1);
        this._datescaler.Stop = new Date(2017, 9, 1);
        let thediv = lookfordatescaler[0] as HTMLDivElement;
        thediv.innerHTML = "";
        this._datescaler.InstallIn(thediv, this._document);
        this._datescaler.OnDateScalerRedrawn = () => {
          for (let gr of this._GanttRows) {
            gr.Invalidate();
          }
        };

        this._datescaler.OnStableAfterChange = () => {
          this._data['DateScalerStart'] = this._datescaler.Start;
          this._data['DateScalerStop'] = this._datescaler.Stop;

        };


      }
    }
  }


  public DateScalerDatesInvalidate() {
    if (this._data['DateScalerStart'] != null && this._data['DateScalerStop'] != null) {
      this._datescaler.SetStartAndStop(this._data['DateScalerStart'], this._data['DateScalerStop']);
    }
  }

  public TreeVisibilityChanged() {
    // make sure the ones made visible again are up to date
    for (let gr of this._GanttRows) {
      gr.Invalidate();
    }
  }

  public static _openedClass = 'glyphicon-triangle-bottom';
  public static _closedClass = 'glyphicon-triangle-right';


  public GetDateScaler(): DateScaler {
    return this._datescaler;
  }


  public IsGanttForThis(element: HTMLElement): boolean {
    return (element === this._Element);
  }

  private _GanttRows: GanttRow[] = [];

  public FindGanttRowElementFromTreeNode(elementForTreeNode: HTMLElement): HTMLDivElement {
    let lookforGanttRow: NodeListOf<Element> = elementForTreeNode.getElementsByClassName('tkGanttRow');
    if (lookforGanttRow.length > 0 && (lookforGanttRow[0] instanceof HTMLDivElement)) {
      return <HTMLDivElement>lookforGanttRow[0];
    }
    return null;
  }

  public HandleTreeNode(elementForTreeNode: HTMLElement, document: HTMLDocument, data: StreamingApp.VMClassListItem): void {
    let ganttRowHtmlElement = this.FindGanttRowElementFromTreeNode(elementForTreeNode);
    if (ganttRowHtmlElement != null) {
      let gr = new GanttRow();
      gr.InstallIn(ganttRowHtmlElement, this, document, data);
      this._GanttRows.push(gr);
    }
  }


  public HandleTreeNodeRemove(elementForTreeNode: HTMLElement): void {
    let ganttRowElement = this.FindGanttRowElementFromTreeNode(elementForTreeNode);
    if (ganttRowElement != null) {
      for (let i = 0; i < this._GanttRows.length; i++) {
        let gr = this._GanttRows[i];
        if (gr.RowDiv === ganttRowElement) {
          gr.Removing();
          this._GanttRows.splice(i, 1);
          break;
        }
      }
    }
  }

  public FindRowFromYPoint(y: number): GanttRow {
    for (let gr of this._GanttRows) {
      let r = gr.RowDiv.getBoundingClientRect();
      if (r.top <= y && r.bottom >= y)
        return gr;
    }
    return null;
  }
}


let _TreeGanttViewLogics: GanttViewLogic[] = [];


function FindOwningGanttFromTreeNode(elementForTreeNode: HTMLElement): GanttViewLogic {
  let ancestor = elementForTreeNode;
  while ((ancestor = ancestor.parentElement) && !ancestor.classList.contains('tkGantt')) { }

  if (ancestor != null) {
    for (let x = 0; x < _TreeGanttViewLogics.length; x++) {
      if (_TreeGanttViewLogics[x].IsGanttForThis(ancestor)) {
        return _TreeGanttViewLogics[x];
      }
    }
  }

  return null;
}


function InstallTheDirectiveTreeGanttView(streamingAppController) {
  console.trace("InstallTheDirectiveTreeGanttView" + streamingAppController.toString());
  streamingAppController.directive('tkGantt', ['$document', function ($document) {
    return {
      link: function (scope, element, attr) {

        //debugger;
        element.attr("vmclassid", scope.data.VMClassId.asString);

        let TreeGanttViewLogic = new GanttViewLogic();
        TreeGanttViewLogic.Init(scope.data, element, $document);
        _TreeGanttViewLogics.push(TreeGanttViewLogic);

        scope.$watch('data.DateScalerStart', function (newv, oldval, thescope) {
          TreeGanttViewLogic.DateScalerDatesInvalidate();
        });
        scope.$watch('data.DateScalerStop', function (newv, oldval, thescope) {
          TreeGanttViewLogic.DateScalerDatesInvalidate();
        });

      }
    };
  }]);

  streamingAppController.directive('tkData', ['$document', function ($document) {
    return {
      link: function (scope, element, attr) {
        element.attr("vmclassid", scope.data.VMClassId.asString);
      }
    };
  }]);

  streamingAppController.directive('tkTreeGanttNode', ['$document', function ($document) {
    return {
      link: function (scope, element, attr) {
        if ((<HTMLLIElement>element) != null) {
          let branch = ($(<HTMLLIElement>element)); //li with children ul

          let theTreeNodeElement: HTMLElement = branch.get()[0];
          let theGanttViewLogic: GanttViewLogic = FindOwningGanttFromTreeNode(theTreeNodeElement);
          if (theGanttViewLogic != null) {
            theGanttViewLogic.HandleTreeNode(theTreeNodeElement, $document[0], scope.data);
            scope.$on('$destroy', function (thescope) {
              theGanttViewLogic.HandleTreeNodeRemove(theTreeNodeElement);
            });
          }




          branch.prepend("<i class='indicator glyphicon " + GanttViewLogic._openedClass + "'></i>");
          branch.addClass('branch');
          branch.on('click', function (e) {
            if (!e.originalEvent.defaultPrevented) {
              var icon = branch.children('i:first');
              icon.toggleClass(GanttViewLogic._openedClass + " " + GanttViewLogic._closedClass);
              branch.children('ul').children().toggle();
              if (branch.children('ul').children().length==0)
              {
                // no children
                //icon.removeClass(GanttViewLogic._openedClass );
                //icon.removeClass(GanttViewLogic._closedClass);
                //icon.toggleClass("glyphicon-minus");
                // Think I should detect if I am first child of parent - if so parent has symbol
              }
              theGanttViewLogic.TreeVisibilityChanged();
              e.preventDefault();
            }
            scope.data.vCurrent = true;
            return false;
          })
          branch.children().children().toggle();

          //fire event from the dynamically added icon
          branch.find('.branch .indicator').each(function () {
            branch.on('click', function (e) {
              branch.closest('li').click();
              e.preventDefault();
              return false;
            });
          });
          //fire event to open branch if the li contains an anchor instead of text
          branch.find('.branch>a').each(function (anchor) {
            $(anchor).on('click', function (e) {
              $(anchor).closest('li').click();
              e.preventDefault();
              return false;
            });
          });
          //fire event to open branch if the li contains a button instead of text
          branch.find('.branch>button').each(function (button) {
            $(button).on('click', function (e) {
              $(button).closest('li').click();
              e.preventDefault();
              return false;
            });
          });


        }
      }
    };
  }]);


}



console.trace("tkGanttView file loaded 3");
InstallTheDirectiveTreeGanttView(angular.module('MDrivenAngularApp'));



