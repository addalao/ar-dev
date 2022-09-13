<template>
	 <div id="box">
		<video  
			v-if='myStore.videoUrl && myCover' 
			class="video currency" 
			:poster='myCover'
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
	import axios from 'axios'
	import {getQueryVariableLocation} from '../../utils/tools.js'
	// import { OrbitControls } from '../../utils/OrbitControls.js';
	
	const id = getQueryVariableLocation('id')
	const token = getQueryVariableLocation('token')
	const tokenType = getQueryVariableLocation('tokenType')
	let headers = {
		'Content-Type': 'application/json;charset=UTF-8',
	}
	headers[tokenType] = token
	// 02939997-9d6b-4401-bd42-cdd6a8521662 token
	// yk_wx_wx_mini tokenType
	
	const myVideo = ref(null) // 视频dom
	const myAudio = ref(null) // 音频dom
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
	const getData = async ()=>{
		const res = await axios.get(`/api/ar/arResources/details?id=${1}`,{},{
			headers
		})
		myStore.value = res.data
	}
	const state = reactive ({
		isLopo:false,
		opty:false,//控制透明度
	})
	let control = true;
	let container, clock, mixer, activeAction, previousAction;
	let camera, renderer, model;//相机 渲染器 模型
	let actions = {};
	const scene = new THREE.Scene(); //场景
	const myHeight = ref(0)
	const myCover = ref(null)
	let audio;
	onMounted(()=>{
		//myVideo.value 视频dom
		//myAudio.value 音频dom

		const box = document.getElementById('app')
		myHeight.value = (window.innerHeight -box.offsetHeight) +'px'
		const canvasDiv = document.getElementById('canvasDiv')
		// canvasDiv.style.height = myHeight.value
		canvasDiv.addEventListener('click',play) 
		const h = +(window.innerWidth/1.7).toFixed(0) //封面高度
		myCover.value = myStore.value.videoUrl+`?x-oss-process=video/snapshot,t_50000,f_jpg,w_${window.innerWidth},h_${h}`
		getData() //获取数据

	})
	

	
	const states = [ 'Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing' ];
	const emotes = [ 'Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp' ];
	// const arr = ['Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp','Walking'] // 动作名称数组
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
			'https://miniapplet.ciligf.com/ar/resource/lib/RobotExpressive.glb', 
			// 'http://192.168.2.193:8011/untitled.glb', //刺梨
			// 'http://192.168.2.193:8011/RobotExpressive.glb', 
			function ( gltf ) {
			model = gltf.scene;
			model.name='myGltf'
			model.scale.set(0.5,0.5,0.5) //缩小模型
			// console.log(model)
			scene.add( model );
			createGUI( model, gltf.animations );
			initDragControls() //拖拽组件
			

		}, undefined, function ( e ) {
			console.error( e );

		} );
		antialias: true,
		renderer = new THREE.WebGLRenderer( {  alpha: true } );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.outputEncoding = THREE.sRGBEncoding;
		container.appendChild( renderer.domElement );
		// renderer.setClearColor(0x949ba2, 1);
		window.addEventListener( 'resize', onWindowResize );
		
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
		console.log
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
		// dragControls.addEventListener( 'dragstart', function ( event ) {//移动开始
			

		// } );
		// dragControls.addEventListener( 'dragend', function ( event ) {//移动结束

		// 	// console.log(event.object)

		// } );
		dragControls.addEventListener('hoveron',()=>{
		
			control = false
		})
		dragControls.addEventListener('hoveroff',()=>{
		
			control = true
		})
		
	}
	//动画
	function animate() {

		const dt = clock.getDelta();

		if ( mixer ) mixer.update( dt );

		requestAnimationFrame( animate );

		renderer.render( scene, camera );

		// stats.update();

	}
	

	camera.position.set(-1,0.5, 10 ); //镜头摆放位置 x越大向右靠 y越大向上靠 
	camera.lookAt( new THREE.Vector3(-1, 0.5, 0 ) );// 镜头对准方向 x越大准星越靠右 y越大准星越靠上
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
		if(!control) return
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
	window.addEventListener('resize',()=>{
		//更新摄像头
		camera.aspect = window.innerWidth / window.innerHeight
		//更新投影矩阵
		camera.updateProjectionMatrix();
		//更新渲染器
		renderer.setSize(window.innerWidth,window.innerHeight)
	})
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
