<template>
	 <!-- <canvas type="webgl" id="webgl" style="width: 100%; height: 450px;"></canvas> -->
	 <div id="box">
		<video  
			v-if='myStore.videoUrl && isAudio ' 
			class="video currency" 
			:src="myStore.videoUrl"
			ref="myVideo"
		>
		</video>
		
		<img class="img currency" v-if="myStore.picUrl" :src="myStore.picUrl" alt="">
		<img
			@click="stop" 
			class="music" 
			:class="{lopo:state.isLopo,opty:state.opty}" 
			
			src="../../lib/music.png" 
		/>
		
		<!-- src="https://miniapplet.ciligf.com/ar/resource/lib/music.png"  -->
		<div class="text currency">
			{{myStore.textUrl}}
		</div>
		<audio
			v-if="!myStore.videoUrl && myStore.audioUrl"
			class='currency'
			:src="myStore.audioUrl"
			ref="myAudio"
		></audio>
	</div>
	<div class="btn">
		<!-- clickme -->
		<!-- <PalyVue
			:dom="myVideo"
		>

		</PalyVue> -->
	</div>
	 <!-- <div class="clickeBox">
		<div class="optin" v-for="(item,index) in arr" @click ="myClick(item)" :key="index"> 
			{{item}}
		</div>
	 </div> -->
</template>

<script setup>
	
	import * as THREE from 'three';
	import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
	import {ref,onMounted, reactive} from 'vue'
	import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
	import { DragControls } from 'three/examples/jsm/controls/DragControls'
	// import {getQueryVariableLocation} from '../../utils/tools.js'
	import { OrbitControls } from '../../utils/OrbitControls.js';

	
	// import PalyVue from './Paly.vue';
	// const r = getQueryVariableLocation('id')

	const myVideo = ref(null) // 视频dom
	const myAudio = ref(null) // 音频dom
	const isAudio = ref(true)
	const myStore = ref({ //测试数据
			id: 1,
			picUrl: null, 
			videoUrl: "https://ciligongfang.oss-cn-chengdu.aliyuncs.com/6ce129574c06470399e2b5542be64ab9.mp4", 
			// videoUrl: null, 
			createTime: null, 
			// audioUrl: "https://ciligongfang.oss-cn-chengdu.aliyuncs.com/b109e0980eb04455ac99da26bc33b3a9.mp3", 
			textUrl: "刺梨饮料灌身", 
			labelName: "刺梨饮料灌身"
	})
	const state = reactive ({
		isLopo:false,
		opty:false,//控制透明度
	})
	
	let container, clock, mixer, activeAction, previousAction;
	let camera, renderer, model ,controls;//相机 渲染器 模型 轨道控制器
	let actions = {};
	const scene = new THREE.Scene(); //场景
	const myHeight = ref(0)
	let audio;
	onMounted(()=>{
		//myVideo.value 视频dom
		//myAudio.value 音频dom

		// const box = document.getElementById('app')
		// myHeight.value = (window.innerHeight -box.offsetHeight) +'px'
		// const canvasDiv = document.getElementById('canvasDiv')
		// canvasDiv.style.height = myHeight.value
		canvasDiv.addEventListener('click',play) 
	})
	
	// const id = getQueryVariableLocation('id')
	
	const states = [ 'Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing' ];
	const emotes = [ 'Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp' ];
	const arr = ['Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp','Walking']
	init()
	async function  init () {

		const demo = document.createElement( 'div' );
		demo.id = 'canvasDiv'
		container = demo;
		document.body.appendChild( container );
		
		//相机
		camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.25, 100 );
		scene.fog = new THREE.Fog( 0xe0e0e0, 20, 100 );

		clock = new THREE.Clock();

		// lights

		const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
		hemiLight.position.set( 0, 20, 0 );
		scene.add( hemiLight );

		const dirLight = new THREE.DirectionalLight( 0xffffff );
		dirLight.position.set( 0, 20, 10 );
		scene.add( dirLight );
		
		
		
		// model
		//https://miniapplet.ciligf.com/ar/resource/lib/RobotExpressive.glb 线上地址
		//http://192.168.2.193:8011/RobotExpressive.glb //线下地址
		// 'http://192.168.2.193:8011/untitled.glb', //磁力
		const loader = new GLTFLoader();
		await loader.load( 
			// 'https://miniapplet.ciligf.com/ar/resource/lib/RobotExpressive.glb', 
			// 'http://192.168.2.193:8011/untitled.glb', //磁力
			'http://192.168.2.193:8011/RobotExpressive.glb', 
			function ( gltf ) {
			model = gltf.scene;
			model.name='myGltf'
			// console.log(gltf.animations)
			scene.add( model );
			createGUI( model, gltf.animations );
			initDragControls()
			model.scale.set(0.5,0.5,0.5)
			console.log(158,model)

		}, undefined, function ( e ) {
			console.error( e );

		} );
		//antialias: true,
		renderer = new THREE.WebGLRenderer( {  alpha: true } );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.outputEncoding = THREE.sRGBEncoding;
		container.appendChild( renderer.domElement );
		// renderer.setClearColor(0x949ba2, 1);
		window.addEventListener( 'resize', onWindowResize );

		// controls = new OrbitControls(camera,renderer.domElement) //轨道控制器
		
		animate()
	}	
	function onWindowResize() {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

	}
	function createGUI( model, animations ) {//动作
		// console.log(16,model)
		// console.log(17,animations)
		
		mixer = new THREE.AnimationMixer( model );
		for ( let i = 0; i < animations.length; i ++ ) {

			const clip = animations[ i ];
			
			const action = mixer.clipAction( clip );
			actions[ clip.name ] = action;
			if ( emotes.indexOf( clip.name ) >= 0 || states.indexOf( clip.name ) >= 4 ) {
				action.clampWhenFinished = true;
				action.loop = THREE.LoopOnce;

			}

		}
		activeAction = actions[ 'Punch' ];
		fadeToAction( 'Walking', 0.2 );
		// actions.Punch.play()
	}
	function fadeToAction( name, duration ) {
		
		previousAction = activeAction;
		activeAction = actions[ name ];

		if ( previousAction !== activeAction ) {

			// previousAction.fadeOut( duration );

		}
		previousAction.fadeOut( duration );
		activeAction
			.reset()
			.setEffectiveTimeScale( 1 )
			.setEffectiveWeight( 1 )
			.fadeIn( duration )
			.play();
	}
	// 添加拖拽控件
    function initDragControls() {
		
		// 添加平移控件
		var transformControls = new TransformControls(camera, renderer.domElement);
		scene.add(transformControls);

		// 过滤不是 Mesh 的物体,例如辅助网格
		var objects = [];
		// objects.push(scene.children[2]);
		objects.push(model);
	
	
		var dragControls = new DragControls(objects, camera, renderer.domElement);
		dragControls.transformGroup = true
		dragControls.addEventListener( 'dragstart', function ( event ) {
			

		} );
		
		
		dragControls.addEventListener( 'dragend', function ( event ) {

			// console.log(event.object)

		} );
	}
	//动作
	function animate() {

		const dt = clock.getDelta();

		if ( mixer ) mixer.update( dt );

		requestAnimationFrame( animate );

		renderer.render( scene, camera );

		// stats.update();

	}
	

	camera.position.set(0,0, 10 ); //镜头摆放位置 x越大向右靠 y越大向上靠 
	camera.lookAt( new THREE.Vector3(0, 0, 0 ) );// 镜头对准方向 x越大准星越靠右 y越大准星越靠上
    

	
	// setInterval(()=>{
	// 	camera.position.x += 0.01
	// 	camera.position.y +=0.01
	// 	// if(camera.position.x >= 5) {
	// 	// 	camera.position.x = 5
	// 	// }
	// },10)
	// camera.position.x = -5
	// camera.position.y = 8.5
	const play = ()=>{
		const video = myVideo.value
		if(!video) return
		// video.requestFullscreen()
		if(video.paused){
			video.play()
			state.isLopo = true
			setTimeout(()=>{
				state.opty = true 
			},1500)
		}else{
			video.pause()
			state.isLopo = false
			state.opty = false 
		}

	}
</script>

<style>
	* {
		box-sizing: border-box;	
		margin: 0;
		padding: 0;
	}
	canvas {
		/* max-width: 100% !important;
		max-height: 100% !important; */
		/* height: 200px !important; */
	}
	.currency {
		margin-bottom: 7px;
		margin-top: 20px;
	}
	.music {
		position: absolute;
		left: 20px;
		top: 40px;
		width: 40px;
		height: 40px;
		transition: 0.5s;
	}
	#canvasDiv {
		box-sizing: border-box;
		overflow: hidden;
		position: absolute;
		left: 0;
		top: 0;
		width: 100vw;
		height: 100vh;
	}
	.demo {
		z-index: 999;
	}
	.img {
		max-width: 100%;
		height: auto;
	}
	#box {
		width: 100vw;
		min-height: 20vh;
		display: flex;
		align-items: center;
		flex-direction: column;

		background: #949BA2;
	}
	.btn {
		position: absolute;
		top: 20px;
		left: 20px;
		z-index: 9999;
	}
	@keyframes myMusic
	{
		0%   {transform:rotate(0deg);}
		100% {transform:rotate(360deg);}
	}
	.lopo {
		animation: myMusic 5s linear 0s infinite normal;
		
	}
	.opty {
		opacity: 0;
	}
	.text {
		color: rgb(229, 234, 238);
	}
	.video {
		width: 100%;
	}
	.clickeBox {
		display: flex;
		min-width: 200px;
		height: auto;
		flex-direction: column;
		align-items: center;
		position: absolute;
		top: 200px;
		right: 50px;
		position: absolute;
		z-index: 1;
	}

</style>
