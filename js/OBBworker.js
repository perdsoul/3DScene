var Vectors=[];
Vector3=function(x,y,z){
    this.x=x||0;
    this.y=y||0;
    this.z=z||0;
};

Vector3.prototype={
    length:function(){
        return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z);
    },
    normalize:function(){
        return new Vector3(this.x/this.length(),this.y/this.length(),this.z/this.length())
    },
    dot:function (v) {
        return this.x*v.x+this.y*v.y+this.z*v.z;
    }
};

function multi(t,a,b) {
    var a1,a2;
    if(a==0){
        a1=1;
        a2=2;
    }
    if(a==1){
        a1=2;
        a2=0;
    }
    if(a==2){
        a1=0;
        a2=1;
    }
    return Vectors[t].dot(Vectors[a2])*Vectors[a1].dot(Vectors[b])-Vectors[t].dot(Vectors[a1])*Vectors[a2].dot(Vectors[b]);
}


onmessage=function(a){
	var pointA,Axl,Ayw,Azh,Al,Aw,Ah,Ax,Ay,Az,pointB,Bxl,Byw,Bzh,Bl,Bw,Bh,Bx,By,Bz,Tl,T;
	var length=a.data.centerpoints.length/3;
	var temp=0;
	var result=[];
	for(var k=0;k<length;k++){
		result[k]=0;
	}
	for(var i=0;i<length-1;i++){
		for(var j=i+1;j<length;j++){
			temp=0;
			pointA=new Vector3(a.data.centerpoints[i*3],a.data.centerpoints[i*3+1],a.data.centerpoints[i*3+2]);
			pointB=new Vector3(a.data.centerpoints[j*3],a.data.centerpoints[j*3+1],a.data.centerpoints[j*3+2]);
			Ax=new Vector3(a.data.vectorXYZ[i*3].x,  a.data.vectorXYZ[i*3].y,  a.data.vectorXYZ[i*3].z);
			Ay=new Vector3(a.data.vectorXYZ[i*3+1].x,a.data.vectorXYZ[i*3+1].y,a.data.vectorXYZ[i*3+1].z);
			Az=new Vector3(a.data.vectorXYZ[i*3+2].x,a.data.vectorXYZ[i*3+2].y,a.data.vectorXYZ[i*3+2].z);
			Bx=new Vector3(a.data.vectorXYZ[j*3].x,  a.data.vectorXYZ[j*3].y,  a.data.vectorXYZ[j*3].z);
            By=new Vector3(a.data.vectorXYZ[j*3+1].x,  a.data.vectorXYZ[j*3+1].y,  a.data.vectorXYZ[j*3+1].z);
            Bz=new Vector3(a.data.vectorXYZ[j*3+2].x,  a.data.vectorXYZ[j*3+2].y,  a.data.vectorXYZ[j*3+2].z);
            Al=a.data.lwhvalue[i*3];
            Aw=a.data.lwhvalue[i*3+1];
            Ah=a.data.lwhvalue[i*3+2];
            Bl=a.data.lwhvalue[j*3];
            Bw=a.data.lwhvalue[j*3+1];
            Bh=a.data.lwhvalue[j*3+2];
            T = new Vector3(pointA.x-pointB.x,pointA.y-pointB.y,pointA.z-pointB.z);
            Vectors[0]=Ax;
            Vectors[1]=Ay;
            Vectors[2]=Az;
            Vectors[3]=Bx;
            Vectors[4]=By;
            Vectors[5]=Bz;
            Vectors[6]=T;
            for(var i2=0;i2<6;i2++){
                Tl=Math.abs(T.dot(Vectors[i2]));
                Axl=Math.abs(Al*Ax.dot(Vectors[i2]));
                Ayw=Math.abs(Aw*Ay.dot(Vectors[i2]));
                Azh=Math.abs(Ah*Az.dot(Vectors[i2]));
                Bxl=Math.abs(Bl*Bx.dot(Vectors[i2]));
                Byw=Math.abs(Bw*By.dot(Vectors[i2]));
                Bzh=Math.abs(Bh*Bz.dot(Vectors[i2]));
                if(Tl>Axl+Ayw+Azh+Bxl+Byw+Bzh){
                    temp++;
                }
            }
            for(var i3=0;i3<2;i3++){
                for(var j2=3;j2<6;j2++){
                    Tl=Math.abs(multi(6,i3,j2));
                    Axl=Math.abs(Al*multi(0,i3,j2));
                    Ayw=Math.abs(Aw*multi(1,i3,j2));
                    Azh=Math.abs(Ah*multi(2,i3,j2));
                    Bxl=Math.abs(Bl*multi(3,i3,j2));
                    Byw=Math.abs(Bw*multi(4,i3,j2));
                    Bzh=Math.abs(Bh*multi(5,i3,j2));
                    if(Tl>Axl+Ayw+Azh+Bxl+Byw+Bzh){
                        temp++;
                    }
                }
            }
            if(temp==0){
            	result[i]++;
            	result[j]++;
			}
		}
	}
	postMessage(result);
}