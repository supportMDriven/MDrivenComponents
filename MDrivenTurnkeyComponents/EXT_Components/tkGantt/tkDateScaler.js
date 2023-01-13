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
var ScaleMark = (function () {
    function ScaleMark() {
    }
    return ScaleMark;
}());
var DateScaler = (function () {
    function DateScaler() {
        var _this = this;
        /*                                    millisec      sec  10sec   30s                                                 1m                        5min                             10min                      1h       1d            1w                 28days             1year                 10year             100year*/
        this._scaleconversion = [DateConsts.kdate_MSec, DateConsts.kdate_MSec * 10, DateConsts.kdate_MSec * 100, DateConsts.kdate_Second, DateConsts.kdate_Second * 10, DateConsts.kdate_Second * 30, DateConsts.kdate_Minute, DateConsts.kdate_Minute * 5, DateConsts.kdate_Minute * 10, DateConsts.kdate_Hour, DateConsts.kdate_Day, DateConsts.kdate_Week, DateConsts.kdate_MonthAprox, DateConsts.kdate_YearAprox, 10 * DateConsts.kdate_YearAprox, 100 * DateConsts.kdate_YearAprox];
        this._handlerformousemove = function (e) { _this.OnMouseMove(e); };
        this._handlerformouseup = function (e) { _this.OnMouseUp(e); };
        this._months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
        this._isInvalidated = false;
    }
    Object.defineProperty(DateScaler.prototype, "Start", {
        get: function () {
            return this._start;
        },
        set: function (value) {
            this._start = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DateScaler.prototype, "Stop", {
        get: function () {
            return this._stop;
        },
        set: function (value) {
            this._stop = value;
        },
        enumerable: true,
        configurable: true
    });
    DateScaler.prototype.DateScaler = function () {
    };
    DateScaler.prototype.GetWidth = function () {
        return this._canvas.width;
    };
    DateScaler.prototype.fitToContainer = function () {
        var rect = this._theDiv.getBoundingClientRect();
        this._canvas.width = rect.width;
        this._canvas.height = rect.height;
    };
    DateScaler.prototype.GetCanvas = function () {
        //this.fitToContainer();
        return this._canvas;
    };
    DateScaler.prototype.InstallIn = function (thediv, document) {
        var _this = this;
        this._canvas = document.createElement("canvas");
        this._theDiv = thediv;
        this._document = document;
        var w = this._theDiv.clientWidth;
        var h = this._theDiv.clientHeight;
        this._theDiv.appendChild(this._canvas);
        this.fitToContainer();
        this._theDiv.onmousedown = function (ev) { _this.OnMouseDown(ev); };
        this._theDiv.onmouseup = function (ev) { _this.OnMouseUp(ev); };
        this._theDiv.onmousemove = function (ev) { _this.OnMouseMove(ev); };
        this._theDiv.ondragstart = function (ev) { ev.preventDefault(); };
        this._theDiv.addEventListener("touchcancel", function (ev) { _this.OnMouseUp(_this.TranslateTouchToMouse(ev, "mouseup")); }, false);
        this._theDiv.addEventListener("touchend", function (ev) { _this.OnMouseUp(_this.TranslateTouchToMouse(ev, "mouseup")); }, false);
        this._theDiv.addEventListener("touchmove", function (ev) { _this.OnMouseMove(_this.TranslateTouchToMouse(ev, "mousemove")); }, false);
        this._theDiv.addEventListener("touchstart", function (ev) { _this.OnMouseDown(_this.TranslateTouchToMouse(ev, "mousedown")); }, false);
        this._css = getComputedStyle(this._theDiv);
        var leftMarginstr = this._css.marginLeft.replace('px', '');
        this._theDiv.style.marginLeft = leftMarginstr + 'px';
        /*
            window.onresize = () => {
              this.Invalidate();
            };
            */
        this.watchSizesFunction();
    };
    DateScaler.prototype.SetStartAndStop = function (start, stop) {
        if (start < stop) {
            this.Start = start;
            this.Stop = stop;
            this.Invalidate();
        }
    };
    DateScaler.prototype.watchSizesFunction = function () {
        var _this = this;
        if (this._lastKnownClientWidth != this._theDiv.clientWidth) {
            this._lastKnownClientWidth = this._theDiv.clientWidth;
            this.Invalidate();
        }
        window.requestAnimationFrame(function () { _this.watchSizesFunction(); });
    };
    DateScaler.prototype.TranslateTouchToMouse = function (te, evtype) {
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
    };
    DateScaler.prototype.OnMouseDown = function (ev) {
        this._downx = ev.x;
        this._downy = ev.y;
        this._lastx = ev.x;
        this._lasty = ev.y;
        this._mousedown = true;
        var currleftstr = this._theDiv.style.marginLeft;
        if (currleftstr == '')
            currleftstr = '0px';
        this._currleft = parseFloat(currleftstr.replace('px', ''));
        this._clientRectAtDown = this._theDiv.getBoundingClientRect();
        this._document.addEventListener("mousemove", this._handlerformousemove);
        this._document.addEventListener("mouseup", this._handlerformouseup);
    };
    DateScaler.prototype.OnMouseUp = function (ev) {
        this._mousedown = false;
        this._document.removeEventListener("mousemove", this._handlerformousemove);
        this._document.removeEventListener("mouseup", this._handlerformouseup);
        if (this.OnStableAfterChange != null)
            this.OnStableAfterChange(this);
    };
    DateScaler.prototype.OnMouseMove = function (ev) {
        if (ev.buttons == 1) {
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
            this._lasty = ev.y;
        }
    };
    DateScaler.prototype.GetPrevStepForEvenDrawstart = function (current, currentScaleConv) {
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
    };
    DateScaler.prototype.MS2UTCDate = function (ms) {
        var d = new Date(ms);
        return d;
    };
    DateScaler.prototype.GetNextStep = function (current, currentScaleConv) {
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
    };
    DateScaler.prototype.ZeroPad = function (value, len) {
        return ('0' + value.toString()).slice(-len);
    };
    DateScaler.prototype.GetWeekNo = function (inp) {
        var d = new Date(+inp);
        d.setHours(0, 0, 0);
        d.setDate(d.getDate() + 4 - (d.getUTCDay() || 7));
        return Math.ceil((((d.valueOf() - (new Date(d.getFullYear(), 0, 1)).valueOf()) / 8.64e7) + 1) / 7);
    };
    DateScaler.prototype.GetText = function (drawdate, scaleconv, isUpper) {
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
    };
    DateScaler.prototype.Invalidate = function () {
        var _this = this;
        if (this._isInvalidated)
            return;
        this._isInvalidated = true;
        setTimeout(function () { _this._isInvalidated = false; _this.Draw(); }, 1);
    };
    DateScaler.prototype.Draw = function () {
        this.DrawDateScaler();
        if (this.OnDateScalerRedrawn != null)
            this.OnDateScalerRedrawn(this);
    };
    DateScaler.prototype.DrawDateScaler = function () {
        this.fitToContainer();
        var w = this._canvas.width;
        var ctx = this._canvas.getContext("2d");
        ctx.lineWidth = 1;
        ctx.strokeStyle = this._css.borderColor;
        ctx.fillStyle = this._css.color; // color of text
        ctx.font = this._css.font;
        if (this.Start && this.Stop && this.Start < this.Stop) {
            ctx.clearRect(0, 0, w, this._canvas.height);
            var totmsecs = (this.Stop.valueOf() - this.Start.valueOf());
            var spanpres = this.ZeroPad(this.Start.getFullYear(), 4) + "-" + this.ZeroPad(this.Start.getMonth() + 1, 2) + "-" + this.ZeroPad(this.Start.getDate(), 2);
            if (this.Start.getHours() != 0 || this.Start.getMinutes() != 0) {
                spanpres += " " + this.ZeroPad(this.Start.getHours(), 2) + ":" + this.ZeroPad(this.Start.getMinutes(), 2);
                if (this.Start.getSeconds() != 0) {
                    spanpres += "." + this.ZeroPad(this.Start.getSeconds(), 2);
                }
            }
            ctx.fillText(spanpres, 1, 10);
            var curr = 0;
            var currentScaleConv = this._scaleconversion[curr];
            while (w / (totmsecs / currentScaleConv) < 12) {
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
    };
    DateScaler.prototype.CreateScaleMarks = function (drawdate, scaleconv, collectlist, isUpper) {
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
            if (xpos > this._canvas.width)
                overage++;
        }
    };
    DateScaler.prototype.ActualBandDraw = function (ctx, scaleconv, collectlist, isUpper) {
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
                ctx.moveTo(xpos, this._canvas.height - (ymarkerlen - boxHeight));
                ctx.lineTo(xpos, this._canvas.height - ymarkerlen);
                ctx.lineTo(oldxpos, this._canvas.height - ymarkerlen);
                ctx.fillText(sm.Text, newfar - ctx.measureText(sm.Text).width / 2, this._canvas.height - (ymarkerlen - boxHeight + textBottomMargin));
                //DoText(scaleconv, sm.XPos, sm.DateTime,sm.
                oldxpos = xpos;
            }
            else {
                ctx.moveTo(xpos, this._canvas.height);
                ctx.lineTo(xpos, this._canvas.height - ymarkerlen / 2);
                if (isUpper) {
                    ctx.fillText(sm.Text, xpos - ctx.measureText(sm.Text).width / 2, this._canvas.height - (ymarkerlen - boxHeight + textBottomMargin));
                }
            }
        }
        ctx.moveTo(0, this._canvas.height);
        ctx.lineTo(this._canvas.width, this._canvas.height);
        ctx.stroke();
        ctx.closePath();
    };
    DateScaler.prototype.DateToPixel = function (value) {
        return ((value.valueOf() - this.Start.valueOf()) / (this.Stop.valueOf() - this.Start.valueOf())) * this._canvas.width;
    };
    DateScaler.prototype.PixelToDate = function (value) {
        return this.MS2UTCDate(this.Start.valueOf() + ((value / this._canvas.width) * (this.Stop.valueOf() - this.Start.valueOf())));
    };
    return DateScaler;
}());
//# sourceMappingURL=tkDateScaler.js.map