onmessage=function(event){

    var modelDataV=event.data[0];
    var data=event.data[1];
    var type=data.type;
    var list=data.reuseDataList;

    var instance=new matInstance();
    instance.type=type;
    instance.matMap=new Map();

    for(let i=0;i<list.length;i++){
        let matrix = list[i].matrix;
        let name =list[i].name;
        let reusen_name = list[i].reuse_name;

        let reusenDataV = modelDataV[reusen_name];  //由被重用的dat的meshes组成的数组

        instance.modelDataM[name] = matrix;
        instance.modelDataNewN[name] = reusen_name;

        if(reusenDataV==undefined) console.warn(reusen_name+"  "+i);//如果缺少了非重用构件在这里报错

        let vMetrix = [];

        //取得每个部分的坐标
        for (var j = 0; j < reusenDataV.length; j += 3) {
            let newN1 = reusenDataV[j] * matrix[0] + reusenDataV[j + 1] * matrix[4] + reusenDataV[j + 2] * matrix[8] + 1.0 * matrix[12];
            let newN2 = reusenDataV[j] * matrix[1] + reusenDataV[j + 1] * matrix[5] + reusenDataV[j + 2] * matrix[9] + 1.0 * matrix[13];
            let newN3 = reusenDataV[j] * matrix[2] + reusenDataV[j + 1] * matrix[6] + reusenDataV[j + 2] * matrix[10] + 1.0 * matrix[14];
            vMetrix.push(newN1, newN2, newN3);
        }
        let vets = new Float32Array(vMetrix);
        instance.matMap.set(name,vets);
    }
    postMessage(instance);
};


function matInstance() {
    this.type="";
    this.matMap=new Map();
    this.modelDataM=[];
    this.modelDataNewN=[];
}