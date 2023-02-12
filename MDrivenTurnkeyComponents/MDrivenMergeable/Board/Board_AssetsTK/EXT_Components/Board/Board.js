//# sourceURL=EXT_Scripts/Board.js
/// <reference path="../../scripts/typings/jquery/jquery.d.ts" />
/// <reference path="../../js/StreamingAppClient.ts" />
/// <reference path="../../js/StreamingAppViewData.ts" />
var BoardLogic = /** @class */ (function () {
    function BoardLogic() {
        var _this = this;
        this._startX = 0;
        this._startY = 0;
        this._x = 0;
        this._y = 0;
        this._clicks = 0;
        this._handlerformousemove = function (e) { _this.mousemove(e); };
        this._handlerformouseup = function (e) { _this.mouseup(e); };
    }
    BoardLogic.prototype.Init = function (card, element, document) {
        var _this = this;
        this._card = card;
        this._Element = element[0];
        this._document = document[0];
        this._Element.addEventListener("mousedown", function (ev) { _this.DoBoardMouseDown(ev); });
        this._Element.addEventListener("touchstart", function (ev) { _this.DoCommonMouseDown(_this.TranslateTouchToMouse(ev, "mousedown")); });
        this._Element.addEventListener("touchcancel", function (ev) { _this.mouseup(_this.TranslateTouchToMouse(ev, "mouseup")); });
        this._Element.addEventListener("touchend", function (ev) { _this.mouseup(_this.TranslateTouchToMouse(ev, "mouseup")); });
        this._Element.addEventListener("touchmove", function (ev) { _this.mousemove(_this.TranslateTouchToMouse(ev, "mousemove")); });
        var startX = 0, startY = 0, x = 0, y = 0;
        var clicks = 0;
    };
    BoardLogic.prototype.DoBoardMouseDown = function (event) {
        // Prevent default dragging of selected content
        event.preventDefault();
        this.DoCommonMouseDown(event);
    };
    BoardLogic.prototype.DoCommonMouseDown = function (event) {
        var _this = this;
        this._x = 0;
        this._y = 0;
        this._startX = event.pageX;
        this._startY = event.pageY;
        this._clicks++;
        if (this._clicks == 1) {
            setTimeout(function () {
                if (_this._clicks == 1) {
                    _this._document.addEventListener("mousemove", _this._handlerformousemove);
                    _this._document.addEventListener("mouseup", _this._handlerformouseup);
                    _this._Element.classList.add("rotateWhileMove");
                    _this._Element.parentElement.style.overflow = 'visible';
                    _this._Element.parentElement.style.zIndex = '1000';
                }
                else {
                    // double click - execute card action
                    _this._card['vCurrent'] = true;
                    var theobjectfortheboard = _this._card.VMClassParent.VMClassParent;
                    _this._card.ViewData.ExecuteAfterFullRoundtrip("dblclickoncard", null, function () {
                        console.log("dblclickoncard");
                        theobjectfortheboard.Execute("EditCurrentCardAction");
                    });
                }
                _this._clicks = 0;
            }, 300);
        }
    };
    BoardLogic.prototype.TranslateTouchToMouse = function (eventin, evtype) {
        eventin.preventDefault();
        var result = new Object();
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
        return result;
    };
    BoardLogic.prototype.mousemove = function (event) {
        this._y = event.clientY - this._startY;
        this._x = event.clientX - this._startX;
        this._Element.style.top = this._y + 'px';
        this._Element.style.left = this._x + 'px';
    };
    BoardLogic.prototype.mouseup = function (event) {
        if (event.preventDefault)
            event.preventDefault();
        this._document.removeEventListener("mousemove", this._handlerformousemove);
        this._document.removeEventListener("mouseup", this._handlerformouseup);
        this._y = event.clientY;
        this._x = event.clientX;
        this._Element.classList.remove("rotateWhileMove");
        var actiondone = false;
        var cardid = this._card.VMClassId.asString;
        var theobjectfortheboard = this._card.VMClassParent.VMClassParent;
        var theboarddiv = $("[vmclassid='" + theobjectfortheboard.VMClassId.asString + "']");
        if (theboarddiv && this._card && this._card.VMClassParent) {
            // find all phBoardList elements under this board in DOM
            var alltheboardlists = $(theboarddiv).find("[ph-boardlist]");
            for (var _i = 0, _a = alltheboardlists.get(); _i < _a.length; _i++) {
                var elem = _a[_i];
                var r = elem.getBoundingClientRect();
                if (r.top < this._y && r.bottom > this._y && r.left < this._x && r.right > this._x) {
                    var thelistWeWereDroppedIn = elem;
                    var vmclassid = thelistWeWereDroppedIn.getAttribute("vmclassid");
                    var theobjectforthelist = this._card.ViewData.GetObjectForVMClassId(vmclassid);
                    if (theobjectforthelist !== this._card.VMClassParent) {
                        theobjectfortheboard['MoveActionTargetList_AsExternalId'] = theobjectforthelist.VMClassId.VMObjectId;
                        theobjectfortheboard['MoveActionTargetCard_AsExternalId'] = this._card.VMClassId.VMObjectId;
                        this._card.ViewData.ExecuteAfterFullRoundtrip("CardMoveOp", null, function () {
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
    };
    return BoardLogic;
}());
function InstallTheDirective(streamingAppController) {
    console.trace("InstallTheDirective" + streamingAppController.toString());
    var myBoardLogics = [];
    streamingAppController.directive('phCard', ['$document', function ($document) {
            return {
                link: function (scope, element, attr) {
                    element.attr("vmclassid", scope.card.VMClassId.asString);
                    var bl = scope.$parent.boardlist;
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
//# sourceMappingURL=Board.js.map