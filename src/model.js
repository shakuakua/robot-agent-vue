// 引入Three.js
import * as THREE from 'three';
// 引入gltf模型加载库GLTFLoader.js
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


const loader = new GLTFLoader(); //创建一个GLTF加载器

const model = new THREE.Group(); //声明一个组对象，用来添加加载成功的三维场景

let mixer = null; //当前动画混合器对象
let headAction = null;
let tailAction = null;
let shakehandAction = null;
let movehandAction = null;
loader.load("模型.glb", function (gltf) { //gltf加载成功后返回一个对象
    console.log('控制台查看gltf对象结构', gltf);
    console.log('场景3D模型数据', gltf.scene);
    model.add(gltf.scene); //三维场景添加到model组对象中
    model.position.set(-1.5, -2, 0);
    console.log('模型对象', model);
	// 打印动画数据
	console.log('动画数据', gltf.animations);
	// 骨骼辅助显示
    // const skeletonHelper = new THREE.SkeletonHelper(gltf.scene);
    // model.add(skeletonHelper);

	 //包含关键帧动画的模型作为参数创建一个播放器
	mixer = new THREE.AnimationMixer(gltf.scene); //创建动画混合器对象
	const bone = gltf.scene.getObjectByName('骨骼001');
	console.log('获取骨骼对象', bone);
	 //  获取gltf.animations[0]的第一个clip动画对象
  tailAction = mixer.clipAction(gltf.animations[0]); //创建动画clipAction对象
  shakehandAction = mixer.clipAction(gltf.animations[1]);
  movehandAction = mixer.clipAction(gltf.animations[2]);
	headAction = mixer.clipAction(gltf.animations[3]);
    tailAction.play(); //播放动画
	headAction.play();
  shakehandAction.play();
  movehandAction.play();


	// 设置初始权重
	tailAction.setEffectiveWeight(0);
	headAction.setEffectiveWeight(0);
  shakehandAction.setEffectiveWeight(0);
  movehandAction.setEffectiveWeight(0);

	 // 如果想播放动画,需要周期性执行`mixer.update()`更新AnimationMixer时间数据
    const clock = new THREE.Clock();
    function loop() {
        requestAnimationFrame(loop);
        //clock.getDelta()方法获得loop()两次执行时间间隔
			const frameT = clock.getDelta();
			// 更新播放器相关的时间
        mixer.update(frameT);
    }
    loop();
})

export function activetailAction(){
	tailAction.setEffectiveWeight(1);
}
export function activeheadAction(){
	headAction.setEffectiveWeight(1);
  shakehandAction.setEffectiveWeight(0);
}
export function activeMovehandAction(){
  movehandAction.setEffectiveWeight(1);
  shakehandAction.setEffectiveWeight(0);
  headAction.setEffectiveWeight(0);
}
export function activeshakehandAction(){
  shakehandAction.setEffectiveWeight(1);
  headAction.setEffectiveWeight(0);
  movehandAction.setEffectiveWeight(0);
}

export function reset(){
	headAction.setEffectiveWeight(0);
	tailAction.setEffectiveWeight(0);
  movehandAction.setEffectiveWeight(0);
  shakehandAction.setEffectiveWeight(0);
}


export default model;
