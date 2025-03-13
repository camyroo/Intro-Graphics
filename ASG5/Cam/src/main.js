import * as THREE from "https://cdn.jsdelivr.net/npm/three@latest/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@latest/examples/jsm/controls/OrbitControls.js";
import { OBJLoader } from "https://cdn.jsdelivr.net/npm/three@latest/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "https://cdn.jsdelivr.net/npm/three@latest/examples/jsm/loaders/MTLLoader.js";
import { GUI } from "https://cdn.jsdelivr.net/npm/three@latest/examples/jsm/libs/lil-gui.module.min.js";
import { EXRLoader } from "https://cdn.jsdelivr.net/npm/three@latest/examples/jsm/loaders/EXRLoader.js";


// Renderer
const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); 
scene.fog = new THREE.Fog(0x000000, 10, 70); 
const fov = 45;
const aspect = window.innerWidth / window.innerHeight;
const near = 0.1;
const far = 200;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0, 5, 15);

const gui = new GUI();

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 2, 0);
controls.update();

class MinMaxGUIHelper {
    constructor(obj, minProp, maxProp, minDif) {
        this.obj = obj;
        this.minProp = minProp;
        this.maxProp = maxProp;
        this.minDif = minDif;
    }
    get min() {
        return this.obj[this.minProp];
    }
    set min(v) {
        this.obj[this.minProp] = v;
        this.obj[this.maxProp] = Math.max(this.obj[this.maxProp], v + this.minDif);
    }
    get max() {
        return this.obj[this.maxProp];
    }
    set max(v) {
        this.obj[this.maxProp] = v;
        this.min = this.min;
    }
}

class FogGUIHelper {
  constructor(fog, backgroundColor) {
    this.fog = fog;
    this.backgroundColor = backgroundColor;
  }
  get near() {
    return this.fog.near;
  }
  set near(v) {
    this.fog.near = v;
    this.fog.far = Math.max(this.fog.far, v);
  }
  get far() {
    return this.fog.far;
  }
  set far(v) {
    this.fog.far = v;
    this.fog.near = Math.min(this.fog.near, v);
  }
  get color() {
    return `#${this.fog.color.getHexString()}`;
  }
  set color(hexString) {
    this.fog.color.set(hexString);cons
    this.backgroundColor.set(hexString);
  }
}

const fogGUIHelper = new FogGUIHelper(scene.fog, scene.background);
gui.add(fogGUIHelper, 'near', near, far).listen();
gui.add(fogGUIHelper, 'far', near, far).listen();
gui.addColor(fogGUIHelper, 'color');

function updateCamera() {
    camera.updateProjectionMatrix();
}

gui.add(camera, 'fov', 1, 180).onChange(updateCamera);
const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('Near Clip').onChange(updateCamera);
gui.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('Far Clip').onChange(updateCamera);


const ambientLight = new THREE.HemisphereLight(0xb1e1ff, 0xb97a20, 1.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
directionalLight.position.set(30, 10, 0);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 4096;
directionalLight.shadow.mapSize.height = 4096;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 100;
directionalLight.shadow.camera.left = -30;
directionalLight.shadow.camera.right = 30;
directionalLight.shadow.camera.top = 30;
directionalLight.shadow.camera.bottom = -30;
scene.add(directionalLight);

const spotLight = new THREE.SpotLight(0xffffff, 200, 50, Math.PI / 6, 0.3, 2);
spotLight.position.set(0, 10, -3);
spotLight.castShadow = true;
scene.add(spotLight);

const billboardTexture = new THREE.CanvasTexture(document.createElement('canvas'));
const ctx = billboardTexture.image.getContext('2d');
ctx.font = 'Bold 40px Arial';
ctx.fillStyle = 'white';
ctx.fillText('Cammyroo', 10, 50);
billboardTexture.needsUpdate = true;

const billboardMaterial = new THREE.SpriteMaterial({ map: billboardTexture });
const billboard = new THREE.Sprite(billboardMaterial);
billboard.scale.set(3, 1.5, 1);
billboard.position.set(0, 7, -3);
scene.add(billboard);


const lightFolder = gui.addFolder('Directional Light');
lightFolder.add(directionalLight.position, 'x', -50, 50, 0.1);
lightFolder.add(directionalLight.position, 'y', -50, 50, 0.1);
lightFolder.add(directionalLight.position, 'z', -50, 50, 0.1);
lightFolder.add(directionalLight, 'intensity', 0, 5, 0.1);

const spotLightFolder = gui.addFolder('Spotlight');
spotLightFolder.add(spotLight.position, 'x', -10, 10, 0.1);
spotLightFolder.add(spotLight.position, 'y', 0, 20, 0.1);
spotLightFolder.add(spotLight.position, 'z', -10, 10, 0.1);
spotLightFolder.add(spotLight, 'intensity', 0, 10, 0.1);
spotLightFolder.add(spotLight, 'angle', 0, Math.PI / 2, 0.01);
spotLightFolder.add(spotLight, 'penumbra', 0, 1, 0.1);
spotLightFolder.add(spotLight, 'decay', 0, 5, 0.1);
spotLightFolder.open();

const shadowFolder = gui.addFolder('Shadow Camera');
shadowFolder.add(directionalLight.shadow.camera, 'near', 0.1, 100, 0.1).onChange(() => directionalLight.shadow.camera.updateProjectionMatrix());
shadowFolder.add(directionalLight.shadow.camera, 'far', 0.1, 200, 0.1).onChange(() => directionalLight.shadow.camera.updateProjectionMatrix());
shadowFolder.add(directionalLight.shadow.camera, 'left', -100, 0, 1).onChange(() => directionalLight.shadow.camera.updateProjectionMatrix());
shadowFolder.add(directionalLight.shadow.camera, 'right', 0, 100, 1).onChange(() => directionalLight.shadow.camera.updateProjectionMatrix());
shadowFolder.add(directionalLight.shadow.camera, 'top', 0, 100, 1).onChange(() => directionalLight.shadow.camera.updateProjectionMatrix());
shadowFolder.add(directionalLight.shadow.camera, 'bottom', -100, 0, 1).onChange(() => directionalLight.shadow.camera.updateProjectionMatrix());
lightFolder.open();
shadowFolder.open();

const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

const exrLoader = new EXRLoader();
exrLoader.load('./resources/images/sky2.exr', function(texture) {
    const envMap = pmremGenerator.fromEquirectangular(texture).texture;
    
    scene.background = envMap; 
    scene.environment = envMap;

    texture.dispose(); 
});

const loadManager = new THREE.LoadingManager();
const loader = new THREE.TextureLoader(loadManager);


const loadingElem = document.querySelector('#loading');
const progressBarElem = document.querySelector('.progressbar');

loadManager.onProgress = (url, itemsLoaded, itemsTotal) => {
    const progress = itemsLoaded / itemsTotal;
    progressBarElem.style.transform = `scaleX(${progress})`;
};

loadManager.onLoad = () => {
    loadingElem.style.display = 'none';
    startScene();
};


const planeSize = 100;
const groundTexture = new THREE.TextureLoader().load('resources/images/ground.jpg');
groundTexture.wrapS = THREE.RepeatWrapping;
groundTexture.wrapT = THREE.RepeatWrapping;
groundTexture.repeat.set(planeSize / 2, planeSize / 2);

const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
const planeMat = new THREE.MeshPhongMaterial({ map: groundTexture, side: THREE.DoubleSide });
const ground = new THREE.Mesh(planeGeo, planeMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);
function loadColorTexture(path) {
    const texture = loader.load(path);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}
const geometry = new THREE.BoxGeometry(1, 1, 1);
const materials = [
    new THREE.MeshBasicMaterial({ map: loadColorTexture('resources/images/flower-1.jpg') }),
    new THREE.MeshBasicMaterial({ map: loadColorTexture('resources/images/flower-2.jpg') }),
    new THREE.MeshBasicMaterial({ map: loadColorTexture('resources/images/flower-3.jpg') }),
    new THREE.MeshBasicMaterial({ map: loadColorTexture('resources/images/flower-4.jpg') }),
    new THREE.MeshBasicMaterial({ map: loadColorTexture('resources/images/flower-5.jpg') }),
    new THREE.MeshBasicMaterial({ map: loadColorTexture('resources/images/flower-6.jpg') }),
];

const platformGeo = new THREE.CylinderGeometry(2, 2, 0.5, 32);
const platformMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
const platform = new THREE.Mesh(platformGeo, platformMat);
platform.position.set(0, 0.25, -3);
platform.castShadow = true;
platform.receiveShadow = true;
scene.add(platform);



let cube, cylinder, sphere;
function startScene() {
    cube = new THREE.Mesh(geometry, materials);
    cube.position.set(-2, 1, 0);
    cube.castShadow = true;
    scene.add(cube);

    cylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 2, 32), new THREE.MeshStandardMaterial({ color: 0xff5733 }));
    cylinder.position.set(0, 1, 0);
    cylinder.scale.set(0.5,0.5,0.5);
    cylinder.castShadow = true;
    scene.add(cylinder);

    sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), new THREE.MeshStandardMaterial({ color: 0x3388ff }));
    sphere.position.set(2, 1, 0);
    sphere.castShadow = true;
    scene.add(sphere);
}


const mtlLoaderStatue = new MTLLoader();
mtlLoaderStatue.setPath('resources/models/statue/');
mtlLoaderStatue.load('stat.mtl', (mtl) => {
    mtl.preload();

    const objLoader = new OBJLoader();
    objLoader.setMaterials(mtl);
    objLoader.setPath('resources/models/statue/');

    objLoader.load('stat.obj', (root) => {
        root.position.set(0, 0.5, -3);
        root.scale.set(0.03, 0.03, 0.03);
        root.rotation.set(-Math.PI / 2, 0, 0);

        root.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        scene.add(root);
    }, 
    (xhr) => {
        console.log(`Model ${(xhr.loaded / xhr.total) * 100}% loaded`);
    },
    (error) => {
        console.error('Error loading OBJ file:', error);
    });
});

const numPillars = 12;
const radius = 16;
const mtlLoader = new MTLLoader();
mtlLoader.setPath('resources/models/pillar/');
mtlLoader.load('rc.mtl', (mtl) => {
    mtl.preload();
    const objLoader = new OBJLoader();
    objLoader.setMaterials(mtl);
    objLoader.setPath('resources/models/pillar/');
    objLoader.load('rc.obj', (pillar) => {
        pillar.scale.set(0.2, 0.2, 0.2);
        pillar.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        for (let i = 0; i < numPillars; i++) {
            const angle = (i / numPillars) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const pillarClone = pillar.clone();
            pillarClone.position.set(x, 0, z);
            pillarClone.rotation.set(0, -angle, 0);
            scene.add(pillarClone);
        }
    });
});

const houseBase = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 3), new THREE.MeshStandardMaterial({ color:  0x000000 }));
houseBase.position.set(20, 1, -40);
houseBase.scale.set(5,5,5);
houseBase.castShadow = true;
houseBase.receiveShadow = true;
scene.add(houseBase);

const houseRoof = new THREE.Mesh(new THREE.ConeGeometry(2.5, 2, 4), new THREE.MeshStandardMaterial({ color: 0x000000 }));
houseRoof.position.set(20, 10, -40);
houseRoof.scale.set(5,5,5);
houseRoof.rotation.y = Math.PI / 4;
houseRoof.castShadow = true;
houseRoof.receiveShadow = true;
scene.add(houseRoof);

const houseBase1 = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 3), new THREE.MeshStandardMaterial({ color:  0x000000 }));
houseBase1.position.set(-40, 1, -40);
houseBase1.scale.set(5,5,5);
houseBase1.castShadow = true;
houseBase1.receiveShadow = true;
scene.add(houseBase1);

const houseRoof1 = new THREE.Mesh(new THREE.ConeGeometry(2.5, 2, 4), new THREE.MeshStandardMaterial({ color: 0x000000 }));
houseRoof1.position.set(-40, 10, -40);
houseRoof1.scale.set(5,5,5);
houseRoof1.rotation.y = Math.PI / 4;
houseRoof1.castShadow = true;
houseRoof1.receiveShadow = true;
scene.add(houseRoof1);


function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    cylinder.rotation.x += 0.01;
    cylinder.rotation.y += 0.01;
    // sphere.rotation.x += 0.01;
    // sphere.rotation.y += 0.01;
    renderer.render(scene, camera);
}

animate();
