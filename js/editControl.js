// $(function(){
//
//     var SavedMaterial = [];
//     var SavedColor = [];
//     var DroppedMaterial = [];
//     var DroppedColor = [];
//
//     var ChangeMaterial1;
//     var ChangeMaterial2;
//
//     var textureURL = './assets/textures/column.jpg';
//     var textureURL1 = './assets/textures/column1.jpg';
//     var textureURL2 = './assets/textures/columns2.jpg';
//     var textureURL3 = './assets/textures/floor1.jpg';
//
//     var textureX = THREE.ImageUtils.loadTexture( textureURL );
//
//     var textureX1 = THREE.ImageUtils.loadTexture( textureURL1 );
//
//     var textureX2 = THREE.ImageUtils.loadTexture( textureURL2 );
//
//     var textureX3 = THREE.ImageUtils.loadTexture( textureURL3 );
//
//     var editObj=Three_Api.editInfoSelectedObj;
//
//     function MaterialRedo(){
//         var DroppedLength = DroppedMaterial.length;
//         if(DroppedLength == 0)
//         {
//             window.alert("无可重做操作");
//         }
//         else
//         {
//             SavedMaterial.push(editObj[editObj.length - 1].material);
//             SavedColor.push(editObj[editObj.length - 1].material.color.getStyle().colorHex());
//             for(var i = 0; i < editObj.length; i++) {
//                 editObj[i].material = DroppedMaterial[DroppedLength - 1];
//                 editObj[i].material.color = new THREE.Color(DroppedColor[DroppedColor.length - 1]);
//             }
//
//             DroppedMaterial.pop();
//             DroppedColor.pop();
//         }
//     }
//
//     function MaterialUndo(){
//         var SavedLength = SavedMaterial.length;
//         if(SavedLength == 0)
//         {
//             window.alert("无可撤回操作");
//         }
//         else
//         {
//             DroppedMaterial.push(editObj[editObj.length - 1].material);
//             DroppedColor.push(editObj[editObj.length - 1].material.color.getStyle().colorHex());
//             for(var i = 0; i < editObj.length; i++) {
//                 editObj[i].material = SavedMaterial[SavedLength - 1];
//                 editObj[i].material.color = new THREE.Color(SavedColor[SavedColor.length - 1]);
//             }
//             SavedMaterial.pop();
//             SavedColor.pop();
//         }
//     }
//
//     $(".RedoUndoDiv Button").on("click",function(e){    //处理距离点的撤销与重置
//         var btnClickedId= e.target.id;
//         if(btnClickedId=="mundo"){                //处理属性切换的撤销与重置
//             MaterialUndo();
//         }else if(btnClickedId=="mredo"){
//             MaterialRedo();
//         }
//     });
//
//     //材质切换相关
//     //为材质编辑UI注册事件处理程序
//     function newFunction()
//     {
//         //#materialID 表示Type的材质选择下拉框
//         document.getElementById("materialID").onchange=function()
//         {
//             console.log("调用material");
//             var flag = document.getElementById("mapID").checked;
//             //editInfoSelectedObj中Mesh均受影响
//             //先将每个元素的原材质存入SavedMaterial
//             //后检查是否勾选Map复选框，若勾上，则附贴图否则单纯变色
//             //？？changeMaterial1/2有什么作用
//             for(var i = 0 ; i < editObj.length ; i++) {
//                 switch (this.value) {
//                     case "1":
//                         SavedMaterial.push(editObj[i].material);
//                         if (!flag)
//                             editObj[i].material = new THREE.MeshBasicMaterial({color: "red"});
//                         else
//                             editObj[i].material = new THREE.MeshBasicMaterial({color: "red", map: textureX});
//
//                         ChangeMaterial1 = new THREE.MeshBasicMaterial({color: "red"});
//                         ChangeMaterial2 = new THREE.MeshBasicMaterial({color: "red", map: textureX});
//
//                         // document.getElementById("colorID").value = "#ff0000";
//                         //console.log(editInfoSelectedObj.material.color.getHex());
//                         //document.getElementById("colorID").setHex(editInfoSelectedObj.material.color.getHex());
//                         break;
//                     case "2":
//                         SavedMaterial.push(editObj[i].material);
//                         if (!flag)
//                             editObj[i].material = new THREE.MeshLambertMaterial({color: "yellow"});
//                         else
//                             editObj[i].material = new THREE.MeshLambertMaterial({
//                                 color: "yellow",
//                                 map: texture
//                             });
//                         ChangeMaterial1 = new THREE.MeshLambertMaterial({color: "yellow"});
//                         ChangeMaterial2 = new THREE.MeshLambertMaterial({color: "yellow", map: textureX});
//                         // document.getElementById("colorID").value = "#ffff00";
//                         break;
//                     case "3":
//                         SavedMaterial.push(editObj[i].material);
//                         if (!flag)
//                             editObj[i].material = new THREE.MeshNormalMaterial();
//                         else
//                             editObj[i].material = new THREE.MeshNormalMaterial({map: texture});
//                         ChangeMaterial1 = new THREE.MeshNormalMaterial();
//                         ChangeMaterial2 = new THREE.MeshNormalMaterial({map: textureX});
//                         break;
//                     case "4":
//                         SavedMaterial.push(editObj[i].material);
//                         if (!flag)
//                             editObj[i].material = new THREE.MeshDepthMaterial();
//                         else
//                             editObj[i].material = new THREE.MeshDepthMaterial({map: texture});
//                         ChangeMaterial1 = new THREE.MeshDepthMaterial();
//                         ChangeMaterial2 = new THREE.MeshDepthMaterial({map: textureX});
//                         break;
//                     case "5":
//                         SavedMaterial.push(editObj[i].material);
//                         editObj[i].material = new THREE.MeshPhongMaterial({color: "green"});
//                         if (!flag)
//                             editObj[i].material = new THREE.MeshPhongMaterial({color: "green"});
//                         else
//                             editObj[i].material = new THREE.MeshPhongMaterial({color: "green", map: texture});
//                         ChangeMaterial1 = new THREE.MeshPhongMaterial({color: "green"});
//                         ChangeMaterial2 = new THREE.MeshPhongMaterial({color: "green", map: textureX});
//                         // document.getElementById("colorID").value = "#00ff00";
//                         break;
//                     /*default:
//                      editInfoSelectedObj.material = new THREE.MeshLambertMaterial({color: "blue"});
//                      ChangeMaterial1.material = new THREE.MeshLambertMaterial({color: "blue"});
//                      ChangeMaterial2.material = new THREE.MeshLambertMaterial({color: "blue"});
//                      document.getElementById("colorID").value = "#0000ff";*/
//                 }
//             }
//             //？？将SavedMaterial pop editInfoSelectedObj.length - 1次
//             for(var i = 0;i<editObj.length-1; i++) {
//                 SavedMaterial.pop();
//             }
//         };
//         //#colorID 表示 Color 颜色选择框的值
//         document.getElementById("colorID").onchange=function()
//         {
//             //只将editInfoSelectedObj数组的最后一个元素的材质和颜色分别存入SavedMaterial与SavedColor
//             SavedMaterial.push(editObj[editObj.length - 1].material);
//             SavedColor.push(editObj[editObj.length - 1].material.color.getStyle().colorHex());
//             console.log("调用color");
//             //遍历editInfoSelectedObj，将其所有颜色均更改为当前选中的值
//             for(var i = 0;i<editObj.length; i++) {
//                 editObj[i].material.color = new THREE.Color(this.value);
//             }
//             ChangeMaterial1.color = new THREE.Color(this.value);
//             ChangeMaterial2.color = new THREE.Color(this.value);
//         };
//
//         document.getElementById("roughnessID").onchange=function()
//         {
//             SavedMaterial.push(editObj[editObj.length - 1].material);
//             for(var i = 0;i<editObj.length; i++) {
//                 editObj[i].material.roughness = this.value;
//             }
//             ChangeMaterial1.roughness = this.value;
//             ChangeMaterial2.roughness = this.value;
//         };
//
//         document.getElementById("metalnessID").onchange=function()
//         {
//             SavedMaterial.push(editObj[editObj.length - 1].material);
//             for(var i = 0;i<editObj.length; i++) {
//                 editObj[i].material.metalness = this.value;
//             }
//             ChangeMaterial1.metalness = this.value;
//             ChangeMaterial2.metalness = this.value;
//         };
//
//         document.getElementById("emissiveID").onchange=function()
//         {
//             SavedMaterial.push(editObj[editObj.length - 1].material);
//             for(var i = 0;i<editObj.length; i++) {
//                 editObj[i].material.emissive.setStyle(this.value);
//             }
//             ChangeMaterial1.emissive.setStyle(this.value);
//             ChangeMaterial2.emissive.setStyle(this.value);
//         };
//
//         document.getElementById("VTcolorID").onchange=function()
//         {
//             for(var i = 0;i<editObj.length; i++) {
//                 switch (this.value) {
//                     case "1":
//                         SavedMaterial.push(editObj[i].material);
//                         editObj[i].material.vertexColors = true;
//                         ChangeMaterial1.vertexColors = true;
//                         ChangeMaterial2.vertexColors = true;
//                         break;
//                     case "2":
//                         SavedMaterial.push(editObj[i].material);
//                         editObj[i].material.vertexColors = false;
//                         ChangeMaterial1.vertexColors = false;
//                         ChangeMaterial2.vertexColors = false;
//                         break;
//                 }
//             }
//             for(var i = 0;i<editObj.length-1; i++) {
//                 SavedMaterial.pop();
//             }
//         };
//
//         document.getElementById("skinningID").onclick=function()
//         {
//             SavedMaterial.push(editObj[editObj.length - 1].material);
//             for(var i = 0;i<editObj.length; i++) {
//                 editObj[i].material.skinning = this.checked;
//             }
//             ChangeMaterial1.skinning = this.checked;
//             ChangeMaterial2.skinning = this.checked;
//         };
//
//         document.getElementById("mapID").onclick=function()
//         {
//             SavedMaterial.push(editObj[editObj.length - 1].material);
//             for(var i = 0;i<editObj.length; i++) {
//                 if (this.checked)
//                     editObj[i].material = ChangeMaterial2;
//                 else
//                     editObj[i].material = ChangeMaterial1;
//             }
//         };
//
//         document.getElementById("mapLoadID").onchange=function()
//         {
//             for(var i = 0;i<editObj.length; i++) {
//                 switch (this.value) {
//                     case "1":
//                         SavedMaterial.push(editObj[i].material);
//                         editObj[i].material.map = textureX;
//                         break;
//                     case "2":
//                         SavedMaterial.push(editObj[i].material);
//                         editObj[i].material.map = textureX1;
//                         break;
//                     case "3":
//                         SavedMaterial.push(editObj[i].material);
//                         editObj[i].material.map = textureX2;
//                         break;
//                     case "4":
//                         SavedMaterial.push(editObj[i].material);
//                         editObj[i].material.map = textureX3;
//                         break;
//                 }
//             }
//             for(var i = 0;i<editObj.length-1; i++) {
//                 SavedMaterial.pop();
//             }
//         };
//
//         document.getElementById("transparentID").onclick=function()
//         {
//             SavedMaterial.push(editObj[editObj.length - 1].material);
//             console.log("transparent已更改");
//             for(var i = 0;i<editObj.length; i++) {
//                 editObj[i].material.transparent = this.checked;
//             }
//             ChangeMaterial1.transparent = this.checked;
//             ChangeMaterial2.transparent = this.checked;
//         };
//
//         document.getElementById("opacityID").onchange=function()
//         {
//             SavedMaterial.push(editObj[editObj.length - 1].material);
//             for(var i = 0;i<editObj.length; i++) {
//                 editObj[i].material.opacity = this.value;
//             }
//             ChangeMaterial1.opacity = this.value;
//             ChangeMaterial2.opacity = this.value;
//         };
//
//         document.getElementById("sideID").onchange=function()
//         {
//             for(var i = 0;i<editObj.length; i++) {
//                 switch (this.value) {
//                     case "1":
//                         SavedMaterial.push(editObj[i].material);
//                         editObj[i].material.side = THREE.FrontSide;
//                         ChangeMaterial1.side = THREE.FrontSide;
//                         ChangeMaterial2.side = THREE.FrontSide;
//                         break;
//                     case "2":
//                         SavedMaterial.push(editObj[i].material);
//                         editObj[i].material.side = THREE.BackSide;
//                         ChangeMaterial1.side = THREE.BackSide;
//                         ChangeMaterial2.side = THREE.BackSide;
//                         break;
//                     case "3":
//                         SavedMaterial.push(editObj[i].material);
//                         editObj[i].material.side = THREE.DoubleSide;
//                         ChangeMaterial1.side = THREE.DoubleSide;
//                         ChangeMaterial2.side = THREE.DoubleSide;
//                         break;
//                 }
//             }
//             for(var i = 0;i<editObj.length-1; i++) {
//                 SavedMaterial.pop();
//             }
//         };
//
//         document.getElementById("wireframeID").onclick=function()
//         {
//             SavedMaterial.push(editObj[editObj.length - 1].material);
//             for(var i = 0;i<editObj.length; i++) {
//                 editObj[i].material.wireframe = this.checked;
//             }
//             ChangeMaterial1.wireframe = this.checked;
//             ChangeMaterial2.wireframe = this.checked;
//         };
//     }
//
//     newFunction();
//
//
//     //材质切换相关
//     //根据击中的构件反查对应的类型，并反映在UI上
//     // function ChangeView() {
//     //     //console.log(editInfoSelectedObj);
//     //
//     //     if(undefined != editObj && editObj.length != 0) {
//     //         var editObj = editObj[editObj.length - 1].name;
//     //         var pos1 = editObj.indexOf("=");
//     //         var pos2 = editObj.indexOf("_");
//     //         var editInfoSelectedObjName = tempEditInfoSelectedObjName.substring(0,pos2);
//     //         var editInfoSelectedObjType = tempEditInfoSelectedObjName.substring(pos1+1,pos2);
//     //         document.getElementById("objectName").value =editInfoSelectedObjName;
//     //         document.getElementById("objectId").value =editObj[editObj.length - 1].uuid;
//     //         document.getElementById("objectType").value =editInfoSelectedObjType;
//     //     }
//     //
//     //     switch (editObj[0].material.type)
//     //     {
//     //         case "MeshBasicMaterial":document.getElementById("materialID").value = 1;break;
//     //         case "MeshLambertMaterial":document.getElementById("materialID").value = 2;break;
//     //         case "MeshNormalMaterial":document.getElementById("materialID").value = 3;break;
//     //         case "MeshDepthMaterial":document.getElementById("materialID").value = 4;break;
//     //         case "MeshPhongMaterial":document.getElementById("materialID").value = 5;break;
//     //     }
//     //
//     //     //document.getElementById("mapID").checked = "checked";
//     //     document.getElementById("transparentID").checked = editObj[0].material.transparent;
//     //     document.getElementById("opacityID").value = editObj[0].material.opacity;
//     //     // console.log("RGB(23, 245, 56)".colorHex());
//     //     document.getElementById("colorID").value = editObj[0].material.color.getStyle().colorHex();
//     //     //document.getElementById("emissiveID").value = "#000000";
//     //     document.getElementById("roughnessID").value = editObj[0].material.roughness ? editObj[0].material.roughness : 0;
//     //     document.getElementById("metalnessID").value = editObj[0].material.metalness ? editObj[0].material.metalness : 0;
//     //     document.getElementById("skinningID").checked = editObj[0].material.skinning;
//     //     document.getElementById("wireframeID").checked = editObj[0].material.wireframe;
//     //
//     //     switch (editObj[0].material.side)
//     //     {
//     //         case 0:document.getElementById("sideID").value = 1;break;
//     //         case 1:document.getElementById("sideID").value = 2;break;
//     //         case 2:document.getElementById("sideID").value = 3;break;
//     //     }
//     //
//     //     switch (editObj[0].material.map)
//     //     {
//     //         case textureX:document.getElementById("mapLoadID").value = 1;document.getElementById("mapID").checked = true;break;
//     //         case textureX1:document.getElementById("mapLoadID").value = 2;document.getElementById("mapID").checked = true;break;
//     //         case textureX2:document.getElementById("mapLoadID").value = 3;document.getElementById("mapID").checked = true;break;
//     //         case textureX3:document.getElementById("mapLoadID").value = 4;document.getElementById("mapID").checked = true;break;
//     //         default:document.getElementById("mapLoadID").value = 0;
//     //             document.getElementById("mapID").checked = false;
//     //     }
//     //
//     //     switch (editObj[0].material.vertexColors)
//     //     {
//     //         case 0:document.getElementById("VTcolorID").value = 2;break;
//     //         case 1:document.getElementById("VTcolorID").value = 1;break;
//     //     }
//     // }
//
//
//
//
//
//
//
//
//
//
// });