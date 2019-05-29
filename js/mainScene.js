(function() {
    let scene, camera, renderer, controls,light,obj;
    let container;
    let loader = new THREE.OBJLoader();
    let currentState = 0;
    let DPD;

    init();
    animate();

    function init() {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x566f87);
        camera = new THREE.PerspectiveCamera(
            70, window.innerWidth / window.innerHeight, 0.001, 1000000
        );
        camera.position.set(0, 0, 60);
        // renderer
        container = document.getElementById("container");
        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled =true;
        container.appendChild(renderer.domElement);

        // controls
        controls = new THREE.OrbitControls(
            camera, renderer.domElement
        );
        scene.add(new THREE.AmbientLight(0xffffff, 0.5));

        light = new THREE.SpotLight(0xffffff);
        light.position.set(camera.position.x, camera.position.y, camera.position.z);
        light.distance = 100;
        light.intensity = 0.2;
        obj = new THREE.Object3D();
        obj.position.set(0, 0, 5);
        scene.add(obj);
        light.target = obj;
        scene.add(light);

        window.addEventListener('resize', onWindowResize, false);

        initMesh();

        //接收主页面发送的设备数据对象
        window.addEventListener('message',function(event){
            DPD = event.data;
        });

        //获取二维数据
        let lampSts;
        setInterval(function(){
            lampSts = readData('电气',138,0);
            if(lampSts!=currentState && lampSts==1)
                turnOnLight();
            else if(lampSts!=currentState && lampSts==0)
                turnOffLight();
        },100);
    }


    //layer:电气,id:138,valId:0;
    //状态: 开：1 ，关：0 无数据：false;
    function readData(layer,id,valId){
        if(DPD!=undefined){
            return DPD[layer][id]['varValue'+valId][0]//1 开   0 关
        }else{
            return false;
        }
    }

    function initMesh() {
        loader.load('obj/test.obj', (obj) => {
            obj.scale.set(0.01,0.01,0.01);
            obj.children[1].geometry.computeBoundingBox();
            obj.children[1].material2 = new THREE.MeshPhysicalMaterial({emissive: 0xffffee, emissiveIntensity: 1, color: 0x000000});
            obj.name = "mainObj";
            scene.add(obj);
        });
    }

    function turnOnLight() {
        let obj = scene.getObjectByName("mainObj");
        switchMaterial(obj.children[1]);
        let myLight = new THREE.PointLight( 0xffee88, 0.5, 100, 2);
        myLight.name = "myLight";
        // bulbLight.add(new THREE.Mesh(new THREE.SphereBufferGeometry(10,10,10),new THREE.MeshBasicMaterial({color:0xff0000})));
        myLight.position.set(
            obj.children[1].geometry.boundingBox.getCenter().x,
            obj.children[1].geometry.boundingBox.getCenter().y,
            obj.children[1].geometry.boundingBox.getCenter().z-200);
        myLight.castShadow = true;
        obj.children[1].add( myLight );
        currentState = 1;
    }

    function turnOffLight() {
        let obj = scene.getObjectByName("mainObj");
        switchMaterial(obj.children[1]);
        obj.children[1].remove(obj.children[1].getObjectByName("myLight"));
        currentState = 0;
    }

    function switchMaterial(mesh) {
        let temp;
        temp = mesh.material;
        mesh.material = mesh.material2;
        mesh.material2 = temp;
    }

    function selectMaterialByType(type) {
        let color = new THREE.Color(0xff0000);
        switch (type) {
            case"IfcFooting":
                color = new THREE.Color(0xFFBFFF);
                break;
            case "IfcWallStandardCase"://ok
                color = new THREE.Color(0xaeb1b3);
                break;
            case "IfcSlab"://ok
                color = new THREE.Color(0x505050);
                break;
            case "IfcStair"://ok
                color = new THREE.Color(0xa4a592);
                break;
            case "IfcDoor"://ok
                color = new THREE.Color(0x6f6f6f);
                break;
            case "IfcWindow":
                color = new THREE.Color(0x9ea3ef);
                break;
            case "IfcBeam"://ok
                color = new THREE.Color(0x949584);
                break;
            case "IfcCovering":
                color = new THREE.Color(0x777a6f);
                break;
            case "IfcFlowSegment"://ok
                color = new THREE.Color(0x999999);
                break;
            case "IfcWall"://ok
                color = new THREE.Color(0xbb9f7c);
                break;
            case "IfcRamp":
                color = new THREE.Color(0x4d5053);
                break;
            case "IfcRailing"://ok
                color = new THREE.Color(0x4f4f4f);
                break;
            case "IfcFlowTerminal"://ok
                // color = new THREE.Color( 0xe9f5f8 );
                color = new THREE.Color(0xd5d5d5);
                break;
            case "IfcBuildingElementProxy"://ok
                color = new THREE.Color(0x6f6f6f);
                break;
            case "IfcColumn"://ok
                color = new THREE.Color(0x8a8f80);
                break;
            case "IfcFlowController"://ok
                color = new THREE.Color(0x2c2d2b);
                break;
            case "IfcFlowFitting"://ok
                color = new THREE.Color(0x93a5aa);
                break;
            case "IfcPlate"://ok外体窗户
                color = new THREE.Color(0x2a4260);
                break;
            case "IfcMember"://ok外体窗户
                color = new THREE.Color(0x2f2f2f);
                break;
            default:
                color = new THREE.Color(0x194354);
                break;
        }
        return color;
    }

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
        updateLight();
        controls.update();
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    //绑定灯光到摄像机
    function updateLight() {
        light.position.set(camera.position.x, camera.position.y, camera.position.z);
        let ps = camera.getWorldDirection();
        obj.position.set(
            camera.position.x + ps.x * 10,
            camera.position.y + ps.y * 10,
            camera.position.z + ps.z * 10
        );
        light.target = obj;
    }

})();
