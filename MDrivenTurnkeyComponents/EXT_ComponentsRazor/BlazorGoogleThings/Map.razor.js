//import { loadGoogleMap } from './GoogleJS/GoogleJS.js';
let _globalapikey;
// load Google.js
export function loadGoogleMap() {
    return new Promise((resolve, reject) => {
        if (window.google && window.google.maps) {
            resolve(window.google.maps);
            return;
        }
        const script = document.createElement("script");
        script.src =
            "https://maps.googleapis.com/maps/api/js?key=" + _globalapikey + "&callback=initMap&libraries=geometry,places";
        script.async = true;
        script.onerror = reject;
        document.head.appendChild(script);
        window.initMap = () => {
            resolve(window.google.maps);
        };
    });
}
export function createMap(thediv, dotNetHelper, apikey) {
    _globalapikey = apikey;
    let ds = new GoogleMapJS();
    ds.InstallIn(thediv, dotNetHelper);
    return ds;
}
export class GoogleMapJS {
    _dotNetHelper;
    _divIdSelector;
    _initIsDone;
    InstallIn(thediv, dotNetHelper) {
        this._dotNetHelper = dotNetHelper;
        this.loadLegacyScript();
    }
    PushValueToBlazor() {
        if (this._dotNetHelper) {
        }
    }
    NotifyBlazorThatWeAreReadyToGetData() {
        window.google.maps.event.addListener(this._MAP, 'click', (event) => {
            let params = "";
            params += "#lat:" + event.latLng.lat();
            params += "#lng:" + event.latLng.lng();
            this._dotNetHelper.invokeMethodAsync("HandleEvent", "AddMarker", params);
        });
        window.google.maps.event.addListener(this._MAP, 'center_changed', () => {
            let params = "";
            params += "#lat:" + this._MAP.getCenter().lat();
            params += "#lng:" + this._MAP.getCenter().lng();
            params += "#zoom:" + this._MAP.getZoom();
            this._dotNetHelper.invokeMethodAsync("HandleEvent", "CenterChanged", params);
        });
        this._dotNetHelper.invokeMethodAsync("HandleEvent", "ReadyToGetData", "");
    }
    async CheckIfAllDone() {
        if (this._MAP && this._dotNetHelper) {
            await this._dotNetHelper.invokeMethodAsync("HandleEvent", "ScriptsDone", "");
            this.NotifyBlazorThatWeAreReadyToGetData();
        }
    }
    InitMapGlue(id) {
        this._divIdSelector = '#' + id;
        if (this._MAP) {
            const elem = document.querySelector(this._divIdSelector);
            if (!elem) {
                setTimeout(() => {
                    this.InitMapGlue(id);
                }, 500);
                return; // not ready yet
            }
            if (this._initIsDone) {
                return;
            }
            this.initMap(elem);
            this._initIsDone = true;
        }
    }
    UpdateContent(str1, str2) {
        if (this._theDivWithMap) {
            const div = this._theDivWithMap;
            const lat = parseFloat(div.dataset.lat ?? "");
            const lng = parseFloat(div.dataset.lng ?? "");
            const zoom = parseInt(div.dataset.zoom ?? "", 10);
            if (Number.isFinite(lat) && Number.isFinite(lng)) {
                this._MAP.setOptions({ center: { lat, lng } });
            }
            if (Number.isFinite(zoom)) {
                this._MAP.setZoom(zoom);
            }
            const spans = this._theDivWithMap.parentElement.querySelectorAll('span[data-id]');
            const markerData = Array.from(spans).map(span => ({
                id: span.dataset.id,
                lat: parseFloat(span.dataset.lat),
                lng: parseFloat(span.dataset.lng),
                title: span.dataset.title
            }));
            this.syncMarkers(markerData, this._MAP);
        }
    }
    markersById = new Map();
    syncMarkers(data, map) {
        const incomingIds = new Set();
        // Add or update markers
        data.forEach(m => {
            incomingIds.add(m.id);
            if (this.markersById.has(m.id)) {
                // Update existing marker position/title
                const marker = this.markersById.get(m.id);
                marker.setPosition({ lat: m.lat, lng: m.lng });
                marker.setTitle(m.title ?? "");
            }
            else {
                // Create a new marker
                const marker = new window.google.maps.Marker({
                    position: { lat: m.lat, lng: m.lng },
                    title: m.title ?? "",
                    map
                });
                this.markersById.set(m.id, marker);
            }
        });
        // Remove markers that are no longer present
        for (const id of this.markersById.keys()) {
            if (!incomingIds.has(id)) {
                this.markersById.get(id).setMap(null);
                this.markersById.delete(id);
            }
        }
    }
    _theDivWithMap;
    w = 600;
    h = 600;
    initMap(elem) {
        this._theDivWithMap = elem;
        this._MAP = new window.google.maps.Map(elem, {
            center: { lat: 59.3293, lng: 18.0686 },
            zoom: 12,
        });
    }
    _MAP;
    loadLegacyScript() {
        const thisObject = this;
        (async () => {
            thisObject._MAP = await loadGoogleMap();
            this.CheckIfAllDone();
        })();
    }
}
//# sourceMappingURL=Map.razor.js.map