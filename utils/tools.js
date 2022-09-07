// 存储localStorage
export const setStorage = (name, content) => {
    if (!name) return;
    if (typeof content !== 'string') {
        content = JSON.stringify(content);
    }
    window.localStorage.setItem(name, content);
}

// 获取localStorage
export const getStorage = name => {
    if (!name) return;
    return window.localStorage.getItem(name);
}


// 移除localStorage
export const removeStorage = name => {
    if (!name) return;
    window.localStorage.removeItem(name);
}

// 存储token
export const setToken = (token) => {
    if (!token) return;
    setStorage("token", token);
}

// 获取token
export const getToken = token => {
    if (!token) return;
    return getStorage(token);
}

//验证手机号码
export const checkMobile = (phone) => {
    let exp = /^1[3456789]\d{9}$/
    return exp.test(phone)
}
/**
 *验证固定电话 
 (new Error('电话号码格式错误！（固定电话格式“区号-电话”）'));
 */
 export const checkPhone = (value)=>{
	if(!value) return false
	let length = value.length,
		phone = /^0\d{2,4}-?\d{7,8}$/, //验证固定电话
		salephone = /^((400)|(800))[0-9]{7}$/;
	if ((length >= 11 && length <= 13 && phone.test(value)) || (length == 10 && salephone.test(value))) {
		return true
	} else {
		return false
	}
} 

//验证邮编
export const checkPostcode = (postcode) => {
    let exp = /^[0-9]{6}$/
    return exp.test(postcode)
}

//格式化富文本内容
export const formatRichText = (html) => {
    if (!html) { return }
    let newContent = html.replace(/<img[^>]*>/gi, function (match, capture) {
        match = match.replace(/style="[^"]+"/gi, '').replace(/style='[^']+'/gi, '');
        match = match.replace(/width="[^"]+"/gi, '').replace(/width='[^']+'/gi, '');
        match = match.replace(/height="[^"]+"/gi, '').replace(/height='[^']+'/gi, '');
        return match;
    });
    newContent = newContent.replace(/style="[^"]+"/gi, function (match, capture) {
        match = match.replace(/width:[^;]+;/gi, 'max-width:100%;').replace(/width:[^;]+;/gi, 'max-width:100%;');
        return match;
    });
    newContent = newContent.replace(/<br[^>]*\/>/gi, '');
    newContent = newContent.replace(/\<img/gi,
        '<img style="max-width:100%;height:auto;display:inline-block;margin:10rpx auto;"');
    return newContent;
}

/**
 * 获取url ?后面参数,window对象
 * @param url： 所需截取的url
 * 返回截取的值
 */
 
 export const getQueryVariableLocation = (name)=>{
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = decodeURI(window.location.search.substr(1)).match(reg);
    if (r != null) {
        return unescape(r[2]);
    }
    return '';
}
//验证身份证号
export const checkIDCard = (id) => {
    // 1 "验证通过!", 0 //校验不通过
    var format = /^(([1][1-5])|([2][1-3])|([3][1-7])|([4][1-6])|([5][0-4])|([6][1-5])|([7][1])|([8][1-2]))\d{4}(([1][9]\d{2})|([2]\d{3}))(([0][1-9])|([1][0-2]))(([0][1-9])|([1-2][0-9])|([3][0-1]))\d{3}[0-9xX]$/;
    //号码规则校验
    if (!format.test(id)) {
        return false
    }
    //区位码校验
    //出生年月日校验   前正则限制起始年份为1900;
    var year = id.substr(6, 4),//身份证年
        month = id.substr(10, 2),//身份证月
        date = id.substr(12, 2),//身份证日
        time = Date.parse(month + '-' + date + '-' + year),//身份证日期时间戳date
        now_time = Date.parse(new Date()),//当前时间戳
        dates = (new Date(year, month, 0)).getDate();//身份证当月天数
    if (time > now_time || date > dates) {
        return false
    }
    //校验码判断
    var c = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2);   //系数
    var b = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2');  //校验码对照表
    var id_array = id.split("");
    var sum = 0;
    for (var k = 0; k < 17; k++) {
        sum += parseInt(id_array[k]) * parseInt(c[k]);
    }
    if (id_array[17].toUpperCase() != b[sum % 11].toUpperCase()) {
        return false
    }
    return true
}

//倒计时
export const cutTime = (time, name) => {
    let nowtime = new Date(),  //获取当前时间
        endtime = new Date(time);  //定义结束时间
    if (endtime < nowtime) return "0天00:00:00";
    let hours, minutes, seconds
    let lefttime = endtime.getTime() - nowtime.getTime(),  //距离结束时间的毫秒数
        leftd = Math.floor(lefttime / (1000 * 60 * 60 * 24)),  //计算天数
        lefth = Math.floor(lefttime / (1000 * 60 * 60) % 24),  //计算小时数
        leftm = Math.floor(lefttime / (1000 * 60) % 60),  //计算分钟数
        lefts = Math.floor(lefttime / 1000 % 60);  //计算秒数
    hours = lefth < 10 ? '0' + lefth : lefth
    minutes = leftm < 10 ? '0' + leftm : leftm
    seconds = lefts < 10 ? '0' + lefts : lefts
    if (leftd == 0 && lefth == 0 && leftm == 0 && lefts == 0) {
        clearInterval(name)
    }
    return leftd + "天" + hours + ":" + minutes + ":" + seconds;  //返回倒计时的字符串
}

//四舍五入保留两位小数,金钱计算
export const keepTwoDecimalFull = (num, p) => {
    let result = parseFloat(num);
    if (isNaN(result)) {
        alert('传递参数错误，请检查！');
        return false;
    }
    let multiplicator = Math.pow(10, p);
    result = Math.round(num * multiplicator) / multiplicator;
    let s_x = result.toString();
    let pos_decimal = s_x.indexOf('.');
    if (pos_decimal < 0) {
        pos_decimal = s_x.length;
        s_x += '.';
    }
    while (s_x.length <= pos_decimal + p) {
        s_x += '0';
    }
    return s_x;
}

//检测数组中某个值是否等于指定值
export const checkArrayItemVal = (array, val, keys) => {
    if (keys) {
        return array.some(v => v[keys] === val)
    }
    return array.some(v => v === val)
}

/*
 获取所有兄弟元素
*/
export const siblings=(elm)=>{
    let a = []
    const p = elm.parentNode.children
    for(let i=0;i<p.length;i++){
        if(p[i].nodeType==1 && p[i]!=elm){
            a.push(p[i])
        }
    }
    return a
}

/*
检索字符串是否包含指定字符串
str 字符串
appointStr 指定包含的子字符串
*/
export const isIncludeStr = (str,appointStr)=>{
    let isInclude = false
    if(str.indexOf(appointStr)!=-1){
        isInclude = true
    }
    return isInclude
}

//删除数组指定元素
export const arrayDelItem = (val,arr)=>{
    let index = -1
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] == val){
            index=i
        }
    }
    if (index > -1) {
        arr.splice(index, 1);
    }
    return arr
}
