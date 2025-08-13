export function createDragDropJS(thediv, dotNetHelper) {
    let dd = new DragDropJS();
    dd.SetDiv(thediv, dotNetHelper);
    return dd;
}
let _GlobalDragDropIsInDrag = null;
let _GlobalDragDropLatestKnownDropTarget = null;
const _GlobalHoverStack = new Set();
export class DragDropJS {
    SetDiv(thediv, dotNetHelper) {
        this._theDiv = thediv;
        this._dotNetHelper = dotNetHelper;
        this._clone = null;
        this._offsetX = 0;
        this._offsetY = 0;
        this._theDiv.addEventListener("mousedown", (e) => {
            if (this._theDiv.getAttribute("AllowDrag") == "false") {
                console.log("AllowDrag false");
                return;
            }
            if (e.target.matches("input, button, textarea, select")) {
                return;
            }
            if (e.target.closest("button")) {
                return;
            }
            if (e.target.closest("select")) {
                return;
            }
            // Prevent default drag behavior
            e.preventDefault();
            e.stopPropagation();
            this.StartDrag();
            // Calculate offset
            const rect = this._theDiv.getBoundingClientRect();
            this._offsetX = e.clientX - rect.left;
            this._offsetY = e.clientY - rect.top;
            // Clone the original
            this._clone = this._theDiv.cloneNode(true);
            this._clone._draggedDragDropJS = this;
            this._clone.style.position = "absolute";
            this._clone.style.left = `${rect.left}px`;
            this._clone.style.top = `${rect.top}px`;
            this._clone.style.pointerEvents = "none"; // Prevent clone from capturing mouse events
            this._clone.style.opacity = "0.8";
            this._clone.style.zIndex = "1000";
            document.body.appendChild(this._clone);
            // Hide original
            //this._theDiv.style.visibility = "hidden"; confuses shadow dom
            // Start listening to mousemove and mouseup
            document.addEventListener("mousemove", (args) => { this.onMouseMove(args); });
            document.addEventListener("mouseup", (args) => { this.onMouseUp(args); });
        });
        this._theDiv.addEventListener('mouseover', (event) => {
            if (!this._theDiv.contains(event.relatedTarget)) {
                console.log('Mouse truly entered');
                if (_GlobalDragDropIsInDrag != null && _GlobalDragDropIsInDrag != this) {
                    //this._theDiv.classList.add("highlight"); confuse dom?
                    if (this._theDiv.getAttribute("AllowDrop") == "true") {
                        _GlobalDragDropLatestKnownDropTarget = this;
                        _GlobalHoverStack.add(this);
                        console.log("Setting DT");
                        event.stopPropagation();
                    }
                    else
                        console.log("Setting DT. NOT AllowDrop");
                }
                if (_GlobalDragDropIsInDrag == null) {
                }
            }
        });
        this._theDiv.addEventListener('mouseout', (event) => {
            if (!this._theDiv.contains(event.relatedTarget)) {
                console.log('Mouse truly left');
                // this._theDiv.classList.remove("highlight"); confuse dom?
                if (_GlobalDragDropLatestKnownDropTarget == this) {
                    _GlobalDragDropLatestKnownDropTarget = null;
                    _GlobalHoverStack.delete(this);
                    console.log("Releasing DT");
                    //e.stopPropagation();
                }
            }
        });
    }
    StartDrag() {
        _GlobalDragDropIsInDrag = this;
        if (this._dotNetHelper != null)
            this._dotNetHelper.invokeMethodAsync("HandleEvent", "StartDrag", "", "");
    }
    GetTheDiv() {
        return this._theDiv;
    }
    onMouseMove(e) {
        if (_GlobalDragDropIsInDrag == this && this._clone) {
            this._clone.style.left = `${e.clientX - this._offsetX}px`;
            this._clone.style.top = `${e.clientY - this._offsetY}px`;
        }
    }
    ConsiderDropAction(dragged) {
        if (this._dotNetHelper != null)
            this._dotNetHelper.invokeMethodAsync("HandleEvent", "DragDrop", "", "");
    }
    onMouseUp(e) {
        if (_GlobalDragDropIsInDrag != this)
            return;
        if (_GlobalDragDropLatestKnownDropTarget == null && _GlobalHoverStack.size > 0) {
            const arr = Array.from(_GlobalHoverStack);
            _GlobalDragDropLatestKnownDropTarget = arr[arr.length - 1];
        }
        if (_GlobalDragDropLatestKnownDropTarget != null) {
            _GlobalDragDropLatestKnownDropTarget.ConsiderDropAction(this);
        }
        else {
            // Show original
            //this._theDiv.style.visibility = "visible"; confuses shadow dom
        }
        // Remove clone
        if (_GlobalDragDropIsInDrag != null && _GlobalDragDropIsInDrag._clone) {
            _GlobalDragDropIsInDrag._clone.remove();
            _GlobalDragDropIsInDrag._clone = null;
        }
        _GlobalDragDropIsInDrag = null;
        _GlobalHoverStack.clear();
        // Stop listening
        document.removeEventListener("mousemove", this.onMouseMove);
        document.removeEventListener("mouseup", this.onMouseUp);
        if (this._dotNetHelper != null)
            this._dotNetHelper.invokeMethodAsync("HandleEvent", "Changed", "", "");
    }
}
//# sourceMappingURL=DragDrop.razor.js.map