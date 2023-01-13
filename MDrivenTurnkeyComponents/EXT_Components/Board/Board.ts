//# sourceURL=EXT_Scripts/Board.js
/// <reference path="../../scripts/typings/jquery/jquery.d.ts" />
/// <reference path="../../js/StreamingAppClient.ts" />
/// <reference path="../../js/StreamingAppViewData.ts" />




class BoardLogic {
  private _Scope: any;
  private _card:StreamingApp.VMClassListItem;
  private _Element: HTMLDivElement;
  private _document: HTMLDocument

  private _startX = 0;
  private _startY = 0;
  private _x = 0;
  private _y = 0;
  private _clicks = 0;

  Init(card: StreamingApp.VMClassListItem, element: HTMLDivElement[], document: HTMLDocument[]): void {
    this._card = card;
    this._Element = element[0];
    this._document = document[0];

    this._Element.addEventListener("mousedown", (ev) => { this.DoBoardMouseDown(ev); });
    this._Element.addEventListener("touchstart", (ev) => { this.DoCommonMouseDown(this.TranslateTouchToMouse(ev, "mousedown")); });
    this._Element.addEventListener("touchcancel", (ev) => { this.mouseup(this.TranslateTouchToMouse(ev, "mouseup")); });
    this._Element.addEventListener("touchend", (ev) => { this.mouseup(this.TranslateTouchToMouse(ev, "mouseup")); });
    this._Element.addEventListener("touchmove", (ev) => { this.mousemove(this.TranslateTouchToMouse(ev, "mousemove")); });

    var startX = 0, startY = 0, x = 0, y = 0;
    var clicks = 0;
  }
  DoBoardMouseDown(event: MouseEvent): void {
    // Prevent default dragging of selected content
    event.preventDefault();
    this.DoCommonMouseDown(event);
  }
  private _handlerformousemove = (e: MouseEvent) => { this.mousemove(e); };
  private _handlerformouseup = (e: MouseEvent) => { this.mouseup(e); };
  DoCommonMouseDown(event: MouseEvent): void { 
    this._x = 0;
    this._y = 0;
    this._startX = event.pageX;
    this._startY = event.pageY;
    this._clicks++;
    if (this._clicks == 1) {
      setTimeout(() => {
        if (this._clicks == 1) {
          this._document.addEventListener("mousemove", this._handlerformousemove);
          this._document.addEventListener("mouseup", this._handlerformouseup);
          this._Element.classList.add("rotateWhileMove");
          this._Element.parentElement.style.overflow = 'visible'; 
          this._Element.parentElement.style.zIndex = '1000';

        } else {
          // double click - execute card action

          this._card['vCurrent'] = true;
          var theobjectfortheboard = (<StreamingApp.VMClassListItem>this._card.VMClassParent).VMClassParent;

          this._card.ViewData.ExecuteAfterFullRoundtrip("dblclickoncard", null, () => {
            console.log("dblclickoncard"); theobjectfortheboard.Execute("EditCurrentCardAction");
          });
        }
        this._clicks = 0;
      }, 300);
    }

  } 

  TranslateTouchToMouse(eventin: TouchEvent, evtype: string): MouseEvent {
    eventin.preventDefault();
    var result:any = new Object();
    result.button = 0;
    result.buttons = 1;    
    if (eventin.touches && eventin.touches.length > 0) {
      result.clientX = eventin.touches[0].clientX;
      result.clientY = eventin.touches[0].clientY;
      result.x = eventin.touches[0].clientX; 
      result.y = eventin.touches[0].clientX;
    }
    result.srcElement = eventin.srcElement;
    result.type = evtype;
    result.ctrlKey = eventin.ctrlKey;
    if (evtype === "mouseup") {
      result.clientY = this._y + this._startY;
      result.clientX = this._x + this._startX; 
    }
    else {
      result.pageY = result.clientY;
      result.pageX = result.clientX;
    }
    return <MouseEvent>result;
  }

  mousemove(event: MouseEvent) {
    this._y = event.clientY - this._startY;
    this._x = event.clientX - this._startX;
    this._Element.style.top = this._y + 'px';
    this._Element.style.left = this._x + 'px';
  }

  mouseup(event: MouseEvent) {
    if (event.preventDefault)
      event.preventDefault();
    this._document.removeEventListener("mousemove", this._handlerformousemove);
    this._document.removeEventListener("mouseup", this._handlerformouseup);


    this._y = event.clientY;
    this._x = event.clientX;

    this._Element.classList.remove("rotateWhileMove");
    let actiondone: boolean = false;

    var cardid: string = this._card.VMClassId.asString;
    var theobjectfortheboard = (<StreamingApp.VMClassListItem>this._card.VMClassParent).VMClassParent;
    var theboarddiv = $("[vmclassid='" + theobjectfortheboard.VMClassId.asString + "']");
    if (theboarddiv && this._card && this._card.VMClassParent) {
      // find all phBoardList elements under this board in DOM
      var alltheboardlists = $(theboarddiv).find("[ph-boardlist]");
      for (let elem of alltheboardlists.get()) {
        var r = (<HTMLElement>elem).getBoundingClientRect();
        if (r.top < this._y && r.bottom > this._y && r.left < this._x && r.right > this._x) {
          let thelistWeWereDroppedIn: HTMLElement = elem;
          let vmclassid = thelistWeWereDroppedIn.getAttribute("vmclassid");  
          let theobjectforthelist = this._card.ViewData.GetObjectForVMClassId(vmclassid);
          if (theobjectforthelist !== this._card.VMClassParent) {
            theobjectfortheboard['MoveActionTargetList_AsExternalId'] = theobjectforthelist.VMClassId.VMObjectId;
            theobjectfortheboard['MoveActionTargetCard_AsExternalId'] = this._card.VMClassId.VMObjectId;
            this._card.ViewData.ExecuteAfterFullRoundtrip("CardMoveOp", null,
              () => {
                console.log("MoveCard target:" + theobjectfortheboard['MoveActionTargetList_AsExternalId']);
                theobjectfortheboard.Execute("MoveAction");   
              });
            actiondone = true;
          }
        }
      }
    }

    if (!actiondone) {
      this._Element.style.top = 'auto';
      this._Element.style.left = 'auto';
    }

  }

}

function InstallTheDirective(streamingAppController) {
  console.trace("InstallTheDirective" + streamingAppController.toString());
  let myBoardLogics: BoardLogic[] = [];
  streamingAppController.directive('phCard', ['$document', function ($document) {

    return {
      link: function (scope, element, attr) {


        element.attr("vmclassid", scope.card.VMClassId.asString);
        let bl = scope.$parent.boardlist;

        element.css({
          position: 'relative',
          cursor: 'pointer'
        });

        var boardLogic = new BoardLogic();
        boardLogic.Init(scope.card, element, $document);
        myBoardLogics.push(boardLogic);
      }
    }; 
  }]);


}



console.trace("Board file loaded");
InstallTheDirective(angular.module('MDrivenAngularApp')); 



