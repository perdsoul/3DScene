/**
 * Created by sse316 on 7/9/2016.
 */

/**
 * Created by huyonghao on 16/4/2.
 */

var jud;
var startTime=0;
onmessage=function(event){
    var url=event.data+".dat";

    readD("../testdat/"+url);
    // readD("http://202.121.178.190:5022/MergedFiles/"+url);
}

function readD(url){

    var xhr=new XMLHttpRequest();
    var url=url;
    xhr.open("GET",url,true);

    xhr.addEventListener("load",function(event)
    {
        var index = -1;
        var data=new map();
        var arr=event.target.response.split("\r\n");
        var sp=new StringParser();
        // console.log(arr);
        for(var i=0;i<arr.length;i++){
            sp.init(arr[i]);
            var command=sp.getWord();
            if(command!=null){
                switch(command){
                    case'COMPONENT':
                        index=-1;
                        data=new map();
                        data.type=sp.getWord();
                        data.nam=sp.getWord();
                        // console.log(data.nam);
                        continue;
                    case'COMPONENTFINISH':
                        // console.log("post");
                        postMessage(data);
                        break;
                    case'ALLCOMPONENTSTART':
                        var dataTag=new config();
                        dataTag.data_type = sp.getWord();
                        dataTag.data_tag = 1;
                        postMessage(dataTag);
                        break;
                    case'ALLCOMPONENTFINISH':
                        var dataTag=new config();
                        dataTag.data_type = sp.getWord();
                        dataTag.data_tag = 0;
                        //console.log(data.nam);
                        postMessage(dataTag);
                        break;
                    case'#':
                        var u=sp.getWord();
                        if(u=="Vertex"){
                            index++;
                            var faceArray=[];
                            var rowNum=-1;
                            data.v[index]=[];
                            data.t[index]=[];
                            data.f[index]=[];
                            jud="v";
                        }else if(u=="Triangle"){
                            jud="t";
                        }else if(u=="Normal"){
                            var rowNormal=-1;
                            jud="n";
                        }else if(u=="TMesh"){
                            var string1 = sp.getWord();
                            jud="f";
                        }
                        continue;
                    default:
                        switch(jud){
                            case 'v':
                                var n1=1.0*command;
                                var n2=1.0*sp.getWord();
                                var n3=1.0*sp.getWord();
                                data.v[index].push(n1);
                                data.v[index].push(n2);
                                data.v[index].push(n3);

                                continue;
                            case 't':

                                var star=1.0*command;
                                while(star!=null){
                                    data.t[index].push(1.0*star);
                                    data.t[index].push(1.0*sp.getWord());
                                    data.t[index].push(1.0*sp.getWord());
                                    star=sp.getWord();
                                }

                                continue;
                            case 'f':
                                data.newFileName = string1;
                                data.m.push(1.0*command);
                                for(var metrixCount=0; metrixCount<15; metrixCount++)
                                {
                                    var tempValue = 1.0*sp.getWord();
                                    data.m.push(tempValue);
                                }
                                break;
                        }
                }
            }
        }
        // console.log("finish");
        arr = null;
    });
    xhr.send(null);
}



function map(){
    this.v=[];
    this.t=[];
    this.f=[];
    this.m=[];
    this.nam=null;
    this.type=null;
    this.newFileName = null;
}

function config(){
    this.data_tag=null;
    this.data_type=null;
}

function faceIndex(){
    this.arr=[];
    this.num=0;

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