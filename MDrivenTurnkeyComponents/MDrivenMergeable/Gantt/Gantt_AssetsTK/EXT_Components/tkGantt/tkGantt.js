/// <reference path="../../Scripts/typings/jquery/jquery.d.ts" />
/// <reference path="../../Scripts/typings/angularjs/angular.d.ts" />
/// <reference path="../../js/StreamingAppViewData.ts" />
/// <reference path="../../js/StreamingAppCtrl.ts" />
/// <reference path="tkDateScaler.ts" />
/// <reference path="tkGanttRow.ts" />
var GanttViewLogic = (function () {
    function GanttViewLogic() {
        this._GanttRows = [];
    }
    GanttViewLogic.prototype.Init = function (data, element, document) {
        var _this = this;
        this._data = data;
        this._Element = element[0];
        this._document = document[0];
        var tree = this._Element;
        if (typeof tree != 'undefined') {
            if (typeof tree.openedClass != 'undefined') {
                GanttViewLogic._openedClass = tree.openedClass;
            }
            if (typeof tree.closedClass != 'undefined') {
                GanttViewLogic._closedClass = tree.closedClass;
            }
            var lookfordatescaler = this._Element.getElementsByClassName('tkDateScaler');
            if (lookfordatescaler.length > 0) {
                this._datescaler = new DateScaler();
                this._datescaler.Start = new Date(2017, 6, 1);
                this._datescaler.Stop = new Date(2017, 9, 1);
                var thediv = lookfordatescaler[0];
                thediv.innerHTML = "";
                this._datescaler.InstallIn(thediv, this._document);
                this._datescaler.OnDateScalerRedrawn = function () {
                    for (var _i = 0, _a = _this._GanttRows; _i < _a.length; _i++) {
                        var gr = _a[_i];
                        gr.Invalidate();
                    }
                };
                this._datescaler.OnStableAfterChange = function () {
                    _this._data['DateScalerStart'] = _this._datescaler.Start;
                    _this._data['DateScalerStop'] = _this._datescaler.Stop;
                };
            }
        }
    };
    GanttViewLogic.prototype.DateScalerDatesInvalidate = function () {
        if (this._data['DateScalerStart'] != null && this._data['DateScalerStop'] != null) {
            this._datescaler.SetStartAndStop(this._data['DateScalerStart'], this._data['DateScalerStop']);
        }
    };
    GanttViewLogic.prototype.TreeVisibilityChanged = function () {
        // make sure the ones made visible again are up to date
        for (var _i = 0, _a = this._GanttRows; _i < _a.length; _i++) {
            var gr = _a[_i];
            gr.Invalidate();
        }
    };
    GanttViewLogic.prototype.GetDateScaler = function () {
        return this._datescaler;
    };
    GanttViewLogic.prototype.IsGanttForThis = function (element) {
        return (element === this._Element);
    };
    GanttViewLogic.prototype.FindGanttRowElementFromTreeNode = function (elementForTreeNode) {
        var lookforGanttRow = elementForTreeNode.getElementsByClassName('tkGanttRow');
        if (lookforGanttRow.length > 0 && (lookforGanttRow[0] instanceof HTMLDivElement)) {
            return lookforGanttRow[0];
        }
        return null;
    };
    GanttViewLogic.prototype.HandleTreeNode = function (elementForTreeNode, document, data) {
        var ganttRowHtmlElement = this.FindGanttRowElementFromTreeNode(elementForTreeNode);
        if (ganttRowHtmlElement != null) {
            var gr = new GanttRow();
            gr.InstallIn(ganttRowHtmlElement, this, document, data);
            this._GanttRows.push(gr);
        }
    };
    GanttViewLogic.prototype.HandleTreeNodeRemove = function (elementForTreeNode) {
        var ganttRowElement = this.FindGanttRowElementFromTreeNode(elementForTreeNode);
        if (ganttRowElement != null) {
            for (var i = 0; i < this._GanttRows.length; i++) {
                var gr = this._GanttRows[i];
                if (gr.RowDiv === ganttRowElement) {
                    gr.Removing();
                    this._GanttRows.splice(i, 1);
                    break;
                }
            }
        }
    };
    GanttViewLogic.prototype.FindRowFromYPoint = function (y) {
        for (var _i = 0, _a = this._GanttRows; _i < _a.length; _i++) {
            var gr = _a[_i];
            var r = gr.RowDiv.getBoundingClientRect();
            if (r.top <= y && r.bottom >= y)
                return gr;
        }
        return null;
    };
    GanttViewLogic._openedClass = 'glyphicon-triangle-bottom';
    GanttViewLogic._closedClass = 'glyphicon-triangle-right';
    return GanttViewLogic;
}());
var _TreeGanttViewLogics = [];
function FindOwningGanttFromTreeNode(elementForTreeNode) {
    var ancestor = elementForTreeNode;
    while ((ancestor = ancestor.parentElement) && !ancestor.classList.contains('tkGantt')) { }
    if (ancestor != null) {
        for (var x = 0; x < _TreeGanttViewLogics.length; x++) {
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
                    var TreeGanttViewLogic = new GanttViewLogic();
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
                    if (element != null) {
                        var branch_1 = ($(element)); //li with children ul
                        var theTreeNodeElement_1 = branch_1.get()[0];
                        var theGanttViewLogic_1 = FindOwningGanttFromTreeNode(theTreeNodeElement_1);
                        if (theGanttViewLogic_1 != null) {
                            theGanttViewLogic_1.HandleTreeNode(theTreeNodeElement_1, $document[0], scope.data);
                            scope.$on('$destroy', function (thescope) {
                                theGanttViewLogic_1.HandleTreeNodeRemove(theTreeNodeElement_1);
                            });
                        }
                        branch_1.prepend("<i class='indicator glyphicon " + GanttViewLogic._openedClass + "'></i>");
                        branch_1.addClass('branch');
                        branch_1.on('click', function (e) {
                            if (!e.originalEvent.defaultPrevented) {
                                var icon = branch_1.children('i:first');
                                icon.toggleClass(GanttViewLogic._openedClass + " " + GanttViewLogic._closedClass);
                                branch_1.children('ul').children().toggle();
                                if (branch_1.children('ul').children().length == 0) {
                                    // no children
                                    //icon.removeClass(GanttViewLogic._openedClass );
                                    //icon.removeClass(GanttViewLogic._closedClass);
                                    //icon.toggleClass("glyphicon-minus");
                                    // Think I should detect if I am first child of parent - if so parent has symbol
                                }
                                theGanttViewLogic_1.TreeVisibilityChanged();
                                e.preventDefault();
                            }
                            scope.data.vCurrent = true;
                            return false;
                        });
                        branch_1.children().children().toggle();
                        //fire event from the dynamically added icon
                        branch_1.find('.branch .indicator').each(function () {
                            branch_1.on('click', function (e) {
                                branch_1.closest('li').click();
                                e.preventDefault();
                                return false;
                            });
                        });
                        //fire event to open branch if the li contains an anchor instead of text
                        branch_1.find('.branch>a').each(function (anchor) {
                            $(anchor).on('click', function (e) {
                                $(anchor).closest('li').click();
                                e.preventDefault();
                                return false;
                            });
                        });
                        //fire event to open branch if the li contains a button instead of text
                        branch_1.find('.branch>button').each(function (button) {
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
//# sourceMappingURL=tkGantt.js.map