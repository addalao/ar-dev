import { reactive ,computed} from "vue";
export default function(pageData){
    const myData = reactive({
        num:pageData
    })
    const add = ()=>{
        myData.num +=1 
        console.log(myData.num)
    }
    return {
        myData,
        add
    }
}