/**
 * Created by sse316 on 9/15/2017.
 */


var exp_test;
var exp_light;
var exp_rectLight=[];
var Three_Api = {};
var exp;
(function () {
    // var threeModelGroup;
    var threeModelGroup = new THREE.Group(); //存放模型的Group
    var WebGLCanvasDom;
    var editViewWidth,
        editViewHeight,
        camera, camControls, scene, renderer,clock, modelScale;
    const clippingPlanes = []; //用于管理剖切平面
    var polyhedrons=[]; //用于处理模型的数组
    var polyhedronsWiTree=[];
    var collisionShift = 0 ; //用于管理剖切状态
    var OBBworker=new Worker("js/OBBworker.js"); //用于调用检测Worker
    var windowWidth,windowHeight,windowStartX,windowStartY;   //THREE.Raycaster中转换鼠标位置坐标使用
    let mouseVector = new THREE.Vector2(); //用于存放全局鼠标WebGL坐标系 {x,y E [-1,1] }
    let transformControls = {};
    let raycaster_Global = new THREE.Raycaster();
    var productFactor = 0 ; //用于修正vsg与场景比例的差异
    var vsgArr = [];
    var camPositionArr=[];//保存摄像机位置的数组
    var camPositionNameArr=[];//保存摄像机位置名称的数组
    var OriginalMaterial = []; //模型的材质数组，需要在场景释放之前清空
    var lineGeo,lineMesh; //模型的geometry和mesh
    var sceneConfigMap = {};
    var modelDataV = [],modelDataT = [],modelDataF = [],modelDataM = [],modelDataNewN = [];
    var workerLoadMergedFile=new Worker("js/loadMergedFile.js");
    var workerLoadVsg = new Worker("js/loadBlockVsg.js");
    var workerDrawBIM = new Worker("js/DrawModelThread.js");
    var currentBlockName = "";
    var drawDataMap = {};
    var drawType = {}; //记录每一个type对应的index，便于后续的重绘
    var packageTag = 0;
    var drawCount = 0;
    var locatedModel,pickedModel; //定位到的模型与批量选中的模型(临时)
    var getSMCCallBack,finishDrawCallback;

    var light,obj,ps;

    var listener;
    // var windGroup=[];
    // var windPars=[];

    var unDisplayModelArr = [];  //用于存放因为单击重新绘制的模型构件名称，当进行绘制时，会根据名称进行判断，在数组中的模型不会进行下载
    var redrawModelArr = [];  //用于存放批量选中重新绘制的模型构件名称，当进行绘制时，会根据名称进行判断，在数组中的模型不会进行下载

    //var hostIP = "http://202.121.178.190:5022";
    var hostIP = "http://127.0.0.1:9090";

    var smcInfo=[];
    var numberOfTri=0;

    var camera2,renderer2,cameraPerspectiveHelper,flag_cam2=false;

    var isServerConnected=false;

    String.prototype.colorHex = function(){
        var that = this;
        if(/^(rgb|RGB)/.test(that)){
            var aColor = that.replace(/(?:\(|\)|rgb|RGB)*/g,"").split(",");
            var strHex = "#";
            for(var i=0; i<aColor.length; i++){
                var hex = Number(aColor[i]).toString(16);
                if(hex === "0"){
                    hex += hex;
                }
                strHex += hex;
            }
            if(strHex.length !== 7){
                strHex = that;
            }
            return strHex;
        }else if(reg.test(that)){
            var aNum = that.replace(/#/,"").split("");
            if(aNum.length === 6){
                return that;
            }else if(aNum.length === 3){
                var numHex = "#";
                for(var i=0; i<aNum.length; i+=1){
                    numHex += (aNum[i]+aNum[i]);
                }
                return numHex;
            }
        }else{
            return that;
        }
    };


    exp_tree=readFile;
    var tree1 = [];
    var tree=new THREE.Group();
    var forest=new THREE.Group();
    function readFile(txt1){
        // var loaderTree1 = new THREE.FileLoader();
        // var loaderTree2 = new THREE.FileLoader();
        //load a text file a output the result to the console
        $.get(txt1,function ( data ) {
            var layer = [];
            var circle;
            var x="", y="",z="";
            var radius="";
            var temp=0;
            var branchlength="";
            var trunk=[];
            var child="";
            var position="";
            // output the text to the console
            for(var i=0;i<data.length;i++) {
                temp = 0;
                x="";
                y="";
                z="";
                radius="";
                if(data[i]=='L'){
                    var number=data[i+9].toString();
                    if(data[i+10]!='\r') {
                        number += data[i + 10].toString();
                        if (data[i + 11] != '\r') {
                            number += data[i + 11].toString();
                            i+=14;
                        }
                        else{
                            i+=13;
                        }
                    }
                    else{
                        i+=12;
                    }
                    number = parseInt(number);
                }
                if(data[i+5]=='\r'||data[i+4]=='\r'||data[i+3]=='\r') {
                    branchlength='';
                    child='';
                    position='';
                    while (data[i] != ' ') {
                        child += data[i].toString();
                        i++;
                    }
                    i++;
                    while (data[i] != '\r'){
                        position += data[i].toString();
                        i++;
                    }
                    i+=2;
                    while (data[i] != '\r') {
                        branchlength += data[i].toString();
                        i++;
                    }
                    i += 2;
                }
                for(var j=i;data[j]!='\r'&&j<data.length;j++) {
                    if(data[j]!=' ') {
                        if(temp==0){
                            x+=data[j];
                        }
                        if(temp==1){
                            y+=data[j];
                        }
                        if(temp==2){
                            z+=data[j];
                        }
                        if(temp==3){
                            radius+=data[j];
                        }
                    }
                    else{
                        temp++;
                    }
                }
                i = j+1;
                if(branchlength!=0) {
                    circle = {
                        radius: radius * 70,
                        position:position,//
                        child:child,
                        pos: new THREE.Vector3(x * 70, y * 70, z * 70)
                    };
                    trunk.push(circle);
                    branchlength--;
                    if(branchlength==0){
                        layer.push(trunk);
                        number--;
                        if(number == 0){
                            tree1.push(layer);
                            layer = [];
                        }
                        trunk=[];
                    }
                }
            }
            originalTree();
        });
    }
    function originalTree(){
        // tree = [];
        compact(tree1);
        drawTree(tree1);
        addLeaf(tree1);
        // scene.add(tree);
        instanceTree();
    }

    function instanceTree() {
        var instanceTree1=new THREE.Group();
        instanceTree1=tree.clone();
        instanceTree1.scale.set(0.04,0.04,0.04);
        instanceTree1.position.set(-30,2,32);
        // instanceTree1.position.set(12,4,14);
        forest.add(instanceTree1);

        var instanceTree2=new THREE.Group();
        instanceTree2=tree.clone();
        instanceTree2.scale.set(0.02,0.02,0.02);
        instanceTree2.position.set(-10,2,26);
        forest.add(instanceTree2);

        var instanceTree3=new THREE.Group();
        instanceTree3=tree.clone();
        instanceTree3.scale.set(0.05,0.05,0.05);
        instanceTree3.position.set(2,2,30);
        forest.add(instanceTree3);

        var instanceTree4=new THREE.Group();
        instanceTree4=tree.clone();
        instanceTree4.scale.set(0.05,0.05,0.05);
        instanceTree4.position.set(14,4,6);
        forest.add(instanceTree4);

        // var instanceTree5=new THREE.Group();
        // instanceTree5=tree.clone();
        // instanceTree5.scale.set(0.1,0.1,0.1);
        // instanceTree5.position.set(-20,-28,0);
        // forest.add(instanceTree5);

        forest.name='trees';
        scene.add(forest);
    }


    //紧凑化处理
    function compact(blendtree){
        for(var i=1;i<blendtree.length;i++){
            for(var j=0;j<blendtree[i].length;j++){
                var child = parseInt(blendtree[i][j][0].child);
                var position = parseInt(blendtree[i][j][0].position);
                if(position >= blendtree[i-1][child].length)
                    position = blendtree[i-1][child].length-1;
                var x = blendtree[i-1][child][position].pos.x - blendtree[i][j][0].pos.x;
                var y = blendtree[i-1][child][position].pos.y - blendtree[i][j][0].pos.y;
                var z = blendtree[i-1][child][position].pos.z - blendtree[i][j][0].pos.z;
                for(var m=0;m<blendtree[i][j].length;m++){
                    blendtree[i][j][m].pos.x += x;
                    blendtree[i][j][m].pos.y += y;
                    blendtree[i][j][m].pos.z += z;
                }
            }
        }
    }
//层次结构转换为树
    function drawTree(blendtree){
        for(var i=0;i<blendtree.length;i++) {
            for(var j=0;j<blendtree[i].length;j++) {
                drawBranch(blendtree[i][j]);
            }
        }
    }
//添加叶子，先将分层了的tree转变成不分层的数组结构，然后在圆环序列上随机添加叶子
    function addLeaf(trunk){
        var treecs = [];
        var leafTexture=THREE.ImageUtils.loadTexture("model/tree/leaf01-min.png");
        var leafMat=new THREE.MeshPhongMaterial({color:0x00aa00,map:leafTexture,transparent:true,opacity:1.0,shininess:50});
        for(var i=0;i<trunk.length;i++){
            for(var j=0;j<trunk[i].length;j++){
                treecs.push(trunk[i][j]);
            }
        }
        for(var i = 1;i<treecs.length;i++) {
            for(var j = Math.floor(treecs[i].length/2+Math.floor(Math.random()*4 + 1));j<treecs[i].length;j+=Math.floor(Math.random()*3 + 1)) {
                for (var k = Math.floor(Math.random() * 6 + 1); k < 6; k++) {
                    var phi = Math.random() * 60 + 20;
                    var theta = Math.random() * 360;
                    var selfRotate = Math.random() * 360;
                    var leaf_size = 20;

                    var geo = new THREE.PlaneGeometry(leaf_size, leaf_size);
                    var leafMesh = new THREE.Mesh(geo, leafMat);
                    leafMesh.geometry.translate(0, leaf_size / 2.0, 0);
                    leafMesh.rotateY(theta / 180 * Math.PI);
                    leafMesh.rotateZ(phi / 180 * Math.PI);
                    leafMesh.rotateY(selfRotate / 180 * Math.PI);
                    leafMesh.position.x = treecs[i][j].pos.x;
                    leafMesh.position.z = treecs[i][j].pos.z;
                    leafMesh.position.y = treecs[i][j].pos.y;
                    // tree.push(leafMesh);
                    tree.add(leafMesh);
                    // forest.push(leafMesh);
                }
            }
        }
    }
    //有buffer的老版本drawbranch
    //var geo = new THREE.BufferGeometry();
    function drawBranch(trunk){
        var branch;
        var seg = 5;
        var vertices = [];
        var geo = new THREE.BufferGeometry();
        var branchTexture=new THREE.ImageUtils.loadTexture("model/tree/diffuse-min.png");
        var branchMat=new THREE.MeshLambertMaterial({map:branchTexture,side:THREE.DoubleSide,transparent:true,opacity:1.0,shininess:0});
        var _32array = [];
        for(var i = 0, l = trunk.length; i < l-1; i ++){
            var circle = trunk[i];
            for(var s=0;s<seg;s++){//for each point in the circle
                var rd = circle.radius;
                var pos = new THREE.Vector3(0,0,0);
                var posx=0,posy=0,posz=0;
                if(i>0) {
                    posx = Math.abs(trunk[i].pos.x - trunk[i - 1].pos.x);
                    posy = Math.abs(trunk[i].pos.y - trunk[i - 1].pos.y);
                    posz = Math.abs(trunk[i].pos.z - trunk[i - 1].pos.z);
                }
                if(i==0){
                    posx = Math.abs(trunk[i+1].pos.x - trunk[i].pos.x);
                    posy = Math.abs(trunk[i+1].pos.y - trunk[i].pos.y);
                    posz = Math.abs(trunk[i+1].pos.z - trunk[i].pos.z);
                }
                if(posx>=posy&&posx>=posz) {
                    pos.x = 0;
                    pos.y = rd * Math.sin(2 * Math.PI / seg * s);
                    pos.z = rd * Math.cos(2 * Math.PI / seg * s);
                }
                if(posz>=posx&&posz>=posy){
                    pos.x = rd * Math.sin(2 * Math.PI / seg * s);
                    pos.y = rd * Math.cos(2 * Math.PI / seg * s);
                    pos.z = 0;
                }
                if(posy>=posz&&posy>=posx) {
                    pos.x = rd * Math.cos(2 * Math.PI / seg * s);
                    pos.y = 0;
                    pos.z = rd * Math.sin(2 * Math.PI / seg * s);
                }
                vertices.push(pos.add(circle.pos));
            }
        }
        vertices.push(trunk[trunk.length-1].pos);
        _32array = translate(vertices);
        /*    for(i=0;i<l-1;i++){
                for(s=0;s<seg;s++){
                    var v1 = i*seg+s;
                    var v2 = i*seg+(s+1)%seg;
                    var v3 = (i+1)*seg+(s+1)%seg;
                    var v4 = (i+1)*seg+s;

                    geo.faces.push(new THREE.Face3(v1,v2,v3));
                    geo.faceVertexUvs[0].push([new THREE.Vector2(s/seg,0),new THREE.Vector2((s+1)/seg,0),new THREE.Vector2((s+1)/seg,1)]);
                    geo.faces.push(new THREE.Face3(v3,v4,v1));
                    geo.faceVertexUvs[0].push([new THREE.Vector2((s+1)/seg,1),new THREE.Vector2((s)/seg,1),new THREE.Vector2((s)/seg,0)]);
                }
            }//add faces and uv*/
        geo.addAttribute( 'position', new THREE.Float32BufferAttribute( _32array, 3 ) );
        geo.computeVertexNormals();
        /*    var instancedGeo = new THREE.InstancedBufferGeometry();
            instancedGeo.index = geo.index;
            instancedGeo.attributes = geo.attributes;

            var particleCount = 1;
            var translateArray = new Float32Array( particleCount * 3 );

            for ( var i = 0, i3 = 0, l = particleCount; i < l; i ++, i3 += 3 ) {
                translateArray[ i3 + 0 ] = Math.random() * 10 - 1;
                translateArray[ i3 + 1 ] = Math.random() * 10 - 1;
                translateArray[ i3 + 2 ] = Math.random() * 10 - 1;
            }

            instancedGeo.addAttribute('translate', new THREE.InstancedBufferAttribute( translateArray, 3, 1 ) );
            var shader_material = new THREE.RawShaderMaterial({
                uniforms: {map:{value:branchImg}},
                vertexShader: [
                    "precision highp float;",
                    "",
                    "uniform mat4 modelViewMatrix;",
                    "uniform mat4 projectionMatrix;",
                    "",
                    "attribute vec3 position;",
                    "attribute vec3 translate;",
                    "",
                    "void main() {",
                    "",
                    "	gl_Position = projectionMatrix * modelViewMatrix * vec4( translate + position, 1.0 );",
                    "",
                    "}"
                ].join("\n"),
                fragmentShader: [
                    "precision highp float;",
                    "",
                    "void main() {",
                    "",
                    "	gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);",
                    "",
                    "}"
                ].join("\n"),
                side: THREE.DoubleSide,
                transparent: false,

            });
           branch = new THREE.Mesh(instancedGeo,shader_material);*/
        branch = new THREE.Mesh(geo,branchMat);
        // tree.push(branch);
        tree.add(branch);
        // forest.push(branch);
    }

    //点集转换为32Array
    function translate(vertices){
        var precision =5;
        var _32array = [];
        for(var i=0;i<vertices.length;i++){
            if((i+1) %5 == 0 && i + 1 != vertices.length-1){
                _32array.push(vertices[i].x, vertices[i].y, vertices[i].z);
                _32array.push(vertices[i - precision +1].x, vertices[i - precision +1].y, vertices[i - precision +1].z);
                _32array.push(vertices[i + precision].x, vertices[i + precision].y, vertices[i + precision].z);
            }
            else if(i == vertices.length-1){
                _32array.push(vertices[i].x, vertices[i].y, vertices[i].z);
            }
            else if(i + 1 == vertices.length-1){
                _32array.push(vertices[i].x, vertices[i].y, vertices[i].z);
                _32array.push(vertices[i- precision +1].x, vertices[i- precision +1].y, vertices[i- precision +1].z);
                _32array.push(vertices[vertices.length-1].x, vertices[vertices.length-1].y, vertices[vertices.length-1].z);
            }
            else if(i + precision >= vertices.length-1){
                _32array.push(vertices[i].x, vertices[i].y, vertices[i].z);
                _32array.push(vertices[i + 1].x, vertices[i + 1].y, vertices[i + 1].z);
                _32array.push(vertices[vertices.length-1].x, vertices[vertices.length-1].y, vertices[vertices.length-1].z);
            }
            else {
                _32array.push(vertices[i].x, vertices[i].y, vertices[i].z);
                _32array.push(vertices[i + 1].x, vertices[i + 1].y, vertices[i + 1].z);
                _32array.push(vertices[i + precision].x, vertices[i + precision].y, vertices[i + precision].z);
            }
        }
        for(var j = vertices.length-2; j>=5;j--){
            if(j % 5 ==0){
                _32array.push(vertices[j].x, vertices[j].y, vertices[j].z);
                _32array.push(vertices[j + precision -1].x, vertices[j + precision -1].y, vertices[j + precision -1].z);
                _32array.push(vertices[j - 1].x, vertices[j - 1].y, vertices[j -1].z);
            }
            else{
                _32array.push(vertices[j].x, vertices[j].y, vertices[j].z);
                _32array.push(vertices[j - 1].x, vertices[j - 1].y, vertices[j - 1].z);
                _32array.push(vertices[j - precision -1].x, vertices[j - precision -1].y, vertices[j - precision -1].z);
            }
        }
        return _32array;
    }


    var hostAddress="ws://114.115.140.115:8280/websocket/air";
    function setupNetWork() {
        var socket=new WebSocket(hostAddress);
        try
        {
            socket.onopen = function(msg)
            {
                console.log("succeed to connect！");

                isServerConnected = true;
            };

            socket.onmessage = function (msg)
            {
                console.log(msg.data);
                // var headerReader = new FileReader();
                // headerReader.onload = function (e)
                // {
                //     if (e.target.readyState == FileReader.DONE)
                //     {
                //         var array = new Uint8Array(e.target.result);
                //         var headerValue = ((array[1] << 8) + array[0]);
                //
                //         //resetTimestamps.forEach(function (value, key)
                //         //{
                //         //    if ((key <= headerValue)) {
                //         //        resetTimestamps.delete(key);
                //         //    }
                //         //});
                //
                //         //if (lastReqFrameCounter === headerValue)
                //         {
                //             var readerData = new FileReader();
                //             readerData.onload = function (e) {
                //                 if (e.target.readyState == FileReader.DONE)
                //                 {
                //                     var rawMsg = e.target.result.replace('data:;base64,' , '');
                //
                //                     if (rawMsg.length > 5)
                //                     {
                //                         var strMsg = window.atob(rawMsg);
                //
                //                         if (strMsg)
                //                         {
                //                             if (strMsg.indexOf('{') > -1)
                //                             {
                //                                 var tempData = strMsg.split('|');
                //
                //                                 syncSceneRootInfo(JSON.parse(tempData[0]));
                //
                //                                 syncSceneVisible(tempData[1].split('\n'));
                //                             }
                //                             else
                //                             {
                //                                 syncSceneVisible(strMsg.split('\n'));
                //                             }
                //                         }
                //                     }
                //
                //                     /*
                //                     console.log('get response: ' + strMsg.indexOf('{'));
                //
                //                     if (false && strvb.length > 5)
                //                     {
                //                         //console.log(strvb.length)
                //                         var allVisibleParts = window.atob(strvb);
                //                     }
                //                     */
                //
                //                     //snapshotVisible();
                //
                //                     ///*
                //                     //image.src = e.target.result;
                //                     //renderTarget.texture.image = image;
                //                     //renderTarget.texture.needsUpdate = true;
                //                     //*/
                //                 }
                //             }
                //             readerData.readAsDataURL(sliceBlob(msg.data, 2));
                //         }
                //     }
                // }
                // headerReader.readAsArrayBuffer(sliceBlob(msg.data, 0, 2));
            };

            socket.onclose = function (msg)
            {
                isServerConnected = false;

                window.alert("暂时无法访问服务器，请稍后！");
            };

            socket.onerror = function(msg)
            {
                isServerConnected = false;

                console.log(msg.data);
            }
        }
        catch (ex)
        {
            console.log(ex);
        }
    }


    var flag_pickMesh=false;

    function startPick(){
        if(flag_pickMesh){
            document.getElementById('btn_pick').innerText="开启选取";
            document.getElementById('meshInfo').innerText="";
            if(editInfoSelectedObj2.length!=0)
                scene.remove(editInfoSelectedObj2[0]);
            editInfoSelectedObj2=[];
        }else{
            document.getElementById('btn_pick').innerText="关闭选取";
        }
        flag_pickMesh=!flag_pickMesh;
    }


    function initThreeJSScene(CanvasDom,dbclickEvent,isSkyBox=false,webGLWidthScale=1) {
        editViewWidth = window.innerWidth * webGLWidthScale;
        editViewHeight = window.innerHeight;
        // clock = new THREE.Clock();

        // clock.start();
        renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true,antialias: true});
        renderer.setSize(window.innerWidth * webGLWidthScale, window.innerHeight);
        renderer.localClippingEnabled = true;
        renderer.setClearColor(0x323232);
        CanvasDom.append(renderer.domElement);
        WebGLCanvasDom = CanvasDom;

        camera = new THREE.PerspectiveCamera(45, editViewWidth / editViewHeight, 1, 1000);
        camera.position.set(0,0,100);
        // camera.lookAt(new THREE.Vector3(0, 0, 0));
        // camera.lookAt(-100, -100, 0);

        //声音组件
        listener = new THREE.AudioListener();
        camera.add( listener );

        camControls = new THREE.OrbitControls( camera, renderer.domElement );

        scene = new THREE.Scene();

        var ambientLight = new THREE.AmbientLight(0xcccccc,0.7);
        scene.add(ambientLight);

        // scene.fog=new THREE.FogExp2(0xefd1b5,0.025);

        light=new THREE.SpotLight(0xffffff);
        light.position.set(camera.position.x,camera.position.y,camera.position.z);
        light.distance=100;
        light.intensity=0.3;
        obj=new THREE.Object3D();
        obj.position.set(0,0,5);
        scene.add(obj);
        light.target=obj;
        scene.add(light);

        // let cube=new THREE.BoxBufferGeometry(10,10,10);
        // let mesh=new THREE.Mesh(cube,new THREE.MeshPhongMaterial({color:0xffff00}));
        // scene.add(mesh);
        // var directionalLight_1 = new THREE.DirectionalLight(0xffffff, 0.4);
        // directionalLight_1.position.set(0.3, 0.4, 0.5);
        // scene.add(directionalLight_1);
        // var directionalLight_2 = new THREE.DirectionalLight(0xffffff, 0.4);
        // directionalLight_2.position.set(-0.3, -0.4, 0.5);
        // scene.add(directionalLight_2);

        //正确的屏幕参数
        windowWidth = renderer.domElement.width;
        windowHeight = renderer.domElement.height;

        if(isSkyBox){
            initSkyBox();
        }

        //加入坐标轴辅助
        // var axes = new THREE.AxisHelper(10);
        // scene.add(axes);

        renderer.render(scene, camera);

        window.addEventListener('resize', onWindowResize, false);

        //初始化场景事件处理函数
        renderer.domElement.addEventListener("mousemove",onMouseMove);
        // initSkyBox();
        render();

        //开启websocket监听
        // setupNetWork();

        // getSMCCallBack = dbclickEvent;
        //如果场景被双击
        CanvasDom.ondblclick = function(event){
            //如果点击的目标不是场景，不处理
            if(event.target !== renderer.domElement) return;

            if(true)//可以判断编辑模式
            {
                event.preventDefault();
                mouse.x = ( (event.clientX-windowStartX) / windowWidth ) * 2 - 1;
                mouse.y = - ( (event.clientY-windowStartY) / windowHeight ) * 2 + 1;

                var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
                projector.unprojectVector( vector, camera );
                var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
                var intersects = raycaster.intersectObjects( polyhedrons );
                var tempNewComponent; // 用以标记当前鼠标击中的未经merge的物体
                unDisplayModelArr = [];//要清空这个数组，不然第二次点击就不会再显示
                if ( intersects.length > 0 ){
                    var tempComponentName = intersects[0].object.name;
                    var pos=tempComponentName.lastIndexOf("_");
                    var ind=tempComponentName.substring(pos+1);
                    if(ind!="copy") //如果射线击中的第一个物体的name属性不带有copy后缀（说明这是一类merge后的大几何体）
                    {
                        //找出merge前该位置对应的那个物体
                        tempNewComponent = getComponentByNameAndPoint(intersects[0].object.name,intersects[0].point,1);
                    }
                    else  //带有copy后缀说明之前已经处理过，可以直接取出
                    {
                        tempNewComponent = intersects[0].object;
                    }

                    // 材质切换相关
                    //editedComponentExist用于判断构件是否已经是点击状态，true为是
                    var editedComponentExist = false;
                    for(var i = 0;i< editInfoSelectedObj.length;i++)
                    {
                        if(editInfoSelectedObj[i].name == tempNewComponent.name) {
                            //从保存选中构件的数组中删除该构件
                            editedComponentExist = true;
                            break;
                        }
                    }

                    if(!editedComponentExist) {
                        editInfoSelectedObj.push(tempNewComponent);
                        scene.add(tempNewComponent);

                        if(currentBlockName=='model5-6_zhaoming'){
                            turnOnLight(tempNewComponent,intersects[0].point);
                        }
                        if(currentBlockName=='model5-6_tongnuan'){
                            turnOnWind(tempNewComponent,intersects[0].point);
                        }
                        showInfo(tempNewComponent);
                    }
                    else {
                        console.log("检测到重复点击");
                        scene.remove(editInfoSelectedObj[i]);

                        if(currentBlockName=='model5-6_zhaoming'){
                            turnOfflight(editInfoSelectedObj[i]);
                        }
                        if(currentBlockName=='model5-6_tongnuan'){
                            turnOffWind(editInfoSelectedObj[i]);
                        }
                        closeInfo();

                        editInfoSelectedObj.splice(i,1);
                        // scene.remove(editInfoSelectedObj[editInfoSelectedObj.length-1]);
                        //从点击交互的数组中删除该构件
                        // for(var i=0;i<polyhedrons.length;i++){
                        //     if(polyhedrons[i]==tempNewComponent)
                        //         break;
                        // }
                        // polyhedrons.splice(i,1);
                    }
                }
            }
        };


        CanvasDom.onmousemove = function(event){
            //如果点击的目标不是场景，不处理
            if(event.target !== renderer.domElement) return;

            if(flag_pickMesh)//可以判断编辑模式
            {
                event.preventDefault();
                mouse.x = ( (event.clientX-windowStartX) / windowWidth ) * 2 - 1;
                mouse.y = - ( (event.clientY-windowStartY) / windowHeight ) * 2 + 1;

                var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
                projector.unprojectVector( vector, camera );
                var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
                var intersects = raycaster.intersectObjects( polyhedrons );
                var tempNewComponent; // 用以标记当前鼠标击中的未经merge的物体
                unDisplayModelArr = [];//要清空这个数组，不然第二次点击就不会再显示
                if ( intersects.length > 0 ){
                    var tempComponentName = intersects[0].object.name;
                    var pos=tempComponentName.lastIndexOf("_");
                    var ind=tempComponentName.substring(pos+1);
                    if(ind!="copy") //如果射线击中的第一个物体的name属性不带有copy后缀（说明这是一类merge后的大几何体）
                    {
                        //找出merge前该位置对应的那个物体
                        tempNewComponent = getComponentByNameAndPoint(intersects[0].object.name,intersects[0].point,2);
                    }
                    else  //带有copy后缀说明之前已经处理过，可以直接取出
                    {
                        tempNewComponent = intersects[0].object;
                    }
                    if(editInfoSelectedObj2.length!=0)
                        scene.remove(editInfoSelectedObj2[0]);
                    editInfoSelectedObj2=[];
                    editInfoSelectedObj2.push(tempNewComponent);
                    scene.add(tempNewComponent);
                    let box=tempNewComponent.geometry.boundingBox;
                    let vol=(box.max.x-box.min.x)*0.001*(box.max.y-box.min.y)*0.001*(box.max.z-box.min.z)*0.001;
                    let name=tempNewComponent.name.substring(0,tempNewComponent.name.lastIndexOf('_'));
                    document.getElementById('meshInfo').innerText="名称："+name+"\n体积："+vol;
                    // showInfo(tempNewComponent);
                }
            }
        };
    }

    //显示信息
    // function showInfo(clickObject){
    //     let name0=clickObject.name;
    //     let name1=name0.substring(0,name0.lastIndexOf('_'));
    //     let index=name1.indexOf('=');
    //     let id=name1.substring(0,index);
    //     let type=name1.substring(index+1);
    //
    //     document.getElementById("objectName").value=currentBlockName;
    //     document.getElementById("objectId").value=id;
    //     document.getElementById("objectType").value=type;
    // }
    //
    // //关闭
    // function closeInfo(){
    //     document.getElementById("objectName").value='';
    //     document.getElementById("objectId").value='';
    //     document.getElementById("objectType").value='';
    // }

    //存放每组产生风的函数
    var winds=new Map();
    // var text = THREE.ImageUtils.loadTexture('image/light/1.png');
    var text = THREE.ImageUtils.loadTexture('image/wind.png');
    //创建烟雾素材
    var material = new THREE.PointsMaterial({
        size: 0.6,
        transparent: true,
        opacity: 0.1,
        sizeAttenuation: true,
        depthWrite: false,
        color: 0xffffff,
        map: text
    });

    class Wind{
        constructor(x,y,z,width1,width2,name){
            this.x=x;
            this.y=y-0.3;
            this.z=z;
            this.width1=width1;
            this.width2=width2;

            let geom = new THREE.Geometry();
            for (let j = 0; j <= 1; j ++) {
                let px=width1*Math.random()+x;
                let py=y;
                let pz=width2*Math.random()+z;
                let particle = new THREE.Vector3(px,py, pz);
                let particle2 = new THREE.Vector3(px, py-.1, pz);
                // let particle3 = new THREE.Vector3(px, py-.2, pz);
                // let particle4 = new THREE.Vector3(px, py-.9, pz);
                geom.vertices.push(particle);
                geom.vertices.push(particle2);
                // geom.vertices.push(particle3);
                // geom.vertices.push(particle4);
            }
            this.cloud= new THREE.Points(geom, material);
            this.cloud.name=name;
            scene.add(this.cloud);
        }

        loop(){
            this.cloud.position.y-=0.03;
            if(this.cloud.position.y<=-0.2){
                let px=Math.random()*this.width1/100+this.x/500;
                let py=0;
                let pz=Math.random()*this.width2/100+this.z/500;
                this.cloud.position.set(px,py,pz);
            }
        }
    }

    function *f(x,y,z,width,width2,windGroup,name){
        while(windGroup.length<7){
            let ff=new Wind(x,y,z,width,width2,name);
            windGroup.push(ff);
            yield;
        }
    }
    
    function turnOnWind(component,clickPoint){
        let name0=component.name;
        let name=name0.substring(0,name0.lastIndexOf('_'));
        let smc=smcInfo[currentBlockName];
        for(let i=0;i<smc.length;i++){
            if(smc[i].name==name){
                if(smc[i].smc['类别']!='风道末端')return;
                else break;
            }
        }
        //包围盒
        var boxMin=new THREE.Vector3();
        var boxMax=new THREE.Vector3();
        boxMin.copy(component.geometry.boundingBox.min);
        boxMin.multiplyScalar(sceneConfigMap[currentBlockName].scale);
        boxMax.copy(component.geometry.boundingBox.max);
        boxMax.multiplyScalar(sceneConfigMap[currentBlockName].scale);

        let width=boxMax.x-boxMin.x;
        let width2=boxMax.z-boxMin.z;

        //每个windGroup存放一组风
        let windGroup=[];
        let generateWind=f(boxMin.x,boxMin.y,boxMin.z,width,width2,windGroup,name+'_wind');
        winds.set(name,[generateWind,windGroup]);

        //增加风的音效
        var sound= new THREE.PositionalAudio( listener );
        var audioLoader = new THREE.AudioLoader();
        audioLoader.load( 'audio/wind.mp3', function( buffer ) {
            sound.setBuffer( buffer );
            sound.setLoop( true );
            sound.setVolume( 5 );
            // sound.setRefDistance(0.2);
            sound.setMaxDistance(1);
            sound.play();
        });
        sound.name=name+'_sound';
        component.add(sound);

        console.log(sound.getMaxDistance());
        // winds.push([generateWind,windGroup]);
        // let wind=new Wind();

        // wind.addEventListener( 'start', function () {
        //     // createPointCloud(0.6,0.1,boxMin.x,boxMin.y,boxMin.z,width,width2);
        //     let geom = new THREE.Geometry();//创建烟雾团
        //     let text = THREE.ImageUtils.loadTexture('image/light/1.png');
        //     //创建烟雾素材
        //     let material = new THREE.PointsMaterial({
        //         size: 0.6,
        //         transparent: true,
        //         opacity: 0.1,
        //         sizeAttenuation: true,
        //         depthWrite: false,
        //         color: 0xffffff,
        //         map: text
        //     });
        //
        //     let windszzz=new THREE.Group();
        //     windszzz.name=name+'_wind';
        //     // for(let i=0;i<=2;i++){
        //     for (let j = 0; j <= 1; j++){
        //         let px = width * Math.random() + boxMin.x;
        //         let py = boxMin.y;
        //         let pz = width2 * Math.random() + boxMin.z;
        //         var particle = new THREE.Vector3(px, py, pz);
        //         var particle2 = new THREE.Vector3(px, py - .1, pz);
        //         // var particle3 = new THREE.Vector3(px, py - .2, pz);
        //         // var particle4 = new THREE.Vector3(px, py - .3, pz);
        //         geom.vertices.push(particle);
        //         geom.vertices.push(particle2);
        //         // geom.vertices.push(particle3);
        //         // geom.vertices.push(particle4);
        //     }
        //     let cloud = new THREE.Points(geom, material);
        //     windszzz.add(cloud);
        //     // windGroup.push(cloud);
        //     // scene.add(cloud);
        //     // }
        //     this.winds=windszzz;
        //     scene.add(this.winds);
        //     this.startGenerateWind=true;
        // });
        //
        // wind.addEventListener('loop',function () {
        //     if(this.startGenerateWind){
        //         this.winds.children.forEach(function (item) {
        //             item.position.y-=0.05;
        //             if(item.position.y<=boxMin.y-0.1){
        //                 let px = width * Math.random() + boxMin.x;
        //                 let py = boxMin.y;
        //                 let pz = width2 * Math.random() + boxMin.z;
        //                 item.position.set(px,py,pz);
        //                 // windGroup.splice(index,1);
        //                 // item.geometry.dispose();
        //                 // item.geometry=null;
        //                 // item.material.dispose();
        //                 // item.material=null;
        //                 // scene.remove(item);
        //             }
        //         });
        //     }
        // });
        // // wind.start(0.6,0.1,boxMin.x,boxMin.y,boxMin.z,width,width2,name);
        // wind.start();
        // windGroup.push(wind);
    }
    
    function turnOffWind(component) {
        // windPars=[];
        let name0=component.name;
        let name=name0.substring(0,name0.lastIndexOf('_'));
        component.getObjectByName(name+'_sound').stop();
        for(let i=0;i<scene.children.length;i++){
            if(scene.children[i].name==name+'_wind'){
                scene.remove(scene.children[i]);
                i--;
            }
        }
        if(winds.has(name)){
            winds.delete(name);
        }
    }
    

    var trimDis = 0.6;
    var sfa=false;
    var order=1;
    //开关灯
    function turnOnLight(component,clickPoint){
        //四种灯：iGuzzini-吊顶灯-IRool，HALLA-吊顶灯，iGuzzini-吊顶灯-miPlan，Bosch Security Systems-摄像机-Security-Fixed-Dinion_IP_4000(01)
        var nameOfLight;
        var typeOfLight;

        //包围盒
        var boxMin=new THREE.Vector3();
        var boxMax=new THREE.Vector3();
        boxMin.copy(component.geometry.boundingBox.min);
        boxMin.multiplyScalar(sceneConfigMap[currentBlockName].scale);
        boxMax.copy(component.geometry.boundingBox.max);
        boxMax.multiplyScalar(sceneConfigMap[currentBlockName].scale);

        //name0："344641=IfcFlowTerminal_copy"
        let name0=component.name;
        let name=name0.substring(0,name0.lastIndexOf('_'));
        let smc=smcInfo[currentBlockName];
        for(let i=0;i<smc.length;i++){
            if(smc[i].name==name){
                nameOfLight=smc[i].smc['NAME'];
                break;
            }
        }
        if(nameOfLight==undefined) return;

        typeOfLight=nameOfLight.split(/\s+/)[0];
        //摄像头
        if(typeOfLight=='Bosch'){
            let pointx=(boxMin.x+boxMax.x)/2;
            let pointy=(boxMin.y+boxMax.y)/2;
            let pointz=(boxMin.z+boxMax.z)/2;
            let container=document.getElementById('show_screen');
            camera2=new THREE.PerspectiveCamera(75,1,0.5,100);
            camera2.position.set(pointx,pointy,pointz);
            camera2.lookAt(pointx,pointy-1,pointz+1);
            cameraPerspectiveHelper = new THREE.CameraHelper( camera2 );
            cameraPerspectiveHelper.name=name+'_showScreen';
            scene.add( cameraPerspectiveHelper );

            renderer2 = new THREE.WebGLRenderer();
            renderer2.setSize(400, 400);
            renderer2.setClearColor(0xaaaaaa,1.0);
            container.appendChild(renderer2.domElement);
            container.addEventListener('click',function () {
                camera.position.set(pointx,pointy,pointz);
                camControls.target.set(pointx,pointy-1,pointz+1);
            });
            if(!flag_cam2)
                $("#show_screen").toggle("normal");
            flag_cam2=!flag_cam2;
        }

        //圆盘灯
        else if(typeOfLight.substring(0,typeOfLight.indexOf('-'))=='HALLA'){
            let pointx=(boxMin.x+boxMax.x)/2;
            let pointy=boxMin.y;
            let pointz=(boxMin.z+boxMax.z)/2;

            let rs=(boxMax.x-boxMin.x)/2;

            if(clickPoint.y<0){
                var comLight=new THREE.SpotLight(0xffffff,1,5);
            }
            else{
                var comLight=new THREE.SpotLight(0xffffff,1,4);
            }

            comLight.position.set(pointx,pointy,pointz);
            if(clickPoint.y<0){
                comLight.angle=0.51;
            }
            else{
                comLight.angle=0.6;
            }
            comLight.penumbra=1.5;
            comLight.decay=0.1;
            comLight.name=name+'_light';
            // initLightGUI(comLight);

            // var lightGeo=new THREE.CircleBufferGeometry(rs+1.42,60);
            // let mat=THREE.ImageUtils.loadTexture( 'image/light/2.png' );
            // let materialss=new THREE.MeshPhongMaterial({color:0x5d4d36,transparent:true,opacity:0.8,shininess:100,map:mat});
            // // materialss.blending = THREE.CustomBlending;
            // // materialss.blendEquation = THREE.AddEquation; //default
            // // materialss.blendEquationAlpha=THREE.AddEquation;
            // // materialss.blendSrc = THREE.SrcAlphaFactor; //default
            // // materialss.blendSrcAlpha=THREE.SrcAlphaFactor;
            // // materialss.blendDst = THREE.OneMinusSrcAlphaFactor; //default
            // // materialss.blendDstAlpha=THREE.SrcAlphaFactor;
            // var comLight=new THREE.Mesh(lightGeo,materialss);
            // comLight.position.set(pointx,boxMin.y-2.792,pointz);
            // comLight.rotation.x=-Math.PI/2;
            // comLight.name=name+'_light';
            // scene.add(comLight);

            let lightObj=new THREE.Object3D();
            lightObj.position.set(pointx,pointy-1,pointz);
            lightObj.name=name+'_lightObj';
            scene.add(lightObj);
            comLight.target=lightObj;

            scene.add(comLight);

            if(clickPoint.y<0){
                var op=new THREE.CylinderBufferGeometry(rs,rs+1.42,3.8,60,50);
                var mesh=new THREE.Mesh(op,new THREEx.VolumetricSpotLightMaterial());
                mesh.material.uniforms.lightColor.value.set(0xdddddd);
                mesh.material.uniforms.spotPosition.value	= mesh.position;
                mesh.material.uniforms.anglePower.value=4.0;
                mesh.material.uniforms.attenuation.value=20.0;
                mesh.position.set(pointx,boxMin.y-1.9,pointz);
            }
            else{
                var op=new THREE.CylinderBufferGeometry(rs,rs+1.21,2.8,60,50);
                var mesh=new THREE.Mesh(op,new THREEx.VolumetricSpotLightMaterial());
                mesh.material.uniforms.lightColor.value.set(0xdddddd);
                mesh.material.uniforms.spotPosition.value	= mesh.position;
                mesh.material.uniforms.anglePower.value=4.0;
                mesh.material.uniforms.attenuation.value=20.0;
                mesh.position.set(pointx,boxMin.y-1.4,pointz);
            }
            mesh.name=name+'_lightS';
            scene.add(mesh);
        }

        //吊顶灯
        else if(typeOfLight.substring(typeOfLight.lastIndexOf('-')+1)=='IRool'){
            let pointx=(boxMin.x+boxMax.x)/2;
            let pointy=boxMin.y;
            let pointz=(boxMin.z+boxMax.z)/2;

            let rs=(boxMax.x-boxMin.x)/2;

            if(clickPoint.y<0){
                var comLight=new THREE.SpotLight(0xffffff,1,5);
            }
            else{
                var comLight=new THREE.SpotLight(0xffffff,1,4);
            }

            comLight.position.set(pointx,pointy+0.5,pointz);
            if(clickPoint.y<0){
                comLight.angle=0.35;
            }
            else{
                comLight.angle=0.4;
            }
            comLight.penumbra=1.5;
            comLight.decay=0.1;
            comLight.name=name+'_light';
            // initLightGUI(comLight);

            let lightObj=new THREE.Object3D();
            lightObj.position.set(pointx,pointy-1,pointz);
            lightObj.name=name+'_lightObj';
            scene.add(lightObj);
            comLight.target=lightObj;
            scene.add(comLight);

            if(clickPoint.y<0){
                var op=new THREE.CylinderBufferGeometry(rs,rs+1.25,3.7,60,50);
                var mesh=new THREE.Mesh(op,new THREEx.VolumetricSpotLightMaterial());
                mesh.material.uniforms.lightColor.value.set(0xdddddd);
                mesh.material.uniforms.spotPosition.value	= mesh.position;
                mesh.material.uniforms.anglePower.value=4.0;
                // var mesh=new THREE.Mesh(op,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.05}));
                mesh.position.set(pointx,boxMin.y-1.85,pointz);
            }
            else{
                var op=new THREE.CylinderBufferGeometry(rs,rs+1.08,2.8,60,50);
                var mesh=new THREE.Mesh(op,new THREEx.VolumetricSpotLightMaterial());
                mesh.material.uniforms.lightColor.value.set(0xdddddd);
                mesh.material.uniforms.spotPosition.value	= mesh.position;
                mesh.material.uniforms.anglePower.value=4.0;
                // var mesh=new THREE.Mesh(op,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.05}));
                mesh.position.set(pointx,boxMin.y-1.4,pointz);
            }
            mesh.name=name+'_lightS';
            scene.add(mesh);
        }

        //矩形灯
        else{
            // scene.remove(component);
            // for(var i=0;i<editInfoSelectedObj.length;i++){
            //     if(editInfoSelectedObj[i]==component)
            //         break;
            // }
            // editInfoSelectedObj.splice(i,1);

            let width1=boxMax.x-boxMin.x;
            let width2=boxMax.z-boxMin.z;
            let hight=boxMax.y-boxMin.y;
            let pointx=(boxMin.x+boxMax.x)/2;
            let pointy=boxMin.y;
            let pointz=(boxMin.z+boxMax.z)/2;

            //发光灯管
            // let newComponentGeo=new THREE.BoxBufferGeometry(width1,hight,width2);
            // let newComponent=new THREE.Mesh(newComponentGeo,new THREE.MeshPhongMaterial({color:0xffffff,transparent:true,opacity:1,shininess:2000,side:THREE.DoubleSide}));
            // newComponent.scale.set(0.32,1.02,0.378);
            // newComponent.position.set(pointx,pointy+0.018,pointz-0.1);
            // newComponent.name = component.name;
            // newComponent.block=currentBlockName;
            // editInfoSelectedObj.push(newComponent);
            // scene.add(newComponent);

            //地面
            // let ss=new THREE.PlaneBufferGeometry(5,8);
            let ss=new THREE.PlaneBufferGeometry(4,7);
            let mat=THREE.ImageUtils.loadTexture( 'image/light/3.png' );
            // let materialss=new THREE.MeshPhongMaterial({color:0x5d4d36,transparent:true,opacity:0.5,shininess:100,map:mat});
            let materialss=new THREE.MeshBasicMaterial({color:0xb4b8f4,transparent:true,opacity:1.1,map:mat});
            // initLightGUIss(materialss);

            materialss.blending = THREE.CustomBlending;
            materialss.blendEquation = THREE.AddEquation;
            materialss.blendSrc = THREE.SrcAlphaFactor;
            materialss.blendDst = THREE.DstAlphaFactor;

            if(sfa==true){trimDis-=0.1;order++;}
            else sfa=true;
            materialss.polygonOffset = true;
            materialss.polygonOffsetFactor = trimDis;
            materialss.depthTest = false;

            let pp=new THREE.Mesh(ss,materialss);
            pp.scale.multiplyScalar(0.19);
            pp.position.set(pointx,pointy-2.792,pointz);
            pp.rotation.x=-Math.PI/2;
            pp.name=name+'_light';
            pp.renderOrder = order;
            scene.add(pp);

            //光线
            // let vets=[
            //     -3,-7.8,-4.5,    3,-7.8,-4.5,    0.5, 7,-2.65,    -0.5, 7,-2.65,
            //     -3,-7.8, 4.5,    3,-7.8, 4.5,    0.5, 7, 2.65,    -0.5, 7, 2.65
            //
            //     // -0.5,-7.8,-2.65,    0.5,-7.8,-2.65,    0.5, 7,-2.65,    -0.5, 7,-2.65
            //     // -0.5,-7.8, 2.65,    0.5,-7.8, 2.65,    0.5, 7, 2.65,    -0.5, 7, 2.65
            // ];
            //
            // let faces=[
            //      // 3,0,1,     1,2,3
            //     2,1,0,    0,3,2,
            //     0,4,7,    7,3,0,
            //     0,1,5,    5,4,0,
            //     1,2,6,    6,5,1,
            //     2,3,7,    7,6,2,
            //     4,5,6,    6,7,4
            // ];
            //
            // let op=new THREE.PolyhedronBufferGeometry(vets,faces);
            // var uvArray=[
            //     0,1, 0,0, 1,0,  1,0, 1,1, 0,1,
            //     0,0, 1,0, 1,1,  1,1, 0,1, 0,0,
            //     0,0, 0,0, 0,0,  0,0, 0,0, 0,0,
            //     1,0, 1,1, 0,1,  0,1, 0,0, 1,0,
            //     0,0, 0,0, 0,0,  0,0, 0,0, 0,0,
            //     0,0, 1,0, 1,1,  1,1, 0,1, 0,0
            // ];
            //
            // var uvAttribute=new Float32Array(uvArray);
            // op.addAttribute('uv',new THREE.BufferAttribute(uvAttribute,2));
            // let mt=THREE.ImageUtils.loadTexture( 'image/light/1.png' );
            // let mesh=new THREE.Mesh(op,new THREE.MeshPhongMaterial({color:0xffffff,map:mt,transparent:true,opacity:0.2}));
            //
            // // let mesh=new THREE.Mesh(op,new THREEx.VolumetricSpotLightMaterial());
            // // mesh.material.uniforms.lightColor.value.set(0xdddddd);
            // // mesh.material.uniforms.spotPosition.value	= mesh.position;
            // // mesh.material.uniforms.anglePower.value=4.0;
            //
            // mesh.scale.set(1.6,1.6,1.6);
            // mesh.position.set(pointx,pointy-1.5,pointz);
            // mesh.name=name+'_lightS';
            // scene.add(mesh);



            let lightgroup=new THREE.Group();
            let mt=THREE.ImageUtils.loadTexture( 'image/light/1.png' );
            let material=new THREE.MeshBasicMaterial({color:0xffffff,map:mt,transparent:true,opacity:0.2,side:THREE.DoubleSide});
            // initLightGUIss(material);

            // material.alphaTest=0.03;
            // material.blending = THREE.CustomBlending;
            // material.blendEquation = THREE.AddEquation;
            // material.blendSrc = THREE.SrcAlphaFactor;
            // material.blendDst = THREE.DstAlphaFactor;

            let geo=new THREE.PlaneBufferGeometry(0.7,2.9);
            let jk=new THREE.Mesh(geo,material);
            // jk.renderOrder=5;
            jk.position.set(pointx,pointy-1.42,pointz);
            // jk.name=name+'_lightSR';

            exp_rectLight.push(jk);

            // scene.add(jk);
            lightgroup.add(jk);
            lightgroup.name=name+'_lightSR';

            //发光效果
            let jkah=new THREE.PointLight(0xffffff,2,0.7);
            // jkah.add(new THREE.Mesh(new THREE.SphereBufferGeometry(0.01,30,30),new THREE.MeshBasicMaterial({color:0xff0000})));
            jkah.position.set(pointx,boxMax.y+0.3,pointz);
            lightgroup.add(jkah);

            let afawq=jkah.clone();
            afawq.position.set(pointx,boxMin.y-0.3,pointz);
            lightgroup.add(afawq);

            scene.add(lightgroup);
        }
    }

    function initLightGUIss(mat) {
        var Options = function() {
            this.opacity=mat.opacity;
        };

        var gui = new dat.GUI();

        var options = new Options();
        gui.add(options, 'opacity', 0, 1).onChange( function ( val ) {
            mat.opacity = val;
            render();
        } );
    }

    // function initLightGUIss(mat) {
    //     var Options = function() {
    //         this.color=mat.color.getHex();
    //         this.opacity=mat.opacity;
    //     };
    //
    //     var gui = new dat.GUI();
    //
    //     var options = new Options();
    //     gui.addColor( options, 'color' ).onChange( function ( val ) {
    //         mat.color.setHex( val );
    //         render();
    //     } );
    //     gui.add(options, 'opacity', 0, 1).onChange( function ( val ) {
    //         mat.opacity = val;
    //         render();
    //     } );
    // }

    function initLightGUI(light) {
        var Options = function() {
            this.message = 'light';
            this.color=light.color.getHex();
            this.intensity=light.intensity;
            this.distance=light.distance;
            this.angle=light.angle;
            this.penumbra=light.penumbra;
            this.decay=light.decay;
        };

        var gui = new dat.GUI();

        var options = new Options();
        gui.add(options, 'message');
        gui.addColor( options, 'color' ).onChange( function ( val ) {
            light.color.setHex( val );
            render();
        } );
        gui.add(options, 'intensity', 0, 5).onChange( function ( val ) {
            light.intensity = val;
            render();
        } );
        gui.add(options, 'distance', 0, 100).onChange( function ( val ) {
            light.distance = val;
            render();
        } );
        gui.add(options, 'angle', 0, Math.PI/3).onChange( function ( val ) {
            light.angle = val;
            render();
        } );
        gui.add(options, 'penumbra', 0, 2).onChange( function ( val ) {
            light.penumbra = val;
            render();
        } );
        gui.add(options, 'decay', 0, 2).onChange( function ( val ) {
            light.decay = val;
            render();
        } );
    }

    function turnOfflight(component) {
        let name0=component.name;
        let name=name0.substring(0,name0.lastIndexOf('_'));
        for(let i=0;i<scene.children.length;i++){
            if(scene.children[i].name==name+'_light'){
                scene.remove(scene.children[i]);
                i--;
            }
            else if(scene.children[i].name==name+'_lightObj'){
                scene.remove(scene.children[i]);
                i--;
            }
            else if(scene.children[i].name==name+'_lightS'){
                scene.remove(scene.children[i]);
                i--;
            }
            else if(scene.children[i].name==name+'_lightSR'){
                scene.remove(scene.children[i]);
                i--;
                //删除数组中的旋转矩形光
                for(var j=0;j<exp_rectLight.length;j++){
                    if(exp_rectLight[j].name==name+'_lightSR')
                        break;
                }
                exp_rectLight.splice(j,1);
            }
            else if(scene.children[i].name==name+'_showScreen'){
                flag_cam2=false;
                scene.remove(scene.children[i]);
                $("#show_screen").toggle("normal");
                i--;
                renderer2.dispose();
            }
            console.log(scene.children[i].name);
        }
    }


    //绑定灯光到摄像机
    function updatelight() {
        light.position.set(camera.position.x, camera.position.y, camera.position.z);
        ps = camera.getWorldDirection();
        obj.position.set(
            camera.position.x + ps.x * 10,
            camera.position.y + ps.y * 10,
            camera.position.z + ps.z * 10
        );
        light.target = obj;
    }


    function getBuildingArr(callback) {
        $.get(hostIP+"/selectBuildingConfig",{},function (result) {
            callback(result);
        });
    }

    function getCamPosition(buildingName,callbak){
        var descriptionUrl = hostIP + "/returnCameraLocation?buildingName="+buildingName;
        $.get(descriptionUrl,(resText)=> {
            callbak(resText);
        });
    }

    //灯光接口
    exp_light=alterLight;
    function alterLight(key,value){
        if(key=='color'){light.color.set(value);}
        else{light[key]=value;}
        // console.log(value);
    }

    function render(){
        requestAnimationFrame(render);
        camControls.update();
        updatelight();

        updateRectLight();

        //存在产风的组件
        if(winds.size!=0){
            winds.forEach(function (item) {
                //circle
                item[1].forEach(function (wind) {
                    wind.loop();
                });
                //generate wind
                if(item[1].length<7){
                    let rand=Math.random();
                    if(rand<=0.3)
                        item[0].next();
                }
            });
        }
        //渲染监控窗口
        if(flag_cam2) renderer2.render(scene,camera2);
        renderer.render(scene, camera);
    }

    function updateRectLight(){
        if(exp_rectLight.length!=0){
            let sdj=camera.getWorldDirection();
            let kjsdf=new THREE.Vector2(sdj.x,-sdj.z);
            let angle=kjsdf.angle()-Math.PI/2;
            exp_rectLight.forEach(function (item) {
                item.rotation.y=angle;
            });
        }
    }
    
    function onWindowResize() {
        camera.aspect = editViewWidth / editViewHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(editViewWidth, editViewHeight - 16);
    }

    //回调函数
    var modelNameArr=['model5-6_jiegou','model5-6_jianzhuNewest','model5-6_geipaishui','model5-6_tongnuan','model5-6_zhaoming'];
    function callBack(){
        console.log('finish draw');
        for(var i=0;i<modelNameArr.length;i++){
            if(modelNameArr[i]==currentBlockName)
                break;
        }
        if(i<4){
            initModel(modelNameArr[i+1],0.001,callBack);
        }
    }

    function initModel(modelName,modelScaleValue,callback) {
        finishDrawCallback = callback;
        currentBlockName = modelName;
        packageTag = 0;
        // threeModelGroup = new THREE.Group();
        if(currentBlockName=='model5-6_jianzhuNewest'||currentBlockName=='model5-6'){
            readFile('model/tree/AL06a.txt');
        }

        workerLoadVsg.postMessage(currentBlockName);
        modelScale = modelScaleValue;
        productFactor = modelScale;
    }

    // initModel(modelNameArr[0],0.001,callBack);

    workerLoadVsg.onmessage = function (event) {
        //获取组件名称，输出到tempresult数组中
        vsgArr = [];
        for(var k in event.data.vsgMap) {
            var vsgList = [];
            vsgList = event.data.vsgMap[k];
            for(var i =0;i<vsgList.length;i++){
                if(vsgArr.indexOf(vsgList[i]) == -1) vsgArr.push(vsgList[i]);
            }
        }
        var sceneConfig = new sceneConfigInfo();
        sceneConfig.vsg = event.data.vsgMap;
        sceneConfig.voxelSize = event.data.voxelSize;
        sceneConfig.sceneBBoxMinX = event.data.sceneBBoxMinX;
        sceneConfig.sceneBBoxMinY = event.data.sceneBBoxMinY;
        sceneConfig.sceneBBoxMinZ = event.data.sceneBBoxMinZ;
        sceneConfig.sceneBBoxMaxX = event.data.sceneBBoxMaxX;
        sceneConfig.sceneBBoxMaxY = event.data.sceneBBoxMaxY;
        sceneConfig.sceneBBoxMaxZ = event.data.sceneBBoxMaxZ;
        sceneConfig.scale = modelScale;
        sceneConfigMap[currentBlockName] = sceneConfig;

        drawCount = 0;

        //获取smc
        if(currentBlockName=='model5-6_zhaoming'||currentBlockName=='model5-6_tongnuan'){
            getComponentSMC(currentBlockName);
        }

        for(var i=0;i<24;i++)
        {
            workerLoadMergedFile.postMessage(currentBlockName+"_"+i);
        }
    };

    workerLoadMergedFile.onmessage = function (event) {
        var Data=event.data;
        if(Data.data_tag!=null)
        {
            if(Data.data_tag==1){
                //发送下一个数据下载请求，map设置对应的key-value
                // console.log("1. Data.data_type is:" + Data.data_type);
                if(!drawDataMap[currentBlockName]) drawDataMap[currentBlockName] = {};
                drawDataMap[currentBlockName][Data.data_type] = [];
            }else{
                //收到块加载完成的消息，开始绘制
                // isOnload = false;
                //开始绘制当前数据
                DrawModel(Data.data_type);
                packageTag++;
                if(packageTag==24)
                {
                    console.log(new Date());
                    document.getElementById('num_tri').innerText=numberOfTri;
                    // console.log(numberOfTri);
                    disableClipping();
                    destroyAllSprite();
                    // scene.add(threeModelGroup);
                    //该参数最早在点击编辑按钮后且完成动画后设定
                    if(!windowStartX)
                    {
                        windowStartX = renderer.domElement.getBoundingClientRect().left;
                        windowStartY = renderer.domElement.getBoundingClientRect().top;
                    }

                    //记录一下所有模型的材质
                    for(var i=0;i<threeModelGroup.children.length;i++) {
                        OriginalMaterial.push(threeModelGroup.children[i].material);
                    }
                    finishDrawCallback();
                }
            }
        }
        else
        {
            if(!drawDataMap[currentBlockName]) drawDataMap[currentBlockName] = {};
            if(!drawDataMap[currentBlockName][Data.type]) drawDataMap[currentBlockName][Data.type] = [];
            // console.log("2. Data.data_type is:" + Data.data_type + "Data.name is" + Data.nam);
            drawDataMap[currentBlockName][Data.type].push(Data.nam);
            if(Data.newFileName)
            {
                var tempKeyValue = Data.nam;
                if(!modelDataNewN[currentBlockName]) modelDataNewN[currentBlockName] = {};
                if(!modelDataM[currentBlockName]) modelDataM[currentBlockName] = {};
                if(!modelDataNewN[currentBlockName][tempKeyValue])
                {
                    modelDataNewN[currentBlockName][tempKeyValue] = [];
                }
                if(!modelDataM[currentBlockName][tempKeyValue])
                {
                    modelDataM[currentBlockName][tempKeyValue] = [];
                }
                modelDataNewN[currentBlockName][tempKeyValue] = Data.newFileName;
                modelDataM[currentBlockName][tempKeyValue] = Data.m;
            }
            else{
                var tempKeyValue = Data.nam;
                if(!modelDataV[currentBlockName]) modelDataV[currentBlockName] = {};
                if(!modelDataT[currentBlockName]) modelDataT[currentBlockName] = {};
                if(!modelDataF[currentBlockName]) modelDataF[currentBlockName] = {};
                if(!modelDataV[currentBlockName][tempKeyValue])
                {
                    modelDataV[currentBlockName][tempKeyValue] = [];
                }
                if(!modelDataT[currentBlockName][tempKeyValue])
                {
                    modelDataT[currentBlockName][tempKeyValue] = [];
                }
                if(!modelDataF[currentBlockName][tempKeyValue])
                {
                    modelDataF[currentBlockName][tempKeyValue] = [];
                }
                for(var dataCount = 0; dataCount<Data.v.length;dataCount++)
                {
                    modelDataV[currentBlockName][tempKeyValue].push(Data.v[dataCount]);
                    modelDataT[currentBlockName][tempKeyValue].push(Data.t[dataCount]);
                    modelDataF[currentBlockName][tempKeyValue].push(Data.f[dataCount]);
                }
            }
            Data = null;
        }
    };


    {
        var texture1 = THREE.ImageUtils.loadTexture( './assets/textures/texture1.jpg' );
        texture1.wrapS = texture1.wrapT = THREE.RepeatWrapping;
        texture1.repeat.set( 1, 1 );
        var material1 = new THREE.MeshPhongMaterial( { color: 0xffffff, map: texture1,side: THREE.DoubleSide,shininess:100});


        var texture2 = THREE.ImageUtils.loadTexture( './assets/textures/texture2.jpg' );
        texture2.wrapS = texture2.wrapT = THREE.RepeatWrapping;
        texture2.repeat.set( 1, 1 );
        var material2 = new THREE.MeshPhongMaterial( { color: 0xffffff, map: texture2,side: THREE.DoubleSide,shininess:100});

        var texture3_1 = THREE.ImageUtils.loadTexture( './assets/textures/ifc_wall.png' );
        texture3_1.wrapS = texture3_1.wrapT = THREE.RepeatWrapping;
        texture3_1.repeat.set( 3, 0.75 );
        var material3_1 = new THREE.MeshPhongMaterial( { color: 0xaeb1b3, map: texture3_1,side: THREE.DoubleSide,shininess:100});

        var texture3_2 = THREE.ImageUtils.loadTexture( './assets/textures/floor2.jpg' );
        texture3_2.wrapS = texture3_2.wrapT = THREE.RepeatWrapping;
        texture3_2.repeat.set( 1, 1 );
        var material3_2 = new THREE.MeshPhongMaterial( { color: 0xffffff, map: texture3_2,side: THREE.DoubleSide,shininess:100});

        var texture4 = THREE.ImageUtils.loadTexture( './assets/textures/ifc_column.jpg' );
        texture4.wrapS = texture4.wrapT = THREE.RepeatWrapping;
        texture4.repeat.set( 1, 1 );
        var material4 = new THREE.MeshPhongMaterial( { color: 0xffffff, map: texture4,side: THREE.DoubleSide,shininess:100});

        var texture5 = THREE.ImageUtils.loadTexture( './assets/textures/texture5.jpg' );
        texture5.wrapS = texture5.wrapT = THREE.RepeatWrapping;
        texture5.repeat.set( 1, 1 );
        var material5 = new THREE.MeshPhongMaterial( { color: 0xffffff, map: texture5,side: THREE.DoubleSide,shininess:100});

        var texture6 = THREE.ImageUtils.loadTexture( './assets/textures/texture6.jpg' );
        texture6.wrapS = texture6.wrapT = THREE.RepeatWrapping;
        texture6.repeat.set( 1, 1 );
        var material6 = new THREE.MeshPhongMaterial( { color: 0xffffff, map: texture6,side: THREE.DoubleSide,shininess:100});

        var texture7 = THREE.ImageUtils.loadTexture( './assets/textures/ifc_slab.png' );
        texture7.wrapS = texture7.wrapT = THREE.RepeatWrapping;
        texture7.repeat.set( 0.1, 0.1 );
        var material7 = new THREE.MeshPhongMaterial( { color: 0xffffff, map: texture7,side: THREE.DoubleSide, shininess:100});


        var texture8 = THREE.ImageUtils.loadTexture( './assets/textures/texture1.jpg' );
        texture8.wrapS = texture8.wrapT = THREE.RepeatWrapping;
        texture8.repeat.set( 1, 1 );
        var material8 = new THREE.MeshPhongMaterial( { color: 0xffffff, map: texture8,side: THREE.DoubleSide,shininess:100});

        var texture9 = THREE.ImageUtils.loadTexture( './assets/textures/texture9.jpg' );
        texture9.wrapS = texture9.wrapT = THREE.RepeatWrapping;
        texture9.repeat.set( 1, 1 );
        var material9 = new THREE.MeshPhongMaterial( { color: 0xffffff, map: texture9,side: THREE.DoubleSide,shininess:100});


        var texture10 = THREE.ImageUtils.loadTexture( './assets/textures/texture10.jpg' );
        texture10.wrapS = texture10.wrapT = THREE.RepeatWrapping;
        texture10.repeat.set( 1, 1 );
        var material10 = new THREE.MeshPhongMaterial( { color: 0xffffff, map: texture10,side: THREE.DoubleSide,shininess:100});

        var texture11 = THREE.ImageUtils.loadTexture( './assets/textures/floors2.jpg' );
        texture11.wrapS = texture11.wrapT = THREE.RepeatWrapping;
        texture11.repeat.set( 0.5, 0.5 );

        //522d2d 584323
        // var material11 = new THREE.MeshPhongMaterial( { color: 0x584323, map: texture11,side: THREE.DoubleSide,shininess:64});
        // var material11 = new THREE.MeshStandardMaterial( {color:0x584323,map:texture11,side:THREE.DoubleSide} );
        var material11 = new THREE.MeshStandardMaterial( {color:0xb4b8f4,map:texture11,side:THREE.DoubleSide} );
    }


    /**
     * 绘制模型
     */
    function DrawModel(tag){
        var geos=[];

        if(drawDataMap[currentBlockName][tag].length>0)
        {
            var tempName = drawDataMap[currentBlockName][tag][0];
            if(tempName)
            {
                var typeIndex = tempName.indexOf("=");
                var packageType = tempName.slice(typeIndex+1);
                drawType[packageType] = tag;
                for(var i=0; i<drawDataMap[currentBlockName][tag].length; i++)
                {
                    var tempFileName = drawDataMap[currentBlockName][tag][i];
                    //先来一波构件过滤
                    if(tempFileName!=null && redrawModelArr.indexOf(tempFileName)==-1)
                    {
                        //重用构件
                        if (modelDataNewN[currentBlockName] && modelDataNewN[currentBlockName][tempFileName]) {

                            var newName = modelDataNewN[currentBlockName][tempFileName];
                            var matrix = modelDataM[currentBlockName][tempFileName];
                            //处理V矩阵，变形
                            if(modelDataV[currentBlockName][newName])
                            {
                                modelDataV[currentBlockName][tempFileName] = [];
                                for(var dataCount=0;dataCount<modelDataV[currentBlockName][newName].length;dataCount++)
                                {
                                    let geometry_three = new THREE.BufferGeometry();
                                    let vets=[];

                                    for (var m = 0; m < modelDataT[currentBlockName][newName][dataCount].length; m++) {
                                        let tri = 1.0 * modelDataT[currentBlockName][newName][dataCount][m];
                                        let newN1 = modelDataV[currentBlockName][newName][dataCount][3*tri] * matrix[0] + modelDataV[currentBlockName][newName][dataCount][3*tri + 1] * matrix[4] + modelDataV[currentBlockName][newName][dataCount][3*tri + 2] * matrix[8] + 1.0 * matrix[12];
                                        let newN2 = modelDataV[currentBlockName][newName][dataCount][3*tri] * matrix[1] + modelDataV[currentBlockName][newName][dataCount][3*tri + 1] * matrix[5] + modelDataV[currentBlockName][newName][dataCount][3*tri + 2] * matrix[9] + 1.0 * matrix[13];
                                        let newN3 = modelDataV[currentBlockName][newName][dataCount][3*tri] * matrix[2] + modelDataV[currentBlockName][newName][dataCount][3*tri + 1] * matrix[6] + modelDataV[currentBlockName][newName][dataCount][3*tri + 2] * matrix[10]+ 1.0 * matrix[14];

                                        // let ps_x=-newN1+offsetX;
                                        // let ps_y=newN3-offsetZ;
                                        // let ps_z=newN2-offsetY;
                                        let ps_x=newN1;
                                        let ps_y=newN2;
                                        let ps_z=newN3;
                                        vets.push(ps_x,ps_y,ps_z);
                                    }
                                    numberOfTri+=(modelDataT[currentBlockName][newName][dataCount].length/3);
                                    let vertices=new Float32Array(vets);
                                    geometry_three.addAttribute('position', new THREE.BufferAttribute( vertices, 3 ));

                                    geos.push(geometry_three);
                                }
                            }
                            else
                            {
                                console.log("找不到modelDataV中对应的newName: "+newName);
                            }
                        }

                        //非重用构件
                        else if (modelDataV[currentBlockName][tempFileName] && !(modelDataNewN[currentBlockName] && modelDataNewN[currentBlockName][tempFileName])) {

                            for(var dataCount=0;dataCount<modelDataV[currentBlockName][tempFileName].length;dataCount++)
                            {
                                let geometry_three = new THREE.BufferGeometry();
                                let vets=[];


                                for (var m = 0; m < modelDataT[currentBlockName][tempFileName][dataCount].length; m ++) {
                                    let tri = 1.0 * modelDataT[currentBlockName][tempFileName][dataCount][m];
                                    let newn1 = 1.0 * modelDataV[currentBlockName][tempFileName][dataCount][3*tri];
                                    let newn2 = 1.0 * modelDataV[currentBlockName][tempFileName][dataCount][3*tri + 1];
                                    let newn3 = 1.0 * modelDataV[currentBlockName][tempFileName][dataCount][3*tri + 2];

                                    // let ps_x=-newn1+offsetX;
                                    // let ps_y=newn3-offsetZ;
                                    // let ps_z=newn2-offsetY;
                                    let ps_x=newn1;
                                    let ps_y=newn2;
                                    let ps_z=newn3;
                                    vets.push(ps_x);
                                    vets.push(ps_y);
                                    vets.push(ps_z);
                                }
                                numberOfTri+=(modelDataT[currentBlockName][tempFileName][dataCount].length/3);
                                let vertices=new Float32Array(vets);
                                geometry_three.addAttribute('position', new THREE.BufferAttribute( vertices, 3 ));

                                geos.push(geometry_three);
                            }
                        }
                    }
                }
                var geos_merged = THREE.BufferGeometryUtils.mergeBufferGeometries(geos);

                geos_merged.applyMatrix(new THREE.Matrix4().set(
                    -1,0,0,0,
                    0,0,1,0,
                    0,1,0,0,
                    0,0,0,1));
                geos_merged.computeBoundingBox();
                geos_merged.computeFaceNormals();
                geos_merged.computeVertexNormals();

                var polyhedron = new THREE.Mesh();
                polyhedron = Three_Api.createMesh(geos_merged,currentBlockName,packageType,tag);
                polyhedron.scale.set(modelScale,modelScale,modelScale);
                polyhedrons.push(polyhedron);
                threeModelGroup.add(polyhedron);
                scene.add(threeModelGroup);
            }
        }
    }


    function assignBufferUVs(bufferGeometry){
        let geometry=new THREE.Geometry();
        let scale=sceneConfigMap[currentBlockName].scale;
        geometry.fromBufferGeometry(bufferGeometry);

        let uvs=[];
        geometry.computeFaceNormals();
        geometry.faces.forEach(function(face) {
            var components = ['x', 'y', 'z'].sort(function(a, b){
                return Math.abs(face.normal[a]) > Math.abs(face.normal[b]);
            });

            var v1 = geometry.vertices[face.a];
            var v2 = geometry.vertices[face.b];
            var v3 = geometry.vertices[face.c];

            uvs.push(v1[components[0]]*scale, v1[components[1]]*scale);
            uvs.push(v2[components[0]]*scale, v2[components[1]]*scale);
            uvs.push(v3[components[0]]*scale, v3[components[1]]*scale);
        });
        let uvArray=new Float32Array(uvs);
        bufferGeometry.addAttribute('uv',new THREE.BufferAttribute(uvArray,2));
        bufferGeometry.uvsNeedUpdate = true;
    }

    function assignUVs(geometry){
        geometry.faceVertexUvs[0] = [];

        geometry.computeFaceNormals();
        geometry.faces.forEach(function(face) {
            var components = ['x', 'y', 'z'].sort(function(a, b){
                return Math.abs(face.normal[a]) > Math.abs(face.normal[b]);
            });

            var v1 = geometry.vertices[face.a];
            var v2 = geometry.vertices[face.b];
            var v3 = geometry.vertices[face.c];

            geometry.faceVertexUvs[0].push([
                new THREE.Vector2(v1[components[0]], v1[components[1]]).multiplyScalar(0.001),
                new THREE.Vector2(v2[components[0]], v2[components[1]]).multiplyScalar(0.001),
                new THREE.Vector2(v3[components[0]], v3[components[1]]).multiplyScalar(0.001)
            ]);
        });
        geometry.uvsNeedUpdate = true;
    }

    //存储视角
    var saveCam;
    var conTarget;
    function saveCam(){
        saveCam=camera.clone();
        conTarget=camControls.target.clone();
    }

    //加载视角
    function loadCam() {
        camera.copy(saveCam);
        camControls.target.copy(conTarget);
    }


    function createMesh(geom,block,nam,isBuffer) {
        if(isBuffer==null) isBuffer = true;

        var mesh;
        var color = new THREE.Color( 0xff0000 );
        var myOpacity = 1;
        switch (nam) {
            case"IfcFooting":
                color =new THREE.Color( 0xFFBFFF );
                break;
            case "IfcWallStandardCase"://ok
                color =new THREE.Color( 0xaeb1b3 );
                break;
            case "IfcSlab"://ok
                color = new THREE.Color( 0x505050 );
                myOpacity = 0.9;
                break;
            case "IfcStair"://ok
                color =new THREE.Color( 0xa4a592 );
                break;
            case "IfcDoor"://ok
                color =new THREE.Color( 0x6f6f6f );
                break;
            case "IfcWindow":
                color =new THREE.Color( 0x6f6f6f );
                break;
            case "IfcBeam"://ok
                color =new THREE.Color( 0x949584 );
                break;
            case "IfcCovering":
                color = new THREE.Color( 0x777a6f );
                break;
            case "IfcFlowSegment"://ok
                color = new THREE.Color( 0x999999 );
                break;
            case "IfcWall"://ok
                color = new THREE.Color( 0xbb9f7c );
                break;
            case "IfcRamp":
                color = new THREE.Color( 0x4d5053 );
                break;
            case "IfcRailing"://ok
                color = new THREE.Color( 0x4f4f4f );
                break;
            case "IfcFlowTerminal"://ok
                // color = new THREE.Color( 0xe9f5f8 );
                color = new THREE.Color( 0xd5d5d5 );
                break;
            case "IfcBuildingElementProxy"://ok
                color = new THREE.Color( 0x6f6f6f );
                myOpacity = 0.7;
                break;
            case "IfcColumn"://ok
                color = new THREE.Color( 0x8a8f80 );
                break;
            case "IfcFlowController"://ok
                color = new THREE.Color( 0x2c2d2b );
                break;
            case "IfcFlowFitting"://ok
                color = new THREE.Color( 0x93a5aa );
                break;
            case "IfcPlate"://ok外体窗户
                color = new THREE.Color( 0x2a4260 );
                break;
            case "IfcMember"://ok外体窗户
                color = new THREE.Color( 0x2f2f2f );
                break;
            default:
                color = new THREE.Color( 0x194354 );
                break;
        }
        var material0 = new THREE.MeshPhongMaterial({ color:color,side: THREE.DoubleSide});

        var material_transparent = new THREE.MeshPhongMaterial( { color: color,side: THREE.DoubleSide,shininess:100});

        var material_flow=new THREE.MeshPhongMaterial({color:0xaaaaaa});
        /**
         * 根据UV坐标来贴上贴图
         */
        // assignBufferUVs(geom);

        switch (nam) {
            case "IfcWallStandardCase"://ok
                if(isBuffer)    mesh = new THREE.Mesh(geom, material3_2);
                else mesh = new THREE.Mesh(geom, material3_2);
                break;
            case "IfcSlab"://ok
                if(isBuffer)    mesh = new THREE.Mesh(geom, material11);
                else mesh = new THREE.Mesh(geom, material11);
                break;
            case "IfcWall"://ok
                if(isBuffer)    mesh = new THREE.Mesh(geom, material3_2);
                else mesh = new THREE.Mesh(geom, material3_2);
                break;
            case "IfcColumn"://ok
                if(isBuffer)    mesh = new THREE.Mesh(geom, material4);
                else mesh = new THREE.Mesh(geom, material4);
                break;
            case "IfcPlate"://ok
                if(isBuffer)    mesh = new THREE.Mesh(geom, material_transparent);
                else mesh = new THREE.Mesh(geom, material_transparent);
                break;
            case "IfcFlowTerminal":
                mesh=new THREE.Mesh(geom,material_flow);
                break;
            default:
                if(isBuffer)    mesh = new THREE.Mesh(geom, material0);
                else mesh = new THREE.Mesh(geom, material0);
                break;
        }

        mesh.name = block+"_"+nam;

        //添加轮廓线
        //  var edges = new THREE.EdgesGeometry( geom,50 );
        //  mesh.add( new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0x000000 } ) ) );

        return mesh;
    }


    /**
     * 清空场景中的所有模型
     */
    function destoryModel() {
        //删除线框模式文件
        if(lineMesh && lineMesh.type==='Group'){
            scene.remove(lineMesh);
            threeModelGroup.visible = true;
            for(var i=0; i<lineMesh.children.length;i++){
                lineMesh.children[i].geometry.dispose();
                lineMesh.children[i].material.dispose();
            }
            lineMesh = null;
        }
        OriginalMaterial = [];
        for (var i = 0; i < threeModelGroup.children.length; i++) {
            threeModelGroup.children[i].geometry.dispose();
            threeModelGroup.children[i].geometry = null;
            threeModelGroup.children[i].material.dispose();
            threeModelGroup.children[i].material = null;
            threeModelGroup.children[i].children = [];
        }
        //移除材质编辑部分的模型
        for(var i = 0; i<editInfoSelectedObj.length; i++)
        {
            editInfoSelectedObj[i].geometry.dispose();
            editInfoSelectedObj[i].geometry.vertices = null;
            editInfoSelectedObj[i].geometry.faces = null;
            editInfoSelectedObj[i].geometry.faceVertexUvs = null;
            editInfoSelectedObj[i].geometry = null;
            editInfoSelectedObj[i].material.dispose();
            editInfoSelectedObj[i].material = null;
            editInfoSelectedObj[i].children = [];
            scene.remove(editInfoSelectedObj[i]);
        }
        while(polyhedrons.length) polyhedrons.pop();
        while(editInfoSelectedObj.length) editInfoSelectedObj.pop();
        scene.remove(threeModelGroup);
        threeModelGroup = new THREE.Group();

        //数据清空
        productFactor = 0 ; //用于修正vsg与场景比例的差异
        vsgArr = [];
        camPositionArr=[];//保存摄像机位置的数组
        camPositionNameArr=[];//保存摄像机位置名称的数组
        OriginalMaterial = []; //模型的材质数组，需要在场景释放之前清空
        lineGeo,lineMesh; //模型的geometry和mesh
        sceneConfigMap = {};
        modelDataV = [];
        modelDataT = [];
        modelDataF = [];
        modelDataM = [];
        modelDataNewN = [];
        currentBlockName = "";
        drawDataMap = {};
        packageTag = 0;
        drawCount = 0;
        polyhedrons=[];
        unDisplayModelArr = [];
        redrawModelArr = [];
    }

    /**
     * 隐藏场景中个单栋建筑
     * @param blockName 建筑的名称
     */
    function hideSingleModelByName(blockName) {
        for(var count=0; count<polyhedrons.length; count++){
            if(polyhedrons[count].name.indexOf(blockName)!=-1){
                polyhedrons[count].visible = false;
            }
        }
        if(blockName=='model5-6_jianzhuNewest'){
            forest.visible=false;
        }
    }

    /**
     * 显示场景中个单栋建筑
     * @param blockName 建筑的名称
     */
    function showSingleModelByName(blockName) {
        for(var count=0; count<polyhedrons.length; count++){
            if(polyhedrons[count].name.indexOf(blockName)!=-1){
                polyhedrons[count].visible = true;
            }
        }
        if(blockName=='model5-6_jianzhuNewest'){
            forest.visible=true;
        }
    }

    //处理鼠标移动
    //更新全局WebGL坐标系数组mouseVector
    //该函数依赖于场景基准坐标：windowWidth,windowHeight,windowStartX,windowStartY;
    //该函数以DOM2级事件处理程序的形式注册在initModel函数里
    const onMouseMove = function (event) {
        mouseVector.x = (event.clientX - windowStartX) / windowWidth * 2 - 1;
        mouseVector.y = -(event.clientY - windowStartY) / windowHeight * 2 + 1;
        // console.log(mouseVector);
    };


    /**
     * 场景构件选取函数，返回相交数组
     * @param meshArr Mesh数组，求交结果为数组的一部分
     * @param recursive 是否迭代子对象
     * @return 数组。元素表示相交集合。每个元素包含distance/point/object/face/faceIndex属性
     */
    const pickupMesh = function (meshArr, recursive = false) {
        raycaster_Global.setFromCamera(mouseVector, camera);
        return raycaster_Global.intersectObjects(meshArr, recursive);
    };

    const pickupMeshConsiderClipping = function(meshArr,recursive = false){
        let originalArr = pickupMesh(meshArr,recursive);
        if(clippingPlanes.length !== 0){
            //确定哪个剖面与当前射线最近
            //注意加入集合的是剖切对象的可视面
            const selection = pickupMesh(clippingPlanes.map((e)=>e._visiblePlane));
            if(selection.length > 0) {
                const leastDistance = selection[0].distance;
                const realIndex = originalArr.findIndex((element)=>{
                    return element.distance > leastDistance;
                });
                if(realIndex !== -1)
                    originalArr = originalArr.slice(realIndex);
            }

        }
        return originalArr;
    };


    function initSkyBox() {
        // Add Sky
        var sky = new THREE.Sky();
        sky.scale.setScalar( 450000 );
        scene.add( sky );
        // Add Sun Helper
        var sunSphere = new THREE.Mesh(
            new THREE.SphereBufferGeometry( 20000, 16, 8 ),
            new THREE.MeshBasicMaterial( { color: 0xffffff } )
        );
        sunSphere.position.y = - 700000;
        sunSphere.visible = false;
        scene.add( sunSphere );
        var effectController  = {
            turbidity: 10,
            rayleigh: 2,
            mieCoefficient: 0.005,
            mieDirectionalG: 0.8,
            luminance: 1,
            inclination: 0.49, // elevation / inclination
            azimuth: 0.25, // Facing front,
            sun: ! true
        };
        var distance = 400000;
        function guiChanged() {
            var uniforms = sky.material.uniforms;
            uniforms.turbidity.value = effectController.turbidity;
            uniforms.rayleigh.value = effectController.rayleigh;
            uniforms.luminance.value = effectController.luminance;
            uniforms.mieCoefficient.value = effectController.mieCoefficient;
            uniforms.mieDirectionalG.value = effectController.mieDirectionalG;
            var theta = Math.PI * ( effectController.inclination - 0.5 );
            var phi = 2 * Math.PI * ( effectController.azimuth - 0.5 );
            sunSphere.position.x = distance * Math.cos( phi );
            sunSphere.position.y = distance * Math.sin( phi ) * Math.sin( theta );
            sunSphere.position.z = distance * Math.sin( phi ) * Math.cos( theta );
            sunSphere.visible = effectController.sun;
            uniforms.sunPosition.value.copy( sunSphere.position );
            renderer.render( scene, camera );
        }
        guiChanged();

        var mesh = new THREE.Mesh(new THREE.PlaneGeometry(1000,1000), new THREE.MeshPhongMaterial({color:0xffffff,side:THREE.DoubleSide}));
        mesh.rotation.x = Math.PI/2;
        scene.add(mesh);
    }

    //保存相机位置的函数
    function SaveCamPosition(cnName,SaveCallback) {
        camPositionArr.push(Number(camera.position.x.toFixed(2))); //保存两位小数
        camPositionArr.push(Number(camera.position.y.toFixed(2)));
        camPositionArr.push(Number(camera.position.z.toFixed(2)));
        camPositionArr.push(Number(camControls.target.x.toFixed(2)));
        camPositionArr.push(Number(camControls.target.y.toFixed(2)));
        camPositionArr.push(Number(camControls.target.z.toFixed(2)));

        // var string=document.getElementById('camSaveBtnName').value;
        // var string=cnName;
        camPositionNameArr.push(cnName);

        //插入数据库操作
        var jsonPosArr = JSON.stringify( camPositionArr );
        var jsonNameArr = JSON.stringify( camPositionNameArr );
        console.log("正在保存摄像机位置，摄像机位置数组为："+jsonPosArr);
        var descriptionUrl = hostIP+"/uploadCameraLocation?buildingName="+currentBlockName+"&posArr=" + jsonPosArr+"&nameArr="+jsonNameArr;
        $.get(descriptionUrl,(resText)=> {
            console.log("保存摄像机位置成功");
            SaveCallback();
        });
    }


    //用于控制辅助测量小球的状态
    let isMeasuringBallDeleting = false;
    //用于存储量测额外加入的Mesh
    const additionalMeasuringMesh = [];
    //事件处理部分
    const auxiliaryMeasuringEvent = {
        _isHeightMeasuring:false,
        deleteTagControlOnClick() {
            const controlBtn = document.querySelector("#deleteTagControl");
            if (isMeasuringBallDeleting) {
                controlBtn.innerHTML = "添加小球状态";
                isMeasuringBallDeleting = false;
            } else {
                controlBtn.innerHTML = "删除小球状态";
                isMeasuringBallDeleting = true;
            }
        },
        //测距按钮的单击事件
        measureControlOnClick() {
            auxiliaryMeasuringEvent.clearAdditionalMeasuringMesh();
            //取得全部测量小球
            const alternatives = [];
            clippingPlanes.filter((e) => e._isActive).forEach((e) => {
                const visiblePlane = e._visiblePlane;
                if (visiblePlane.children.length > 0) {
                    alternatives.push(...visiblePlane.children);
                }
            });
            if (alternatives.length > 1) {
                const lineGeometry = new THREE.Geometry();
                let measureVector = null; //用于计算距离的临时变量
                let distance = 0;
                alternatives.forEach((ballMesh) => {
                    const tmpVector = new THREE.Vector3().copy(ballMesh.position).applyMatrix4(ballMesh.parent.matrixWorld);
                    ballMesh.parent.updateMatrixWorld();
                    if (measureVector === null) {
                        //如果是第一个向量，将其赋给用于计算距离的临时变量
                        measureVector = new THREE.Vector3().copy(tmpVector);
                    } else {
                        //否则，将距离叠加，并更新计算临时变量，使其指向下一个点
                        distance += measureVector.distanceTo(tmpVector);
                        measureVector.copy(tmpVector);
                    }
                    lineGeometry.vertices.push(tmpVector);
                });
                const line = new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({color: 0x000000}));
                additionalMeasuringMesh.push(line);
                scene.add(line);
                //设超时是为了令弹框在连线之后
                setTimeout(() => alert(`距离量测结果为：${distance}`), 100);

            } else {
                alert("至少需要两个小球才能进行测距！");
            }
        },
        //清空Mesh管理数组
        clearAdditionalMeasuringMesh() {
            while (additionalMeasuringMesh.length > 0) {
                const currentMesh = additionalMeasuringMesh.pop();
                //清空之前的测量线
                scene.remove(currentMesh);
                currentMesh.geometry.dispose();
                currentMesh.material.dispose();
            }
        },
        //层高测量按钮的点击事件,假设启用时处于剖切状态
        measureHeightOnClick(){
            if(auxiliaryMeasuringEvent._isHeightMeasuring){
                //关闭层高测量
                //清理可能多余的Mesh
                auxiliaryMeasuringEvent.clearAdditionalMeasuringMesh();
                //解除事件处理函数
                renderer.domElement.removeEventListener("click",auxiliaryMeasuringEvent.heightMeasuring);
                //重绑定事件处理函数
                renderer.domElement.addEventListener("click",onclickWhenClipping);
                //还原按钮文本
                document.querySelector("#measureHeight").innerHTML = "开始层高测量";
                auxiliaryMeasuringEvent._isHeightMeasuring = false;
            }else{
                //开始层高测量
                //去除剖面高亮状态
                ClippingPlane.cancelActive(clippingPlanes);
                //去除默认剖面处理函数
                renderer.domElement.removeEventListener("click",onclickWhenClipping);
                //绑定层高事件处理函数
                renderer.domElement.addEventListener("click",auxiliaryMeasuringEvent.heightMeasuring);
                //还原按钮文本
                document.querySelector("#measureHeight").innerHTML = "结束层高测量";
                auxiliaryMeasuringEvent._isHeightMeasuring = true;
            }
        },
        /**
         * 本函数响应垂直测量时的点击事件
         * @param e DOM event
         */
        heightMeasuring(e){
            //取场景构件作为备选
            const picked = pickupMeshConsiderClipping(polyhedrons,true);
            if(picked.length !== 0){
                const point = picked[0].point;
                const sampleBall = new THREE.Mesh(new THREE.SphereGeometry(1),
                    new THREE.MeshBasicMaterial({color:0xff0000}));
                sampleBall.position.copy(point);
                //加入外部数组方便管理
                additionalMeasuringMesh.push(sampleBall);
                scene.add(sampleBall);
            }
            //检查数组中的元素数量
            if(additionalMeasuringMesh.length === 2){
                //如果已经选中两个球，弹框提示垂直距离
                const y1 = additionalMeasuringMesh[0].position.y;
                const y2 = additionalMeasuringMesh[1].position.y;
                //加入延时是为了显示两个球后再弹框
                setTimeout(()=>{
                    alert(`两点之间的垂直距离为：${Math.abs(y1-y2)}`);
                    //清理现场
                    auxiliaryMeasuringEvent.clearAdditionalMeasuringMesh();
                },300);
            }else if(additionalMeasuringMesh.length > 2){
                //有BUG，直接清空数组
                auxiliaryMeasuringEvent.clearAdditionalMeasuringMesh();
            }
        }
    };

    const onclickWhenClipping = function (e) {
        e.preventDefault();
        //清除测量直线
        auxiliaryMeasuringEvent.clearAdditionalMeasuringMesh();
        //只选择剖切面
        const picked = pickupMesh(clippingPlanes.map((ele) => ele._visiblePlane));
        //如果单击时按住了Ctrl，表示平面选择模式
        //拖拽剖切面和添加测量小球必须在平面激活状态下才可用
        if (e.ctrlKey) {
            //处于激活编辑状态
            if (picked.length === 0) {
                //未击中任何构件则取消所有剖面的激活状态
                ClippingPlane.cancelActive(clippingPlanes);
            } else {
                let SELECTED = picked[0].object;
                SELECTED.upperObject.highLight();
                SELECTED.upperObject._isActive = true;

            }
        }

        //选中了激活的剖面对象
        if (picked.length !== 0 && picked[0].object.upperObject._isActive) {
            //击中的可视面（clippingPlane实例的子对象）
            const SELECTED = picked[0].object;
            //如果按住alt表示需要更改激活的剖切面
            if (e.altKey) {
                //如果当前Transform不可见，或即将更改绑定对象，就将其设为可见
                if (!transformControls.visible || transformControls.object !== SELECTED) {
                    transformControls.attach(SELECTED);
                } else {
                    //否则，令其不可见
                    transformControls.detach();
                }
                //这里增加逻辑是为了支持ctrl+alt同时按下直接进入编辑剖面状态
            } else if (!e.ctrlKey) {
                //普通点击（未按下ctrl 也没有按下 alt）
                //根据全局量决定处于增加测量小球还是删除测量小球状态
                if (!isMeasuringBallDeleting) {
                    //增加测量小球状态
                    const POINT = picked[0].point;
                    let markingBallMesh = new THREE.Mesh(new THREE.SphereGeometry(1),
                        new THREE.MeshBasicMaterial({color: 0xff0000}));
                    //直接对击中的点进行逆变换是可以的
                    markingBallMesh.position.copy(POINT);
                    SELECTED.updateMatrixWorld();
                    markingBallMesh.position.applyMatrix4(new THREE.Matrix4().getInverse(SELECTED.matrixWorld));
                    //但是把击中的点赋给mesh后对mesh做同样的变换就不行了，这是为什么？
                    // THREE.SceneUtils.attach(markingBallMesh,scene,SELECTED);
                    // markingBallMesh.applyMatrix(new THREE.Matrix4().getInverse(SELECTED.matrixWorld));
                    SELECTED.add(markingBallMesh);
                } else {
                    //删除测量小球状态
                    //由于此时只需点中激活面上小球，因此重新激发一次相交测试
                    //选出激活态可视平面的标识球
                    const alternatives = []; //标识球集合
                    clippingPlanes.filter((e) => e._isActive).forEach((e) => {
                        const visiblePlane = e._visiblePlane;
                        if (visiblePlane.children.length > 0) {   //可视剖面的子对象只可能是标识球
                            alternatives.push(...visiblePlane.children);
                        }
                    });
                    const picked = pickupMesh(alternatives);
                    if (picked.length > 0) {
                        //击中了标识球
                        const SELECTED = picked[0].object;
                        SELECTED.parent.remove(SELECTED);
                    }
                }
            }
        }

    };



    const onKeyDownWhenClipping = function (event) {
        if (event.key === "R" && event.shiftKey === true) {
            event.preventDefault();
            transformControls.setMode("rotate");
        }
        if (event.key === "T" && event.shiftKey === true) {
            event.preventDefault();
            transformControls.setMode("translate");
        }
    };

    const onObjectChangeWhenClipping = function () {
        clippingPlanes.forEach(
            (e) => e.alignToMesh()
        )
    };


    //剖切面构造函数
    //位置基于坐标
    //添加功能：指定剖面的坐标、改变可视平面大小、扩展至其他两个方向
    function ClippingPlane(scene, x = 2, y = 2) {
        //默认x，y方向对齐
        this._visiblePlane = new THREE.Mesh(new THREE.PlaneGeometry(x, y),
            new THREE.MeshPhongMaterial({
                color: Math.random() * 0xffffff,
                transparent: true,
                opacity: 0.2,
                side: THREE.DoubleSide,
                depthTest: false
            }));
        this._clippingPlane = new THREE.Plane();
        this._initialTransform = new THREE.Matrix4();
        //用于向DragControl中传递信息，表示拖动的是需要特殊处理剖切面
        this._isClippingPlane = true;
        //表示剖面是否激活
        this._isActive = false;
        //用于记录原始法向
        this._originalNormal = new THREE.Vector3();
        scene.add(this._visiblePlane);
        this._visiblePlane.upperObject = this;
        this._originalMaterial = this._visiblePlane.material;

    }

    /**
     * 废弃方法
     * ClippingPlane的静态方法，取消指定集合中剖切面的高亮
     * @param clippingPlaneSet
     */
    ClippingPlane.cancelHighlight = function (clippingPlaneSet) {
        console.warn("This method has been deprecated,using ClippingPlane.cancelActive instead.");
        // clippingPlaneSet.forEach((e) => {
        //     if (e._visiblePlane.material.opacity !== 0.2) {
        //         e._visiblePlane.material = e._originalMaterial;
        //     }
        // });
        ClippingPlane.cancelActive(clippingPlaneSet);
    };

    /**
     * 反激活集合中处于激活状态的平面
     * @param clippingPlaneSet
     */
    ClippingPlane.cancelActive = function (clippingPlaneSet) {
        clippingPlaneSet.forEach((e) => {
            if (e._isActive) {
                //gizmos
                transformControls.detach();
                //清除子物体
                while (e._visiblePlane.children.length > 0) {
                    e._visiblePlane.children.pop();
                }
                //还原材质
                e._visiblePlane.material = e._originalMaterial;
                e._isActive = false;
            }
        })
    };

    ClippingPlane.setHeightPair = function(min,max){
        let planeYMax,planeYMin;    //Max Min 表示所在位置的大小
        clippingPlanes.forEach((e)=>{
            if(e._originalNormal.y === -1){
                planeYMax = e;
            }
            if(e._originalNormal.y === 1){
                planeYMin = e;
            }
        });

        planeYMin._visiblePlane.position.y = min;
        planeYMax._visiblePlane.position.y = max;

        planeYMin.alignToMesh();
        planeYMax.alignToMesh();
    };


    ClippingPlane.prototype = {
        constructor: ClippingPlane,
        /**
         * 将剖切面对象和具体的Mesh绑定
         * @param mesh 要进行剖切的Mesh
         * 副作用：为传入的Mesh的材质添加剖面属性
         */
        setToMesh: function (mesh) {
            //加入递归子对象
            mesh.traverse((mesh)=>{
                if (mesh.material !== undefined) {
                    if (!Array.isArray(mesh.material.clippingPlanes)) {
                        mesh.material.clippingPlanes = [];
                    }
                    if (mesh.material.clippingPlanes.indexOf(this._clippingPlane) === -1) {
                        mesh.material.clippingPlanes.push(this._clippingPlane);
                    }
                }
            });
        },
        /**
         * 根据传入的法向量和可视平面上一点创建剖切面
         * @param normalVector THREE.Vector3 表示平面的法向
         * 副作用：求取并记录当前可视平面的变换矩阵的逆阵，用于在复合变换中消去多余变换
         */
        initializeFromMesh: function (normalVector) {
            if (normalVector instanceof THREE.Vector3) {
                this._visiblePlane.updateMatrix();
                this._initialTransform.copy(this._visiblePlane.matrix);
                this._clippingPlane.setFromNormalAndCoplanarPoint(normalVector,
                    this._visiblePlane.geometry.vertices[0].applyMatrix4(this._visiblePlane.matrix));
                this._initialTransform.getInverse(this._initialTransform);
            }
        },
        /**
         * 将实际剖切面对齐到可视平面
         */
        alignToMesh: function () {
            let tmpMatrix = new THREE.Matrix4();
            this._visiblePlane.updateMatrix();
            tmpMatrix.copy(this._visiblePlane.matrix);
            this._clippingPlane.normal.copy(this._originalNormal);
            this._clippingPlane.constant = 0;
            this._clippingPlane.applyMatrix4(tmpMatrix.multiply(this._initialTransform));
        },
        /**
         * 获取代表剖切面位置的矩阵
         * 对一个平面网格对象调用applyMatrix()方法可使Mesh对齐到Plane对象
         * @param plane THREE.Plane类型，要获取位置的Plane对象
         * 函数返回THREE.Matrix4类型矩阵
         */
        getPlaneAlignmentMatrix: function (plane) {
            // creates a matrix that aligns X/Y to a given plane
            // temporaries:
            var xAxis = new THREE.Vector3(),
                yAxis = new THREE.Vector3(),
                trans = new THREE.Vector3();  //初始化为(0,0,0)

            var zAxis = plane.normal,
                matrix = new THREE.Matrix4();

            // Hughes & Moeller '99
            // "Building an Orthonormal Basis from a Unit Vector."

            if (Math.abs(zAxis.x) > Math.abs(zAxis.z)) {
                yAxis.set(-zAxis.y, zAxis.x, 0);
            } else {
                yAxis.set(0, -zAxis.z, zAxis.y)
            }

            xAxis.crossVectors(yAxis.normalize(), zAxis);

            plane.coplanarPoint(trans); //求出平面上一点，存入trans中

            return matrix.set(
                xAxis.x, yAxis.x, zAxis.x, trans.x,
                xAxis.y, yAxis.y, zAxis.y, trans.y,
                xAxis.z, yAxis.z, zAxis.z, trans.z,
                0, 0, 0, 1);
        },
        /**
         * 先移动剖切面，再将可视平面与剖切面对齐
         * @param vec3 THREE.Vector3 传入的移动向量
         */
        normalMovement: function (vec3) {
            if (vec3 instanceof THREE.Vector3) {
                let matrix;
                vec3.clamp(new THREE.Vector3(-0.03, -0.03, -0.03), new THREE.Vector3(0.03, 0.03, 0.03));
                this._clippingPlane.translate(vec3);
                //获取剖切面的变换矩阵
                matrix = this._visiblePlane.matrix.clone();
                //这里如果继续连缀会有BUG，原因不明
                matrix.getInverse(matrix)
                    .multiplyMatrices(matrix, this.getPlaneAlignmentMatrix(this._clippingPlane));

                //将该变换施加给平面
                this._visiblePlane.applyMatrix(matrix);
            }
        },
        /**
         * 返回传入向量在剖切面法向量上的投影长度
         * @param vec3
         * @returns float
         */
        getNormalProjection: function (vec3) {
            if (vec3 instanceof THREE.Vector3) {
                return new THREE.Vector3().copy(vec3).dot(this._clippingPlane.normal);
            }
        },
        /**
         * 将可视平面在剖切面法向上移动相应数值的距离
         * @param distance NUMBER
         */
        moveMeshNormally: function (distance) {
            let normal = new THREE.Vector3().copy(this._clippingPlane.normal);
            let mesh = this._visiblePlane;
            mesh.translateOnAxis(normal, distance);
        },
        /**
         * 管理可见平面的旋转
         * 1表示平面法向与x轴正向对齐，2表示与y轴正向对齐，其他表示与z轴正向对齐（by default）
         */
        handleVisibleRotation: function (type) {
            let visiblePlane = this._visiblePlane;
            let tmpMatrix = new THREE.Matrix4();
            switch (type) {
                case 1:
                    tmpMatrix.makeRotationY(Math.PI / 2);
                    break;
                case 2:
                    tmpMatrix.makeRotationX(Math.PI / -2);
                    break;
                default:
                    break;
            }
            visiblePlane.geometry.vertices.forEach((ele) => ele.applyMatrix4(tmpMatrix));

        },
        /**
         * 初始化x-法向剖切面
         */
        initializeXAxis: function () {
            let scope = this;
            this.handleVisibleRotation(1);
            this.initializeFromMesh(new THREE.Vector3(1, 0, 0));
            this._originalNormal.copy(this._clippingPlane.normal);
            // console.log(this);
        },
        /**
         * 初始化y-法向剖切面,适用小坐标
         */
        initializeYAxis: function () {
            let scope = this;
            this.handleVisibleRotation(2);
            this.initializeFromMesh(new THREE.Vector3(0, 1, 0));
            this._originalNormal.copy(this._clippingPlane.normal);
            // console.log(this);
        },
        /**
         * 初始化z-法向剖切面
         */
        initializeZAxis: function () {
            let scope = this;
            // this.handleVisibleRotation();
            this.initializeFromMesh(new THREE.Vector3(0, 0, 1));
            this._originalNormal.copy(this._clippingPlane.normal);
            // console.log(this);
        },
        /**
         * 初始化x负法向剖切面，适用于较大的x坐标
         */
        initializeXNAxis: function () {
            this.handleVisibleRotation(1);
            this.initializeFromMesh(new THREE.Vector3(-1, 0, 0));
            this._originalNormal.copy(this._clippingPlane.normal);
        },
        /**
         * 初始化x负法向剖切面，适用于较大的x坐标
         */
        initializeYNAxis: function () {
            this.handleVisibleRotation(2);
            this.initializeFromMesh(new THREE.Vector3(0, -1, 0));
            this._originalNormal.copy(this._clippingPlane.normal);
        },
        /**
         * 初始化x负法向剖切面，适用于较大的x坐标
         * 不必对可视面几何元素进行处理，不调用handleRotation函数
         */
        initializeZNAxis: function () {
            this.initializeFromMesh(new THREE.Vector3(0, 0, -1));
            this._originalNormal.copy(this._clippingPlane.normal);
        },
        /**
         * 设定剖切对象的位置
         * @param distance 离开原点的有向（按剖切面法向量）距离
         * 注意X/Y/ZNAxis法向量为逆坐标轴向。
         * 传入正值将导致平面与该轴的交点坐标为负值
         * 因此对于X/Y/ZNAxis，若要使其与通过坐标t，应当向该函数传入-t
         */
        setAxialDistance: function (distance) {
            this.moveMeshNormally(distance);
            this.alignToMesh();
        },
        /**
         * 轴向移动可视面
         * 不应设定法向position
         */
        translateVisiblePlane: function (x = 0, y = 0, z = 0) {
            let visPlane = this._visiblePlane;
            if (x !== 0)
                visPlane.translateX(x);
            if (y !== 0)
                visPlane.translateY(y);
            if (z !== 0)
                visPlane.translateZ(z);
        },
        /**
         * 该函数专门处理由鼠标控制的旋转
         * 根据传入向量在平面法向量的投影大小决定旋转角度
         * 根据this._originalNormal的非零项决定旋转轴
         * 先移动可视Mesh，然后令剖面应用Mesh的matrix矩阵
         * @vec THREE.Vector3
         */
        processMouseRotation: function (vec) {
            let origin = this._originalNormal;
            let rotationMatrix = new THREE.Matrix4();
            let angle = this.getNormalProjection(vec) / 10;
            let visiblePlane = this._visiblePlane;
            if (angle > Math.PI / 200) angle = Math.PI / 200;
            else if (angle < Math.PI / -200) angle = Math.PI / -200;
            if (origin.y !== 0) {
                if (Math.abs(visiblePlane.rotation.z + angle) < Math.PI / 3)
                    rotationMatrix.makeRotationZ(angle);
            } else {
                if (Math.abs(visiblePlane.rotation.y + angle) < Math.PI / 3)
                    rotationMatrix.makeRotationY(angle);
            }
            visiblePlane.applyMatrix(rotationMatrix);
            //对齐剖面到可视面的工作由方法alignToMesh负责
        },
        /**
         * 该函数用于将选中平面高亮
         */
        highLight() {
            this._visiblePlane.material = new THREE.MeshBasicMaterial({
                color: 0xbbcc00,
                transparent: true,
                opacity: 0.4,
                side: THREE.DoubleSide,
                depthTest: false
            });

        }

    };

    /**
     * 启用剖切功能
     * @param meshArr 传入场景的Mesh集合，不受是否merge的影响
     */

    function enableClipping(meshArr = polyhedrons) {
        currentControlType = 2;
        //求取场景包围盒并扩展一个单位
        let box = new THREE.Box3();
        meshArr.forEach((e) => {
            box.expandByObject(e);
        });
        box.expandByScalar(1);
        //获取长宽高
        let size = box.getSize();
        //包围盒中心
        let center = new THREE.Vector3().addVectors(box.max, box.min).multiplyScalar(0.5);
        //size系一个包含x，y，z三个属性的对象，属性分别代表各方向的尺寸
        let x = size.x,
            y = size.y,
            z = size.z;
        // let x = 2*Math.max(Math.abs(box.max.x),Math.abs(box.min.x)),
        //     y = 2*Math.max(Math.abs(box.max.y),Math.abs(box.min.y)),
        //     z = 2*Math.max(Math.abs(box.max.z),Math.abs(box.min.z));


        //初始化剖切平面
        const MAX_XY = Math.max(x, y);
        const MAX_YZ = Math.max(z, y);
        const MAX_XZ = Math.max(x, z);

        let zAxisClippingPlane = new ClippingPlane(scene, x, y);
        zAxisClippingPlane.initializeZAxis();
        zAxisClippingPlane.translateVisiblePlane(center.x, center.y);
        zAxisClippingPlane.setAxialDistance(box.min.z);
        clippingPlanes.push(zAxisClippingPlane);

        let zNAxisClippingPlane = new ClippingPlane(scene, x, y);
        zNAxisClippingPlane.initializeZNAxis();
        zNAxisClippingPlane.translateVisiblePlane(center.x, center.y);
        zNAxisClippingPlane.setAxialDistance(-(box.max.z));
        clippingPlanes.push(zNAxisClippingPlane);

        let xAxisClippingPlane = new ClippingPlane(scene, z, y);
        xAxisClippingPlane.initializeXAxis();
        xAxisClippingPlane.translateVisiblePlane(0, center.y, center.z);
        xAxisClippingPlane.setAxialDistance(box.min.x);
        clippingPlanes.push(xAxisClippingPlane);

        let xNAxisClippingPlane = new ClippingPlane(scene, z, y);
        xNAxisClippingPlane.initializeXNAxis();
        xNAxisClippingPlane.translateVisiblePlane(0, center.y, center.z);
        xNAxisClippingPlane.setAxialDistance(-(box.max.x));
        clippingPlanes.push(xNAxisClippingPlane);

        let yAxisClippingPlane = new ClippingPlane(scene, x, z);
        yAxisClippingPlane.initializeYAxis();
        yAxisClippingPlane.translateVisiblePlane(center.x, 0, center.z);
        yAxisClippingPlane.setAxialDistance(box.min.y);
        clippingPlanes.push(yAxisClippingPlane);

        let yNAxisClippingPlane = new ClippingPlane(scene, x, z);
        yNAxisClippingPlane.initializeYNAxis();
        yNAxisClippingPlane.translateVisiblePlane(center.x, 0, center.z);
        yNAxisClippingPlane.setAxialDistance(-(box.max.y));
        clippingPlanes.push(yNAxisClippingPlane);

        renderer.localClippingEnabled = true;

        //剖切面之间互相截割
        clippingPlanes.forEach((e, i) => {
            clippingPlanes.forEach((ec, j) => {
                if (j !== i) {
                    ec.setToMesh(e._visiblePlane);
                }
            });
        });


        //将每个剖切对象应用于每一个Mesh
        clippingPlanes.forEach((planeObj) => {
            meshArr.forEach((mesh) => {
                planeObj.setToMesh(mesh);
            });
        });


        //设置Controls环境
        //初始化gizmos
        if (!(transformControls instanceof THREE.TransformControls)) {
            transformControls = new THREE.TransformControls(camera, renderer.domElement);
        }
        if (scene.children.indexOf(transformControls) === -1) {
            scene.add(transformControls);
        }


        //注册事件处理程序
        renderer.domElement.addEventListener("click", onclickWhenClipping);
        document.addEventListener("keydown", onKeyDownWhenClipping);
        transformControls.addEventListener("objectChange", onObjectChangeWhenClipping);

        ClippingPlane.setHeightPair(box.min.y,box.max.y);


    }

    /**
     * 关闭剖切功能
     * @param meshArray 当前场景的mesh集合，不受是否merge的影响
     */
    function disableClipping(meshArray = polyhedrons) {
        currentControlType = 1;
        //置空clippingPlanes数组
        while (clippingPlanes.length > 0) {
            let tmpClippingPlanes = clippingPlanes.pop();
            //先从场景中remove可视面
            scene.remove(tmpClippingPlanes._visiblePlane);
            //为避免内存泄漏,dispose可视面的material和geometry
            tmpClippingPlanes._visiblePlane.geometry.dispose();
            tmpClippingPlanes._visiblePlane.material.dispose();
        }
        //遍历Mesh集合，将mesh.material.clippingPlanes置空
        renderer.localClippingEnabled = false;
        meshArray.forEach((e) => {
            if (e.material){
                e.material.clippingPlanes = null;
            }
        });
        //清空测量直线
        auxiliaryMeasuringEvent.clearAdditionalMeasuringMesh();
        //删除Gizmos
        if(transformControls instanceof THREE.TransformControls){
            transformControls.detach();
            transformControls.removeEventListener("objectChange", onObjectChangeWhenClipping);
        }
        scene.remove(transformControls);

        //反注册事件处理程序
        renderer.domElement.removeEventListener("click", onclickWhenClipping);
        document.removeEventListener("keydown", onKeyDownWhenClipping);
    }


    //spirit
    const spritesArray = [];    //存放精灵全局数组

    const dblClickWhenSpriteEnabled = function (event) {
        event.preventDefault();
        const selectPoint = pickupMesh(polyhedrons);
        if (selectPoint) {
            const spriteMap = new THREE.TextureLoader().load("./image/sprite0.png");
            const spriteMaterial = new THREE.SpriteMaterial({
                map: spriteMap,
                color: 0xffffff,
                transparent: true
            });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.onBeforeRender = function (renderer) {
                renderer.clearDepth();
            };
            sprite.position.copy(selectPoint[0].point);
            spritesArray.push(sprite); //加入数组便于管理
            scene.add(sprite);
        }
    };

    const clickWhenSpriteEnabled = function (event) {
        //防止击中弹出窗口
        if (event.target !== renderer.domElement) return;

        const selectSpherePoint = pickupMesh(spritesArray);
        if(selectSpherePoint.length > 0) {
            //添加击中精灵球后的处理程序
            console.log('击中精灵球');
        }
    };

    const destroyAllSprite = function(){
        while(spritesArray.length > 0){
            const currentElement = spritesArray.pop();
            //清出场景
            scene.remove(currentElement);
            //避免内存泄漏的必要清理
            const material = currentElement.material;
            material.map.dispose();
            material.dispose();
        }
    };

    function disableCreateSprite(){
        spritesArray.forEach(function(value){
            value.visible= false;
        });
        //添加精灵球
        WebGLCanvasDom.removeEventListener("dblclick" ,dblClickWhenSpriteEnabled );
        //检测精灵球点击
        WebGLCanvasDom.removeEventListener("click" , clickWhenSpriteEnabled);
    };

    function enableCreateSprite() {
        spritesArray.forEach(function(value){
            value.visible=true;
        });
        //添加精灵球
        WebGLCanvasDom.addEventListener("dblclick" ,dblClickWhenSpriteEnabled );
        //检测精灵球点击
        WebGLCanvasDom.addEventListener("click" , clickWhenSpriteEnabled);
    }


    //场景编辑模块，按照首钢那套交互方式，对于Merge过的物体，先在原先的基础上创建一个新的，一模一样的，然后redraw，把以前的模型删掉
    //需要传进来原始数据模型，看看能不能通过属性的方式来调用
    //材质切换相关
    var ChangeMaterial1;
    var ChangeMaterial2;
    var mouse = { x: 0, y: 0 }, projector;
    projector = new THREE.Projector();

    var editInfoSelectedObj = []; // ？？
    var editInfoSelectedObj2=[];
    var textureURL = './assets/textures/column.jpg';
    var textureURL1 = './assets/textures/column1.jpg';
    var textureURL2 = './assets/textures/columns2.jpg';
    var textureURL3 = './assets/textures/floor1.jpg';

    var textureX = THREE.ImageUtils.loadTexture( textureURL );

    var textureX1 = THREE.ImageUtils.loadTexture( textureURL1 );

    var textureX2 = THREE.ImageUtils.loadTexture( textureURL2 );

    var textureX3 = THREE.ImageUtils.loadTexture( textureURL3 );


    /**
     *查询语义的函数
     * @param fileName
     */
    var smcComponentName = "";//全局变量，用于存放显示语义信息的构件名
    var smcBody = "";//全局变量，用于存放下载下来的语义信息

    function getComponentSMC(block) {
        var url='smc/smc'+block+'_smc.json';
        //var url=`smc/${block}.json`;
        $.get(url,(resText)=>{
            // var smcObj={};
            // resText.forEach(function (item) {
            //     smcObj[item["name"]]=item["smc"];
            // });
            //smcInfo[block]=smcObj;
            //console.log(JSON.stringify(smcInfo[block]));
            smcInfo[block]=resText;

            // var descriptionUrl = hostIP + "/returnDescription?collection="+currentBlockName+"_smc_describe&name=" + fileName;
            // $.get(descriptionUrl,(resText)=> {
            //     getSMCCallBack(result,resText);
            // });
        });
    }


    /**
     * 自定义语义信息
     */
    function updateSMC() {
        var newKey = document.getElementById('smcKeyInput').value;
        var newValue = document.getElementById('smcValueInput').value;
        smcBody[newKey] = newValue;
        var smcJson = JSON.stringify(smcBody);
        var url = hostIP + "/uploadSMC?collection="+currentBlockName+"_smc&name=" + smcComponentName+"&smc="+smcJson;
        $.get(url,(resText)=>{
            $(".smc-body-text").empty();//清空，不然会越加越多
            var showArr = [];
            for(var key in smcBody)
            {
                var tempStr = key + ":"  + smcBody[key];
                showArr.push(tempStr);
            }
            $(".smc-body-text").html(showArr.join("<br\>"));
            document.getElementById('smcKeyInput').value = "";
            document.getElementById('smcValueInput').value = "";
        });
    }

    /**
     * 模糊查询的函数以及先获取查询个数的函数
     * @constructor
     */
    function GetSearchComponentsCount(blockName,searchStr,callback){
        var url = hostIP+"/selectSetCount?collection="+blockName+"_smc&name=" + searchStr;
        $.get(url,(resText)=> {
            callback(resText);
        });
    }

    function SearchComponents(blockName,searchStr,page,callback) {
        var url = hostIP+"/selectSet?collection="+blockName+"_smc&name=" + searchStr+"&page="+page;
        $.get(url,(resText)=> {
            if(resText.length>0) {
                callback(resText);
            } else {
                //没有结果
                console.log("没有找到对应的结果");
            }
        });
    }


    /**
     * 用于处理来自数据库的其你去
     * @param str 按名称查询得到的构件结果集
     * @return {Array}
     */
    function parseNewFormatDat(str){
        return str[0].smc;
    }




    /**
     * 双击场景构件获取构件信息时调用
     * @param name 双击与实际构件交互时获取的merge过的构件名称
     * @param point 射线与构件相交的点
     * @returns {*}
     */
    function getComponentByNameAndPoint(name, point, flag){
        var offsetX,offsetY,offsetZ;
        offsetX=44000;
        offsetY=20000;
        offsetZ=30000;
        // offsetX=sceneConfigMap[currentBlockName].sceneBBoxMinX;
        // offsetY=sceneConfigMap[currentBlockName].sceneBBoxMinY;
        // offsetZ=sceneConfigMap[currentBlockName].sceneBBoxMinZ;

        //name的结构为block_type
        var pos1 = name.lastIndexOf("_");
        var currentBlock = name.substring(0,pos1);
        var componentType = name.substring(pos1+1);

        currentBlockName = currentBlock;

        var tempArray = [];  //用于存储比较构件
        var tempIndex = 0; //用于存放最小值索引
        var tempMinValue = 0xffffff;
        var temp;          //临时计算变量
        var tempFileNameIndexArr = [];
        // var indexX = Math.ceil((-point.x / sceneConfigMap[currentBlock].scale - offsetX + sceneConfigMap[currentBlock].sceneBBoxMinX )/sceneConfigMap[currentBlock].voxelSize) ;
        // var indexZ = Math.ceil((point.z / sceneConfigMap[currentBlock].scale + offsetY - sceneConfigMap[currentBlock].sceneBBoxMinY )/sceneConfigMap[currentBlock].voxelSize) ;
        // var indexY = Math.ceil((point.y / sceneConfigMap[currentBlock].scale + offsetZ - sceneConfigMap[currentBlock].sceneBBoxMinZ )/sceneConfigMap[currentBlock].voxelSize) ;
        var indexX = Math.ceil((-1*point.x / sceneConfigMap[currentBlock].scale - sceneConfigMap[currentBlock].sceneBBoxMinX )/sceneConfigMap[currentBlock].voxelSize) ;
        var indexZ = Math.ceil((point.z / sceneConfigMap[currentBlock].scale - sceneConfigMap[currentBlock].sceneBBoxMinY )/sceneConfigMap[currentBlock].voxelSize) ;
        var indexY = Math.ceil((point.y / sceneConfigMap[currentBlock].scale - sceneConfigMap[currentBlock].sceneBBoxMinZ )/sceneConfigMap[currentBlock].voxelSize) ;
        //减小误差
        if(indexX<=0){
            indexX=1;
        }
        if(indexY<=0){
            indexY=1;
        }
        if(indexZ<=0){
            indexZ=1;
        }
        var index = indexX + "-" + indexZ + "-" + indexY;
        console.log(index);
        // console.log(point.x ,point.y,point.z);
        //存放vsg块中所有的文件名
        var vsgFileArr = sceneConfigMap[currentBlock].vsg[index];
        if(vsgFileArr)
        {
            //将（除unDisplayModelArr之外）可能是点击中的同一类型的物体存入数组tempArray
            for(var i=0; i<vsgFileArr.length; i++)
            {
                //unDisplayModelArr用于存储不显示的模型，需要在适当的时候清空
                if(unDisplayModelArr.indexOf(vsgFileArr[i])==-1)
                {
                    var pos=vsgFileArr[i].indexOf("=");
                    var ind=vsgFileArr[i].substring(pos+1);
                    if(ind==componentType)
                    {
                        var newObj = drawModelByFileName(currentBlock,vsgFileArr[i],flag);
                        // scene.remove(newObj);
                        tempFileNameIndexArr.push(i);
                        tempArray.push(newObj);
                    }
                }
            }
            //从数组中找出距离最短的物体
            for(i = 0; i<tempArray.length ; i++){
                temp = pointObjectClosetDistance(point,tempArray[i]);
                if(temp < tempMinValue){
                    tempMinValue = temp;
                    tempIndex = i;
                }
            }
            //显示点击中的物体
            //模型比例不同需要同时将scale和position除比例系数（相对m的放大倍数）
            // tempArray[tempIndex].position.multiplyScalar(sceneConfigMap[currentBlock].scale);
            // tempArray[tempIndex].scale.multiplyScalar(sceneConfigMap[currentBlock].scale);
            // tempArray[tempIndex].name = vsgFileArr[tempFileNameIndexArr[tempIndex]] + "_copy";
            // tempArray[tempIndex].block =currentBlockName;
            // scene.add(tempArray[tempIndex]);
            return tempArray[tempIndex];
        }
    }


    /**
     * 根据构件名称绘制一个新的单独的没有merge过的构件
     * @param fileName 构件名称
     * @param dataInfo
     * @returns {*}
     */
    function drawModelByFileName(blockName,fileName,flag){
        currentBlockName = blockName;
        var geos = [];
        if(fileName!=null) {
            // if (modelDataNewN[currentBlockName] && modelDataNewN[currentBlockName][fileName]) {
            if (modelDataNewN[currentBlockName][fileName]) {
                let newName = modelDataNewN[currentBlockName][fileName];
                let matrix = modelDataM[currentBlockName][fileName];

                let reusenDataV = modelDataV[currentBlockName][newName];
                let reusenDataT = modelDataT[currentBlockName][newName];

                if (reusenDataV) {
                    for (var n = 0; n < reusenDataV.length; n++) {
                        var vets = [];
                        var componentGeo = new THREE.BufferGeometry();
                        for (var m = 0; m < reusenDataT[n].length; m++) {
                            let tri = 1.0 * reusenDataT[n][m];
                            let newN1 = reusenDataV[n][3 * tri] * matrix[0] + reusenDataV[n][3 * tri + 1] * matrix[4] + reusenDataV[n][3 * tri + 2] * matrix[8] + 1.0 * matrix[12];
                            let newN2 = reusenDataV[n][3 * tri] * matrix[1] + reusenDataV[n][3 * tri + 1] * matrix[5] + reusenDataV[n][3 * tri + 2] * matrix[9] + 1.0 * matrix[13];
                            let newN3 = reusenDataV[n][3 * tri] * matrix[2] + reusenDataV[n][3 * tri + 1] * matrix[6] + reusenDataV[n][3 * tri + 2] * matrix[10] + 1.0 * matrix[14];
                            // let ps_x=-newN1+offsetX;
                            // let ps_y=newN3-offsetZ;
                            // let ps_z=newN2-offsetY;
                            let ps_x = newN1;
                            let ps_y = newN2;
                            let ps_z = newN3;
                            vets.push(ps_x, ps_y, ps_z);
                        }
                        let vertices = new Float32Array(vets);
                        componentGeo.addAttribute('position', new THREE.BufferAttribute(vertices, 3));

                        geos.push(componentGeo);
                    }
                }
            }
            else {
                let tempDataT = modelDataT[currentBlockName][fileName];
                let tempDataV = modelDataV[currentBlockName][fileName];
                for (var n = 0; n < tempDataV.length; n++) {
                    let geometry_three = new THREE.BufferGeometry();
                    let vets = [];
                    for (var m = 0; m < tempDataT[n].length; m++) {
                        let tri = 1.0 * tempDataT[n][m];
                        let newn1 = 1.0 * tempDataV[n][3 * tri];
                        let newn2 = 1.0 * tempDataV[n][3 * tri + 1];
                        let newn3 = 1.0 * tempDataV[n][3 * tri + 2];
                        // let ps_x=-newn1+offsetX;
                        // let ps_y=newn3-offsetZ;
                        // let ps_z=newn2-offsetY;
                        let ps_x = newn1;
                        let ps_y = newn2;
                        let ps_z = newn3;
                        vets.push(ps_x, ps_y, ps_z);
                    }
                    let vertices = new Float32Array(vets);
                    geometry_three.addAttribute('position', new THREE.BufferAttribute(vertices, 3));

                    geos.push(geometry_three);
                }
            }
            var geos_merged = THREE.BufferGeometryUtils.mergeBufferGeometries(geos);

            geos_merged.applyMatrix(new THREE.Matrix4().set(
                -1,0,0,0,
                0,0,1,0,
                0,1,0,0,
                0,0,0,1));
            geos_merged.computeBoundingBox();
            geos_merged.computeFaceNormals();
            geos_merged.computeVertexNormals();
            if(flag==1&&currentBlockName=='model5-6_zhaoming'){
                // var vetex=document.getElementById('vertexShaderAtmosphere').innerHTML;
                // var fragment=document.getElementById('fragmentShaderAtmosphere').innerHTML;
                // var mt=new THREE.ShaderMaterial({
                //     uniforms: {
                //         "c": {
                //             type: "f",
                //             value: 0.8
                //         },
                //         "p": {
                //             type: "f",
                //             value: 0.5
                //         }
                //     },
                //     vertexShader: vetex,
                //     fragmentShader: fragment
                // });
                // var mesh=new THREE.Mesh(geos_merged,new THREE.MeshPhongMaterial({color:0xffffff,transparent:true,opacity:1,shininess:2000,side:THREE.DoubleSide}));
                var mesh=new THREE.Mesh(geos_merged,new THREE.MeshPhysicalMaterial({color:0xffffff,metalness:0.1,transparent:true,opacity:1,shininess:2000,emissive:0xffffcc,emissiveIntensity:0.3}));
                // var mesh=new THREE.Mesh(geos_merged,new THREE.MeshPhongMaterial({color:0xffffff,transparent:true,opacity:1,shininess:2000,emissive:0x777777,emissiveIntensity:0.5}));
                // initGUI(mesh.material);
            }
            else if(flag==1&&currentBlockName=='model5-6_tongnuan'){
                var mesh=new THREE.Mesh(geos_merged,new THREE.MeshPhysicalMaterial({color:0xffffff,metalness:0.1,transparent:true,opacity:1,shininess:2000}));
            }
            else if(flag==2&&currentBlockName!='model5-6_zhaoming'){
                var mesh = new THREE.Mesh(geos_merged, new THREE.MeshPhongMaterial({color: 0x00ffff,side:THREE.DoubleSide}));
            }
            // else{
            //     var mesh = new THREE.Mesh(geos_merged, new THREE.MeshPhongMaterial({color: 0xff0000,side:THREE.DoubleSide}));
            // }
            mesh.position.multiplyScalar(sceneConfigMap[currentBlockName].scale);
            mesh.scale.multiplyScalar(sceneConfigMap[currentBlockName].scale);
            mesh.name = fileName + "_copy";
            mesh.block=currentBlockName;

            polyhedrons.push(mesh);

            //下次点击不再显示
            unDisplayModelArr.push(fileName);
            return mesh;
        }
    }

    function initGUI(mat) {
        var Options = function() {
            this.emissive=mat.emissive;
            this.emissiveIntensity=mat.emissiveIntensity;
        };

        var gui = new dat.GUI();

        var options = new Options();
        gui.addColor( options, 'emissive' ).onChange( function ( val ) {
            mat.emissive.setHex( val );
            render();
        } );
        gui.add(options, 'emissiveIntensity', 0, 10).onChange( function ( val ) {
            mat.emissiveIntensity = val;
            render();
        } );
    }

    // function redrawComponentsCollectionByFileNameList(blockName,filenamelist,matUrl,repetVal,opacityVal) {
    //     var fileName = filenamelist[0];
    //     var typeName = fileName.substring(fileName.indexOf('=')+1);
    //     var newGeo = new THREE.Geometry();
    //     var newTexture = THREE.ImageUtils.loadTexture( matUrl );
    //     newTexture.wrapS = texture7.wrapT = THREE.RepeatWrapping;
    //     newTexture.repeat.set( repetVal, repetVal );
    //     var newMat = new THREE.MeshPhongMaterial( { color: 0xffffff, map: newTexture,side: THREE.DoubleSide, shininess:5000,opacity:opacityVal,transparent:true});
    //
    //     //删除模型
    //     for(var count=0; count<polyhedrons.length; count++){
    //         if(polyhedrons[count].name.indexOf(typeName)!=-1 && polyhedrons[count].name.indexOf(blockName)!=-1){
    //             threeModelGroup.remove(polyhedrons[count]);
    //             polyhedrons.splice(count, 1);
    //         }
    //     }
    //
    //     //绘制目标数组模型
    //     for(var i=0; i<filenamelist.length; i++){
    //         var tempFileName = filenamelist[i];
    //         if(redrawModelArr.indexOf(tempFileName)==-1) redrawModelArr.push(tempFileName);
    //         if (modelDataNewN[blockName] && modelDataNewN[blockName][tempFileName]) {
    //             var newName = modelDataNewN[blockName][tempFileName];
    //             var matrix = modelDataM[blockName][tempFileName];
    //             if(modelDataV[blockName][newName])
    //             {
    //                 modelDataV[blockName][tempFileName] = [];
    //                 for(var dataCount=0;dataCount<modelDataV[blockName][newName].length;dataCount++)
    //                 {
    //                     var vArrary = [];
    //                     var fArrary = [];
    //                     var vMetrix = [];
    //                     var fMetrix = [];
    //                     for (var j = 0; j < modelDataV[blockName][newName][dataCount].length; j += 3) {
    //                         var newN1 = modelDataV[blockName][newName][dataCount][j] * matrix[0] + modelDataV[blockName][newName][dataCount][j + 1] * matrix[4] + modelDataV[blockName][newName][dataCount][j + 2] * matrix[8] + 1.0 * matrix[12];
    //                         var newN2 = modelDataV[blockName][newName][dataCount][j] * matrix[1] + modelDataV[blockName][newName][dataCount][j + 1] * matrix[5] + modelDataV[blockName][newName][dataCount][j + 2] * matrix[9] + 1.0 * matrix[13];
    //                         var newN3 = modelDataV[blockName][newName][dataCount][j] * matrix[2] + modelDataV[blockName][newName][dataCount][j + 1] * matrix[6] + modelDataV[blockName][newName][dataCount][j + 2] * matrix[10]+ 1.0 * matrix[14];
    //                         vArrary.push(newN1);
    //                         vArrary.push(newN2);
    //                         vArrary.push(newN3);
    //                         var groupV = new THREE.Vector3(newN1, newN3, newN2);
    //                         vMetrix.push(groupV);
    //                     }
    //                     for (var m = 0; m < modelDataT[blockName][newName][dataCount].length; m += 3) {
    //                         var newT1 = 1.0 * modelDataT[blockName][newName][dataCount][m];
    //                         var newT2 = 1.0 * modelDataT[blockName][newName][dataCount][m + 1];
    //                         var newT3 = 1.0 * modelDataT[blockName][newName][dataCount][m + 2];
    //                         var grouT = new THREE.Face3(newT1, newT2, newT3);
    //                         fArrary.push(newT1);
    //                         fArrary.push(newT2);
    //                         fArrary.push(newT3);
    //                         fMetrix.push(grouT);
    //                     }
    //                     //绘制
    //                     var geometry_three = new THREE.Geometry();
    //                     geometry_three.vertices = vMetrix;
    //                     geometry_three.faces = fMetrix;
    //                     geometry_three.computeFaceNormals();
    //                     newGeo.merge(geometry_three);
    //                 }
    //             } else {
    //                 console.log("找不到modelDataV中对应的newName: "+newName);
    //             }
    //         } else if (modelDataV[blockName][tempFileName] && !(modelDataNewN[blockName] && modelDataNewN[blockName][tempFileName])) {
    //             for(var dataCount=0;dataCount<modelDataV[blockName][tempFileName].length;dataCount++)
    //             {
    //                 var vArrary = [];
    //                 var fArrary = [];
    //                 var vMetrix = [];
    //                 var fMetrix = [];
    //                 //处理V矩阵，变形
    //                 for (var j = 0; j < modelDataV[blockName][tempFileName][dataCount].length; j += 3) {
    //                     var newn1 = 1.0 * modelDataV[blockName][tempFileName][dataCount][j];
    //                     var newn2 = 1.0 * modelDataV[blockName][tempFileName][dataCount][j + 1];
    //                     var newn3 = 1.0 * modelDataV[blockName][tempFileName][dataCount][j + 2];
    //                     var groupV = new THREE.Vector3(newn1, newn3, newn2);
    //                     vArrary.push(newn1);
    //                     vArrary.push(newn2);
    //                     vArrary.push(newn3);
    //                     vMetrix.push(groupV);
    //                 }
    //                 //处理T矩阵
    //                 for (var m = 0; m < modelDataT[blockName][tempFileName][dataCount].length; m += 3) {
    //                     var newT1 = 1.0 * modelDataT[blockName][tempFileName][dataCount][m];
    //                     var newT2 = 1.0 * modelDataT[blockName][tempFileName][dataCount][m + 1];
    //                     var newT3 = 1.0 * modelDataT[blockName][tempFileName][dataCount][m + 2];
    //                     var grouT = new THREE.Face3(newT1, newT2, newT3);
    //                     fArrary.push(newT1);
    //                     fArrary.push(newT2);
    //                     fArrary.push(newT3);
    //                     fMetrix.push(grouT);
    //                 }
    //                 var geometry_three = new THREE.Geometry();
    //                 geometry_three.vertices = vMetrix;
    //                 geometry_three.faces = fMetrix;
    //                 geometry_three.computeFaceNormals();
    //                 var pos=tempFileName.indexOf("=");
    //                 var ind=tempFileName.substring(pos+1);
    //                 newGeo.merge(geometry_three);
    //             }
    //         }
    //     }
    //     //计算geometry的UV坐标
    //     if(newGeo.faces[0])
    //     {
    //         for(var i=0; i<newGeo.faces.length; ++i)
    //         {
    //             var normal = newGeo.faces[i].normal;
    //             normal.normalize();
    //             var directU,directV;
    //             if(String(normal.x) === '1' || String(normal.x) === '-1')
    //             {
    //                 directU = new THREE.Vector3(0,1,0);
    //                 directV = new THREE.Vector3(0,0,1);
    //             }
    //             else if(String(normal.z) === '1' || String(normal.z) === '-1')
    //             {
    //                 directU = new THREE.Vector3(0,1,0);
    //                 directV = new THREE.Vector3(1,0,0);
    //             }
    //             else
    //             {
    //                 directU = new THREE.Vector3(1,0,0);
    //                 directV = new THREE.Vector3(0,0,1);
    //             }
    //
    //             var uvArray = [];
    //             for(var j=0; j<3; ++j) {
    //                 var point;
    //                 if(j==0)
    //                     point = newGeo.vertices[newGeo.faces[i].a];
    //                 else if(j==1)
    //                     point = newGeo.vertices[newGeo.faces[i].b];
    //                 else
    //                     point = newGeo.vertices[newGeo.faces[i].c];
    //
    //                 var tmpVec = new THREE.Vector3();
    //                 tmpVec.subVectors(point, newGeo.vertices[0]);
    //
    //                 var u = tmpVec.dot(directU);
    //                 var v = tmpVec.dot(directV);
    //
    //                 uvArray.push(new THREE.Vector2(u, v));
    //             }
    //             newGeo.faceVertexUvs[0].push(uvArray);
    //         }
    //     }
    //     var newMesh = new THREE.Mesh(newGeo,newMat);
    //     newMesh.name = currentBlockName+'_'+typeName;
    //     newMesh.scale.set(modelScale,modelScale,modelScale);
    //     threeModelGroup.add(newMesh);
    //     polyhedrons.push(newMesh);
    //
    //     currentBlockName = blockName;
    //     //重新绘制该类模型
    //     drawModel(drawType[typeName]);
    //
    //     //重新记录一下所有模型的材质
    //     OriginalMaterial = [];
    //     for(var i=0;i<threeModelGroup.children.length;i++) {
    //         OriginalMaterial.push(threeModelGroup.children[i].material);
    //     }
    // }


    //输入点(THREE.Vector3)和要比较的对象(有THREE对象的Geometry属性)
    //返回距离最小值的平方
    function pointObjectClosetDistance(point, obj) {
        var triangles = getMeshTriangleVertices(obj);  //获取obj
        var tempMin = 0xffff;          //用于存放目前最短距离数值
        var temp = 0;                   //用于存放中间计算结果
        for(var i = 0 ; i<triangles.length ;i ++){
            temp= pointTriangleSquaredDistance(point,triangles[i][0],triangles[i][1],triangles[i][2]);
            if(temp<tempMin){
                tempMin = temp;
            }
        }
        return tempMin;
    }

    function getMeshTriangleVertices(object){
        var triangleV=[];
        object.updateMatrixWorld();
        var vert=[];
        var geo=new THREE.Geometry();
        geo.fromBufferGeometry(object.geometry);
        for(var i=0;i<geo.vertices.length;i++){
            var tempVer = geo.vertices[i].clone();
            tempVer = object.localToWorld(tempVer);
            vert.push(tempVer);
        }
        for(i=0;i<geo.faces.length;i++){
            var temp=[];
            temp.push(vert[geo.faces[i].a]);
            temp.push(vert[geo.faces[i].b]);
            temp.push(vert[geo.faces[i].c]);
            triangleV.push(temp);
        }
        return triangleV;
    }

    /** 计算一个dat的中心点
     * @param vertexArr
     * @returns {THREE.Vector3}
     */
    function getCenterPositionByVertexArr (vertexArr){
        var centroidVer = new THREE.Vector3();
        var max_x,min_x,max_y,min_y,max_z,min_z;
        var centroidLen = vertexArr.length;
        var arrayVer= [];
        for(var i=0;i<centroidLen;i++){
            arrayVer.push(vertexArr[i])
        }
        max_x = Number(arrayVer[0].x);
        min_x = Number(arrayVer[0].x);
        max_y = Number(arrayVer[0].y);
        min_y = Number(arrayVer[0].y);
        max_z = Number(arrayVer[0].z);
        min_z = Number(arrayVer[0].z);
        for(var i=0; i<centroidLen;i++){
            if(max_x<arrayVer[i].x){
                max_x =Number(arrayVer[i].x);
            }
            if(max_y<arrayVer[i].y){
                max_y =Number(arrayVer[i].y);
            }
            if(max_z<arrayVer[i].z){
                max_z =Number(arrayVer[i].z);
            }
        }
        for(var i=0; i<centroidLen;i++){
            if(min_x>arrayVer[i].x){
                min_x =Number(arrayVer[i].x);
            }
            if(min_y>arrayVer[i].y){
                min_y =Number(arrayVer[i].y);
            }
            if(min_z>arrayVer[i].z){
                min_z =Number(arrayVer[i].z);
            }
        }
        centroidVer.set(modelScale*(max_x+min_x)/2,modelScale*(max_y+min_y)/2,modelScale*(max_z+min_z)/2);
        // console.log(centroidVer);
        return centroidVer;
    }

    function getNewDataVByCnterPosAndVertexArr(centerPos,vertexArr) {
        var newDataV = [];
        for(var i=0;i<vertexArr.length; i++)
        {
            // var tempVector = new THREE.Vector3();
            // tempVector.subVectors(vertexArr[i]*modelScale,centerPos);
            newDataV.push((vertexArr[i].x*sceneConfigMap[currentBlockName].scale - centerPos.x)*1.01);
            newDataV.push((vertexArr[i].y*sceneConfigMap[currentBlockName].scale - centerPos.y)*1.01);
            newDataV.push((vertexArr[i].z*sceneConfigMap[currentBlockName].scale - centerPos.z)*1.01);
        }
        return newDataV;

    }

    function getVertexArrByVertexData(vertexData) {
        var vertexArr = [];
        for(var i=0; i<vertexData.length; i+=3)
        {
            var tempVec3 = new THREE.Vector3(vertexData[i],vertexData[i+2],vertexData[i+1]);
            vertexArr.push(tempVec3);
        }
        return vertexArr;
    }

    /**
     * 根据构件名称重新定位摄像机的位置
     * @param fileName 构件名
     * @param distance 距离中心点的距离
     * @returns 目标构件的坐标
     */
    function locatedToComponent(blockName,fileName,distance) {
        //因为不清楚要不要画模型出来，所以先不调用drawModelByFileName()了
        locatedModel = null;
        locatedModel = drawModelByFileName(blockName,fileName);
        if(locatedModel){
            locatedModel.material = new THREE.MeshPhongMaterial({color:0xff0000});
            ChangeCameraPos(locatedModel.position.x+distance,locatedModel.position.y+distance,locatedModel.position.z+distance);
            camControls.target.x = locatedModel.position.x;
            camControls.target.y = locatedModel.position.y;
            camControls.target.z = locatedModel.position.z;

            return locatedModel.position;
        }else{
            console.error('无法定位')
        }
    }

    /**
     * 从场景中删除定位到的模型
     */
    function deleteLocatedComponent() {
        scene.remove(locatedModel);
    }


    /**
     * 选中同一类构件
     * @param typeName
     * @returns {*}
     */
    function pickComponentsCollectionByTypeName(typeName) {
        for(var i=0; i<threeModelGroup.children.length; i++){
            if(threeModelGroup.children[i].name.indexOf(typeName)!=-1){
                pickedModel = threeModelGroup.children[i];
                pickedModel.originalMat = pickedModel.material;
                pickedModel.material = new THREE.MeshPhongMaterial({color:0xff0000});
            }
        }
    }

    /**
     * 选中同一类构件
     * @param typeName
     * @returns {*}
     */
    function dispickComponentsCollection() {
        pickedModel.material = pickedModel.originalMat;
    }


    /**
     * 材质切换相关代码
     * @type {Array}
     */
    var SavedMaterial = [];
    var SavedColor = [];
    var DroppedMaterial = [];
    var DroppedColor = [];


    function MaterialRedo(){
        var DroppedLength = DroppedMaterial.length;
        if(DroppedLength == 0)
        {
            window.alert("无可重做操作");
        }
        else
        {
            SavedMaterial.push(editInfoSelectedObj[editInfoSelectedObj.length - 1].material);
            SavedColor.push(editInfoSelectedObj[editInfoSelectedObj.length - 1].material.color.getStyle().colorHex());
            for(var i = 0; i < editInfoSelectedObj.length; i++) {
                editInfoSelectedObj[i].material = DroppedMaterial[DroppedLength - 1];
                editInfoSelectedObj[i].material.color = new THREE.Color(DroppedColor[DroppedColor.length - 1]);
            }

            DroppedMaterial.pop();
            DroppedColor.pop();
        }
    }

    function MaterialUndo(){
        var SavedLength = SavedMaterial.length;
        if(SavedLength == 0)
        {
            window.alert("无可撤回操作");
        }
        else
        {
            DroppedMaterial.push(editInfoSelectedObj[editInfoSelectedObj.length - 1].material);
            DroppedColor.push(editInfoSelectedObj[editInfoSelectedObj.length - 1].material.color.getStyle().colorHex());
            for(var i = 0; i < editInfoSelectedObj.length; i++) {
                editInfoSelectedObj[i].material = SavedMaterial[SavedLength - 1];
                editInfoSelectedObj[i].material.color = new THREE.Color(SavedColor[SavedColor.length - 1]);
            }
            SavedMaterial.pop();
            SavedColor.pop();
        }
    }

    $(".RedoUndoDiv Button").on("click",function(e){    //处理距离点的撤销与重置
        var btnClickedId= e.target.id;
        if(btnClickedId=="mundo"){                //处理属性切换的撤销与重置
            MaterialUndo();
        }else if(btnClickedId=="mredo"){
            MaterialRedo();
        }
    });

    //材质切换相关
    //为材质编辑UI注册事件处理程序
    // function newFunction()
    // {
    //     //#materialID 表示Type的材质选择下拉框
    //     document.getElementById("materialID").onchange=function()
    //     {
    //         console.log("调用material");
    //         var flag = document.getElementById("mapID").checked;
    //         //editInfoSelectedObj中Mesh均受影响
    //         //先将每个元素的原材质存入SavedMaterial
    //         //后检查是否勾选Map复选框，若勾上，则附贴图否则单纯变色
    //         //？？changeMaterial1/2有什么作用
    //         for(var i = 0 ; i < editInfoSelectedObj.length ; i++) {
    //             switch (this.value) {
    //                 case "1":
    //                     SavedMaterial.push(editInfoSelectedObj[i].material);
    //                     if (!flag)
    //                         editInfoSelectedObj[i].material = new THREE.MeshBasicMaterial({color: "red"});
    //                     else
    //                         editInfoSelectedObj[i].material = new THREE.MeshBasicMaterial({color: "red", map: texture});
    //                     ChangeMaterial1 = new THREE.MeshBasicMaterial({color: "red"});
    //                     ChangeMaterial2 = new THREE.MeshBasicMaterial({color: "red", map: texture});
    //                     // document.getElementById("colorID").value = "#ff0000";
    //                     //console.log(editInfoSelectedObj.material.color.getHex());
    //                     //document.getElementById("colorID").setHex(editInfoSelectedObj.material.color.getHex());
    //                     break;
    //                 case "2":
    //                     SavedMaterial.push(editInfoSelectedObj[i].material);
    //                     if (!flag)
    //                         editInfoSelectedObj[i].material = new THREE.MeshLambertMaterial({color: "yellow"});
    //                     else
    //                         editInfoSelectedObj[i].material = new THREE.MeshLambertMaterial({
    //                             color: "yellow",
    //                             map: texture
    //                         });
    //                     ChangeMaterial1 = new THREE.MeshLambertMaterial({color: "yellow"});
    //                     ChangeMaterial2 = new THREE.MeshLambertMaterial({color: "yellow", map: texture});
    //                     // document.getElementById("colorID").value = "#ffff00";
    //                     break;
    //                 case "3":
    //                     SavedMaterial.push(editInfoSelectedObj[i].material);
    //                     if (!flag)
    //                         editInfoSelectedObj[i].material = new THREE.MeshNormalMaterial();
    //                     else
    //                         editInfoSelectedObj[i].material = new THREE.MeshNormalMaterial({map: texture});
    //                     ChangeMaterial1 = new THREE.MeshNormalMaterial();
    //                     ChangeMaterial2 = new THREE.MeshNormalMaterial({map: texture});
    //                     break;
    //                 case "4":
    //                     SavedMaterial.push(editInfoSelectedObj[i].material);
    //                     if (!flag)
    //                         editInfoSelectedObj[i].material = new THREE.MeshDepthMaterial();
    //                     else
    //                         editInfoSelectedObj[i].material = new THREE.MeshDepthMaterial({map: texture});
    //                     ChangeMaterial1 = new THREE.MeshDepthMaterial();
    //                     ChangeMaterial2 = new THREE.MeshDepthMaterial({map: texture});
    //                     break;
    //                 case "5":
    //                     SavedMaterial.push(editInfoSelectedObj[i].material);
    //                     editInfoSelectedObj[i].material = new THREE.MeshPhongMaterial({color: "green"});
    //                     if (!flag)
    //                         editInfoSelectedObj[i].material = new THREE.MeshPhongMaterial({color: "green"});
    //                     else
    //                         editInfoSelectedObj[i].material = new THREE.MeshPhongMaterial({color: "green", map: texture});
    //                     ChangeMaterial1 = new THREE.MeshPhongMaterial({color: "green"});
    //                     ChangeMaterial2 = new THREE.MeshPhongMaterial({color: "green", map: texture});
    //                     // document.getElementById("colorID").value = "#00ff00";
    //                     break;
    //                 /*default:
    //                  editInfoSelectedObj.material = new THREE.MeshLambertMaterial({color: "blue"});
    //                  ChangeMaterial1.material = new THREE.MeshLambertMaterial({color: "blue"});
    //                  ChangeMaterial2.material = new THREE.MeshLambertMaterial({color: "blue"});
    //                  document.getElementById("colorID").value = "#0000ff";*/
    //             }
    //         }
    //         //？？将SavedMaterial pop editInfoSelectedObj.length - 1次
    //         for(var i = 0;i<editInfoSelectedObj.length-1; i++) {
    //             SavedMaterial.pop();
    //         }
    //     };
    //     //#colorID 表示 Color 颜色选择框的值
    //     document.getElementById("colorID").onchange=function()
    //     {
    //         //只将editInfoSelectedObj数组的最后一个元素的材质和颜色分别存入SavedMaterial与SavedColor
    //         SavedMaterial.push(editInfoSelectedObj[editInfoSelectedObj.length - 1].material);
    //         SavedColor.push(editInfoSelectedObj[editInfoSelectedObj.length - 1].material.color.getStyle().colorHex());
    //         console.log("调用color");
    //         //遍历editInfoSelectedObj，将其所有颜色均更改为当前选中的值
    //         for(var i = 0;i<editInfoSelectedObj.length; i++) {
    //             editInfoSelectedObj[i].material.color = new THREE.Color(this.value);
    //         }
    //         ChangeMaterial1.color = new THREE.Color(this.value);
    //         ChangeMaterial2.color = new THREE.Color(this.value);
    //     };
    //
    //     document.getElementById("roughnessID").onchange=function()
    //     {
    //         SavedMaterial.push(editInfoSelectedObj[editInfoSelectedObj.length - 1].material);
    //         for(var i = 0;i<editInfoSelectedObj.length; i++) {
    //             editInfoSelectedObj[i].material.roughness = this.value;
    //         }
    //         ChangeMaterial1.roughness = this.value;
    //         ChangeMaterial2.roughness = this.value;
    //     };
    //
    //     document.getElementById("metalnessID").onchange=function()
    //     {
    //         SavedMaterial.push(editInfoSelectedObj[editInfoSelectedObj.length - 1].material);
    //         for(var i = 0;i<editInfoSelectedObj.length; i++) {
    //             editInfoSelectedObj[i].material.metalness = this.value;
    //         }
    //         ChangeMaterial1.metalness = this.value;
    //         ChangeMaterial2.metalness = this.value;
    //     };
    //
    //     document.getElementById("emissiveID").onchange=function()
    //     {
    //         SavedMaterial.push(editInfoSelectedObj[editInfoSelectedObj.length - 1].material);
    //         for(var i = 0;i<editInfoSelectedObj.length; i++) {
    //             editInfoSelectedObj[i].material.emissive.setStyle(this.value);
    //         }
    //         ChangeMaterial1.emissive.setStyle(this.value);
    //         ChangeMaterial2.emissive.setStyle(this.value);
    //     };
    //
    //     document.getElementById("VTcolorID").onchange=function()
    //     {
    //         for(var i = 0;i<editInfoSelectedObj.length; i++) {
    //             switch (this.value) {
    //                 case "1":
    //                     SavedMaterial.push(editInfoSelectedObj[i].material);
    //                     editInfoSelectedObj[i].material.vertexColors = true;
    //                     ChangeMaterial1.vertexColors = true;
    //                     ChangeMaterial2.vertexColors = true;
    //                     break;
    //                 case "2":
    //                     SavedMaterial.push(editInfoSelectedObj[i].material);
    //                     editInfoSelectedObj[i].material.vertexColors = false;
    //                     ChangeMaterial1.vertexColors = false;
    //                     ChangeMaterial2.vertexColors = false;
    //                     break;
    //             }
    //         }
    //         for(var i = 0;i<editInfoSelectedObj.length-1; i++) {
    //             SavedMaterial.pop();
    //         }
    //     };
    //
    //     document.getElementById("skinningID").onclick=function()
    //     {
    //         SavedMaterial.push(editInfoSelectedObj[editInfoSelectedObj.length - 1].material);
    //         for(var i = 0;i<editInfoSelectedObj.length; i++) {
    //             editInfoSelectedObj[i].material.skinning = this.checked;
    //         }
    //         ChangeMaterial1.skinning = this.checked;
    //         ChangeMaterial2.skinning = this.checked;
    //     };
    //
    //     document.getElementById("mapID").onclick=function()
    //     {
    //         SavedMaterial.push(editInfoSelectedObj[editInfoSelectedObj.length - 1].material);
    //         for(var i = 0;i<editInfoSelectedObj.length; i++) {
    //             if (this.checked)
    //                 editInfoSelectedObj[i].material = ChangeMaterial2;
    //             else
    //                 editInfoSelectedObj[i].material = ChangeMaterial1;
    //         }
    //     };
    //
    //     document.getElementById("mapLoadID").onchange=function()
    //     {
    //         for(var i = 0;i<editInfoSelectedObj.length; i++) {
    //             switch (this.value) {
    //                 case "1":
    //                     SavedMaterial.push(editInfoSelectedObj[i].material);
    //                     editInfoSelectedObj[i].material.map = textureX;
    //                     break;
    //                 case "2":
    //                     SavedMaterial.push(editInfoSelectedObj[i].material);
    //                     editInfoSelectedObj[i].material.map = textureX1;
    //                     break;
    //                 case "3":
    //                     SavedMaterial.push(editInfoSelectedObj[i].material);
    //                     editInfoSelectedObj[i].material.map = textureX2;
    //                     break;
    //                 case "4":
    //                     SavedMaterial.push(editInfoSelectedObj[i].material);
    //                     editInfoSelectedObj[i].material.map = textureX3;
    //                     break;
    //             }
    //         }
    //         for(var i = 0;i<editInfoSelectedObj.length-1; i++) {
    //             SavedMaterial.pop();
    //         }
    //     };
    //
    //     document.getElementById("transparentID").onclick=function()
    //     {
    //         SavedMaterial.push(editInfoSelectedObj[editInfoSelectedObj.length - 1].material);
    //         console.log("transparent已更改");
    //         for(var i = 0;i<editInfoSelectedObj.length; i++) {
    //             editInfoSelectedObj[i].material.transparent = this.checked;
    //         }
    //         ChangeMaterial1.transparent = this.checked;
    //         ChangeMaterial2.transparent = this.checked;
    //     };
    //
    //     document.getElementById("opacityID").onchange=function()
    //     {
    //         SavedMaterial.push(editInfoSelectedObj[editInfoSelectedObj.length - 1].material);
    //         for(var i = 0;i<editInfoSelectedObj.length; i++) {
    //             editInfoSelectedObj[i].material.opacity = this.value;
    //         }
    //         ChangeMaterial1.opacity = this.value;
    //         ChangeMaterial2.opacity = this.value;
    //     };
    //
    //     document.getElementById("sideID").onchange=function()
    //     {
    //         for(var i = 0;i<editInfoSelectedObj.length; i++) {
    //             switch (this.value) {
    //                 case "1":
    //                     SavedMaterial.push(editInfoSelectedObj[i].material);
    //                     editInfoSelectedObj[i].material.side = THREE.FrontSide;
    //                     ChangeMaterial1.side = THREE.FrontSide;
    //                     ChangeMaterial2.side = THREE.FrontSide;
    //                     break;
    //                 case "2":
    //                     SavedMaterial.push(editInfoSelectedObj[i].material);
    //                     editInfoSelectedObj[i].material.side = THREE.BackSide;
    //                     ChangeMaterial1.side = THREE.BackSide;
    //                     ChangeMaterial2.side = THREE.BackSide;
    //                     break;
    //                 case "3":
    //                     SavedMaterial.push(editInfoSelectedObj[i].material);
    //                     editInfoSelectedObj[i].material.side = THREE.DoubleSide;
    //                     ChangeMaterial1.side = THREE.DoubleSide;
    //                     ChangeMaterial2.side = THREE.DoubleSide;
    //                     break;
    //             }
    //         }
    //         for(var i = 0;i<editInfoSelectedObj.length-1; i++) {
    //             SavedMaterial.pop();
    //         }
    //     };
    //
    //     document.getElementById("wireframeID").onclick=function()
    //     {
    //         SavedMaterial.push(editInfoSelectedObj[editInfoSelectedObj.length - 1].material);
    //         for(var i = 0;i<editInfoSelectedObj.length; i++) {
    //             editInfoSelectedObj[i].material.wireframe = this.checked;
    //         }
    //         ChangeMaterial1.wireframe = this.checked;
    //         ChangeMaterial2.wireframe = this.checked;
    //     };
    // }
    // newFunction();



    //材质切换相关
    //根据击中的构件反查对应的类型，并反映在UI上
    function ChangeView() {
        //console.log(editInfoSelectedObj);

        if(undefined != editInfoSelectedObj && editInfoSelectedObj.length != 0) {
            var tempEditInfoSelectedObjName = editInfoSelectedObj[editInfoSelectedObj.length - 1].name;
            var pos1 = tempEditInfoSelectedObjName.indexOf("=");
            var pos2 = tempEditInfoSelectedObjName.indexOf("_");
            var editInfoSelectedObjName = tempEditInfoSelectedObjName.substring(0,pos2);
            var editInfoSelectedObjType = tempEditInfoSelectedObjName.substring(pos1+1,pos2);
            document.getElementById("objectName").value =editInfoSelectedObjName;
            document.getElementById("objectId").value =editInfoSelectedObj[editInfoSelectedObj.length - 1].uuid;
            document.getElementById("objectType").value =editInfoSelectedObjType;
        }

        switch (editInfoSelectedObj[0].material.type)
        {
            case "MeshBasicMaterial":document.getElementById("materialID").value = 1;break;
            case "MeshLambertMaterial":document.getElementById("materialID").value = 2;break;
            case "MeshNormalMaterial":document.getElementById("materialID").value = 3;break;
            case "MeshDepthMaterial":document.getElementById("materialID").value = 4;break;
            case "MeshPhongMaterial":document.getElementById("materialID").value = 5;break;
        }

        //document.getElementById("mapID").checked = "checked";
        document.getElementById("transparentID").checked = editInfoSelectedObj[0].material.transparent;
        document.getElementById("opacityID").value = editInfoSelectedObj[0].material.opacity;
        // console.log("RGB(23, 245, 56)".colorHex());
        document.getElementById("colorID").value = editInfoSelectedObj[0].material.color.getStyle().colorHex();
        //document.getElementById("emissiveID").value = "#000000";
        document.getElementById("roughnessID").value = editInfoSelectedObj[0].material.roughness ? editInfoSelectedObj[0].material.roughness : 0;
        document.getElementById("metalnessID").value = editInfoSelectedObj[0].material.metalness ? editInfoSelectedObj[0].material.metalness : 0;
        document.getElementById("skinningID").checked = editInfoSelectedObj[0].material.skinning;
        document.getElementById("wireframeID").checked = editInfoSelectedObj[0].material.wireframe;

        switch (editInfoSelectedObj[0].material.side)
        {
            case 0:document.getElementById("sideID").value = 1;break;
            case 1:document.getElementById("sideID").value = 2;break;
            case 2:document.getElementById("sideID").value = 3;break;
        }

        switch (editInfoSelectedObj[0].material.map)
        {
            case textureX:document.getElementById("mapLoadID").value = 1;document.getElementById("mapID").checked = true;break;
            case textureX1:document.getElementById("mapLoadID").value = 2;document.getElementById("mapID").checked = true;break;
            case textureX2:document.getElementById("mapLoadID").value = 3;document.getElementById("mapID").checked = true;break;
            case textureX3:document.getElementById("mapLoadID").value = 4;document.getElementById("mapID").checked = true;break;
            default:document.getElementById("mapLoadID").value = 0;
                document.getElementById("mapID").checked = false;
        }

        switch (editInfoSelectedObj[0].material.vertexColors)
        {
            case 0:document.getElementById("VTcolorID").value = 2;break;
            case 1:document.getElementById("VTcolorID").value = 1;break;
        }
    }



    //碰撞检测
    function enableCollision(){
        var tempO=[];
        var CenterpointGroup=[];
        var CentervectorGroup=[];
        var CenterLWH=[];
        var AcovXX,AcovXY,AcovXZ,AcovYY,AcovYZ,AcovZZ,AX,AY,AZ,Al,Aw,Ah,tempX,tempY,tempZ;
        var CollisionMaterial=new THREE.MeshLambertMaterial({ color:  0xffff00} );
        for(var i=0;i<threeModelGroup.children.length;i++){
            tempO.push(threeModelGroup.children[i].material);
            var pointAVectors=[];
            AcovXX=AcovXY=AcovXZ=AcovYY=AcovYZ=AcovZZ=Al=Aw=Ah=tempX=tempY=tempZ=0;
            if(threeModelGroup.children[i].geometry.vertices){//存在没有顶点的物件？？？
                for(var v=0;v<threeModelGroup.children[i].geometry.vertices.length;v++) {
                    pointAVectors.push(new THREE.Vector3(threeModelGroup.children[i].geometry.vertices[v].x, threeModelGroup.children[i].geometry.vertices[v].y, threeModelGroup.children[i].geometry.vertices[v].z));
                }
                for(var v=0;v<threeModelGroup.children[i].geometry.vertices.length;v++) {
                    AcovXX+=pointAVectors[v].x*pointAVectors[v].x/threeModelGroup.children[i].geometry.vertices.length;
                    AcovXY+=pointAVectors[v].x*pointAVectors[v].y/threeModelGroup.children[i].geometry.vertices.length;
                    AcovXZ+=pointAVectors[v].x*pointAVectors[v].z/threeModelGroup.children[i].geometry.vertices.length;
                    AcovYY+=pointAVectors[v].y*pointAVectors[v].y/threeModelGroup.children[i].geometry.vertices.length;
                    AcovYZ+=pointAVectors[v].y*pointAVectors[v].z/threeModelGroup.children[i].geometry.vertices.length;
                    AcovZZ+=pointAVectors[v].z*pointAVectors[v].z/threeModelGroup.children[i].geometry.vertices.length;
                    tempX+=pointAVectors[v].x/threeModelGroup.children[i].geometry.vertices.length;
                    tempY+=pointAVectors[v].y/threeModelGroup.children[i].geometry.vertices.length;
                    tempZ+=pointAVectors[v].z/threeModelGroup.children[i].geometry.vertices.length;
                }
                CenterpointGroup.push(tempX);
                CenterpointGroup.push(tempY);
                CenterpointGroup.push(tempZ);
                var covarianceA=new THREE.Matrix3();
                covarianceA.set(AcovXX,AcovXY,AcovXZ,AcovXY,AcovYY,AcovYZ,AcovXZ,AcovYZ,AcovZZ);
                var vA=pMatrix(covarianceA);
                AX=new THREE.Vector3(vA.elements[0],vA.elements[1],vA.elements[2]);
                AY=new THREE.Vector3(vA.elements[3],vA.elements[4],vA.elements[5]);
                AZ=new THREE.Vector3(vA.elements[6],vA.elements[7],vA.elements[8]);
                CentervectorGroup.push(AX);//x
                CentervectorGroup.push(AY);//y
                CentervectorGroup.push(AZ);//z
                Al=Aw=Ah=0;
                for(var u=0;u<threeModelGroup.children[i].geometry.vertices.length;u++){
                    Al+=Math.abs(Dot(threeModelGroup.children[i].geometry.vertices[u],AX))/threeModelGroup.children[i].geometry.vertices.length;
                    Aw+=Math.abs(Dot(threeModelGroup.children[i].geometry.vertices[u],AY))/threeModelGroup.children[i].geometry.vertices.length;
                    Ah+=Math.abs(Dot(threeModelGroup.children[i].geometry.vertices[u],AZ))/threeModelGroup.children[i].geometry.vertices.length;
                }
                CenterLWH.push(Al);
                CenterLWH.push(Aw);
                CenterLWH.push(Ah);
            }
            else{
                CenterpointGroup.push(0);
                CenterpointGroup.push(0);
                CenterpointGroup.push(0);
                CentervectorGroup.push(new THREE.Vector3(1,0,0));//x
                CentervectorGroup.push(new THREE.Vector3(0,1,0));//y
                CentervectorGroup.push(new THREE.Vector3(0,0,1));//z
                CenterLWH.push(0);
                CenterLWH.push(0);
                CenterLWH.push(0);
            }
        }
        // OriginalMaterial=tempO;
        var OBBobject=new Object();
        OBBobject.centerpoints= [];
        OBBobject.vectorXYZ= [];
        OBBobject.lwhvalue= [];
        OBBobject.centerpoints=CenterpointGroup;
        OBBobject.vectorXYZ=CentervectorGroup;
        OBBobject.lwhvalue=CenterLWH;
        //var OBBworker=new Worker("OBBworker.js");
        OBBworker.postMessage(OBBobject);
        OBBworker.onmessage=function(e){
            for(var u=0;u<threeModelGroup.children.length;u++){
                if(e.data[u]!=0){
                    threeModelGroup.children[u].material=CollisionMaterial;
                }
            }
        };
        collisionShift=1;
    }

    function disableCollision(){
        for(var i=0;i<threeModelGroup.children.length;i++){
            threeModelGroup.children[i].material=OriginalMaterial[i];
        }
        collisionShift=0;
    }

    function pMatrix(k){
        var eps=1;
        var VMatrix=new THREE.Matrix3();
        VMatrix.set(1,0,0,0,1,0,0,0,1);
        var max=k.elements[1];
        var Apq,App,Aqq;
        var Angle,sina,sin2a,cosa,cos2a;
        do {
            var temp, location = 1;
            for (var a = 2; a < 9; a++) {
                if (a !== 4 && a !== 8) {
                    temp = k.elements[a];
                    if (temp > max) {
                        max = temp;
                        location = a;
                    }
                }
            }
            var col, row;
            col = parseInt(location / 3);//行
            row = location % 3;//列
            Apq=k.elements[col*3+row];
            App=k.elements[col*3+col];
            Aqq=k.elements[row*3+row];
            Angle=0.5*Math.atan2(-2*Apq,Aqq-App);
            sina = Math.sin(Angle);
            cosa = Math.cos(Angle);
            sin2a = Math.sin(2*Angle);
            cos2a=Math.cos(2*Angle);
            k.elements[col*3+col] = App*cosa*cosa + Aqq*sina*sina + 2*Apq*cosa*sina;
            k.elements[row*3+row] = App*sina*sina + Aqq*cosa*cosa - 2*Apq*cosa*sina;
            k.elements[col*3+row] = 0.5*(Aqq-App)*sin2a + Apq*cos2a;
            k.elements[row*3+col] = k.elements[col*3+row];
            for(var b = 0; b < 3; b ++)
            {
                if((b!=row) && (b!=col))
                {
                    var u = b*3 + col;
                    var w = b*3 + row;
                    max = k.elements[u];
                    k.elements[u]= k.elements[w]*sina + max*cosa;
                    k.elements[w]= k.elements[w]*cosa - max*sina;
                }
            }
            for (var c = 0; c < 3; c ++)
            {
                if((c!=row) && (c!=col))
                {
                    var u = col*3 + c;
                    var w = row*3 + c;
                    aax = k.elements[u];
                    k.elements[u]= k.elements[w]*sina + max*cosa;
                    k.elements[w]=k.elements[w]*cosa - max*sina;
                }
            }
            for(var d = 0; d < 3; d ++)
            {
                var u = d*3 + col;      //p
                var w = d*3 + row;      //q
                max = VMatrix.elements[u];
                VMatrix.elements[u] = VMatrix.elements[w]*sina + max*cosa;
                VMatrix.elements[w] = VMatrix.elements[w]*cosa - max*sina;
            }

        }while(max>=eps)
        for(var n=0;n<VMatrix.elements.length;n++)
            if(Math.abs(VMatrix.elements[n])<0.0000001)
                VMatrix.elements[n]=0;
        return VMatrix;
    }

    function Dot(a,b){
        return a.x*b.x+a.y*b.y+a.z*b.z;
    }


    //下载csv功能
    function downloadCSV(){
        var content = "data:text/csv;charset=utf-8,";
        var rows = vsgArr;
        var count = 1;

        rows.forEach( function(row,index){
                //console.log(row)
                content += row + ","+count+"\n";
                count++;
            }
        );
        var link = document.createElement("a");
        link.download = "myfile.csv";
        link.href = encodeURI(content);
        document.body.appendChild(link);
        link.click();
        ducument.removeChild(link);
        delete link;
    }


    function ShowHeight() {
        var url = hostIP + "/selectElevation?collection="+currentBlockName+"_smc";
        console.log(url);
        var btnNum=0;
        var heightStr=[];
        $.get(url,(resText)=>{
            var temp = resText;
            btnNum = temp.length;

            var MyDiv =document.getElementById("MyDiv");
            document.getElementById("MyDiv").innerHTML="";
            for(var num = 0; num<btnNum ;num++) {
                heightStr[num] = temp[num].smc["立面"];
            }
            //console.log(heightStr);
            for(var f= 0;f<btnNum - 1;f++){
                var button = document.createElement("button");
                button.id = f;
                button.innerHTML = "第"+(f+1)+"层";
                MyDiv.appendChild(button);
                button.onclick = function(event){
                    //console.log(heightStr[this.id]);
                    camera.position.y = parseFloat(1*heightStr[Number(event.currentTarget.id)]+1*heightStr[Number(event.currentTarget.id)+1])/2;
                    console.log(camera.position.y);
                }

            }
        });
    }

    function sceneConfigInfo(){
        this.sceneBBoxMinX=0;
        this.sceneBBoxMinY=0;
        this.sceneBBoxMinZ=0;
        this.voxelSize=0;
        this.vsg = {};
        this.scale = 0;
    }


    function ChangeCameraPos(posX,posY,posZ,targetX,targetY,targetZ) {
        camera.position.set(posX,posY,posZ);
        camControls.target = new THREE.Vector3(targetX,targetY,targetZ);
    }


    //用于暴露场景中是否添加轮廓线
    let MODEL_EDGE_ENABLED = false;
    let modelEdgeArr = [];

    //轮廓线函数
    /**
     * 将集合中构件添加轮廓线并绘制进场景
     * @param modelArr 要添加轮廓线的Mesh数组
     * @param scene    添加轮廓线的目标场景
     * @param edgeArr 将绘制出的轮廓线加入数组方便后续管理
     */
    const addModelEdge = (modelArr,scene,edgeArr = [])=>{
        modelArr.forEach((e)=>{
            const tmpEdgeGeo = new THREE.EdgesGeometry(e.geometry,5);
            const tmpLineMesh = new THREE.LineSegments(tmpEdgeGeo,new THREE.LineBasicMaterial({color:0x000000}));
            tmpLineMesh.scale.multiplyScalar(0.001);
            edgeArr.push(tmpLineMesh);
            scene.add(tmpLineMesh);
        })
    };

    /**
     * 示例函数，为全部场景构件添加轮廓线
     */
    const ShowLineModel = ()=> {
        if(MODEL_EDGE_ENABLED){
            while(modelEdgeArr.length > 0){
                const tmpMesh = modelEdgeArr.pop();
                scene.remove(tmpMesh);
                tmpMesh.geometry.dispose();
                tmpMesh.material.dispose();
                MODEL_EDGE_ENABLED = false;
            }
        }else{
            addModelEdge(polyhedrons,scene,modelEdgeArr);
            MODEL_EDGE_ENABLED = true;
        }
    };



    // function ShowNormalModel() {
    //     scene.remove(lineMesh);
    //     threeModelGroup.visible = true;
    //     for(var i=0; i<lineMesh.children.length;i++){
    //         lineMesh.children[i].geometry.dispose();
    //         lineMesh.children[i].material.dispose();
    //     }
    //     lineMesh = null;
    // }
    //
    // function ShowLineModel(){
    //     threeModelGroup.visible = false;
    //     lineMesh = new THREE.Group();
    //     for(var i=0;i<threeModelGroup.children.length;i++){
    //         var edgesGeo = new THREE.EdgesGeometry( threeModelGroup.children[i].geometry,1);
    //         var edges=new THREE.LineSegments( edgesGeo, new THREE.LineBasicMaterial( { color: 0xff0000,side:THREE.DoubleSide} ) );
    //         // edges.scale.multiplyScalar(sceneConfigMap[currentBlockName].scale);
    //         scene.add( edges );
    //         lineMesh.add(edges);
    //     }
    // }

    var strDownloadMime = "image/octet-stream";

    function getCapture() {
        var imgData, imgNode;

        try {
            var strMime = "image/jpeg";
            imgData = renderer.domElement.toDataURL(strMime);

            saveFile(imgData.replace(strMime, strDownloadMime), "test.jpg");

        } catch (e) {
            console.log(e);
            return;
        }
    }

    function saveFile(strData, filename) {
        var link = document.createElement('a');
        if (typeof link.download === 'string') {
            document.body.appendChild(link); //Firefox requires the link to be in the body
            link.download = filename;
            link.href = strData;
            link.click();
            document.body.removeChild(link); //remove the link when done
        } else {
            // location.replace(uri);
        }
    }

    function getBuildingHeight(blockName) {
        var height = sceneConfigMap[blockName].sceneBBoxMaxZ/modelScale;
        console.log("当前建筑物: "+blockName+"的高度为："+height);
        return height;
    }

    Three_Api = {
        InitThreeJSScene: initThreeJSScene,     //初始化Threejs场景
        InitModel: initModel,                   //在编辑界面生成模型
        GetBuildingArr: getBuildingArr,         //获取建筑物列表
        DestoryModel:destoryModel,              //清空编辑界面
        EnableClipping:enableClipping,          //打开剖切
        DisableClipping:disableClipping,        //关闭剖切
        EnableCollision:enableCollision,        //打开碰撞检测
        DisableCollisDion:disableCollision,      //关闭碰撞检测
        createMesh: createMesh,                 //创建模型，在MainThread中被调用
        DownDloadCSV:downloadCSV,                //下载统计数据文件到本地
        SaveCamPosition:SaveCamPosition,        //保存摄像机位置
        GetCamPosition:getCamPosition,        //保存摄像机位置
        LocatedToComponent:locatedToComponent,  //根据构件重新位摄像机的位置
        DeleteLocatedComponent:deleteLocatedComponent,  //从场景中删除定位到的模型
        ChangeCameraPos,                        //改变摄像机位置
        // ShowNormalModel,                        //显示正常模型
        ShowLineModel,                          //显示线框模型
        SearchComponents,                       //搜索模型，传入参数为搜索字符串
        GetSearchComponentsCount,               //获取搜索模型的结果的总个数
        PickComponentsCollectionByTypeName:pickComponentsCollectionByTypeName,     //根据名称选择同一类的构件
        // RedrawComponentsCollectionByFileNameList:redrawComponentsCollectionByFileNameList,  //根据名称列表对选中的模型进行重绘，传入的参数为：filenamelist,matUrl,repetVal,opacityVal
        DispickComponentsCollection:dispickComponentsCollection,     //取消选择同一类的构件
        UpdateSMC:updateSMC,                    //更新SMC数据
        ShowHeight:ShowHeight,                  //显示层高按钮
        DestroyAllSprite:destroyAllSprite,
        EnableCreateSprite:enableCreateSprite,
        DisableCreateSprite:disableCreateSprite,
        GetCapture:getCapture,                   //获取屏幕的截图
        GetBuildingHeight:getBuildingHeight,
        HideSingleModelByName:hideSingleModelByName,    //隐藏单套建筑
        ShowSingleModelByName:showSingleModelByName,     //显示单套建筑
        SaveCam:saveCam,
        LoadCam:loadCam,
        StartPick:startPick
    };

}());