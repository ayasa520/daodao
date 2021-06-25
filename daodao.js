/* innerhtml.js   
 * Version: 1.9   
 * LastModified: 2006-06-04   
 * This library is free.  You can redistribute it and/or modify it.   
 *   
 */
var global_html_pool = [];   
var global_script_pool = [];   
var global_script_src_pool = [];   
var global_lock_pool = [];   
var innerhtml_lock = null;   
var document_buffer = "";   
function set_innerHTML(obj_id, html, time) {   
    if (innerhtml_lock == null) {   
        innerhtml_lock = obj_id;   
    }   
    else if (typeof(time) == "undefined") {   
        global_lock_pool[obj_id + "_html"] = html;   
        window.setTimeout("set_innerHTML('" + obj_id + "', global_lock_pool['" + obj_id + "_html']);", 10);   
        return;   
    }   
    else if (innerhtml_lock != obj_id) {   
        global_lock_pool[obj_id + "_html"] = html;   
        window.setTimeout("set_innerHTML('" + obj_id + "', global_lock_pool['" + obj_id + "_html'], " + time + ");", 10);   
        return;   
    }   
    function get_script_id() {   
        return "script_" + (new Date()).getTime().toString(36)   
          + Math.floor(Math.random() * 100000000).toString(36);   
    }   
    document_buffer = "";   
    document.write = function (str) {   
        document_buffer += str;   
    }   
    document.writeln = function (str) {   
        document_buffer += str + "\n";   
    }   
    global_html_pool = [];   
    var scripts = [];   
    html = html.split(/<\/script>/i);   
    for (var i = 0; i < html.length; i++) {   
        global_html_pool[i] = html[i].replace(/<script[\s\S]*$/ig, "");   
        scripts[i] = {text: '', src: '' };   
        scripts[i].text = html[i].substr(global_html_pool[i].length);   
        scripts[i].src = scripts[i].text.substr(0, scripts[i].text.indexOf('>') + 1);   
        scripts[i].src = scripts[i].src.match(/src\s*=\s*(\"([^\"]*)\"|\'([^\']*)\'|([^\s]*)[\s>])/i);   
        if (scripts[i].src) {   
            if (scripts[i].src[2]) {   
                scripts[i].src = scripts[i].src[2];   
            }   
            else if (scripts[i].src[3]) {   
                scripts[i].src = scripts[i].src[3];   
            }   
            else if (scripts[i].src[4]) {   
                scripts[i].src = scripts[i].src[4];   
            }   
            else {   
                scripts[i].src = "";   
            }   
            scripts[i].text = "";   
        }   
        else {   
            scripts[i].src = "";   
            scripts[i].text = scripts[i].text.substr(scripts[i].text.indexOf('>') + 1);   
            scripts[i].text = scripts[i].text.replace(/^\s*<\!--\s*/g, "");   
        }   
    }   
    var s;   
    if (typeof(time) == "undefined") {   
        s = 0;   
    }   
    else {   
        s = time;   
    }   
    var script, add_script, remove_script;   
    for (var i = 0; i < scripts.length; i++) {   
        var add_html = "document_buffer += global_html_pool[" + i + "];\n";   
        add_html += "document.getElementById('" + obj_id + "').innerHTML = document_buffer;\n";   
        script = document.createElement("script");   
        if (scripts[i].src) {   
            script.src = scripts[i].src;   
            if (typeof(global_script_src_pool[script.src]) == "undefined") {   
                global_script_src_pool[script.src] = true;   
                s += 2000;   
            }   
            else {   
                s += 10;   
            }   
        }   
        else {   
            script.text = scripts[i].text;   
            s += 10;   
        }   
        script.defer = true;   
        script.type =  "text/javascript";   
        script.id = get_script_id();   
        global_script_pool[script.id] = script;   
        add_script = add_html;   
        add_script += "document.getElementsByTagName('head').item(0)";   
        add_script += ".appendChild(global_script_pool['" + script.id + "']);\n";   
        window.setTimeout(add_script, s);   
        remove_script = "document.getElementsByTagName('head').item(0)";   
        remove_script += ".removeChild(document.getElementById('" + script.id + "'));\n";   
        remove_script += "delete global_script_pool['" + script.id + "'];\n";   
        window.setTimeout(remove_script, s + 10000);   
    }   
    var end_script = "if (document_buffer.match(/<\\/script>/i)) {\n";   
    end_script += "set_innerHTML('" + obj_id + "', document_buffer, " + s + ");\n";   
    end_script += "}\n";   
    end_script += "else {\n";   
    end_script += "document.getElementById('" + obj_id + "').innerHTML = document_buffer;\n";   
    end_script += "innerhtml_lock = null;\n";   
    end_script += "}";   
    window.setTimeout(end_script, s);   
}


function getLocalTime(nS) {
    return new Date(parseInt(nS) * 1000).toLocaleString().replace(/:\d{1,2}$/,' ');
}
function getdddata(){
    var bbsurl = "https://daodao-alpha.vercel.app/api?q=10"

    var httpRequest = new XMLHttpRequest();//第一步：建立所需的对象
    httpRequest.open('GET', bbsurl, true);//第二步：打开连接  将请求参数写在url中  ps:"./Ptest.php?name=test&nameone=testone"
    httpRequest.send();//第三步：发送请求  将请求参数写在URL中
    /**
     * 获取数据后的处理程序
     */
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var json = httpRequest.responseText;//获取到json字符串，还需解析
            var obj = eval('(' + json + ')');
            // console.log(obj.data)
            const bbArray = obj.map(e => {
                return {
                    'date': getLocalTime(e.date.$date),
                    'content': e.content,
                    'from': e.from
                }
            })
            const data = JSON.stringify(bbArray);
            generateddHtml(JSON.parse(data))
        }
    };
}
function HTMLDecode(text) { 
    var temp = document.createElement("div"); 
    temp.innerHTML = text; 
    var output = temp.innerText || temp.textContent; 
    temp = null; 
    return output; 
} 
var generateddHtml = array => {
    var $dom = document.querySelector('#bber');
    var result = '<section class="timeline page-1"><ul><div class="list">'
    var scriptHTML='';
    console.log(array)

    if (array.length) {
        for (let i = 0; i < array.length; i++) {
            var from_icon = '';
            if (array[i].from == "iPhone"){
                from_icon = '<i class="fas fa-mobile-alt"></i>';
            }else if (array[i].from == "MacBook"){
                from_icon = '<i class="fas fa-laptop"></i>';
            }else if (array[i].from == "微信公众号"){
                from_icon = '<i class="fab fa-weixin" style="font-size: 0.6rem"></i>';
            }else{
                from_icon = '<i class="fas fa-tools"></i>';
            };

            var dataTime = '<p class="datatime">'+array[i].date+'</p>'
            var decodedHTML = HTMLDecode( array[i].content);
//             var scriptHTMLList = decodedHTML.match(/<script>.*<\/script>/);
//             if(scriptHTMLList!=null)
//                 scriptHTML += scriptHTMLList[0];
           
            result += `<li class="item"><div>`+ dataTime  + `<p class="datacont">`+decodedHTML+`</p><p class="datafrom"><small>`+ from_icon + decodeURIComponent(array[i].from) +`</small></p></div></li>`;
        }
    } else {
        result += '!{_p("aside.card_funds.zero")}';
    }
    result += '</div></ul></section>'

//     var $dom = document.querySelector('#bber');
    set_innerHTML('bber',result);
    window.lazyLoadInstance && window.lazyLoadInstance.update();
    window.pjax && window.pjax.refresh($dom);
}

if (document.querySelector('#bber')) {
    getdddata()
}

function urlToLink(str) {
    var re =/\bhttps?:\/\/(?!\S+(?:jpe?g|png|bmp|gif|webp|gif))\S+/g;
    var re_forpic =/\bhttps?:[^:<>"]*\/([^:<>"]*)(\.(jpeg)|(png)|(jpg)|(webp))/g;
    str =str.replace(re_forpic,function (imgurl) {
        return '<a href="' + imgurl + '"><img src="' + imgurl + '" /></a>';
    });
    str =str.replace(re,function (website) {
        return " <a href='" + website + "'rel='noopener' target='_blank'>↘链接↙</a> ";
    });
    str = qqWechatEmotionParser(str)
    return str;
}
/*
MIT License - http://www.opensource.org/licenses/mit-license.php
For usage and examples, visit:
https://tokinx.github.io/lately/
Copyright (c) 2017, Biji.IO
*/
var $jscomp=$jscomp||{};$jscomp.scope={};$jscomp.arrayIteratorImpl=function(b){var g=0;return function(){return g<b.length?{done:!1,value:b[g++]}:{done:!0}}};$jscomp.arrayIterator=function(b){return{next:$jscomp.arrayIteratorImpl(b)}};$jscomp.makeIterator=function(b){var g="undefined"!=typeof Symbol&&Symbol.iterator&&b[Symbol.iterator];return g?g.call(b):$jscomp.arrayIterator(b)};
(function(b,g){var p=function(h){var d=h.lang||{second:"\u79d2",minute:"\u5206\u949f",hour:"\u5c0f\u65f6",day:"\u5929",month:"\u4e2a\u6708",year:"\u5e74",ago:"\u524d",error:"NaN"};h=$jscomp.makeIterator(document.querySelectorAll(h.target||".time"));for(var c=h.next();!c.done;c=h.next()){c=c.value;var a=c.dateTime;var e=c.title,f=c.innerHTML;if(!a||isNaN(new Date(a=a.replace(/(.*)[a-z](.*)\+(.*)/gi,"$1 $2").replace(/-/g,"/"))))if(e&&!isNaN(new Date(e=e.replace(/-/g,"/"))))a=e;else if(f&&!isNaN(new Date(f=
    f.replace(/-/g,"/"))))a=f;else break;c.title=a;a=new Date(a);a=((new Date).getTime()-a.getTime())/1E3;e=a/60;f=e/60;var k=f/24,l=k/30,m=l/12;c.innerHTML=(1<=m?Math.floor(m)+d.year:1<=l?Math.floor(l)+d.month:1<=k?Math.floor(k)+d.day:1<=f?Math.floor(f)+d.hour:1<=e?Math.floor(e)+d.minute:1<=a?Math.floor(a)+d.second:d.error)+d.ago}};var n=function(){return this||(0,eval)("this")}();"Lately"in n||(n.Lately=p)})();
