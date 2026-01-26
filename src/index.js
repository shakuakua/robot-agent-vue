import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {SMAAPass} from 'three/examples/jsm/postprocessing/SMAAPass.js';
import  model  from './model.js';//模型对象
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';

//场景
const scene = new THREE.Scene();
scene.add(model); //模型对象添加到场景中


//辅助观察的坐标系
// const axesHelper = new THREE.AxesHelper(100);
// scene.add(axesHelper);


//光源设置
const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
directionalLight.position.set(0, 50, 100);
scene.add(directionalLight);
const ambient = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambient);


//渲染器和相机
const width = window.innerWidth;
const height = window.innerHeight;
const camera = new THREE.PerspectiveCamera(30, width / height, 1, 3000);
// camera.position.set(292, 223, 185);
camera.position.set(0, 6, 18);//根据渲染范围尺寸数量级设置相机位置
camera.lookAt(model.position);

const renderer = new THREE.WebGLRenderer({
   antialias: true,           // 启用内置抗锯齿
    alpha: true               // 如果需要透明背景
});
renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 限制最大像素比，避免性能问题
renderer.setClearColor(0xffffff,1.0);//设置背景颜色白色
// document.getElementById('model').appendChild(renderer.domElement);

// 抗锯齿处理
// 创建后处理对象EffectComposer，WebGL渲染器作为参数
const composer = new EffectComposer(renderer);
//获取.setPixelRatio()设置的设备像素比
const pixelRatio = renderer.getPixelRatio();
// width、height是canva画布的宽高度
const smaaPass = new SMAAPass(width * pixelRatio, height * pixelRatio);
composer.addPass(smaaPass);


//解决加载gltf格式模型颜色偏差问题
// 提醒：有的版本这里不用在设置，默认就是sRGB
renderer.outputEncoding = THREE.sRGBEncoding;

// 渲染循环
function render() {
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}
render();


const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;//禁止平移
controls.enableZoom = false;//禁止缩放
controls.enableRotate = false;//禁止旋转
// 画布跟随窗口变化
window.onresize = function () {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
};

export default renderer;
