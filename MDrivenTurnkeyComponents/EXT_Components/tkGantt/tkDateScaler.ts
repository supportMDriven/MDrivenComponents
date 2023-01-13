
module DateConsts {
  export var kdate_MSec: number = 1;
  export var kdate_Second: number = 1000;
  export var kdate_Minute: number = 60000;
  export var kdate_Hour: number = DateConsts.kdate_Minute * 60;
  export var kdate_Day: number = 24 * 3600000;
  export var kdate_Week: number = 7 * 24 * 3600000;
  export var kdate_MonthAprox: number = 28 * 24 * 360000;
  export var kdate_YearAprox: number = 365 * 24 * 360000;
}

class ScaleMark {
  public XPos: number;
  public XPosBoxFar: number;
  public Text: string;
  public DateTime: number;

}
class DateScaler {  

  /*                                    millisec      sec  10sec   30s                                                 1m                        5min                             10min                      1h       1d            1w                 28days             1year                 10year             100year*/
  private _scaleconversion: number[] = [DateConsts.kdate_MSec, DateConsts.kdate_MSec * 10, DateConsts.kdate_MSec * 100, DateConsts.kdate_Second, DateConsts.kdate_Second * 10, DateConsts.kdate_Second * 30, DateConsts.kdate_Minute, DateConsts.kdate_Minute * 5, DateConsts.kdate_Minute * 10, DateConsts.kdate_Hour, DateConsts.kdate_Day, DateConsts.kdate_Week, DateConsts.kdate_MonthAprox, DateConsts.kdate_YearAprox, 10 * DateConsts.kdate_YearAprox, 100 * DateConsts.kdate_YearAprox];


  private _start: Date;
  get Start(): Date {
    return this._start;
  }
  set Start(value: Date) {
    this._start = value;
  }


  private _stop: Date;
  get Stop(): Date {
    return this._stop;
  }
  set Stop(value: Date) {
    this._stop = value;
  }
  public DateScaler(): void {
  }

  public GetWidth(): number {
    return this._canvas.width;
  }

  public fitToContainer() {
    var rect = this._theDiv.getBoundingClientRect();
    this._canvas.width = rect.width;
    this._canvas.height = rect.height;
  }

  public GetCanvas(): HTMLCanvasElement
  {
    //this.fitToContainer();
    return this._canvas;
  }


  private _canvas: HTMLCanvasElement;
  private _theDiv: HTMLDivElement;
  private _document: HTMLDocument;

  public InstallIn(thediv: HTMLDivElement, document: HTMLDocument): void {
    this._canvas = document.createElement("canvas");
    this._theDiv = thediv;
    this._document = document;
    let w = this._theDiv.clientWidth;
    let h = this._theDiv.clientHeight;
    this._theDiv.appendChild(this._canvas);
    this.fitToContainer();


    this._theDiv.onmousedown = (ev: MouseEvent)=> {this.OnMouseDown(ev);}
    this._theDiv.onmouseup = (ev: MouseEvent)=> {this.OnMouseUp(ev);}
    this._theDiv.onmousemove = (ev: MouseEvent)=> {this.OnMouseMove(ev);}
    this._theDiv.ondragstart = function (ev: DragEvent) {ev.preventDefault();}

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

  private _lastKnownClientWidth: number;
  private _css: CSSStyleDeclaration;

  public SetStartAndStop(start: Date, stop: Date)
  {
    if (start < stop) {
      this.Start = start;
      this.Stop = stop;
      this.Invalidate();
    }

  }

  private watchSizesFunction() {
    if (this._lastKnownClientWidth != this._theDiv.clientWidth) {
      this._lastKnownClientWidth = this._theDiv.clientWidth;
      this.Invalidate();
    }
    window.requestAnimationFrame(() => { this.watchSizesFunction(); });
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
      result.y = te.touches[0].clientX;
    }
    result.srcElement = te.srcElement;
    result.type = evtype;
    result.ctrlKey = te.ctrlKey;

    return <MouseEvent>result;
  }

  private _handlerformousemove = (e: MouseEvent) => { this.OnMouseMove(e); };
  private _handlerformouseup = (e: MouseEvent) => { this.OnMouseUp(e); };

  private _downx: number;
  private _downy: number;
  private _lastx: number;
  private _lasty: number;
  private _mousedown: boolean;
  private _currleft: number;
  private _clientRectAtDown:ClientRect;
  private OnMouseDown(ev: MouseEvent): void {
    this._downx = ev.x;
    this._downy = ev.y;
    this._lastx = ev.x;
    this._lasty = ev.y;
    this._mousedown = true;

    let currleftstr = this._theDiv.style.marginLeft;
    if (currleftstr == '')
      currleftstr = '0px';
    this._currleft = parseFloat(currleftstr.replace('px', ''));
    this._clientRectAtDown=this._theDiv.getBoundingClientRect();



    this._document.addEventListener("mousemove", this._handlerformousemove);
    this._document.addEventListener("mouseup", this._handlerformouseup);

  }
  private OnMouseUp(ev: MouseEvent): void {

    this._mousedown = false;

    this._document.removeEventListener("mousemove", this._handlerformousemove);
    this._document.removeEventListener("mouseup", this._handlerformouseup);

    if (this.OnStableAfterChange != null)
      this.OnStableAfterChange(this);

  }
  private OnMouseMove(ev: MouseEvent): void {

    if (ev.buttons == 1) {
      var diffx = ev.x - this._lastx;
      if (diffx != 0) {
        var newx = this._lastx + diffx;
        if (this._downx - this._clientRectAtDown.left < 4) {
          //resize
          this._theDiv.style.marginLeft = (this._currleft + ev.x - this._downx).toString() + 'px';
        }
        else
        {
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

  }

  private _currentScaleConv: number;


  private GetPrevStepForEvenDrawstart(current: number, currentScaleConv: number): number {
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

  private MS2UTCDate(ms: number): Date {
    var d = new Date(ms);
    return d;
  }

  private GetNextStep(current: number, currentScaleConv: number): number {
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


  private ZeroPad(value: number, len: number): string { 
    return ('0' + value.toString()).slice(-len);
  }


  private _ScaleMarksShort: ScaleMark[];
  private _ScaleMarksLong: ScaleMark[];
  private _months: string[] = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

  private GetWeekNo(inp: Date): number {
    var d = new Date(+inp);
    d.setHours(0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getUTCDay() || 7));
    return Math.ceil((((d.valueOf() - (new Date(d.getFullYear(), 0, 1)).valueOf()) / 8.64e7) + 1) / 7);
  }

  private GetText(drawdate, scaleconv, isUpper): string {
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
  private _isInvalidated: boolean = false;
  public Invalidate(): void {
    if (this._isInvalidated)
      return;
    this._isInvalidated = true;
    setTimeout(() => { this._isInvalidated = false; this.Draw(); }, 1);
  }

  public Draw(): void {
    this.DrawDateScaler();
    if (this.OnDateScalerRedrawn != null)
      this.OnDateScalerRedrawn(this);
  }

  public OnDateScalerRedrawn: (ds: DateScaler) => void;

  public OnStableAfterChange: (ds: DateScaler) => void;
  

  public DrawDateScaler(): void {
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
      var currentScaleConv = this._scaleconversion[curr]
      while (w / (totmsecs / currentScaleConv) < 12) {   //make sure we have at least 12 pixels in small span
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

  private CreateScaleMarks(drawdate: number, scaleconv: number, collectlist: ScaleMark[], isUpper: boolean): void {

    var prevSM: ScaleMark = null;
    var overage = 0;
    while (drawdate!=undefined && (drawdate < this.Stop.valueOf() || overage < 2)) {
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
  }

  private ActualBandDraw(ctx: CanvasRenderingContext2D, scaleconv: number, collectlist: ScaleMark[], isUpper: boolean): void {
    ctx.beginPath();

    var boxHeight:number= 24;
    var textBottomMargin:number= 4;
    
    var ymarkerlen: number = boxHeight;
    if (isUpper)
      ymarkerlen = 2*boxHeight;

    var oldxpos: number = 0;
    for (var i: number = 0; i < collectlist.length; i++) {
      var sm = collectlist[i];
      var xpos = sm.XPos;
      if (scaleconv >= DateConsts.kdate_Day) {
        //box
        var newfar = collectlist[i].XPosBoxFar;
        ctx.moveTo(xpos, this._canvas.height - (ymarkerlen - boxHeight));
        ctx.lineTo(xpos, this._canvas.height - ymarkerlen);
        ctx.lineTo(oldxpos, this._canvas.height - ymarkerlen);

        ctx.fillText(sm.Text, newfar - ctx.measureText(sm.Text).width / 2, this._canvas.height - (ymarkerlen - boxHeight+textBottomMargin));
        //DoText(scaleconv, sm.XPos, sm.DateTime,sm.

        oldxpos = xpos;
      }
      else {
        ctx.moveTo(xpos, this._canvas.height);
        ctx.lineTo(xpos, this._canvas.height - ymarkerlen / 2);
        if (isUpper) {
          ctx.fillText(sm.Text, xpos - ctx.measureText(sm.Text).width / 2, this._canvas.height - (ymarkerlen - boxHeight+textBottomMargin));
        }

      }
    }
    ctx.moveTo(0, this._canvas.height);
    ctx.lineTo(this._canvas.width, this._canvas.height);
    ctx.stroke();
    ctx.closePath();
  }

  public DateToPixel(value: Date): number {
    return ((value.valueOf() - this.Start.valueOf()) / (this.Stop.valueOf() - this.Start.valueOf())) * this._canvas.width;
  }

  public PixelToDate(value: number): Date {
    return this.MS2UTCDate(this.Start.valueOf() + ((value / this._canvas.width) * (this.Stop.valueOf() - this.Start.valueOf())));
  }

}