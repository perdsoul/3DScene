onmessage=function(event){
    let result=event.data;
    let list=result.dataList;
    let type=result.type;
    let instance=new meshInstance();
    instance.type=type;
    //遍历每个dat
    for(let i=0;i<list.length;i++){
        //遍历dat的每个mesh
        let name=list[i].name;
        let buffer=list[i].buffer;
        instance.vets.set(name,buffer);
    }
    postMessage(instance);
};


function meshInstance() {
    this.type='';
    this.vets=new Map();
}