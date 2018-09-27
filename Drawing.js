 /**
 * Drawing.js Created by x84108494 on 2018/8/21.
 */

 /*队列*/
 function Queue() {
    this.length = 0;
    this.data = [];
}

Queue.prototype.push = function (parse) {
//        value = Number(value);
var date = new Date(parse[0]);
var cpu = parse[1];
if (this.length >= 30) {
    this.data.shift();
    this.length--;
}
/*年月日*/
var ymd = [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-');
/*时分秒*/
var hms;
if (date.getSeconds() < 10) {
    hms = [date.getHours(), date.getMinutes(), "0" + date.getSeconds()].join(':');
}
else {
    hms = [date.getHours(), date.getMinutes(), date.getSeconds()].join(':');
}
    // console.log(ymd + " " + hms, cpu);
    // console.log(this.data);
    this.data.push([ymd + " " + hms, cpu]);
    this.length = this.length + 1;

};



/*URL列表*/
var ServerList = [];

function Server(url) {
    this.url = url;
    this.queue = new Queue();
}

/*ajax
Server:传入的服务器对象
n:表示第几个服务器，对应tr的位置为 n+1
*/
function ajax(Server,n) {
    $.ajax({
        async: true,
        url: Server.url,
        type: 'get',
        timeout: 1000,
        error: function (err) {
            console.log("error");
        },
        success: function (data) {
            var s = data.toString().substr(0, 19);
            var date = new Date(s);
            s = data.toString().substring(20).split("%");
            var cpu = parseFloat(s[0]);
            n = Number(n);

            /*导入画图所需数据*/
            Server.queue.push([date.toString(),cpu]);
            option.series[n].data = Server.queue.data;
            console.log(option.series[n].data);

            console.log("url:"+Server.url+"n is:"+n);

            /*刷新表格CPU利用率*/
            $("table tr").eq(n+1).children("td").eq(1).text(cpu);
            /*刷新表格时间*/
            $("table tr").eq(n+1).children("td").eq(2).text(date.getHours()+":"+date.getMinutes()+":"+date.getSeconds());
        }
    });
}
/*绘图*/
var dom = document.getElementById("container");
var myChart = echarts.init(dom);

var option = {
    title: {
        text: 'CPU监控系统'
    },
    tooltip: {
        trigger: 'axis',
        show: true

    },
    xAxis: {
        name: "时间/s",
        type: 'time',
        splitNumber: 30,
        splitLine: {
            show: false
        },
        axisLabel: {
            formatter: function (value, index) {
                var date = new Date(value);
                var texts = [date.getHours(), date.getMinutes(), date.getSeconds()].join(':');
                return texts;
            }
        },
        maxInterval: 1000 * 60
    },
    yAxis: {
        name: "CPU利用率/%",
        type: 'value',
        splitNumber: 10,
        boundaryGap: [0, '100%'],
        splitLine: {
            show: false
        }
    },
    series: [
    ]
};


/*刷新数据*/

var cycle = setInterval(function () {
    for (e in ServerList) {
        var o = ServerList[e];
        ajax(o,e);
        // o.queue.push(GetDate);

        }//for
        /*刷新图*/
        myChart.setOption(option,true);

        console.log(option.series);
    }
    ,
    4000
    );

if (option && typeof option === "object") {
    /*刷新图*/
    myChart.setOption(option, true);
}

/*添加URL*/
function add() {
    var s = new Server("http://" + $("input").val() + ":8080/");
    ServerList.push(s);

    /*增加线条*/
    option.series.push({
        name: $("input").val(),
        type: 'line',
        showSymbol: false,
        hoverAnimation: false,
        data: []
    })
    /*刷新图*/
    myChart.setOption(option,true)

    /*增加表格行数*/
    $("table").append("<tr>" +
        "<td>" + $("input").val() + "</td>" +
        "<td>-</td>" +
        "<td>-</td>"+
        "<td><button onclick='del(this)'>-</button></td>" +
        "</tr>"
        )
    ;

    $("input").val("");

}

/*删除URL*/
function del(e) {
    var url = "http://" + $(e).parent("td").siblings().first().text() + ":8080/";
    for (i in ServerList) {
        // console.log("1");
        // console.log(ServerList[i].url);
        if (ServerList[i].url == url) {
            console.log("2")
            ServerList.splice(i, 1);
            option.series.splice(i, 1);
        }
    }
    $(e).parents("tr").empty();

    /*刷新图*/
    myChart.setOption(option,true);
}
