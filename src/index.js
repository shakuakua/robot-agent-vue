// index.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import model from './model.js'; // 模型对象
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';

// 场景
const scene = new THREE.Scene();
scene.add(model); // 模型对象添加到场景中

// 辅助观察的坐标系
// const axesHelper = new THREE.AxesHelper(100);
// scene.add(axesHelper);

// 光源设置
const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
directionalLight.position.set(25, 50, 100);
scene.add(directionalLight);
const ambient = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambient);

// 渲染器和相机
const width = window.innerWidth;
const height = window.innerHeight;
const camera = new THREE.PerspectiveCamera(25, width / height, 1, 3000);
camera.position.set(-2.4623199219951086,  1.2189353091212818,  12.512804466186772); // 根据渲染范围尺寸数量级设置相机位置
camera.lookAt( 0,0,0);

const renderer = new THREE.WebGLRenderer({
  antialias: true, // 启用内置抗锯齿
  alpha: true // 如果需要透明背景
});
renderer.setSize(width, height);
console.log('渲染器对象', width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 限制最大像素比，避免性能问题
renderer.setClearColor(0x87ceeb, 1.0); // 设置背景颜色白色

// 抗锯齿处理
// 创建后处理对象EffectComposer，WebGL渲染器作为参数
const composer = new EffectComposer(renderer);
const pixelRatio = renderer.getPixelRatio();
const smaaPass = new SMAAPass(width * pixelRatio, height * pixelRatio);
composer.addPass(smaaPass);

// 解决加载gltf格式模型颜色偏差问题
renderer.outputEncoding = THREE.sRGBEncoding;

// 设置相机控件轨道控制器OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false; // 禁止平移
controls.enableZoom = false; // 禁止缩放
controls.enableRotate = false; // 禁止旋转
// 渲染循环
function render() {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
  // 辅助设置position
  // console.log('camera.position',camera.position);
  // 浏览器控制台查看controls.target变化，辅助设置lookAt参数
  // console.log('controls.target',controls.target);
}
render();



// 画布跟随窗口变化
window.onresize = function () {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
};

// 导出 camera 和 scene
export { camera, scene };
export default renderer;
