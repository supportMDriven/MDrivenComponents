import * as THREE from 'https://cdn.skypack.dev/three'
import * as lll from 'https://cdn.skypack.dev/three-stl-loader'
import threeOrbitControls   from 'https://cdn.skypack.dev/three-orbit-controls';


let camera, scene, renderer,controls;
let geometry, material, mesh;
let w=200;
let h=200;

function init3d(element) {

    camera = new THREE.PerspectiveCamera( 70, w / h, 0.01, 10 );
    camera.position.z = 1;
	


    scene = new THREE.Scene();

    geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
    material = new THREE.MeshNormalMaterial();

    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( w, h );
    renderer.setAnimationLoop( animation );
    element.appendChild( renderer.domElement );

	var OrbitControls=threeOrbitControls(THREE);
	controls = new OrbitControls( camera, renderer.domElement );

}

function loadstl(fileurl){
			
				var STLLoader = new lll.default(THREE);
				var loader=new STLLoader();
				loader.load( fileurl, function ( geometry ) {

					//const material = new THREE.MeshPhongMaterial( { color: 0xff5533, specular: 0x111111, shininess: 200 } );
					material = new THREE.MeshNormalMaterial();
					const mesh2 = new THREE.Mesh( geometry, material );

					//mesh2.position.set( 0, - 0.25, 0.6 );
					//mesh2.rotation.set( 0, - Math.PI / 2, 0 );
					mesh2.scale.set( 0.01, 0.01, 0.01 );

					mesh2.castShadow = true;
					mesh2.receiveShadow = true;

					while(scene.children.length > 0){ 
						scene.remove(scene.children[0]); 
					}
					scene.add( mesh2 );
					controls.update();


				} );
	
}

function animation( time ) {

    mesh.rotation.x = time / 2000;
    mesh.rotation.y = time / 1000;

    renderer.render( scene, camera );

}

function InstallTheDirectiveFor_ThreeJS(streamingAppController) {
    streamingAppController.directive('treejs', ['$document', function ($document) {
            return {
				link: function (scope, element, attr) {
					
					init3d(element[0]);
					
					scope.$watch('ViewModelRoot.DragFileHere', function (newv, oldval, thescope) {
					loadstl(newv);
						});
					
           		
				}
			}	
        }]);
		
    console.trace("InstallTheDirectiveFor_ThreeJS");
}

InstallTheDirectiveFor_ThreeJS(angular.module(MDrivenAngularAppModule));
