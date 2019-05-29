importScripts("../lib/lz4.js");

onmessage=function(event){
    let url=event.data;
    getData(url);
};


function getData(url) {
    let type=url.substring(url.indexOf('/')+1);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', `../lz4/${url}.lz4`, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function(e) {
        // response is unsigned 8 bit integer
        var responseArray = new Uint8Array(this.response);

        // console.log(responseArray.toString());

        let std=lz4.decompress(responseArray);
        let data1=new Uint8Array(std);
        let data2=new Float32Array(data1.buffer);
        let i=-1;
        while(i<data2.length){
            let start=i+1;
            i=data2.searchNum(22222222,start);
            let postdata={};
            postdata.name=data2[start]+'='+type;
            postdata.type=type;
            postdata.reusename='';
            //注意slice不会复制最后一位
            postdata.vets=data2.slice(start+1,i-1);
            postdata.tag=0;
            if(data2[i-1]!=11112222)
                postdata.reusename=data2[i-1]+'='+type;
            // console.log(postdata);
            postMessage(postdata);
        }
        // 表示当前类别解析完毕
        postMessage({'tag':1,'type':type});
    };
    xhr.send();
}


Float32Array.prototype.searchNum=function (num,start=0) {
    for(let i=start;i<this.length;i++) {
        if (num == this[i]){
            return i;
        }
    }
}

