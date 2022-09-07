<template>
    <div class="playBox">
        <div class="palyBtn" @ondblclick="palyFn">
            <img v-if="!state.paly" src="../assets/kaishi.jpg" alt="">
            <img v-else src="../assets/zhantin.jpg" alt="">
        </div>
    </div>
</template>

<script>
    export default {
        name:'Play'
    }
</script>

<script setup>
    import {ref,reactive,watch} from 'vue'
    const props = defineProps({
		dom:HTMLElement,

	})
    
    const state = reactive({
        dom:props.dom,

    })
    const palyFn = ()=>{
        // state.dom
        if(state.dom.paused){
			state.dom.play()
		}else{
			state.dom.pause()
		}
    }
    watch(()=> props.dom,(val)=>{
        state.dom = val
    })
</script>

<style scoped>
    .palyBtn {
        width: 35px;
        height: 35px;
    }
    .palyBtn  img {
        width: 100%;
        height: 100%;
    }
    .playBox {
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
</style>