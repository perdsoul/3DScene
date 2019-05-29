importScripts("../lib/jquery.nodom.js");
onmessage=function (event) {
    let url="../test.rar";//要测试的数据文件
    let starttime=0;
    let endtime=0;
    let size=0;//文件长度，由脚本使用HEAD自动计算

    let usetime;
    let size_mb;
    //提交查询：
    // document.getElementById('net_speed').innerText="网速测试中...";
    endtime=0;
    //获取文件的长度：
    let xhr=$.ajax({
        type:"HEAD",
        url:url,
        success:function(msg){
            size=xhr.getResponseHeader('Content-Length');
            starttime=new Date().valueOf();
            //开始GET数据：
            $.get(url,function(data){
                endtime=new Date().valueOf();
                usetime=endtime-starttime;
                size_mb=size/(1024*1024);
                var result_text="测试完成，总测试数量"+size_mb.toFixed(2)+"MB，用时"+usetime+"毫秒。\n";
                var speed=size/(usetime/1000*1024*1024);
                result_text+="网络吞吐量："+speed.toFixed(2)+"MB/秒\n";
                console.log(result_text);
                var speed2=speed*8;
                result_text+="网络带宽："+speed2.toFixed(2)+"Mb/秒\n";
                console.log(result_text);

                // document.getElementById('net_speed').innerText=result_text;
            })
        }
    })
};