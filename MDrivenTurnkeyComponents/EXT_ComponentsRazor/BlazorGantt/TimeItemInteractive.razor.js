export function createTimeItemJS(thediv, dotNetHelper) {
    let ds = new InteractiveTimeItemJS();
    ds.SetDiv(thediv, dotNetHelper);
    return ds;
}
export class InteractiveTimeItemJS {
    constructor() {
        this._isInvalidated = false;
    }
    SetDiv(thediv, dotNetHelper) {
        this._theDiv = thediv;
        this._dotNetHelper = dotNetHelper;
    }
    GetStart() {
        const startStr = this._theDiv.getAttribute("starttime");
        return new Date(startStr);
    }
    GetStop() {
        const stopStr = this._theDiv.getAttribute("stoptime");
        return new Date(stopStr);
    }
    SetAsCurrent() {
        if (this._dotNetHelper != null)
            this._dotNetHelper.invokeMethodAsync("HandleEvent", "UpdateCurrent", new Date());
    }
    UpdateStart(value) {
        if (this._dotNetHelper != null)
            this._dotNetHelper.invokeMethodAsync("HandleEvent", "UpdateStart", value);
    }
    UpdateStop(value) {
        if (this._dotNetHelper != null)
            this._dotNetHelper.invokeMethodAsync("HandleEvent", "UpdateStop", value);
    }
    GetTheDiv() {
        return this._theDiv;
    }
    setupJsCallback(dotNetHelper) {
    }
    GetGanttRow() {
        return this._owningGanttRow;
    }
    SetDrawnInGeneration(gen) {
        this._drawninGen = gen;
    }
    ShouldDraw(gen) {
        if (gen == this._drawninGen) {
            return true;
        }
        return false;
    }
    InstallIn() {
        this._theDiv.setAttribute('data-hasTimeItemRef', 'true');
        this._theDiv._timeitemref = this;
        const parentWithRef = this._theDiv.closest('div[data-hasGanttRowRef="true"]');
        if (parentWithRef != null)
            this._owningGanttRow = parentWithRef._ganttrowref;
        //    if (this._owningGanttRow != null)
        //      this._owningGanttRow.TrackTimeItem(this, this._theDiv);
    }
    GetIdentity() {
        return this._theDiv.attributes["Identity"];
    }
    Invalidate() {
        if (this._owningGanttRow != null)
            this._owningGanttRow.Invalidate();
    }
}
//# sourceMappingURL=TimeItemInteractive.razor.js.map