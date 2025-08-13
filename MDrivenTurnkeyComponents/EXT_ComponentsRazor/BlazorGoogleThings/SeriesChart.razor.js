export function createChart(thediv, dotNetHelper) {
    let ds = new GoogleChartJS();
    ds.InstallIn(thediv, dotNetHelper);
    return ds;
}
let loaderPromise = null;
// Normalize and sort dimensions (dates before strings)
function normalizeDimension(d) {
    if (d instanceof Date)
        return d;
    // Try ISO date strings -> Date
    const maybe = new Date(d);
    return isNaN(maybe.getTime()) ? d : maybe;
}
function sortByDimensionAsc(a, b) {
    const da = a instanceof Date ? a.getTime() : a.toString();
    const db = b instanceof Date ? b.getTime() : b.toString();
    return da < db ? -1 : da > db ? 1 : 0;
}
/**
 * Pivot long-format rows into [dimension, s1, s2, ...]
 * - Missing values become null so charts can handle gaps.
 */
function pivotSeries(rows) {
    const dims = new Set();
    const dimKey = (d) => (d instanceof Date ? d.getTime().toString() : `s:${d}`);
    const dimMap = new Map();
    const seriesSet = new Set();
    const bucket = new Map();
    for (const r of rows) {
        const dim = normalizeDimension(r.dimension);
        const dk = dimKey(dim);
        dims.add(dk);
        dimMap.set(dk, dim);
        const s = r.seriesBy ?? "__default__";
        seriesSet.add(s);
        if (!bucket.has(dk))
            bucket.set(dk, new Map());
        bucket.get(dk).set(s, (bucket.get(dk).get(s) ?? 0) + r.value);
    }
    const series = Array.from(seriesSet.values()).sort();
    const dimList = Array.from(dims.values())
        .map(k => dimMap.get(k))
        .sort(sortByDimensionAsc);
    // Header: first column typed for Date if needed
    const firstDim = dimList[0];
    const dimHeader = firstDim instanceof Date
        ? { type: "date", label: "Dimension" }
        : "Dimension";
    const header = [dimHeader, ...series];
    const data = dimList.map(d => {
        const dk = dimKey(d);
        const row = [d];
        for (const s of series) {
            row.push(bucket.get(dk)?.get(s) ?? null);
        }
        return row;
    });
    return { header, data };
}
/**
 * Aggregate rows into [label, value] for Pie/Donut.
 * - If options.pieSeries is set, it filters by that series.
 * - Otherwise, it aggregates across all seriesBy.
 */
function makePieTable(rows, options) {
    const agg = new Map();
    for (const r of rows) {
        if (options?.pieSeries && r.seriesBy && r.seriesBy !== options.pieSeries)
            continue;
        const key = normalizeDimension(r.dimension)?.toString();
        agg.set(key, (agg.get(key) ?? 0) + r.value);
    }
    const table = [["Label", "Value"]];
    for (const [label, val] of agg)
        table.push([label, val]);
    return table;
}
/**
 * Build data for Histogram.
 * - Default: single numeric column with all values.
 * - If histogramBySeries=true: one numeric column per series; rows are aligned by index.
 */
function makeHistogramTable(rows, options) {
    if (options?.histogramBySeries) {
        const seriesBuckets = new Map();
        for (const r of rows) {
            const s = r.seriesBy ?? "Series";
            if (!seriesBuckets.has(s))
                seriesBuckets.set(s, []);
            seriesBuckets.get(s).push(r.value);
        }
        const series = Array.from(seriesBuckets.keys()).sort();
        const maxLen = Math.max(...series.map(s => seriesBuckets.get(s).length));
        const table = [["", ...series]];
        for (let i = 0; i < maxLen; i++) {
            const row = [i + 1];
            for (const s of series) {
                row.push(seriesBuckets.get(s)[i] ?? null);
            }
            table.push(row);
        }
        return table;
    }
    else {
        const table = [["Value"], ...rows.map(r => [r.value])];
        return table;
    }
}
function chartConstructorFor(type, gv) {
    switch (type) {
        case "Bar": return gv.BarChart;
        case "Column": return gv.ColumnChart;
        case "Line": return gv.LineChart;
        case "Area": return gv.AreaChart;
        case "SteppedArea": return gv.SteppedAreaChart;
        case "StackedBar": return gv.BarChart;
        case "StackedColumn": return gv.ColumnChart;
        case "StackedArea": return gv.AreaChart;
        case "StackedSteppedArea": return gv.SteppedAreaChart;
        case "Pie":
        case "Donut": return gv.PieChart;
        case "Histogram": return gv.Histogram;
    }
}
function defaultOptionsFor(type, opts) {
    const base = {
        title: opts?.title,
        legend: { position: "right" },
        chartArea: { left: 60, right: 20, top: 50, bottom: 50 },
    };
    switch (type) {
        case "StackedBar":
        case "StackedColumn":
        case "StackedArea":
        case "StackedSteppedArea":
            return { ...base, isStacked: true };
        case "Donut":
            return { ...base, pieHole: 0.5 };
        default:
            return base;
    }
}
/**
 * Build a Google DataTable from rows and chart type.
 */
function dataTableFor(type, gv, rows, options) {
    switch (type) {
        case "Pie":
        case "Donut": {
            const table = makePieTable(rows, options);
            return gv.arrayToDataTable(table);
        }
        case "Histogram": {
            const table = makeHistogramTable(rows, options);
            return gv.arrayToDataTable(table);
        }
        default: {
            const { header, data } = pivotSeries(rows);
            return gv.arrayToDataTable([header, ...data]);
        }
    }
}
export class GoogleChartJS {
    _dotNetHelper;
    _divIdSelector;
    _initIsDone;
    InstallIn(thediv, dotNetHelper) {
        this._dotNetHelper = dotNetHelper;
        this.loadLegacyScript();
    }
    ensureLoader() {
        if (loaderPromise)
            return loaderPromise;
        loaderPromise = new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://www.gstatic.com/charts/loader.js";
            script.onload = () => {
                window.google.charts.load("current", { packages: ["corechart"] });
                window.google.charts.setOnLoadCallback(resolve);
            };
            script.onerror = () => reject(new Error("Failed to load Google Charts loader"));
            document.head.appendChild(script);
        });
        return loaderPromise;
    }
    /**
   * Render a series chart into a container.
   * - Assumes google.charts has been loaded with { packages: ["corechart"] }.
   */
    async renderSeriesChart(container, chartType, rows, options) {
        await this.ensureLoader();
        const gv = window.google.visualization;
        const ChartCtor = chartConstructorFor(chartType, gv);
        const dataTable = dataTableFor(chartType, gv, rows, options);
        const chartOpts = { ...defaultOptionsFor(chartType, options), ...(options?.corechartOptions ?? {}) };
        const chart = new ChartCtor(container);
        // Add click/selection listener
        window.google.visualization.events.addListener(chart, 'select', () => {
            const selection = chart.getSelection();
            if (selection.length > 0) {
                const sel = selection[0];
                if (sel.row != null) {
                    const clickedRow = dataTable.getValue(sel.row, 0); // first column value
                    let clickedValue = '';
                    if (sel.column)
                        clickedValue = dataTable.getValue(sel.row, sel.column);
                    // You can pass this back to Blazor via DotNet.invokeMethodAsync(...)
                    this._dotNetHelper.invokeMethodAsync("HandleEvent", "ClickOn", "#label:" + clickedRow + "#value:" + clickedValue);
                }
            }
        });
        chart.draw(dataTable, chartOpts);
        return chart;
    }
    PushValueToBlazor() {
        if (this._dotNetHelper) {
        }
    }
    NotifyBlazorThatWeAreReadyToGetData() {
        this._dotNetHelper.invokeMethodAsync("HandleEvent", "ReadyToGetData", "");
    }
    InitChartGlue(id) {
        this._divIdSelector = '#' + id;
        this._initIsDone = true;
    }
    UpdateContent(str1, str2) {
    }
    loadLegacyScript() {
        this.ensureLoader();
    }
}
//# sourceMappingURL=SeriesChart.razor.js.map