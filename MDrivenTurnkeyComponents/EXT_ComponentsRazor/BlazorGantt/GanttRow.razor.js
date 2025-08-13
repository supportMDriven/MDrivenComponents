/// <reference path="DateScaler.razor.ts" />
import { VMClassTS } from './DateScaler.razor.js';
import { InteractiveTimeItemJS } from './TimeItemInteractive.razor.js';
var TimeItemOp;
(function (TimeItemOp) {
    TimeItemOp[TimeItemOp["none"] = 0] = "none";
    TimeItemOp[TimeItemOp["resizeleft"] = 1] = "resizeleft";
    TimeItemOp[TimeItemOp["resizeright"] = 2] = "resizeright";
    TimeItemOp[TimeItemOp["move"] = 3] = "move";
    TimeItemOp[TimeItemOp["timeitemcreation"] = 4] = "timeitemcreation";
})(TimeItemOp || (TimeItemOp = {}));
class CreationTimeItem extends VMClassTS {
}
export function createGanttRow(thediv, theouterdiv) {
    let ds = new GanttRow();
    ds.InstallIn(thediv, theouterdiv);
    return ds;
}
export class GanttRow {
    constructor() {
        this._collisionDetect = false;
        this._isInvalidated = false;
        this._isCollisionInvalidated = false;
        this._TimeItemMap = new Map();
        this._drawgenerattion = 0;
        this._handlerformousemove = (e) => { this.OnMouseMove(e); };
        this._handlerformouseup = (e) => { this.OnMouseUp(e); };
        this._clicks = 0;
    }
    //private _gantt: GanttViewLogic;
    //private _rowdata: VMClassTS;
    InstallIn(rowdiv, theouterdiv /*, gantt: GanttViewLogic, document: Document, data: VMClassTS*/) {
        this._document = document;
        this._rowdiv = rowdiv;
        this._rowdiv.style.overflow = "hidden";
        this._rowdiv.style.position = "relative";
        this._outerdiv = theouterdiv;
        //this._rowdata = data;
        rowdiv.setAttribute('data-hasGanttRowRef', 'true');
        rowdiv._ganttrowref = this;
        rowdiv.onclick = (e) => {
            // avoid having the tree node closing
            e.preventDefault();
            return false;
        };
        rowdiv.onmousedown = (ev) => { return this.OnMouseDown(ev); };
        this.Invalidate();
    }
    EnsureAlignWithDateScaler() {
        if (this._dateScaler) {
            const dsrect = this._dateScaler.BoundingRect();
            const outerrect = this._outerdiv.getBoundingClientRect();
            const rowmargin = dsrect.x - outerrect.x;
            this._rowdiv.style.marginLeft = rowmargin.toString() + 'px';
            this._rowdiv.style.width = this._dateScaler.GetWidth().toString() + 'px';
        }
    }
    setupJsCallback(dotNetHelper) {
        this._dotNetHelper = dotNetHelper;
    }
    CallBack(eventname, eventdata, eventdata2) {
        this._dotNetHelper.invokeMethodAsync("HandleEvent", eventname, eventdata, eventdata2);
    }
    GetIdentity() {
        var x = this._rowdiv.getAttribute("Identity");
        if (x)
            return x;
        return "";
    }
    installDateScaler(ds) {
        if (this._dateScaler != ds) {
            this._dateScaler = ds;
            this.Invalidate();
            if (this._dateScaler != null) {
            }
        }
    }
    GetScreenFirstX() {
        let r = this._outerdiv.getBoundingClientRect();
        return r.left;
    }
    GetWidth() {
        let r = this._outerdiv.getBoundingClientRect();
        return r.width;
    }
    Removing() {
        // Here you can clean up
    }
    /*
    private _timeitems: InteractiveTimeItemJS[] = [];
    public get TimeItems(): InteractiveTimeItemJS[] {
      return this._timeitems;
    }
    */
    get RowDiv() {
        return this._rowdiv;
    }
    TimeItemsFromIdentity(identity) {
        return this._TimeItemMap.get(identity);
    }
    Invalidate() {
        if (this._isInvalidated)
            return;
        this._isInvalidated = true;
        setTimeout(() => { this._isInvalidated = false; this.Draw(); }, 1);
    }
    // Call when there is risk for CollisionOutOfDate
    CollisionInvalidate() {
        if (this._isCollisionInvalidated)
            return;
        this._isCollisionInvalidated = true;
        this.Invalidate();
    }
    DrawOne(ti) {
        if (!this._dateScaler)
            return;
        let start = ti.GetStart();
        let stop = ti.GetStop();
        if (this._timeItemUnderChange === ti) {
            if (this._timeItemOp == TimeItemOp.resizeleft || this._timeItemOp == TimeItemOp.move) {
                start = new Date(start.valueOf() + this._timeItemUnderChangeDiffDate);
            }
            if (this._timeItemOp == TimeItemOp.resizeright || this._timeItemOp == TimeItemOp.move || this._timeItemOp == TimeItemOp.timeitemcreation) {
                stop = new Date(stop.valueOf() + this._timeItemUnderChangeDiffDate);
            }
        }
        let x1 = 0;
        let x2 = 0;
        if (start != null)
            x1 = this._dateScaler.DateToPixel(start);
        if (stop != null)
            x2 = this._dateScaler.DateToPixel(stop);
        ti.GetTheDiv().style.left = Math.max(0, x1).toString() + "px";
        ti.GetTheDiv().style.width = Math.min(this._rowWidth, x2 - Math.max(0, x1)).toString() + "px";
        if (start == null || stop == null || stop < this._dateScaler.Start || start > this._dateScaler.Stop) {
            ti.GetTheDiv().style.display = 'none';
        }
        else {
            if (this._timeItemUnderChange != ti)
                ti.GetTheDiv().style.display = 'flex';
        }
        if (this._timeItemUnderChange === ti && this._timeItemOp == TimeItemOp.move && this._allowChangeRow) {
            let ydiff = this._currenty - this._downy;
            ti.GetTheDiv().style.top = (this._moveRectTopAtStart + ydiff).toString() + "px";
            //this._rowdiv.style.overflow = 'visible';
            //this._rowdiv.style.zIndex = '1000';
        }
        if (this._timeItemUnderChange != ti) {
            if (x1 > this._rowWidth || x2 < 0)
                ti.GetTheDiv().style.visibility = 'collapse';
            else {
                ti.GetTheDiv().style.visibility = 'visible';
                if (this._collisionDetect) {
                    // remove all in collision that has stopped prior to this
                    let newcollissionOngoing = [];
                    for (let tic of this._collissionOngoing) // reverse just so I get a copy so I can remove
                     {
                        if (tic.GetStop() > ti.GetStart())
                            newcollissionOngoing.push(tic); // keep
                    }
                    this._collissionOngoing = newcollissionOngoing;
                    let collisionOffset = 0;
                    if (this._collissionOngoing.length > 0)
                        collisionOffset = this._collissionOngoing[this._collissionOngoing.length - 1]['_collision'] + 1;
                    ti['_collision'] = collisionOffset;
                    if (collisionOffset > this._highestCollisionSeen)
                        this._highestCollisionSeen = collisionOffset;
                    ti.GetTheDiv().style.top = (2 + (collisionOffset * this._rowheightincrease)).toString() + "px";
                    this._collissionOngoing.push(ti);
                }
                else {
                    ti.GetTheDiv().style.top = "2px";
                }
            }
        }
    }
    Draw() {
        var _a, _b, _c;
        if (this._rowdiv != null) {
            //const timeitemDivs = this._rowdiv.querySelectorAll(':scope > div');
            this.EnsureAlignWithDateScaler();
            this._drawgenerattion++;
            let timeitemdivs = this._rowdiv.querySelectorAll('div[data-hastimeitemref="true"]');
            for (let onediv of timeitemdivs) {
                let tijs = onediv._timeitemref;
                const theid = tijs.GetIdentity();
                if (!this._TimeItemMap.has(theid)) {
                    this.TrackTimeItem(tijs, onediv);
                }
                this._TimeItemMap.set(tijs.GetIdentity(), tijs);
                tijs.SetDrawnInGeneration(this._drawgenerattion);
            }
            //    if (!this._gantt)
            //    return;
            // Make sure row follows DateScaler
            let rectrowCurrent = this._rowdiv.getBoundingClientRect();
            /*
            let rectrow = this._dateScaler.GetCanvas().getBoundingClientRect();
            if (rectrow.left != rectrowCurrent.left || rectrow.width != rectrowCurrent.width) {
              let currleft = parseFloat(this._rowdiv.style.left.replace('px', ''));
              if (isNaN(currleft))
                currleft = 0;
              this._rowdiv.style.left = (rectrow.left - rectrowCurrent.left + currleft).toString() + 'px';
              this._rowdiv.style.width = (rectrow.width).toString() + 'px';
            }
            */
            this._collisionDetect = ((_a = this._rowdiv.attributes.getNamedItem('tk-collision-detect')) === null || _a === void 0 ? void 0 : _a.value) == "true";
            this._rowheight = parseFloat((_b = this._rowdiv.attributes.getNamedItem('tk-row-height')) === null || _b === void 0 ? void 0 : _b.value);
            this._rowheightincrease = parseFloat((_c = this._rowdiv.attributes.getNamedItem('tk-row-height-increase')) === null || _c === void 0 ? void 0 : _c.value);
            if (this._collisionDetect && this._isCollisionInvalidated) {
                //this._timeitems = this.TimeItems.sort((a: InteractiveTimeItemJS, b: InteractiveTimeItemJS) => { return a.GetStart().valueOf() - b.GetStart().valueOf(); });
                this._isCollisionInvalidated = false;
            }
            this._collissionOngoing = [];
            this._rowWidth = rectrowCurrent.width;
            this._rowLeft = rectrowCurrent.left;
            this._highestCollisionSeen = 0;
            // Iterate TimeItems for updating pos
            for (const tijs of this._TimeItemMap.values()) {
                if (tijs.ShouldDraw(this._drawgenerattion))
                    this.DrawOne(tijs);
            }
            if (this._collisionDetect) {
                this._rowdiv.style.height = (this._rowheight - this._rowheightincrease + ((this._highestCollisionSeen + 1) * this._rowheightincrease)).toString() + 'px';
            }
            if (this._timeItemOp == TimeItemOp.timeitemcreation && this._timeItemUnderChange != null)
                this.DrawOne(this._timeItemUnderChange);
        }
    }
    TrackTimeItem(timeItemData, timeItemElement) {
        //this._timeitems.push(timeItemData);
        //timeItemData.TheDiv = timeItemElement;
        //timeItemData.Identity = timeItemData.VMClassId;
        //timeItemElement.style.position = "absolute";
        //timeItemElement.style.overflow = "hidden";
        //timeItemElement.setAttribute("TimeItemIdentity", timeItemData.GetIdentity);
        //this._TimeItemMap.set(timeItemData.GetIdentity(),timeItemData);
        this.CollisionInvalidate();
        timeItemElement.onmousedown = (ev) => { return this.OnMouseDown(ev); };
        timeItemElement.ondragstart = function (ev) { ev.preventDefault(); };
        timeItemElement.addEventListener("touchcancel", (ev) => { this.OnMouseUp(this.TranslateTouchToMouse(ev, "mouseup")); }, false);
        timeItemElement.addEventListener("touchend", (ev) => { this.OnMouseUp(this.TranslateTouchToMouse(ev, "mouseup")); }, false);
        timeItemElement.addEventListener("touchmove", (ev) => { this.OnMouseMove(this.TranslateTouchToMouse(ev, "mousemove")); }, false);
        timeItemElement.addEventListener("touchstart", (ev) => { this.OnMouseDown(this.TranslateTouchToMouse(ev, "mousedown")); }, false);
    }
    UpdateTimeItemUnderChangeFromDiv(clickedElement) {
        const parentWithRef = clickedElement.closest('div[data-hasTimeItemRef="true"]');
        if (parentWithRef != null) {
            this._timeItemUnderChange = parentWithRef._timeitemref;
            this._timeItemUnderChange['vCurrent'] = true;
            this._timeItemUnderChange['vSelected'] = true;
            return this._timeItemUnderChange;
        }
        return null;
    }
    SingleClickGanttRow(ev, clickedElement) {
        var _a, _b;
        //    if (!this._gantt)
        //    return;
        this._mousedown = true;
        let ds = this._dateScaler;
        this._downDate = ds.PixelToDate(ev.x - this._rowLeft).valueOf();
        this._timeItemUnderChangeDiffDate = 0;
        this._currenty = ev.y;
        this._document.addEventListener("mousemove", this._handlerformousemove);
        this._document.addEventListener("mouseup", this._handlerformouseup);
        this.CallBack("SetCurrentRow", "", "");
        let timeitemcreatemode = ((_a = clickedElement.attributes.getNamedItem('tk-create-time-item-mode')) === null || _a === void 0 ? void 0 : _a.value) == "true";
        if (timeitemcreatemode) {
            this._timeitemcreation = this._document.createElement('div');
            this._rowdiv.appendChild(this._timeitemcreation);
            this._timeitemcreation.className = 'tkTimeItem';
            let rowheight = parseFloat((_b = this._rowdiv.attributes.getNamedItem('tk-row-height')) === null || _b === void 0 ? void 0 : _b.value);
            //this._timeitemcreation.style.height = rowheight.toString() + 'px';
            this._timeItemUnderChange = new InteractiveTimeItemJS();
            this._timeItemUnderChange.InstallIn();
            this._timeItemUnderChange.UpdateStart(new Date(this._downDate));
            this._timeItemUnderChange.UpdateStop(this._timeItemUnderChange.GetStart());
            this._timeItemUnderChange.GetTheDiv().style.cursor = 'e-resize';
            this._timeItemUnderChange.GetTheDiv().style.position = "absolute";
            this._timeItemOp = TimeItemOp.timeitemcreation;
            this._timeItemUnderChange.GetTheDiv().style.left = (this._dateScaler.DateToPixel(new Date(this._downDate))).toString() + "px";
            this._timeItemUnderChange.GetTheDiv().style.width = "0px";
        }
        let r = this._rowdiv.getBoundingClientRect();
    }
    SingleClick(ev, clickedElement) {
        var _a, _b, _c, _d;
        //    if (!this._gantt)
        //    return;
        let x = this.UpdateTimeItemUnderChangeFromDiv(clickedElement);
        x.SetAsCurrent();
        this._mousedown = true;
        let ds = this._dateScaler;
        this._downDate = ds.PixelToDate(ev.x - this._rowLeft).valueOf();
        this._timeItemUnderChangeDiffDate = 0;
        this._currenty = ev.y;
        this._document.addEventListener("mousemove", this._handlerformousemove);
        this._document.addEventListener("mouseup", this._handlerformouseup);
        this._allowMove = ((_a = clickedElement.attributes.getNamedItem('tk-allow-move')) === null || _a === void 0 ? void 0 : _a.value) == "true";
        this._allowResizeStart = ((_b = clickedElement.attributes.getNamedItem('tk-allow-resize-start')) === null || _b === void 0 ? void 0 : _b.value) == "true";
        this._allowResizeStop = ((_c = clickedElement.attributes.getNamedItem('tk-allow-resize-stop')) === null || _c === void 0 ? void 0 : _c.value) == "true";
        this._allowChangeRow = ((_d = clickedElement.attributes.getNamedItem('tk-allow-change-row')) === null || _d === void 0 ? void 0 : _d.value) == "true";
        let r = x.GetTheDiv().getBoundingClientRect();
        if (x.GetTheDiv().style.top == "")
            x.GetTheDiv().style.top = "0px";
        this._moveRectTopAtStart = parseFloat(x.GetTheDiv().style.top.replace('px', ''));
        if (r.right < ev.x + GanttRow.kResizeArea && this._allowResizeStop) {
            this._timeItemUnderChange.GetTheDiv().style.cursor = 'e-resize';
            this._timeItemOp = TimeItemOp.resizeright;
        }
        else if (r.left > ev.x - GanttRow.kResizeArea && this._allowResizeStart) {
            this._timeItemUnderChange.GetTheDiv().style.cursor = 'e-resize';
            this._timeItemOp = TimeItemOp.resizeleft;
        }
        else {
            if (this._allowMove) {
                this._timeItemUnderChange.GetTheDiv().style.cursor = 'move';
                this._timeItemOp = TimeItemOp.move;
            }
        }
    }
    ////
    ////
    DoubleClick(ev, clickedElement) {
        let x = this.UpdateTimeItemUnderChangeFromDiv(clickedElement);
        this.CallBack("VariableSet", 'vTimeItemDoubleClick_AsExternalId', x.GetIdentity());
        this.CallBack("ExecuteAfterFullRoundtrip", "ItemDoubleClick", "GanttTimeItemDoubleClick");
    }
    OnMouseDown(ev) {
        ev.stopPropagation();
        this._mouseDownEvent = ev;
        this._downx = ev.x;
        this._downy = ev.y;
        let clickedElement = ev.srcElement;
        if (clickedElement != null) {
            clickedElement = this.DeduceElementToEitherTIOrRow(clickedElement);
            if (clickedElement == this._rowdiv) {
                // GanttRow
                this.SingleClickGanttRow(ev, clickedElement);
            }
            else {
                // TimeItem
                this._clicks++;
                console.trace("Click " + this._clicks.toString());
                if (this._clicks == 1) {
                    this.UpdateTimeItemUnderChangeFromDiv(clickedElement);
                    this._timeItemUnderChange.SetAsCurrent();
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
    DeduceElementToEitherTIOrRow(elem) {
        let parentWithRef = elem.closest('div[data-hasTimeItemRef="true"]');
        if (parentWithRef == null) {
            parentWithRef = elem.closest('div[data-hasGanttRowRef="true"]');
        }
        return parentWithRef;
    }
    OnMouseMove(ev) {
        if (ev.buttons == 1) {
            if (this._timeItemUnderChange != null) {
                if (!this._cloneMover) { // init the mover
                    const floatingLayer = document.getElementById('_TimeItemMoveLayer');
                    // Optionally clone the element
                    const clone = this._timeItemUnderChange.GetTheDiv().cloneNode(true);
                    clone.style.position = 'absolute';
                    clone.style.pointerEvents = 'auto'; // allow interaction
                    clone.style.display = "none";
                    floatingLayer.appendChild(clone);
                    this._cloneMover = clone;
                    this._cloneMoverInialRect = this._timeItemUnderChange.GetTheDiv().getBoundingClientRect();
                }
                let ds = this._dateScaler;
                this._timeItemUnderChangeDiffDate = ds.PixelToDate(ev.x - this._rowLeft).valueOf() - this._downDate;
                if (this._allowChangeRow)
                    this._currenty = ev.y;
                this.Invalidate();
                if (this._cloneMover) {
                    var parentPos = this._cloneMover.parentNode.getBoundingClientRect();
                    this._cloneMover.style.left = (this._cloneMoverInialRect.x - parentPos.x + (ev.x - this._mouseDownEvent.x)) + 'px';
                    this._cloneMover.style.top = (this._cloneMoverInialRect.y - parentPos.y + (ev.y - this._mouseDownEvent.y)) + 'px';
                    this._cloneMover.style.display = "flex";
                    this._timeItemUnderChange.GetTheDiv().style.display = "none";
                    //this._cloneMover.style.left = ev.pageX + 'px';
                    //this._cloneMover.style.top = ev.pageY + 'px';
                }
            }
        }
    }
    OnMouseUp(ev) {
        this._mousedown = false;
        if (this._timeItemUnderChange == null)
            return;
        this._timeItemUnderChange.GetTheDiv().style.cursor = 'default';
        this._timeItemUnderChange.SetAsCurrent();
        if (this._timeItemOp == TimeItemOp.resizeleft || this._timeItemOp == TimeItemOp.move) {
            this._timeItemUnderChange.UpdateStart(new Date(this._timeItemUnderChange.GetStart().valueOf() + this._timeItemUnderChangeDiffDate));
        }
        if (this._timeItemOp == TimeItemOp.resizeright || this._timeItemOp == TimeItemOp.move || this._timeItemOp == TimeItemOp.timeitemcreation) {
            this._timeItemUnderChange.UpdateStop(new Date(this._timeItemUnderChange.GetStop().valueOf() + this._timeItemUnderChangeDiffDate));
        }
        if (this._cloneMover) {
            this._cloneMover.remove();
            this._cloneMover = null;
            this._timeItemUnderChange.GetTheDiv().style.display = "flex";
        }
        let memory = this._timeItemUnderChange;
        if (this._timeItemOp == TimeItemOp.move && this._allowChangeRow) {
            let rowrect = this._rowdiv.getBoundingClientRect();
            if (this._currenty < rowrect.top || this._currenty > rowrect.bottom) {
                let gr = this._dateScaler.FindRowFromYPoint(this._currenty);
                if (gr != null) {
                    // row change          
                    this._timeItemUnderChange.SetAsCurrent();
                    this.CallBack("StateChanged", "", "");
                    gr.CallBack("AcceptNewTimeItem", "", "");
                    ev.preventDefault();
                }
            }
        }
        else if (this._timeItemOp == TimeItemOp.timeitemcreation) {
            this.CallBack("VariableSet", 'vTimeItemCreateStart', memory.GetStart().toISOString());
            this.CallBack("VariableSet", 'vTimeItemCreateStop', memory.GetStop().toISOString());
            this.CallBack("ExecuteAfterFullRoundtrip", "ItemCreate", "");
        }
        this._timeItemUnderChange.GetTheDiv().style.top = "0px"; // to avoid drag out of view
        this._timeItemUnderChange = null;
        this._timeItemOp = TimeItemOp.none;
        this._document.removeEventListener("mousemove", this._handlerformousemove);
        this._document.removeEventListener("mouseup", this._handlerformouseup);
    }
    UnTrackTimeItem(timeItemData) {
        if (timeItemData != null) {
            timeItemData.TheDiv = null;
        }
        this.CollisionInvalidate();
    }
    TranslateTouchToMouse(te, evtype) {
        te.preventDefault();
        var result = new Object();
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
        return result;
    }
}
GanttRow.kResizeArea = 4;
//# sourceMappingURL=GanttRow.razor.js.map