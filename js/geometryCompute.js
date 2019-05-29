/**
 * Created by Administrator on 2016/7/29.
 */

const zero=1e-6;
var closetDistanceShow=[];   //用以存放示例位置

var clamp=function(a,min,max){
    if(a<min) return min;
    if(a>max) return max;
    return a;
};

function findArrayMinInformation(a){   //返回数组中最小元素及下标
    var min=[];
    min[0]=a[0];
    min[1]=0;
    for(var i=0;i<a.length;i++){
        if (min[0]>a[i]) {
            min[0]=a[i];
            min[1]=i;
        }

    }
    return min;
}


function closetPtPointTriangle(p,a,b,c){   //该函数返回三角面中距离参数p指定的点最近的点 (THREE.Vector3)
    // console.log(p);
    // console.log(a);
    // console.log(b);
    // console.log(c);




    var temp=new THREE.Vector3;

    var ab=new THREE.Vector3();
    ab.subVectors(b,a);
    var ac=new THREE.Vector3();
    ac.subVectors(c,a);
    var ap=new THREE.Vector3();
    ap.subVectors(p,a);
    var d1=ab.dot(ap);
    var d2=ac.dot(ap);
    if(d1<=zero && d2<=zero) return a;

    var bp=new THREE.Vector3();
    bp.subVectors(p,b);
    var d3=ab.dot(bp);
    var d4=ac.dot(bp);
    if(d3>=zero && d4<=d3) return b;

    var vc=d1*d4-d3*d2;
    if(vc<=zero && d1>=zero &&d3<=zero){
        v=d1/(d1-d3);
        return temp.addVectors(a,ab.multiplyScalar(v));
    }

    var cp=new THREE.Vector3();
    cp.subVectors(p,c);
    var d5=ab.dot(cp);
    var d6=ac.dot(cp);
    if(d6>=zero && d5<=d6) return c;

    var vb=d5*d2-d1*d6;
    if(vb<=zero && d2>=zero && d6<=zero){
        var w=d2/(d2-d6);
        return temp.addVectors(a,ac.multiplyScalar(w));
    }

    var va=d3*d6-d5*d4;
    if(va<=zero && (d4-d3)>=zero && (d5-d6)>=zero){
        var temp2=THREE.Vector3();
        w=(d4-d3)/((d4-d3)+(d5-d6));
        temp2= c.clone();
        temp2.sub(b);
        temp2.multiplyScalar(w);
        temp.addVectors(b,temp2);
        return temp;

    }

    var denom=1/(va+vb+vc);
    var v =vb*denom;
    w =vc*denom;
    temp.addVectors(a,ab.multiplyScalar(v));
    temp.add(ac.multiplyScalar(w));
    return temp;

}
//参数均为THREE.Vector3  ,p为需要比较的点，a,b,c为决定三角面的三点
function pointTriangleSquaredDistance(p,a,b,c){   //返回点到三角最近距离的平方
    var point=closetPtPointTriangle(p,a,b,c);
    return p.distanceToSquared(point);
}

function segmentSegmentClosetPoints(p1,q1,p2,q2){
    var d1=new THREE.Vector3();
    d1.subVectors(q1,p1);
    var d2=new THREE.Vector3();
    d2.subVectors(q2,p2);

    var r=new THREE.Vector3();
    r.subVectors(p1,p2);
    var s1=new THREE.Vector3();
    var s2=new THREE.Vector3();
    var a=d1.dot(d1);
    var e=d2.dot(d2);
    var s=0;
    var t=0;
    if(a<zero){      //consider that the segment degenerate to point
        if(e<zero){
            return r.dot(r);
        }
        t= r.dot(d2)/e;
        t=clamp(t,0,1);
    }else if(e<zero){
        s=-r.dot(d1)/a;
        s=clamp(s,0,1);
    }else{
        var b=d1.dot(d2);
        var f=r.dot(d2);
        var c=r.dot(d1);
        var judge=a*e-b*b;
        if(judge<zero){
            s=0;
            t=f/e;
        }else {
            s = clamp((b * f - c * e) / judge, 0, 1);
            t = (b * s + f) / e;

        }


            if(t<0){
                t=0;
                s=clamp(-c/a,0,1);
            }else if(t>1){
                t=1;
                s=clamp((b-c)/a,0,1);
            }


    }

    s1.addVectors(p1,d1.multiplyScalar(s));
    s2.addVectors(p2,d2.multiplyScalar(t));
    return [s1,s2];

}

function segmentSegmentSquaredDistance(p1,q1,p2,q2){
    var temp=segmentSegmentClosetPoints(p1,q1,p2,q2);
    return temp[0].distanceToSquared(temp[1]);
}



function triangleTriangleSquaredInformation(a,b,c,d,e,f){
    var values=[];
    values.push(segmentSegmentSquaredDistance(a,b,d,e));
    values.push(segmentSegmentSquaredDistance(a,b,d,f));
    values.push(segmentSegmentSquaredDistance(a,b,e,f));
    values.push(segmentSegmentSquaredDistance(a,c,d,e));
    values.push(segmentSegmentSquaredDistance(a,c,d,f));
    values.push(segmentSegmentSquaredDistance(a,c,e,f));
    values.push(segmentSegmentSquaredDistance(b,c,d,e));
    values.push(segmentSegmentSquaredDistance(b,c,d,f));
    values.push(segmentSegmentSquaredDistance(b,c,e,f));
    values.push(pointTriangleSquaredDistance(a,d,e,f));
    values.push(pointTriangleSquaredDistance(b,d,e,f));
    values.push(pointTriangleSquaredDistance(c,d,e,f));
    values.push(pointTriangleSquaredDistance(d,a,b,c));
    values.push(pointTriangleSquaredDistance(e,a,b,c));
    values.push(pointTriangleSquaredDistance(f,a,b,c));
    return findArrayMinInformation(values);

}


//a,b,c决定第一个三角面，d、e、f决定第二个三角面
//调用本方法返回两个三角面之间最近的距离
function triangleTriangleSquaredDistance(a,b,c,d,e,f){
    return triangleTriangleSquaredInformation(a,b,c,d,e,f)[0];
}





