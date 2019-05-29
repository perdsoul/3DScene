/**
 * Created by huyonghao on 16/6/1.
 */
/**
 * Created by jialao on 2015/10/11.
 */
onmessage=function(event){

    var fileName = event.data;
    var data = new myMap();
    readV("../vsg/" + fileName + ".vsg",data);
    // readV("http://202.121.178.190:5022/VSG/" + fileName + ".vsg",data);
    // readV("http://smart3d.tongji.edu.cn/citybim/VSG/" + fileName + ".vsg",data);
}

/*
readV("../VSG/" + "voxel" + ".vsg",data);
*/

function readV(url,data){

    var xhr=new XMLHttpRequest();
    var url=url;
    xhr.open("GET",url,true);
    xhr.withCredentials = true;
    xhr.onreadystatechange=function(){

        if(xhr.readyState==4&&xhr.status==200){

            var arr=xhr.response.split("\r\n");
            var sp=new StringParser();
            for(var i=0;i<arr.length;i++){
                sp.init(arr[i]);
                var command=sp.getWord();
                if(command!=null){
                    switch(command){
                        case '#' :
                            while(command){
                                if(command=='Min:'){
                                    data.sceneBBoxMinX = 1.0*sp.getWord();
                                    data.sceneBBoxMinY = 1.0*sp.getWord();
                                    data.sceneBBoxMinZ = 1.0*sp.getWord();
                                }
                                if(command=='Max:'){
                                    data.sceneBBoxMaxX = 1.0*sp.getWord();
                                    data.sceneBBoxMaxY = 1.0*sp.getWord();
                                    data.sceneBBoxMaxZ = 1.0*sp.getWord();
                                }
                                if(command=='Size:'){
                                    data.voxelSize = 1.0*sp.getWord();
                                }
                                command = sp.getWord()
                            }
                            continue;
                        case 'begin':
                            continue;
                        case 'end':
                            continue;
                        default :
                        {
                            var x=command;
                            var y=sp.getWord();
                            var z=sp.getWord();

                            var num=sp.getWord();

                            var index=x+"-"+y+"-"+z;

                            var tempDataArr = [];
                            //data.keyArr.push(index);

                            for(var j=0;j<num;j++){
                                var d=sp.getWord();
                                tempDataArr.push(d);
                            }
                            data.vsgMap[index] = tempDataArr;
                            //data.dataArr.push(tempDataArr);
                        }
                    }
                }
            }
            // console.log(data);
            postMessage(data);
        }

    }
    // xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;");//缺少这句，后台无法获取参数

    xhr.send(null);

}




function myMap(){
    this.vsgMap={};
    this.sceneBBoxMinX = 0;
    this.sceneBBoxMinY = 0;
    this.sceneBBoxMinZ = 0;
    this.sceneBBoxMaxX = 0;
    this.sceneBBoxMaxY = 0;
    this.sceneBBoxMaxZ = 0;
    this.voxelSize = 0;
}




var StringParser = function (str) {
    this.str;   // Store the string specified by the argument
    this.index; // Position in the string to be processed
    this.init(str);
}
// Initialize StringParser object
StringParser.prototype.init = function (str) {
    this.str = str;
    this.index = 0;
}

// Skip delimiters
StringParser.prototype.skipDelimiters = function () {
    for (var i = this.index, len = this.str.length; i < len; i++) {
        var c = this.str.charAt(i);
        // Skip TAB, Space, '(', ')
        if (c == '\t' || c == ' ' || c == '(' || c == ')' || c == '"') continue;
        break;
    }
    this.index = i;
}

// Skip to the next word
StringParser.prototype.skipToNextWord = function () {
    this.skipDelimiters();
    var n = getWordLength(this.str, this.index);
    this.index += (n + 1);
}

// Get word
StringParser.prototype.getWord = function () {
    this.skipDelimiters();
    var n = getWordLength(this.str, this.index);
    if (n == 0) return null;
    var word = this.str.substr(this.index, n);
    this.index += (n + 1);

    return word;
}

// Get integer
StringParser.prototype.getInt = function () {
    return parseInt(this.getWord());
}

// Get floating number
StringParser.prototype.getFloat = function () {
    return parseFloat(this.getWord());
}

function getWordLength(str, start) {
    var n = 0;
    for (var i = start, len = str.length; i < len; i++) {
        var c = str.charAt(i);
        if (c == '\t' || c == ' ' || c == '(' || c == ')' || c == '"')
            break;
    }
    return i - start;
}