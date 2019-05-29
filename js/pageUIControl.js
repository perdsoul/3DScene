// $(function () {
//     editWindow();
//     // editListener();
//
//     function editWindow(){
//         // $("#editToggle").click(function(){
//         //     $(".right").toggle("normal");
//         //     rightToggleCount++;
//         // });
//
//         // $("#updatelight").click(function(){
//         //     $("#light").toggle("normal");
//         // });
//
//         // $("#btn1").click(function(){
//         //     $("#windSystem").toggle("normal");
//         // });
//         //
//         // $("#btn2").click(function(){
//         //     $("#lightSystem").toggle("normal");
//         // });
//     }
//
//     // function editListener() {
//     //     let textureURL1 = './assets/textures/column.jpg';
//     //     let textureURL2 = './assets/textures/column1.jpg';
//     //     let textureURL3 = './assets/textures/columns2.jpg';
//     //     let textureURL4 = './assets/textures/floor1.jpg';
//     //
//     //     let texture1 = THREE.ImageUtils.loadTexture( textureURL1 );
//     //     let texture2 = THREE.ImageUtils.loadTexture( textureURL2 );
//     //     let texture3 = THREE.ImageUtils.loadTexture( textureURL3 );
//     //     let texture4 = THREE.ImageUtils.loadTexture( textureURL4 );
//     //
//     //     //材质类型监视器
//     //     document.getElementById("materialID").onchange=function(){
//     //         let id=document.getElementById("objectId").value;
//     //         let type=document.getElementById("objectType").value;
//     //         //存在选中构件
//     //         if(id!=''&&type!=''){
//     //             let editObj=Three_Api.editInfoSelectedObj;
//     //             let name=id+'='+type+'_copy';
//     //             for(var i=0;i<editObj.length;i++){
//     //                 if(editObj[i].name==name) break;
//     //             }
//     //
//     //             if(i==editObj.length){
//     //                 console.log('没有找到该构件！');
//     //             }else{
//     //                 let theObj=editObj[i];
//     //                 switch(this.value){
//     //                     case "1":
//     //                         theObj.material=new THREE.MeshBasicMaterial({color:"red"});
//     //                         break;
//     //                     case "2":
//     //                         theObj.material=new THREE.MeshLambertMaterial({color:"red"});
//     //                         break;
//     //                     case "3":
//     //                         theObj.material=new THREE.MeshNormalMaterial();
//     //                         break;
//     //                     case "4":
//     //                         theObj.material=new THREE.MeshDepthMaterial();
//     //                         break;
//     //                     case "5":
//     //                         theObj.material=new THREE.MeshPhongMaterial({color:"red"});
//     //                         break;
//     //                 }
//     //             }
//     //         }
//     //     };
//     //
//     //     document.getElementById("colorID").onchange=function(){
//     //         let id=document.getElementById("objectId").value;
//     //         let type=document.getElementById("objectType").value;
//     //         //存在选中构件
//     //         if(id!=''&&type!='') {
//     //             let editObj = Three_Api.editInfoSelectedObj;
//     //             let name = id + '=' + type + '_copy';
//     //             for (var i = 0; i < editObj.length; i++) {
//     //                 if (editObj[i].name == name) break;
//     //             }
//     //
//     //             if (i == editObj.length) {
//     //                 console.log('没有找到该构件！');
//     //             } else {
//     //                 let theObj = editObj[i];
//     //                 theObj.material.color = new THREE.Color(this.value);
//     //             }
//     //         }
//     //     };
//     //
//     //     document.getElementById("ShininessID").onchange=function(){
//     //         let id=document.getElementById("objectId").value;
//     //         let type=document.getElementById("objectType").value;
//     //         //存在选中构件
//     //         if(id!=''&&type!='') {
//     //             let editObj = Three_Api.editInfoSelectedObj;
//     //             let name = id + '=' + type + '_copy';
//     //             for (var i = 0; i < editObj.length; i++) {
//     //                 if (editObj[i].name == name) break;
//     //             }
//     //             if (i == editObj.length) {
//     //                 console.log('没有找到该构件！');
//     //             } else {
//     //                 let theObj = editObj[i];
//     //                 theObj.material.shininess= this.value;
//     //             }
//     //         }
//     //     };
//     //
//     //     // document.getElementById("roughnessID").onchange=function() {
//     //     //     let id = document.getElementById("objectId").value;
//     //     //     let type = document.getElementById("objectType").value;
//     //     //     //存在选中构件
//     //     //     if (id != '' && type != '') {
//     //     //         let editObj = Three_Api.editInfoSelectedObj;
//     //     //         let name = id + '=' + type + '_copy';
//     //     //         for (var i = 0; i < editObj.length; i++) {
//     //     //             if (editObj[i].name == name) break;
//     //     //         }
//     //     //
//     //     //         if (i == editObj.length) {
//     //     //             console.log('没有找到该构件！');
//     //     //         } else {
//     //     //             let theObj = editObj[i];
//     //     //             theObj.material.roughness = this.value;
//     //     //         }
//     //     //     }
//     //     // };
//     //
//     //     // document.getElementById("metalnessID").onchange=function(){
//     //     //     let id=document.getElementById("objectId").value;
//     //     //     let type=document.getElementById("objectType").value;
//     //     //     //存在选中构件
//     //     //     if(id!=''&&type!='') {
//     //     //         let editObj = Three_Api.editInfoSelectedObj;
//     //     //         let name = id + '=' + type + '_copy';
//     //     //         for (var i = 0; i < editObj.length; i++) {
//     //     //             if (editObj[i].name == name) break;
//     //     //         }
//     //     //
//     //     //         if (i == editObj.length) {
//     //     //             console.log('没有找到该构件！');
//     //     //         } else {
//     //     //             let theObj = editObj[i];
//     //     //             theObj.material.metal= this.value;
//     //     //         }
//     //     //     }
//     //     // };
//     //
//     //     document.getElementById("emissiveID").onchange=function(){
//     //         let id=document.getElementById("objectId").value;
//     //         let type=document.getElementById("objectType").value;
//     //         //存在选中构件
//     //         if(id!=''&&type!='') {
//     //             let editObj = Three_Api.editInfoSelectedObj;
//     //             let name = id + '=' + type + '_copy';
//     //             for (var i = 0; i < editObj.length; i++) {
//     //                 if (editObj[i].name == name) break;
//     //             }
//     //
//     //             if (i == editObj.length) {
//     //                 console.log('没有找到该构件！');
//     //             } else {
//     //                 let theObj = editObj[i];
//     //                 // theObj.material.emissive = new THREE.Color(this.value);
//     //                 theObj.material.emissive.setStyle(this.value);
//     //             }
//     //         }
//     //     };
//     //
//     //     document.getElementById("VTcolorID").onchange=function(){
//     //         let id=document.getElementById("objectId").value;
//     //         let type=document.getElementById("objectType").value;
//     //         //存在选中构件
//     //         if(id!=''&&type!='') {
//     //             let editObj = Three_Api.editInfoSelectedObj;
//     //             let name = id + '=' + type + '_copy';
//     //             for (var i = 0; i < editObj.length; i++) {
//     //                 if (editObj[i].name == name) break;
//     //             }
//     //             if (i == editObj.length) {
//     //                 console.log('没有找到该构件！');
//     //             } else {
//     //                 let theObj = editObj[i];
//     //                 switch (this.value) {
//     //                     case "1":
//     //                         theObj.material.vertexColors = true;
//     //                         break;
//     //                     case "2":
//     //                         theObj.material.vertexColors = false;
//     //                         break;
//     //                 }
//     //             }
//     //         }
//     //     };
//     //
//     //     // document.getElementById("skinningID").onclick=function()
//     //     // {
//     //     //     let id=document.getElementById("objectId").value;
//     //     //     let type=document.getElementById("objectType").value;
//     //     //     //存在选中构件
//     //     //     if(id!=''&&type!='') {
//     //     //         let editObj = Three_Api.editInfoSelectedObj;
//     //     //         let name = id + '=' + type + '_copy';
//     //     //         for (var i = 0; i < editObj.length; i++) {
//     //     //             if (editObj[i].name == name) break;
//     //     //         }
//     //     //
//     //     //         if (i == editObj.length) {
//     //     //             console.log('没有找到该构件！');
//     //     //         } else {
//     //     //             let theObj = editObj[i];
//     //     //             theObj.material.skinning = this.checked;
//     //     //         }
//     //     //     }
//     //     // };
//     //
//     //     document.getElementById("mapLoadID").onchange=function()
//     //     {
//     //         if(document.getElementById("mapID").checked==true){
//     //             let id=document.getElementById("objectId").value;
//     //             let type=document.getElementById("objectType").value;
//     //             //存在选中构件
//     //             if(id!=''&&type!='') {
//     //                 let editObj = Three_Api.editInfoSelectedObj;
//     //                 let name = id + '=' + type + '_copy';
//     //                 for (var i = 0; i < editObj.length; i++) {
//     //                     if (editObj[i].name == name) break;
//     //                 }
//     //
//     //                 if (i == editObj.length) {
//     //                     console.log('没有找到该构件！');
//     //                 } else {
//     //                     let theObj = editObj[i];
//     //                     switch(this.value){
//     //                         case "0":
//     //                             theObj.material.map=null;
//     //                             break;
//     //                         case "1":
//     //                             theObj.material.map=texture1;
//     //                             theObj.material.map.wrapS=theObj.material.map.wrapT=THREE.RepeatWrapping;
//     //                             break;
//     //                         case "2":
//     //                             theObj.material.map=texture2;
//     //                             theObj.material.map.wrapS=theObj.material.map.wrapT=THREE.RepeatWrapping;
//     //                             break;
//     //                         case "3":
//     //                             theObj.material.map=texture3;
//     //                             theObj.material.map.wrapS=theObj.material.map.wrapT=THREE.RepeatWrapping;
//     //                             break;
//     //                         case "4":
//     //                             theObj.material.map=texture4;
//     //                             theObj.material.map.wrapS=theObj.material.map.wrapT=THREE.RepeatWrapping;
//     //                             break;
//     //                     }
//     //
//     //                 }
//     //             }
//     //         }
//     //     };
//     //
//     //     document.getElementById("sideID").onchange=function() {
//     //         let id=document.getElementById("objectId").value;
//     //         let type=document.getElementById("objectType").value;
//     //         //存在选中构件
//     //         if(id!=''&&type!='') {
//     //             let editObj = Three_Api.editInfoSelectedObj;
//     //             let name = id + '=' + type + '_copy';
//     //             for (var i = 0; i < editObj.length; i++) {
//     //                 if (editObj[i].name == name) break;
//     //             }
//     //
//     //             if (i == editObj.length) {
//     //                 console.log('没有找到该构件！');
//     //             } else {
//     //                 let theObj = editObj[i];
//     //                 switch (this.value) {
//     //                     case "1":
//     //                         theObj.material.side = THREE.FrontSide;
//     //                         break;
//     //                     case "2":
//     //                         theObj.material.side = THREE.BackSide;
//     //                         break;
//     //                     case "3":
//     //                         theObj.material.side = THREE.DoubleSide;
//     //                         break;
//     //                 }
//     //             }
//     //         }
//     //     };
//     //
//     //     document.getElementById("transparentID").onclick=function()
//     //     {
//     //
//     //         let id=document.getElementById("objectId").value;
//     //         let type=document.getElementById("objectType").value;
//     //         //存在选中构件
//     //         if(id!=''&&type!='') {
//     //             let editObj = Three_Api.editInfoSelectedObj;
//     //             let name = id + '=' + type + '_copy';
//     //             for (var i = 0; i < editObj.length; i++) {
//     //                 if (editObj[i].name == name) break;
//     //             }
//     //
//     //             if (i == editObj.length) {
//     //                 console.log('没有找到该构件！');
//     //             } else {
//     //                 let theObj = editObj[i];
//     //                 theObj.material.transparent = this.checked;
//     //             }
//     //         }
//     //     };
//     //
//     //     document.getElementById("opacityID").onchange=function()
//     //     {
//     //         let id=document.getElementById("objectId").value;
//     //         let type=document.getElementById("objectType").value;
//     //         //存在选中构件
//     //         if(id!=''&&type!=''){
//     //             let editObj = Three_Api.editInfoSelectedObj;
//     //             let name = id + '=' + type + '_copy';
//     //             for (var i = 0; i < editObj.length; i++) {
//     //                 if (editObj[i].name == name) break;
//     //             }
//     //
//     //             if (i == editObj.length) {
//     //                 console.log('没有找到该构件！');
//     //             } else {
//     //                 let theObj = editObj[i];
//     //                 theObj.material.opacity = this.value;
//     //             }
//     //         }
//     //     };
//     //
//     //     document.getElementById("wireframeID").onclick=function()
//     //     {
//     //
//     //         let id=document.getElementById("objectId").value;
//     //         let type=document.getElementById("objectType").value;
//     //         //存在选中构件
//     //         if(id!=''&&type!='') {
//     //             let editObj = Three_Api.editInfoSelectedObj;
//     //             let name = id + '=' + type + '_copy';
//     //             for (var i = 0; i < editObj.length; i++) {
//     //                 if (editObj[i].name == name) break;
//     //             }
//     //
//     //             if (i == editObj.length) {
//     //                 console.log('没有找到该构件！');
//     //             } else {
//     //                 let theObj = editObj[i];
//     //                 theObj.material.wireframe = this.checked;
//     //             }
//     //         }
//     //     };
//     //
//     //
//     // }
//
//
//
// });
//
//
//
//
//
//
//
// // $(()=>{
// //     $("#editToggle").click(function(){
// //         $(".right").toggle("normal");
// //         rightToggleCount++;
// //
// //     });
// // });
// //
// // $(()=>{
// //     $("#updatelight").click(function(){
// //         $("#light").toggle("normal");
// //
// //     });
// // });
//
//
//
