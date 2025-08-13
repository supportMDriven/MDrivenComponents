//import { loadThree, loadSTLLoader, loadOrbitControls, loadObjLoader, loadGLTFLoader } from './ThreeJS/ThreeLoadModules.js';
export async function loadThree() {
    // @ts-ignore
    const THREE = await import('https://unpkg.com/three@0.179.0/build/three.module.js');
    return THREE;
}
export async function loadSTLLoader() {
    // @ts-ignore
    const STL = await import('https://unpkg.com/three@0.179.0/examples/jsm/loaders/STLLoader.js?module');
    return STL;
}
export async function loadOrbitControls() {
    // @ts-ignore
    const orbits = await import('https://unpkg.com/three@0.179.0/examples/jsm/controls/OrbitControls.js?module');
    return orbits;
}
export async function loadObjLoader() {
    // @ts-ignore
    const objload = await import('https://unpkg.com/three@0.179.0/examples/jsm/loaders/OBJLoader.js?module');
    return objload;
}
export async function loadGLTFLoader() {
    // @ts-ignore
    const GLTFLoader = await import('https://unpkg.com/three@0.179.0/examples/jsm/loaders/GLTFLoader.js?module');
    return GLTFLoader;
}
export function createEditor(thediv, dotNetHelper) {
    let ds = new BlazorThreeJS();
    ds.InstallIn(thediv, dotNetHelper);
    return ds;
}
export class BlazorThreeJS {
    _dotNetHelper;
    _divIdSelector;
    _initIsDone;
    InstallIn(thediv, dotNetHelper) {
        this._dotNetHelper = dotNetHelper;
        this.loadLegacyScript();
    }
    async UpdateContent(content, filetype) {
        if (this.STL)
            this.loadFileInFormat(content, filetype);
    }
    PushValueToBlazor() {
        if (this._dotNetHelper) {
            // not really a thing for ThreeJS
        }
    }
    NotifyBlazorThatWeAreReadyToGetData() {
        this._dotNetHelper.invokeMethodAsync("HandleEvent", "ReadyToGetData", "");
    }
    async CheckIfAllDone() {
        if (this.THREE && this.STL && this.ORBIT && this.OBJLoader && this.GLTFLoader && this._dotNetHelper) {
            await this._dotNetHelper.invokeMethodAsync("HandleEvent", "ScriptsDone", "");
            this.NotifyBlazorThatWeAreReadyToGetData();
        }
    }
    InitEditorGlue(id) {
        this._divIdSelector = '#' + id;
        if (this.THREE && this.STL && this.ORBIT && !this.camera) {
            const elem = document.querySelector(this._divIdSelector);
            if (!elem) {
                setTimeout(() => {
                    this.InitEditorGlue(id);
                }, 500);
                return; // not ready yet
            }
            if (this._initIsDone) {
                return;
            }
            this.init3d(elem);
            this._initIsDone = true;
        }
    }
    camera;
    scene;
    renderer;
    controls;
    geometry;
    material;
    mesh;
    w = 600;
    h = 600;
    init3d(element) {
        this.camera = new this.THREE.PerspectiveCamera(70, this.w / this.h, 0.01, 10);
        this.camera.position.z = 1;
        this.scene = new this.THREE.Scene();
        this.geometry = new this.THREE.BoxGeometry(0.2, 0.2, 0.2);
        this.material = new this.THREE.MeshNormalMaterial();
        this.mesh = new this.THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.mesh);
        this.renderer = new this.THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.w, this.h);
        this.renderer.setAnimationLoop((time) => {
            this.mesh.rotation.x = time / 2000;
            this.mesh.rotation.y = time / 1000;
            this.renderer.render(this.scene, this.camera);
        });
        element.appendChild(this.renderer.domElement);
        this.controls = new this.ORBIT.OrbitControls(this.camera, element);
        //var OrbitControls = this.ORBIT(this.THREE);
        //this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    }
    loadFileInFormat(fileurl, filetype) {
        console.log('Loading file ' + fileurl + " of type " + filetype);
        if (!filetype || filetype == "STL") {
            const { STLLoader } = this.STL; // named export
            const loader = new STLLoader();
            //var STLLoader = new this.STL.default(this.THREE);
            //var loader = new STLLoader();
            loader.load(fileurl, (geometry) => {
                //let material2 = new this.THREE.MeshPhongMaterial( { color: 0xff5533, specular: 0x111111, shininess: 200 } ); //funkar
                let material1 = new this.THREE.MeshNormalMaterial();
                const mesh2 = new this.THREE.Mesh(geometry, material1);
                //mesh2.position.set( 0, - 0.25, 0.6 );
                //mesh2.rotation.set( 0, - Math.PI / 2, 0 );
                //mesh2.scale.set(0.01, 0.01, 0.01);
                mesh2.castShadow = true;
                mesh2.receiveShadow = true;
                while (this.scene.children.length > 0) {
                    this.scene.remove(this.scene.children[0]);
                }
                this.scene.add(mesh2);
                this.SetGoodScale(mesh2);
                this.controls.update();
            });
        }
        else if (filetype == "OBJ") {
            // instantiate a loader
            // debugger;
            const loader = new this.OBJLoader.OBJLoader();
            // load a resource
            loader.load(
            // resource URL
            fileurl, 
            // called when resource is loaded
            (object) => {
                this.material = new this.THREE.MeshPhongMaterial({ color: 0xff5533, specular: 0x111111, shininess: 200 });
                //this.material = new this.THREE.MeshNormalMaterial();
                object.traverse((child) => {
                    if (child instanceof this.THREE.Mesh) {
                        child.material = this.material;
                    }
                });
                while (this.scene.children.length > 0) {
                    this.scene.remove(this.scene.children[0]);
                }
                this.scene.add(object);
                const ambientLight = new this.THREE.AmbientLight(0xffffff, 0.6); // soft white light
                this.scene.add(ambientLight);
                const directionalLight = new this.THREE.DirectionalLight(0xffffff, 0.8);
                directionalLight.position.set(1, 1, 1); // adjust as needed
                this.scene.add(directionalLight);
                this.SetGoodScale(object);
                this.controls.update();
            }, 
            // called when loading is in progresses
            (xhr) => {
                //UpdateLocalProgress(Math.round(xhr.loaded / xhr.total * 100));
                //console.log(localProgress.Progress + '% loaded');
            }, 
            // called when loading has errors
            (error) => {
                console.log('An error happened ' + error);
            });
        }
        else if (filetype == "GLTF") {
            const loader = new this.GLTFLoader.GLTFLoader();
            loader.load(fileurl, (gltf) => {
                while (this.scene.children.length > 0) {
                    this.scene.remove(this.scene.children[0]);
                }
                if (gltf.scene.children.length > 0) {
                    let prim = gltf.scene.children[0];
                    if (prim.geometry == undefined && prim.children.length > 0 && prim.children[0].geometry != undefined) {
                        prim = prim.children[0];
                    }
                    if (prim.geometry != undefined && prim.geometry.attributes != undefined && prim.geometry.attributes.color != undefined) {
                        prim.material = new this.THREE.MeshStandardMaterial(); // funkar med färg
                        prim.material.vertexColors = true;
                    }
                    else {
                        prim.material = new this.THREE.MeshNormalMaterial(); //funkar ej med färg
                    }
                }
                this.scene.add(new this.THREE.AmbientLight(0xffffff));
                this.scene.add(gltf.scene);
                this.SetGoodScale(gltf.scene);
                this.controls.update();
            }, (xhr) => {
            }, (error) => {
                console.log('GLTF An error happened ' + error);
            });
        }
    }
    SetGoodScale(model) {
        const box = new this.THREE.Box3();
        box.setFromObject(model);
        let xwidth = box.max.x - box.min.x;
        let ywidth = box.max.y - box.min.y;
        let zwidth = box.max.z - box.min.z;
        let showscale = 1 / xwidth;
        const size = box.getSize(new this.THREE.Vector3()).length();
        const center = box.getCenter(new this.THREE.Vector3());
        this.controls.reset();
        model.position.x = -center.x * showscale;
        model.position.y = -center.y * showscale;
        model.position.z = -center.z * showscale;
        model.scale.set(showscale, showscale, showscale);
        this.camera.near = 0.01; //size / 100;
        this.camera.far = size * 100;
        this.camera.updateProjectionMatrix();
        this.camera.lookAt(new this.THREE.Vector3());
    }
    THREE;
    STL;
    ORBIT;
    OBJLoader;
    GLTFLoader;
    loadLegacyScript() {
        /*
        import * as THREE from 'https://cdn.skypack.dev/three'
    import * as lll from 'https://cdn.skypack.dev/three-stl-loader'
    import threeOrbitControls   from 'https://cdn.skypack.dev/three-orbit-controls';
        */
        const thisObject = this;
        (async () => {
            thisObject.THREE = await loadThree();
            thisObject.STL = await loadSTLLoader();
            thisObject.ORBIT = await loadOrbitControls();
            thisObject.OBJLoader = await loadObjLoader();
            thisObject.GLTFLoader = await loadGLTFLoader();
            this.CheckIfAllDone();
        })();
    }
}
//# sourceMappingURL=Three.razor.js.map