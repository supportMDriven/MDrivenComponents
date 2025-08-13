export function createEditor(thediv, dotNetHelper) {
    /*
    <script src="EXT_Components/TinyMCE/tinymce/tinymce.min.js" referrerpolicy = "origin" > </script>
      < script src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.bundle.js" > </script>
      < script type = "text/javascript" src = "https://journalcheckertool.org/static/jct_plugin.js" > </script>
      */
    let ds = new EditorJS();
    ds.InstallIn(thediv, dotNetHelper);
    return ds;
}
let _TinyScript1 = false;
export class EditorJS {
    _dotNetHelper;
    _realJSEditor;
    _texteareaIdSelector;
    _theEditor;
    _initIsDone;
    InstallIn(thediv, dotNetHelper) {
        this._dotNetHelper = dotNetHelper;
        this.loadLegacyScript();
    }
    async UpdateReadOnlyStateAndContent(readonly, content) {
        let rostr = 'readonly';
        if (!readonly)
            rostr = 'design';
        if (this._theEditor) {
            this._theEditor.mode.set(rostr);
            this._theEditor.setContent(content);
            this._theEditor.save();
        }
    }
    PushValueToBlazor() {
        if (this._dotNetHelper) {
            if (this._theEditor) {
                this._theEditor.save();
                let content = this._theEditor.getContent({ format: 'html' });
                this._dotNetHelper.invokeMethodAsync("HandleEvent", "TextUpdate", content);
            }
        }
    }
    NotifyBlazorThatWeAreReadyToGetData() {
        this._dotNetHelper.invokeMethodAsync("HandleEvent", "ReadyToGetData", "");
    }
    CheckIfAllDone() {
        if (_TinyScript1 && this._dotNetHelper && window.tinymce) {
            this._dotNetHelper.invokeMethodAsync("HandleEvent", "ScriptsDone", "");
        }
    }
    InitEditorGlue(id) {
        this._realJSEditor = window.tinymce;
        this._texteareaIdSelector = '#' + id;
        if (!this._theEditor && window.tinymce) {
            const elem = document.querySelector(this._texteareaIdSelector);
            if (!elem) {
                setTimeout(() => {
                    this.InitEditorGlue(id);
                }, 500);
                return; // not ready yet
            }
            if (window.tinymce.get(id)) {
                return;
            }
            if (this._initIsDone) {
                return;
            }
            let thisEditorJS = this;
            window.tinymce.init({
                selector: this._texteareaIdSelector,
                plugins: 'image link code table lists searchreplace',
                toolbar: 'undo redo | bold italic | table | code',
                promotion: false, // 👈 This hides the Upgrade button
                branding: false,
                skin: 'oxide',
                skin_url: 'https://unpkg.com/tinymce@6.8.3/skins/ui/oxide',
                content_css: 'https://unpkg.com/tinymce@6.8.3/skins/ui/oxide/skin.min.css',
                init_instance_callback: function (editor) {
                    thisEditorJS._initIsDone = true;
                    thisEditorJS._theEditor = editor;
                    console.log('Editor is ready!');
                    editor.on('ExecCommand change NodeChange ObjectResized', function () {
                        thisEditorJS.PushValueToBlazor();
                    });
                    thisEditorJS.NotifyBlazorThatWeAreReadyToGetData();
                },
                setup: function (editor) {
                }
            });
        }
    }
    loadLegacyScript() {
        //let scr1 = '/BlazorTinyMCE/tinymce/tinymce.min.js';
        let scr1 = 'https://unpkg.com/tinymce@6.8.3/tinymce.min.js';
        if (!document.querySelector(`link[href="${scr1}"]`)) {
            const script1 = document.createElement('script');
            script1.src = scr1;
            script1.onload = () => {
                _TinyScript1 = true;
                this.CheckIfAllDone();
            };
            document.head.appendChild(script1);
        }
    }
}
//# sourceMappingURL=Editor.razor.js.map