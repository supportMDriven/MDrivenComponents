//works 2 
var DateConsts;
(function (DateConsts) {
    DateConsts.kdate_MSec = 1;
    DateConsts.kdate_Second = 1000;
    DateConsts.kdate_Minute = 60000;
    DateConsts.kdate_Hour = DateConsts.kdate_Minute * 60;
    DateConsts.kdate_Day = 24 * 3600000;
    DateConsts.kdate_Week = 7 * 24 * 3600000;
    DateConsts.kdate_MonthAprox = 28 * 24 * 360000;
    DateConsts.kdate_YearAprox = 365 * 24 * 360000;
})(DateConsts || (DateConsts = {}));
class ScaleMark {
}
export class VMClassTS {
    Execute(action) {
    }
    ExecuteOnRoot(action) {
    }
    ExecuteAfterFullRoundtrip(action, someobj, lambdatocall) {
    }
    VariableSet(name, value) {
    }
    VariableGet(name) {
        return null;
    }
}
export function createDateScaler(thediv) {
    let ds = new DateScaler();
    ds.InstallIn(thediv);
    return ds;
}
export class DateScaler {
    constructor() {
        /*                                    millisec      sec  10sec   30s                                                 1m                        5min                             10min                      1h       1d            1w                 28days             1year                 10year             100year*/
        this._scaleconversion = [DateConsts.kdate_MSec, DateConsts.kdate_MSec * 10, DateConsts.kdate_MSec * 100, DateConsts.kdate_Second, DateConsts.kdate_Second * 10, DateConsts.kdate_Second * 30, DateConsts.kdate_Minute, DateConsts.kdate_Minute * 5, DateConsts.kdate_Minute * 10, DateConsts.kdate_Hour, DateConsts.kdate_Day, DateConsts.kdate_Week, DateConsts.kdate_MonthAprox, DateConsts.kdate_YearAprox, 10 * DateConsts.kdate_YearAprox, 100 * DateConsts.kdate_YearAprox];
        this._handlerformousemove = (e) => { this.OnMouseMove(e); };
        this._handlerformouseup = (e) => { this.OnMouseUp(e); };
        this._months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
        this._isInvalidated = false;
    }
    setupJsCallbackToDateScaler(dotNetHelper) {
        this.OnStableAfterChange = (e) => {
            console.trace("DS OnStableAfterChange");
            dotNetHelper.invokeMethodAsync("HandleEvent", "OnStableAfterChange", "");
        };
    }
    BoundingRect() {
        if (this._theDiv != null) {
            return this._theDiv.getBoundingClientRect();
        }
        return null;
    }
    GetScreenFirstX() {
        if (this._theDiv != null) {
            let r = this._theDiv.getBoundingClientRect();
            return r.left;
        }
        return 0;
    }
    SetWidthAndHeight(w, h) {
        this._Width = w;
        this._Height = h;
    }
    SetStartStop(startasstring, stopasstring) {
        this.Start = new Date(startasstring);
        this.Stop = new Date(stopasstring);
        console.trace("DS SetStartStop " + startasstring + " " + stopasstring);
        this.Invalidate();
    }
    GetStart() {
        return this._start.toISOString();
    }
    GetStop() {
        return this._stop.toISOString();
    }
    get Start() {
        return this._start;
    }
    set Start(value) {
        this._start = value;
    }
    get Stop() {
        return this._stop;
    }
    set Stop(value) {
        this._stop = value;
    }
    DateScaler() {
    }
    GetWidth() {
        return this._Width;
    }
    fitToContainer() {
        this._canvas.width = this._Width;
        this._canvas.height = this._Height;
    }
    GetCanvas() {
        //this.fitToContainer();
        return this._canvas;
    }
    InstallIn(thediv) {
        this._canvas = document.createElement("canvas");
        this._theDiv = thediv;
        this._document = document;
        let w = this._theDiv.clientWidth;
        let h = this._theDiv.clientHeight;
        this._theDiv.appendChild(this._canvas);
        this.fitToContainer();
        this._theDiv.onmousedown = (ev) => { this.OnMouseDown(ev); };
        this._theDiv.onmouseup = (ev) => { this.OnMouseUp(ev); };
        this._theDiv.onmousemove = (ev) => { this.OnMouseMove(ev); };
        this._theDiv.ondragstart = function (ev) { ev.preventDefault(); };
        this._theDiv.addEventListener("touchcancel", (ev) => { this.OnMouseUp(this.TranslateTouchToMouse(ev, "mouseup")); }, false);
        this._theDiv.addEventListener("touchend", (ev) => { this.OnMouseUp(this.TranslateTouchToMouse(ev, "mouseup")); }, false);
        this._theDiv.addEventListener("touchmove", (ev) => { this.OnMouseMove(this.TranslateTouchToMouse(ev, "mousemove")); }, false);
        this._theDiv.addEventListener("touchstart", (ev) => { this.OnMouseDown(this.TranslateTouchToMouse(ev, "mousedown")); }, false);
        this._css = getComputedStyle(this._theDiv);
        let leftMarginstr = this._css.marginLeft.replace('px', '');
        this._theDiv.style.marginLeft = leftMarginstr + 'px';
        /*
            window.onresize = () => {
              this.Invalidate();
            };
            */
        this.watchSizesFunction();
    }
    FindRowFromYPoint(y) {
        //    rowdiv['data-hasGanttRowRef'] = true;
        //(rowdiv as any)._ganttrowref = this;
        const divs = Array.from(document.querySelectorAll('div[data-hasGanttRowRef]'));
        for (let grdiv of divs) {
            let r = grdiv.getBoundingClientRect();
            if (r.top <= y && r.bottom >= y)
                return grdiv._ganttrowref;
        }
        return null;
    }
    SetStartAndStop(start, stop) {
        if (start < stop) {
            this.Start = start;
            this.Stop = stop;
            this.Invalidate();
        }
    }
    watchSizesFunction() {
        if (this._lastKnownClientWidth != this._theDiv.clientWidth) {
            this._lastKnownClientWidth = this._theDiv.clientWidth;
            this.Invalidate();
        }
        //window.requestAnimationFrame(() => { this.watchSizesFunction(); });
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
            result.y = te.touches[0].clientX;
        }
        result.srcElement = te.srcElement;
        result.type = evtype;
        result.ctrlKey = te.ctrlKey;
        return result;
    }
    OnMouseDown(ev) {
        this._mouseMovedAtAll = false;
        if (ev.currentTarget === ev.target || this._canvas === ev.target) {
            this._downx = ev.x;
            this._lastx = ev.x;
            let currleftstr = this._theDiv.style.marginLeft;
            if (currleftstr == '')
                currleftstr = '0px';
            this._currleft = parseFloat(currleftstr.replace('px', ''));
            this._clientRectAtDown = this._theDiv.getBoundingClientRect();
            this._document.addEventListener("mousemove", this._handlerformousemove);
            this._document.addEventListener("mouseup", this._handlerformouseup);
        }
    }
    OnMouseUp(ev) {
        this._document.removeEventListener("mousemove", this._handlerformousemove);
        this._document.removeEventListener("mouseup", this._handlerformouseup);
        // We have controls inside here as well - and we dont want to 
        if (this._mouseMovedAtAll && Math.abs(this._downx - this._lastx) > 2) {
            if (this.OnStableAfterChange != null)
                this.OnStableAfterChange(this);
        }
    }
    OnMouseMove(ev) {
        if (ev.buttons == 1) {
            this._mouseMovedAtAll = true;
            var diffx = ev.x - this._lastx;
            if (diffx != 0) {
                var newx = this._lastx + diffx;
                if (this._downx - this._clientRectAtDown.left < 4) {
                    //resize
                    this._theDiv.style.marginLeft = (this._currleft + ev.x - this._downx).toString() + 'px';
                }
                else {
                    // normal pan/zoom
                    var diffInDate = this.PixelToDate(newx).valueOf() - this.PixelToDate(this._lastx).valueOf();
                    if (ev.ctrlKey) {
                        this.Start = new Date(this.Start.valueOf() - diffInDate / 1);
                        this.Stop = new Date(this.Stop.valueOf() + diffInDate / 1);
                    }
                    else {
                        this.Start = new Date(this.Start.valueOf() - diffInDate);
                        this.Stop = new Date(this.Stop.valueOf() - diffInDate);
                    }
                }
                this.Invalidate();
            }
            this._lastx = ev.x;
        }
    }
    GetPrevStepForEvenDrawstart(current, currentScaleConv) {
        var drawdate;
        if (currentScaleConv >= DateConsts.kdate_Day) {
            current = this.MS2UTCDate(current).setUTCHours(0, 0, 0, 0);
        }
        if (currentScaleConv < DateConsts.kdate_Day) {
            drawdate = (currentScaleConv * Math.round((current - currentScaleConv) / currentScaleConv));
        }
        else if (currentScaleConv == DateConsts.kdate_Day) {
            drawdate = (currentScaleConv * Math.round((current - currentScaleConv) / currentScaleConv));
        }
        else if (currentScaleConv == DateConsts.kdate_Week) {
            var day = this.MS2UTCDate(current).getDay();
            if (day == 0)
                day = 7;
            drawdate = current - day * DateConsts.kdate_Day; // start on day zero
        }
        else if (currentScaleConv == DateConsts.kdate_MonthAprox) {
            var date = this.MS2UTCDate(current).getDate();
            drawdate = current - ((date + 1) * DateConsts.kdate_Day);
            drawdate = (new Date(drawdate)).setDate(1);
        }
        else if (currentScaleConv >= DateConsts.kdate_YearAprox) {
            var year = this.MS2UTCDate(current).getFullYear();
            drawdate = (new Date(year - 1, 0, 1)).valueOf();
            if (currentScaleConv > DateConsts.kdate_YearAprox) {
                var numyears = (currentScaleConv / DateConsts.kdate_YearAprox);
                year = numyears * Math.round((year - numyears) / numyears);
                drawdate = (new Date(year, 0, 1)).valueOf();
            }
        }
        return drawdate;
    }
    MS2UTCDate(ms) {
        var d = new Date(ms);
        return d;
    }
    GetNextStep(current, currentScaleConv) {
        var drawdate;
        if (currentScaleConv <= DateConsts.kdate_Day) {
            drawdate = current + currentScaleConv;
        }
        else if (currentScaleConv == DateConsts.kdate_Week) {
            var day = this.MS2UTCDate(current).getDay();
            if (day == 0)
                day = 7;
            drawdate = current + 7 * DateConsts.kdate_Day;
        }
        else if (currentScaleConv == DateConsts.kdate_MonthAprox) {
            drawdate = (this.MS2UTCDate(current + 32 * DateConsts.kdate_Day)).setDate(1);
        }
        else if (currentScaleConv >= DateConsts.kdate_YearAprox) {
            var year = this.MS2UTCDate(current).getFullYear();
            var numyears = (currentScaleConv / DateConsts.kdate_YearAprox);
            drawdate = (new Date(year + numyears, 0, 1)).valueOf();
        }
        return drawdate;
    }
    ZeroPad(value, len) {
        return ('0' + value.toString()).slice(-len);
    }
    GetWeekNo(inp) {
        var d = new Date(+inp);
        d.setHours(0, 0, 0);
        d.setDate(d.getDate() + 4 - (d.getUTCDay() || 7));
        return Math.ceil((((d.valueOf() - (new Date(d.getFullYear(), 0, 1)).valueOf()) / 8.64e7) + 1) / 7);
    }
    GetText(drawdate, scaleconv, isUpper) {
        if (scaleconv == DateConsts.kdate_MSec || scaleconv == DateConsts.kdate_MSec * 10 || scaleconv == DateConsts.kdate_MSec * 100)
            return this.ZeroPad(this.MS2UTCDate(drawdate).getMilliseconds(), 3);
        if (scaleconv == DateConsts.kdate_Second || scaleconv == DateConsts.kdate_Second * 10 || scaleconv == DateConsts.kdate_Second * 30)
            return this.ZeroPad(this.MS2UTCDate(drawdate).getSeconds(), 2);
        if (scaleconv == DateConsts.kdate_Minute || scaleconv == DateConsts.kdate_Minute * 5 || scaleconv == DateConsts.kdate_Minute * 10)
            return this.ZeroPad(this.MS2UTCDate(drawdate).getMinutes(), 2);
        if (scaleconv == DateConsts.kdate_Hour)
            return this.ZeroPad(this.MS2UTCDate(drawdate).getHours(), 2);
        if (scaleconv == DateConsts.kdate_Day)
            return this.ZeroPad(this.MS2UTCDate(drawdate).getDate(), 2);
        if (scaleconv == DateConsts.kdate_MonthAprox)
            return this._months[this.MS2UTCDate(drawdate).getMonth()];
        if (scaleconv == DateConsts.kdate_Week)
            return "w" + this.GetWeekNo(this.MS2UTCDate(drawdate)).toString();
        if (scaleconv == DateConsts.kdate_YearAprox)
            return this.ZeroPad(this.MS2UTCDate(drawdate).getFullYear(), 4);
        if (scaleconv == DateConsts.kdate_YearAprox * 10)
            return this.ZeroPad(this.MS2UTCDate(drawdate).getFullYear(), 4) + "-" + this.ZeroPad(this.MS2UTCDate(drawdate).getFullYear() + 10, 4);
        if (scaleconv == DateConsts.kdate_YearAprox * 100)
            return this.ZeroPad(this.MS2UTCDate(drawdate).getFullYear(), 4) + "-" + this.ZeroPad(this.MS2UTCDate(drawdate).getFullYear() + 100, 4);
        return "";
    }
    Invalidate() {
        if (this._isInvalidated)
            return;
        this._isInvalidated = true;
        setTimeout(() => { this._isInvalidated = false; this.Draw(); }, 1);
    }
    Draw() {
        this.DrawDateScaler();
        if (this.OnDateScalerRedrawn != null)
            this.OnDateScalerRedrawn(this);
    }
    DrawDateScaler() {
        this.fitToContainer();
        var w = this._Width;
        var ctx = this._canvas.getContext("2d");
        ctx.lineWidth = 1;
        ctx.strokeStyle = this._css.borderColor;
        ctx.fillStyle = this._css.color; // color of text
        ctx.font = this._css.font;
        if (this.Start != undefined && this.Stop != undefined && this.Start && this.Stop && this.Start < this.Stop) {
            ctx.clearRect(0, 0, w, this._Height);
            var totmsecs = (this.Stop.valueOf() - this.Start.valueOf());
            var spanpres = this.ZeroPad(this.Start.getFullYear(), 4) + "-" + this.ZeroPad(this.Start.getMonth() + 1, 2) + "-" + this.ZeroPad(this.Start.getDate(), 2);
            if (this.Start.getHours() != 0 || this.Start.getMinutes() != 0) {
                spanpres += " " + this.ZeroPad(this.Start.getHours(), 2) + ":" + this.ZeroPad(this.Start.getMinutes(), 2);
                if (this.Start.getSeconds() != 0) {
                    spanpres += "." + this.ZeroPad(this.Start.getSeconds(), 2);
                }
            }
            //ctx.fillText(spanpres, 1, 10);
            var curr = 0;
            var currentScaleConv = this._scaleconversion[curr];
            while (w / (totmsecs / currentScaleConv) < 12) { //make sure we have at least 12 pixels in small span
                curr++;
                currentScaleConv = this._scaleconversion[curr];
            }
            this._currentScaleConv = currentScaleConv;
            // lower band
            this._ScaleMarksShort = [];
            var drawdate = this.GetPrevStepForEvenDrawstart(this.Start.valueOf(), currentScaleConv);
            this.CreateScaleMarks(drawdate, currentScaleConv, this._ScaleMarksShort, false);
            this.ActualBandDraw(ctx, currentScaleConv, this._ScaleMarksShort, false);
            //upperband
            this._ScaleMarksLong = [];
            if (this._scaleconversion.length > curr + 1) {
                currentScaleConv = this._scaleconversion[curr + 1];
                drawdate = this.GetPrevStepForEvenDrawstart(this.Start.valueOf(), currentScaleConv);
                this.CreateScaleMarks(drawdate, currentScaleConv, this._ScaleMarksLong, true);
                this.ActualBandDraw(ctx, currentScaleConv, this._ScaleMarksLong, true);
            }
        }
    }
    CreateScaleMarks(drawdate, scaleconv, collectlist, isUpper) {
        var prevSM = null;
        var overage = 0;
        while (drawdate != undefined && (drawdate < this.Stop.valueOf() || overage < 2)) {
            var xpos = this.DateToPixel(this.MS2UTCDate(drawdate));
            var sm = new ScaleMark();
            sm.DateTime = drawdate;
            sm.XPos = xpos;
            sm.Text = this.GetText(drawdate, scaleconv, isUpper);
            collectlist.push(sm);
            if (prevSM != null) {
                prevSM.XPosBoxFar = ((sm.XPos - prevSM.XPos) / 2) + prevSM.XPos;
            }
            drawdate = this.GetNextStep(drawdate, scaleconv);
            prevSM = sm;
            if (xpos > this._Width)
                overage++;
        }
    }
    ActualBandDraw(ctx, scaleconv, collectlist, isUpper) {
        ctx.beginPath();
        var boxHeight = 24;
        var textBottomMargin = 4;
        var ymarkerlen = boxHeight;
        if (isUpper)
            ymarkerlen = 2 * boxHeight;
        var oldxpos = 0;
        for (var i = 0; i < collectlist.length; i++) {
            var sm = collectlist[i];
            var xpos = sm.XPos;
            if (scaleconv >= DateConsts.kdate_Day) {
                //box
                var newfar = collectlist[i].XPosBoxFar;
                ctx.moveTo(xpos, this._Height - (ymarkerlen - boxHeight));
                ctx.lineTo(xpos, this._Height - ymarkerlen);
                ctx.lineTo(oldxpos, this._Height - ymarkerlen);
                ctx.fillText(sm.Text, newfar - ctx.measureText(sm.Text).width / 2, this._Height - (ymarkerlen - boxHeight + textBottomMargin));
                //DoText(scaleconv, sm.XPos, sm.DateTime,sm.
                oldxpos = xpos;
            }
            else {
                ctx.moveTo(xpos, this._Height);
                ctx.lineTo(xpos, this._Height - ymarkerlen / 2);
                if (isUpper) {
                    ctx.fillText(sm.Text, xpos - ctx.measureText(sm.Text).width / 2, this._Height - (ymarkerlen - boxHeight + textBottomMargin));
                }
            }
        }
        ctx.moveTo(0, this._Height);
        ctx.lineTo(this._Width, this._Height);
        ctx.stroke();
        ctx.closePath();
    }
    DateToPixel(value) {
        return ((value.valueOf() - this.Start.valueOf()) / (this.Stop.valueOf() - this.Start.valueOf())) * this._Width;
    }
    PixelToDate(value) {
        return this.MS2UTCDate(this.Start.valueOf() + ((value / this._Width) * (this.Stop.valueOf() - this.Start.valueOf())));
    }
}
//# sourceMappingURL=DateScaler.razor.js.map