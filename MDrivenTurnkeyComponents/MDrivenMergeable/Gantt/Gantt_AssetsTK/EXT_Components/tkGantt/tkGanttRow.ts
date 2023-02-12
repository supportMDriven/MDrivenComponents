/// <reference path="../../Scripts/typings/jquery/jquery.d.ts" />
/// <reference path="../../Scripts/typings/angularjs/angular.d.ts" />
/// <reference path="../../js/StreamingAppViewData.ts" />
/// <reference path="../../js/StreamingAppCtrl.ts" />
/// <reference path="tkDateScaler.ts" />
/// <reference path="tkGantt.ts" />

interface ITimeItem extends StreamingApp.VMClassListItem {

  Start: Date;
  Stop: Date;
  TheDiv: HTMLDivElement;
  Identity: string;
}

enum TimeItemOp {
  none,
  resizeleft,
  resizeright,
  move,
  timeitemcreation
}

class CreationTimeItem extends StreamingApp.VMClassListItem implements ITimeItem
{
  Start: Date;
  Stop: Date;
  TheDiv: HTMLDivElement;
  Identity: string;
}

class GanttRow {

  private _rowdiv: HTMLDivElement;
  private _gantt: GanttViewLogic;
  private _rowdata: StreamingApp.VMClassListItem;
  public InstallIn(rowdiv: HTMLDivElement, gantt: GanttViewLogic, document: HTMLDocument, data: StreamingApp.VMClassListItem): void {
    this._document = document;
    this._gantt = gantt;
    this._rowdiv = rowdiv;
    this._rowdiv.style.overflow = "hidden";
    this._rowdiv.style.position = "relative";
    this._rowdata = data;
    rowdiv['data-tkGanttRowRef'] = this;
    rowdiv.onclick = (e: MouseEvent) => {
      // avoid having the tree node closing
      e.preventDefault();
      return false;
    };

    rowdiv.onmousedown = (ev: MouseEvent) => { return this.OnMouseDown(ev); }


    this.Invalidate();
  }

  public Removing() {
    // Here you can clean up
  }

  private _timeitems: ITimeItem[] = [];
  public get TimeItems(): ITimeItem[] {
    return this._timeitems;
  }

  public get RowDiv(): HTMLDivElement {
    return this._rowdiv;
  }
  public TimeItemsFromIdentity(identity: string): ITimeItem {
    return this._TimeItemMap[identity];
  }

  private _collisionDetect: boolean = false;
  private _rowheight: number;
  private _rowheightincrease: number;
  private _isInvalidated: boolean = false;
  private _isCollisionInvalidated: boolean = false;
  private _TimeItemMap: { [id: string]: ITimeItem } = {};
  public Invalidate(): void {
    if (this._isInvalidated)
      return;
    this._isInvalidated = true;
    setTimeout(() => { this._isInvalidated = false; this.Draw(); }, 1);
  }

  // Call when there is risk for CollisionOutOfDate
  public CollisionInvalidate() {
    if (this._isCollisionInvalidated)
      return;
    this._isCollisionInvalidated = true;
    this.Invalidate();
  }
  private DrawOne(ti: ITimeItem) {
    let start = ti.Start;
    let stop = ti.Stop;
    if (this._timeItemUnderChange === ti) {
      if (this._timeItemOp == TimeItemOp.resizeleft || this._timeItemOp == TimeItemOp.move) {
        start = new Date(start.valueOf() + this._timeItemUnderChangeDiffDate);
      }
      if (this._timeItemOp == TimeItemOp.resizeright || this._timeItemOp == TimeItemOp.move || this._timeItemOp == TimeItemOp.timeitemcreation) {
        stop = new Date(stop.valueOf() + this._timeItemUnderChangeDiffDate);
      }
    }

    let x1=0;
    let x2=0;
    if (start!=null)
      x1 = this._gantt.GetDateScaler().DateToPixel(start);
    if (stop!=null)
      x2 = this._gantt.GetDateScaler().DateToPixel(stop);
    ti.TheDiv.style.left = Math.max(0, x1).toString() + "px";
    ti.TheDiv.style.width = Math.min(this._rowWidth, x2 - Math.max(0, x1)).toString() + "px";
    if (this._timeItemUnderChange === ti && this._timeItemOp == TimeItemOp.move && this._allowChangeRow) {
      let ydiff = this._currenty - this._downy;
      ti.TheDiv.style.top = (this._moveRectTopAtStart + ydiff).toString() + "px";
      this._rowdiv.style.overflow = 'visible';
      this._rowdiv.style.zIndex = '1000';
    }

    if (this._timeItemUnderChange != ti) {
      if (x1 > this._rowWidth || x2 < 0)
        ti.TheDiv.style.visibility = 'collapse';
      else {
        ti.TheDiv.style.visibility = 'visible';

        if (this._collisionDetect) {
          // remove all in collision that has stopped prior to this
          let newcollissionOngoing: ITimeItem[] = [];
          for (let tic of this._collissionOngoing) // reverse just so I get a copy so I can remove
          {
            if (tic.Stop > ti.Start)
              newcollissionOngoing.push(tic); // keep
          }
          this._collissionOngoing = newcollissionOngoing;
          let collisionOffset = 0;
          if (this._collissionOngoing.length > 0)
            collisionOffset = this._collissionOngoing[this._collissionOngoing.length - 1]['_collision'] + 1;
          ti['_collision'] = collisionOffset;
          if (collisionOffset > this._highestCollisionSeen)
            this._highestCollisionSeen = collisionOffset;
          ti.TheDiv.style.top = (2 + (collisionOffset * this._rowheightincrease)).toString() + "px";
          this._collissionOngoing.push(ti);
        }
        else {
          ti.TheDiv.style.top = "2px";
        }

      }
    }

  }
  private _collissionOngoing: ITimeItem[];
  private _rowWidth: number;
  private _rowLeft: number;  
  private _highestCollisionSeen: number;
  public Draw(): void {
    // Make sure row follows DateScaler
    let rectrow = this._gantt.GetDateScaler().GetCanvas().getBoundingClientRect();
    let rectrowCurrent = this._rowdiv.getBoundingClientRect();
    if (rectrow.left != rectrowCurrent.left || rectrow.width != rectrowCurrent.width) {
      let currleft = parseFloat(this._rowdiv.style.left.replace('px', ''));
      if (isNaN(currleft))
        currleft = 0;
      this._rowdiv.style.left = (rectrow.left - rectrowCurrent.left + currleft).toString() + 'px';
      this._rowdiv.style.width = (rectrow.width).toString() + 'px';
    }

    this._collisionDetect = this._rowdiv.attributes.getNamedItem('tk-collision-detect').value == "true";
    this._rowheight = parseFloat(this._rowdiv.attributes.getNamedItem('tk-row-height').value);
    this._rowheightincrease = parseFloat(this._rowdiv.attributes.getNamedItem('tk-row-height-increase').value);
    if (this._collisionDetect && this._isCollisionInvalidated) {
      this._timeitems = this.TimeItems.sort((a: ITimeItem, b: ITimeItem) => { return a.Start.valueOf() - b.Start.valueOf(); });
      this._isCollisionInvalidated = false;
    }

    this._collissionOngoing = [];
    this._rowWidth = rectrowCurrent.width;
    this._rowLeft = rectrow.left;
    this._highestCollisionSeen= 0;
    // Iterate TimeItems for updating pos
    for (let ti of this.TimeItems) {
      if (ti.TheDiv != null) {
        this.DrawOne(ti);
      }     
    }
    if (this._collisionDetect) {
      this._rowdiv.style.height = (this._rowheight - this._rowheightincrease + ((this._highestCollisionSeen + 1) * this._rowheightincrease)).toString() + 'px';
    }

    if (this._timeItemOp == TimeItemOp.timeitemcreation && this._timeItemUnderChange != null)
      this.DrawOne(this._timeItemUnderChange);
  }

  public TrackTimeItem(timeItemData: ITimeItem, timeItemElement: HTMLDivElement) {
    this._timeitems.push(timeItemData);
    timeItemData.TheDiv = timeItemElement;
    timeItemData.Identity = timeItemData['VMClassId'].asString;
    timeItemElement.style.position = "absolute";
    timeItemElement.style.overflow = "hidden";
    timeItemElement.setAttribute("TimeItemIdentity", timeItemData.Identity);
    this._TimeItemMap[timeItemData.Identity] = timeItemData;
    this.CollisionInvalidate();

    timeItemElement.onmousedown = (ev: MouseEvent) => { return this.OnMouseDown(ev); }
    timeItemElement.ondragstart = function (ev: DragEvent) { ev.preventDefault(); }

    timeItemElement.addEventListener("touchcancel", (ev) => { this.OnMouseUp(this.TranslateTouchToMouse(ev, "mouseup")); }, false);
    timeItemElement.addEventListener("touchend", (ev) => { this.OnMouseUp(this.TranslateTouchToMouse(ev, "mouseup")); }, false);
    timeItemElement.addEventListener("touchmove", (ev) => { this.OnMouseMove(this.TranslateTouchToMouse(ev, "mousemove")); }, false);
    timeItemElement.addEventListener("touchstart", (ev) => { this.OnMouseDown(this.TranslateTouchToMouse(ev, "mousedown")); }, false);
  }


  private _handlerformousemove = (e: MouseEvent) => { this.OnMouseMove(e); };
  private _handlerformouseup = (e: MouseEvent) => { this.OnMouseUp(e); };

  private _document: HTMLDocument
  private _downx: number;
  private _downy: number;
  private _currenty: number;
  private _downDate: number;
  private _mousedown: boolean;
  private _moveRectTopAtStart: number;
  private _timeItemUnderChange: ITimeItem;
  private _timeItemUnderChangeDiffDate: number;
  private _timeItemOp: TimeItemOp;
  private _allowMove: boolean;
  private _allowResizeStart: boolean;
  private _allowResizeStop: boolean;
  private _allowChangeRow: boolean;
  private _clicks: number = 0;

  private UpdateTimeItemUnderChangeFromDiv(clickedElement: HTMLDivElement): ITimeItem {
    for (let x of this._timeitems) {
      if (x.TheDiv == clickedElement) {
        this._timeItemUnderChange = x;
        this._timeItemUnderChange['vCurrent'] = true;
        this._timeItemUnderChange['vSelected'] = true;
        return this._timeItemUnderChange;
      }
    }
    return null;
  }

  private _timeitemcreation: HTMLDivElement;
  private SingleClickGanttRow(ev: MouseEvent, clickedElement: HTMLDivElement) {
    this._mousedown = true;
    let ds = this._gantt.GetDateScaler();
    this._downDate = ds.PixelToDate(ev.x - this._rowLeft).valueOf();
    this._timeItemUnderChangeDiffDate = 0;
    this._currenty = ev.y;
    this._document.addEventListener("mousemove", this._handlerformousemove);
    this._document.addEventListener("mouseup", this._handlerformouseup);

    let timeitemcreatemode = clickedElement.attributes.getNamedItem('tk-create-time-item-mode').value == "true";
    if (timeitemcreatemode)
    {
      this._timeitemcreation = this._document.createElement('div');
      this._rowdiv.appendChild(this._timeitemcreation);
      this._timeitemcreation.className = 'tkTimeItem';
      let rowheight = parseFloat(this._rowdiv.attributes.getNamedItem('tk-row-height').value);
      //this._timeitemcreation.style.height = rowheight.toString() + 'px';
      this._timeItemUnderChange = new CreationTimeItem(null);
      this._timeItemUnderChange.TheDiv = this._timeitemcreation;
      this._timeItemUnderChange.Start = new Date(this._downDate);
      this._timeItemUnderChange.Stop = this._timeItemUnderChange.Start;
      this._timeItemUnderChange.TheDiv.style.cursor = 'e-resize';
      this._timeItemUnderChange.TheDiv.style.position = "absolute";

      this._timeItemOp = TimeItemOp.timeitemcreation;

      this._timeItemUnderChange.TheDiv.style.left = (this._gantt.GetDateScaler().DateToPixel(new Date(this._downDate))).toString() + "px";
      this._timeItemUnderChange.TheDiv.style.width = "0px";
    }

    let r = this._rowdiv.getBoundingClientRect();
  }


  private SingleClick(ev: MouseEvent, clickedElement: HTMLDivElement) {
    let x = this.UpdateTimeItemUnderChangeFromDiv(clickedElement);
    this._mousedown = true;
    let ds = this._gantt.GetDateScaler();
    this._downDate = ds.PixelToDate(ev.x - this._rowLeft).valueOf();
    this._timeItemUnderChangeDiffDate = 0;
    this._currenty = ev.y;
    this._document.addEventListener("mousemove", this._handlerformousemove);
    this._document.addEventListener("mouseup", this._handlerformouseup);

    this._allowMove = clickedElement.attributes.getNamedItem('tk-allow-move').value == "true";
    this._allowResizeStart = clickedElement.attributes.getNamedItem('tk-allow-resize-start').value == "true";
    this._allowResizeStop = clickedElement.attributes.getNamedItem('tk-allow-resize-stop').value == "true";
    this._allowChangeRow = clickedElement.attributes.getNamedItem('tk-allow-change-row').value == "true";


    let r = x.TheDiv.getBoundingClientRect();
    if (x.TheDiv.style.top == "")
      x.TheDiv.style.top = "0px";
    this._moveRectTopAtStart = parseFloat(x.TheDiv.style.top.replace('px', ''));
    if (r.right < ev.x + GanttRow.kResizeArea && this._allowResizeStop) {
      this._timeItemUnderChange.TheDiv.style.cursor = 'e-resize';
      this._timeItemOp = TimeItemOp.resizeright;
    }
    else if (r.left > ev.x - GanttRow.kResizeArea && this._allowResizeStart) {
      this._timeItemUnderChange.TheDiv.style.cursor = 'e-resize';
      this._timeItemOp = TimeItemOp.resizeleft;
    }
    else {
      if (this._allowMove) {
        this._timeItemUnderChange.TheDiv.style.cursor = 'move';
        this._timeItemOp = TimeItemOp.move;
      }
    }



  }
  private DoubleClick(ev: MouseEvent, clickedElement: HTMLDivElement) {
    let x = this.UpdateTimeItemUnderChangeFromDiv(clickedElement);
    this._rowdata.ViewData.RootVMClassObject['VM_Variables'].vTimeItemDoubleClick_AsExternalId = x.VMClassId.VMObjectId;
    this._rowdata.ViewData.ExecuteAfterFullRoundtrip("ItemDoubleClick", null,
      () => {
        this._rowdata.ViewData.RootVMClassObject.Execute("GanttTimeItemDoubleClick");
      });

  }
  private OnMouseDown(ev: MouseEvent): boolean {
    ev.stopPropagation();
    this._downx = ev.x;
    this._downy = ev.y;
    let clickedElement = ev.srcElement as HTMLDivElement;
    if (clickedElement != null) {
      if (clickedElement == this._rowdiv) {
        // GanttRow
        this.SingleClickGanttRow(ev, clickedElement);
      }
      else {
        // TimeItem
        this._clicks++;
        console.trace("Click " + this._clicks.toString());

        if (this._clicks == 1) {
          setTimeout(() => {
            if (this._clicks == 1) {
              this.SingleClick(ev, clickedElement);
            }
            else {
              this.DoubleClick(ev, clickedElement);
            }
            this._clicks = 0;
          }, 200);
        }
      }
    }
    return false;
  }

  public static kResizeArea: number = 4;

  private OnMouseMove(ev: MouseEvent): void {

    if (ev.buttons == 1) {
      if (this._timeItemUnderChange != null) {
        let ds = this._gantt.GetDateScaler();
        this._timeItemUnderChangeDiffDate = ds.PixelToDate(ev.x - this._rowLeft).valueOf() - this._downDate;
        if (this._allowChangeRow)
          this._currenty = ev.y;
        this.Invalidate();
      }
    }

  }
  private OnMouseUp(ev: MouseEvent): void {
    this._mousedown = false;

    if (this._timeItemUnderChange == null)
      return;
    this._timeItemUnderChange.TheDiv.style.cursor = 'default';

    if (this._timeItemOp == TimeItemOp.resizeleft || this._timeItemOp == TimeItemOp.move) {
      this._timeItemUnderChange.Start = new Date(this._timeItemUnderChange.Start.valueOf() + this._timeItemUnderChangeDiffDate);
    }
    if (this._timeItemOp == TimeItemOp.resizeright || this._timeItemOp == TimeItemOp.move || this._timeItemOp == TimeItemOp.timeitemcreation) {
      this._timeItemUnderChange.Stop = new Date(this._timeItemUnderChange.Stop.valueOf() + this._timeItemUnderChangeDiffDate);
    }

    if (this._timeItemOp == TimeItemOp.move && this._allowChangeRow) {
      let rowrect = this._rowdiv.getBoundingClientRect();
      if (this._currenty < rowrect.top || this._currenty > rowrect.bottom) {
        let gr: GanttRow = this._gantt.FindRowFromYPoint(this._currenty);
        if (gr != null) {
          // row change
          this._rowdata.ViewData.RootVMClassObject['VM_Variables'].vRowMoveTargetRow_AsExternalId = gr._rowdata.VMClassId.VMObjectId;
          this._rowdata.ViewData.RootVMClassObject['VM_Variables'].vRowMoveTimeItem_AsExternalId = this._timeItemUnderChange.VMClassId.VMObjectId;
          this._rowdata.ViewData.ExecuteAfterFullRoundtrip("MoveRow", null,
          () => {
            this._rowdata.ViewData.RootVMClassObject.Execute("GanttTimeItemRowMoveExecute");
            this._timeItemUnderChange = null;
            this._timeItemOp = TimeItemOp.none;
            this._rowdiv.style.overflow = 'hidden';
            this._rowdiv.style.zIndex = '1';
                    });
          return;
        }
      }

    }

    let memory = this._timeItemUnderChange;
    if (this._timeItemOp == TimeItemOp.timeitemcreation) {
      this._rowdata.ViewData.RootVMClassObject['VM_Variables'].vTimeItemCreateStart = memory.Start;
      this._rowdata.ViewData.RootVMClassObject['VM_Variables'].vTimeItemCreateStop = memory.Stop;
      this._rowdata.ViewData.ExecuteAfterFullRoundtrip("ItemCreate", null,
        () => {
          this._rowdata.Execute("GanttTimeItemCreate");
          this.RowDiv.removeChild(memory.TheDiv);
        });

    }
    else
    {
      // normal move
      this._rowdata.ViewData.ExecuteAfterFullRoundtrip("ItemMoveOp", null,
        () => {
          this._rowdiv.style.overflow = 'hidden';
          this._rowdiv.style.zIndex = '1';
        });
    }

    this._timeItemUnderChange = null;
    this._timeItemOp = TimeItemOp.none;
    this._document.removeEventListener("mousemove", this._handlerformousemove);
    this._document.removeEventListener("mouseup", this._handlerformouseup);

  }




  public UnTrackTimeItem(timeItemData) {
    if (timeItemData != null) {
      timeItemData.TheDiv = null;
    }
    this.CollisionInvalidate();
  }

  private TranslateTouchToMouse(te: TouchEvent, evtype: string): MouseEvent {
    te.preventDefault();
    var result: any = new Object();
    result.button = 0;
    result.buttons = 1;
    if (te.touches.length > 0) {
      result.clientX = te.touches[0].clientX;
      result.clientY = te.touches[0].clientY;
      result.x = te.touches[0].clientX;
      result.y = te.touches[0].clientY;
    }
    result.srcElement = te.srcElement;
    result.type = evtype;
    result.ctrlKey = te.ctrlKey;

    return <MouseEvent>result;
  }


}

function FindGanttRowFromTimeItemElement(timeitemElement: HTMLElement): GanttRow {
  let ancestor = timeitemElement;
  while ((ancestor = ancestor.parentElement) && !ancestor.classList.contains('tkGanttRow'))
  { }

  if (ancestor != null) {

    let gr: GanttRow = ancestor['data-tkGanttRowRef'];
    return gr;
  }

  return null;

}

function InstallTheDirectiveTimeItem(streamingAppController) {
  console.trace("InstallTheDirectiveTimeItem" + streamingAppController.toString());

  streamingAppController.directive('tkTimeItem', ['$document', function ($document) {
    return {
      link: function (scope, elements, attr) {
        let gr: GanttRow = FindGanttRowFromTimeItemElement(elements[0]);
        if (gr != null) {
          gr.TrackTimeItem(scope.timeItem, elements[0]);
          scope.$watch('timeItem.Start', function (newv, oldval, thescope) {
            gr.CollisionInvalidate();
          });
          scope.$watch('timeItem.Stop', function (newv, oldval, thescope) {
            gr.CollisionInvalidate();
          });
          scope.$on('$destroy', function (thescope) {
            gr.UnTrackTimeItem(thescope.timeItem);
          });
        }
      }
    };
  }]);


}





console.trace("TimeItem loaded");
InstallTheDirectiveTimeItem(angular.module('MDrivenAngularApp'));