---
title:  "網站流量收集 demo"
permalink: /ga/
description: "示範事件追踪及 GTM "
---

<script>
<!-- Google Analytics -->
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-126699959-1', 'auto');
<!-- Send an event -->
ga('send', {
    hitType: 'event',
    eventCategory: 'Event Tracking',
    eventAction: 'Page View',
    eventLabel: 'Analytics.js'
});

<!-- User defined function -->

function sendOutboundEvent(event) {
  ga('send', 'event', {
    eventCategory: 'Outbound Link',
    eventAction: 'click',
    eventLabel: event.target.href
  });
}
</script>

<!-- Google Tag Manager (noscript) -->
<noscript>
<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-MF6M9VZ" height="0" width="0" style="display:none;visibility:hidden">
</iframe>
</noscript>
<!-- End Google Tag Manager (noscript) -->

## 事件追踪


<a href='https://tw.yahoo.com/' onclick='(function(event){sendOutboundEvent(event); console.log(event); event.preventDefault(); alert("Event is sent.") } )(event)'> Yahoo tw  </a> 

此連結不會轉跳, 只會傳送事件 hit 給 GA 伺服器。

## 使用 GTM 進行事件追踪


<a class="btn-click-event">會觸發的連結</a>
<a class="btn">不會觸發的連結</a>

<a class="outbound_link" href="https://yahoo.com.tw/"> Yahoo Taiwan </a>

## 使用 GTM 資料層，收集自訂指標資料

<script>
    var entryTime = Date.now();
   
    function clickTimeInterval(){
        let clickTime = Date.now();
        let intervalSeconds = (clickTime - entryTime)/1000
        entryTime = clickTime;
        console.log(intervalSeconds)
        //將資料送入 dataLayer 
        //使用的 key 值需和先前新增GTM變數時使手的「資料層變數名稱」一致
        dataLayer.push({'clickTimeInterval': intervalSeconds});
        document.getElementById("clickTimeInterval").innerText = intervalSeconds;
        return true;
    }
</script>

<a class="btn btn-dataLayer"  
    onClick = "clickTimeInterval()" > 傳送點擊間隔時間 </a> <br />

<div id="clickTimeInterval"></div>