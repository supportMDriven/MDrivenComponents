/// <reference path="../../Scripts/typings/jquery/jquery.d.ts" />
/// <reference path="../../Scripts/typings/angularjs/angular.d.ts" />
/// <reference path="../../js/StreamingAppViewData.ts" />
/// <reference path="../../js/StreamingAppCtrl.ts" />
/// <reference path="tkDateScaler.ts" />
/// <reference path="tkGantt.ts" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var TimeItemOp;
(function (TimeItemOp) {
    TimeItemOp[TimeItemOp["none"] = 0] = "none";
    TimeItemOp[TimeItemOp["resizeleft"] = 1] = "resizeleft";
    TimeItemOp[TimeItemOp["resizeright"] = 2] = "resizeright";
    TimeItemOp[TimeItemOp["move"] = 3] = "move";
    TimeItemOp[TimeItemOp["timeitemcreation"] = 4] = "timeitemcreation";
})(TimeItemOp || (TimeItemOp = {}));
var CreationTimeItem = (function (_super) {
    __extends(CreationTimeItem, _super);
    function CreationTimeItem() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return CreationTimeItem;
}(StreamingApp.VMClassListItem));
var GanttRow = (function () {
    function GanttRow() {
        var _this = this;
        this._timeitems = [];
        this._collisionDetect = false;
        this._isInvalidated = false;
        this._isCollisionInvalidated = false;
        this._TimeItemMap = {};
        this._handlerformousemove = function (e) { _this.OnMouseMove(e); };
        this._handlerformouseup = function (e) { _this.OnMouseUp(e); };
        this._clicks = 0;
    }
    GanttRow.prototype.InstallIn = function (rowdiv, gantt, document, data) {
        var _this = this;
        this._document = document;
        this._gantt = gantt;
        this._rowdiv = rowdiv;
        this._rowdiv.style.overflow = "hidden";
        this._rowdiv.style.position = "relative";
        this._rowdata = data;
        rowdiv['data-tkGanttRowRef'] = this;
        rowdiv.onclick = function (e) {
            // avoid having the tree node closing
            e.preventDefault();
            return false;
        };
        rowdiv.onmousedown = function (ev) { return _this.OnMouseDown(ev); };
        this.Invalidate();
    };
    GanttRow.prototype.Removing = function () {
        // Here you can clean up
    };
    Object.defineProperty(GanttRow.prototype, "TimeItems", {
        get: function () {
            return this._timeitems;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GanttRow.prototype, "RowDiv", {
        get: function () {
            return this._rowdiv;
        },
        enumerable: true,
        configurable: true
    });
    GanttRow.prototype.TimeItemsFromIdentity = function (identity) {
        return this._TimeItemMap[identity];
    };
    GanttRow.prototype.Invalidate = function () {
        var _this = this;
        if (this._isInvalidated)
            return;
        this._isInvalidated = true;
        setTimeout(function () { _this._isInvalidated = false; _this.Draw(); }, 1);
    };
    // Call when there is risk for CollisionOutOfDate
    GanttRow.prototype.CollisionInvalidate = function () {
        if (this._isCollisionInvalidated)
            return;
        this._isCollisionInvalidated = true;
        this.Invalidate();
    };
    GanttRow.prototype.DrawOne = function (ti) {
        var start = ti.Start;
        var stop = ti.Stop;
        if (this._timeItemUnderChange === ti) {
            if (this._timeItemOp == TimeItemOp.resizeleft || this._timeItemOp == TimeItemOp.move) {
                start = new Date(start.valueOf() + this._timeItemUnderChangeDiffDate);
            }
            if (this._timeItemOp == TimeItemOp.resizeright || this._timeItemOp == TimeItemOp.move || this._timeItemOp == TimeItemOp.timeitemcreation) {
                stop = new Date(stop.valueOf() + this._timeItemUnderChangeDiffDate);
            }
        }
        var x1 = 0;
        var x2 = 0;
        if (start != null)
            x1 = this._gantt.GetDateScaler().DateToPixel(start);
        if (stop != null)
            x2 = this._gantt.GetDateScaler().DateToPixel(stop);
        ti.TheDiv.style.left = Math.max(0, x1).toString() + "px";
        ti.TheDiv.style.width = Math.min(this._rowWidth, x2 - Math.max(0, x1)).toString() + "px";
        if (this._timeItemUnderChange === ti && this._timeItemOp == TimeItemOp.move && this._allowChangeRow) {
            var ydiff = this._currenty - this._downy;
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
                    var newcollissionOngoing = [];
                    for (var _i = 0, _a = this._collissionOngoing; _i < _a.length; _i++) {
                        var tic = _a[_i];
                        if (tic.Stop > ti.Start)
                            newcollissionOngoing.push(tic); // keep
                    }
                    this._collissionOngoing = newcollissionOngoing;
                    var collisionOffset = 0;
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
    };
    GanttRow.prototype.Draw = function () {
        // Make sure row follows DateScaler
        var rectrow = this._gantt.GetDateScaler().GetCanvas().getBoundingClientRect();
        var rectrowCurrent = this._rowdiv.getBoundingClientRect();
        if (rectrow.left != rectrowCurrent.left || rectrow.width != rectrowCurrent.width) {
            var currleft = parseFloat(this._rowdiv.style.left.replace('px', ''));
            if (isNaN(currleft))
                currleft = 0;
            this._rowdiv.style.left = (rectrow.left - rectrowCurrent.left + currleft).toString() + 'px';
            this._rowdiv.style.width = (rectrow.width).toString() + 'px';
        }
        this._collisionDetect = this._rowdiv.attributes.getNamedItem('tk-collision-detect').value == "true";
        this._rowheight = parseFloat(this._rowdiv.attributes.getNamedItem('tk-row-height').value);
        this._rowheightincrease = parseFloat(this._rowdiv.attributes.getNamedItem('tk-row-height-increase').value);
        if (this._collisionDetect && this._isCollisionInvalidated) {
            this._timeitems = this.TimeItems.sort(function (a, b) { return a.Start.valueOf() - b.Start.valueOf(); });
            this._isCollisionInvalidated = false;
        }
        this._collissionOngoing = [];
        this._rowWidth = rectrowCurrent.width;
        this._rowLeft = rectrow.left;
        this._highestCollisionSeen = 0;
        // Iterate TimeItems for updating pos
        for (var _i = 0, _a = this.TimeItems; _i < _a.length; _i++) {
            var ti = _a[_i];
            if (ti.TheDiv != null) {
                this.DrawOne(ti);
            }
        }
        if (this._collisionDetect) {
            this._rowdiv.style.height = (this._rowheight - this._rowheightincrease + ((this._highestCollisionSeen + 1) * this._rowheightincrease)).toString() + 'px';
        }
        if (this._timeItemOp == TimeItemOp.timeitemcreation && this._timeItemUnderChange != null)
            this.DrawOne(this._timeItemUnderChange);
    };
    GanttRow.prototype.TrackTimeItem = function (timeItemData, timeItemElement) {
        var _this = this;
        this._timeitems.push(timeItemData);
        timeItemData.TheDiv = timeItemElement;
        timeItemData.Identity = timeItemData['VMClassId'].asString;
        timeItemElement.style.position = "absolute";
        timeItemElement.style.overflow = "hidden";
        timeItemElement.setAttribute("TimeItemIdentity", timeItemData.Identity);
        this._TimeItemMap[timeItemData.Identity] = timeItemData;
        this.CollisionInvalidate();
        timeItemElement.onmousedown = function (ev) { return _this.OnMouseDown(ev); };
        timeItemElement.ondragstart = function (ev) { ev.preventDefault(); };
        timeItemElement.addEventListener("touchcancel", function (ev) { _this.OnMouseUp(_this.TranslateTouchToMouse(ev, "mouseup")); }, false);
        timeItemElement.addEventListener("touchend", function (ev) { _this.OnMouseUp(_this.TranslateTouchToMouse(ev, "mouseup")); }, false);
        timeItemElement.addEventListener("touchmove", function (ev) { _this.OnMouseMove(_this.TranslateTouchToMouse(ev, "mousemove")); }, false);
        timeItemElement.addEventListener("touchstart", function (ev) { _this.OnMouseDown(_this.TranslateTouchToMouse(ev, "mousedown")); }, false);
    };
    GanttRow.prototype.UpdateTimeItemUnderChangeFromDiv = function (clickedElement) {
        for (var _i = 0, _a = this._timeitems; _i < _a.length; _i++) {
            var x = _a[_i];
            if (x.TheDiv == clickedElement) {
                this._timeItemUnderChange = x;
                this._timeItemUnderChange['vCurrent'] = true;
                this._timeItemUnderChange['vSelected'] = true;
                return this._timeItemUnderChange;
            }
        }
        return null;
    };
    GanttRow.prototype.SingleClickGanttRow = function (ev, clickedElement) {
        this._mousedown = true;
        var ds = this._gantt.GetDateScaler();
        this._downDate = ds.PixelToDate(ev.x - this._rowLeft).valueOf();
        this._timeItemUnderChangeDiffDate = 0;
        this._currenty = ev.y;
        this._document.addEventListener("mousemove", this._handlerformousemove);
        this._document.addEventListener("mouseup", this._handlerformouseup);
        var timeitemcreatemode = clickedElement.attributes.getNamedItem('tk-create-time-item-mode').value == "true";
        if (timeitemcreatemode) {
            this._timeitemcreation = this._document.createElement('div');
            this._rowdiv.appendChild(this._timeitemcreation);
            this._timeitemcreation.className = 'tkTimeItem';
            var rowheight = parseFloat(this._rowdiv.attributes.getNamedItem('tk-row-height').value);
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
        var r = this._rowdiv.getBoundingClientRect();
    };
    GanttRow.prototype.SingleClick = function (ev, clickedElement) {
        var x = this.UpdateTimeItemUnderChangeFromDiv(clickedElement);
        this._mousedown = true;
        var ds = this._gantt.GetDateScaler();
        this._downDate = ds.PixelToDate(ev.x - this._rowLeft).valueOf();
        this._timeItemUnderChangeDiffDate = 0;
        this._currenty = ev.y;
        this._document.addEventListener("mousemove", this._handlerformousemove);
        this._document.addEventListener("mouseup", this._handlerformouseup);
        this._allowMove = clickedElement.attributes.getNamedItem('tk-allow-move').value == "true";
        this._allowResizeStart = clickedElement.attributes.getNamedItem('tk-allow-resize-start').value == "true";
        this._allowResizeStop = clickedElement.attributes.getNamedItem('tk-allow-resize-stop').value == "true";
        this._allowChangeRow = clickedElement.attributes.getNamedItem('tk-allow-change-row').value == "true";
        var r = x.TheDiv.getBoundingClientRect();
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
    };
    GanttRow.prototype.DoubleClick = function (ev, clickedElement) {
        var _this = this;
        var x = this.UpdateTimeItemUnderChangeFromDiv(clickedElement);
        this._rowdata.ViewData.RootVMClassObject['VM_Variables'].vTimeItemDoubleClick_AsExternalId = x.VMClassId.VMObjectId;
        this._rowdata.ViewData.ExecuteAfterFullRoundtrip("ItemDoubleClick", null, function () {
            _this._rowdata.ViewData.RootVMClassObject.Execute("GanttTimeItemDoubleClick");
        });
    };
    GanttRow.prototype.OnMouseDown = function (ev) {
        var _this = this;
        ev.stopPropagation();
        this._downx = ev.x;
        this._downy = ev.y;
        var clickedElement = ev.srcElement;
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
                    setTimeout(function () {
                        if (_this._clicks == 1) {
                            _this.SingleClick(ev, clickedElement);
                        }
                        else {
                            _this.DoubleClick(ev, clickedElement);
                        }
                        _this._clicks = 0;
                    }, 200);
                }
            }
        }
        return false;
    };
    GanttRow.prototype.OnMouseMove = function (ev) {
        if (ev.buttons == 1) {
            if (this._timeItemUnderChange != null) {
                var ds = this._gantt.GetDateScaler();
                this._timeItemUnderChangeDiffDate = ds.PixelToDate(ev.x - this._rowLeft).valueOf() - this._downDate;
                if (this._allowChangeRow)
                    this._currenty = ev.y;
                this.Invalidate();
            }
        }
    };
    GanttRow.prototype.OnMouseUp = function (ev) {
        var _this = this;
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
            var rowrect = this._rowdiv.getBoundingClientRect();
            if (this._currenty < rowrect.top || this._currenty > rowrect.bottom) {
                var gr = this._gantt.FindRowFromYPoint(this._currenty);
                if (gr != null) {
                    // row change
                    this._rowdata.ViewData.RootVMClassObject['VM_Variables'].vRowMoveTargetRow_AsExternalId = gr._rowdata.VMClassId.VMObjectId;
                    this._rowdata.ViewData.RootVMClassObject['VM_Variables'].vRowMoveTimeItem_AsExternalId = this._timeItemUnderChange.VMClassId.VMObjectId;
                    this._rowdata.ViewData.ExecuteAfterFullRoundtrip("MoveRow", null, function () {
                        _this._rowdata.ViewData.RootVMClassObject.Execute("GanttTimeItemRowMoveExecute");
                        _this._timeItemUnderChange = null;
                        _this._timeItemOp = TimeItemOp.none;
                        _this._rowdiv.style.overflow = 'hidden';
                        _this._rowdiv.style.zIndex = '1';
                    });
                    return;
                }
            }
        }
        var memory = this._timeItemUnderChange;
        if (this._timeItemOp == TimeItemOp.timeitemcreation) {
            this._rowdata.ViewData.RootVMClassObject['VM_Variables'].vTimeItemCreateStart = memory.Start;
            this._rowdata.ViewData.RootVMClassObject['VM_Variables'].vTimeItemCreateStop = memory.Stop;
            this._rowdata.ViewData.ExecuteAfterFullRoundtrip("ItemCreate", null, function () {
                _this._rowdata.Execute("GanttTimeItemCreate");
                _this.RowDiv.removeChild(memory.TheDiv);
            });
        }
        else {
            // normal move
            this._rowdata.ViewData.ExecuteAfterFullRoundtrip("ItemMoveOp", null, function () {
                _this._rowdiv.style.overflow = 'hidden';
                _this._rowdiv.style.zIndex = '1';
            });
        }
        this._timeItemUnderChange = null;
        this._timeItemOp = TimeItemOp.none;
        this._document.removeEventListener("mousemove", this._handlerformousemove);
        this._document.removeEventListener("mouseup", this._handlerformouseup);
    };
    GanttRow.prototype.UnTrackTimeItem = function (timeItemData) {
        if (timeItemData != null) {
            timeItemData.TheDiv = null;
        }
        this.CollisionInvalidate();
    };
    GanttRow.prototype.TranslateTouchToMouse = function (te, evtype) {
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
    };
    GanttRow.kResizeArea = 4;
    return GanttRow;
}());
function FindGanttRowFromTimeItemElement(timeitemElement) {
    var ancestor = timeitemElement;
    while ((ancestor = ancestor.parentElement) && !ancestor.classList.contains('tkGanttRow')) { }
    if (ancestor != null) {
        var gr = ancestor['data-tkGanttRowRef'];
        return gr;
    }
    return null;
}
function InstallTheDirectiveTimeItem(streamingAppController) {
    console.trace("InstallTheDirectiveTimeItem" + streamingAppController.toString());
    streamingAppController.directive('tkTimeItem', ['$document', function ($document) {
            return {
                link: function (scope, elements, attr) {
                    var gr = FindGanttRowFromTimeItemElement(elements[0]);
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
//# sourceMappingURL=tkGanttRow.js.map