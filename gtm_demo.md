---
layout: page
title: GTM Demo
description: Google Tag Manager Demo
---

Click Event 

<script>
    // dataLayer = [];

    var entryTime = Date.now();
    function clickTimeInterval(){
        let clickTime = Date.now();
        let intervalSeconds = (clickTime - entryTime)/1000
        entryTime = clickTime;
        console.log(intervalSeconds)
        dataLayer.push({'clickTimeInterval': intervalSeconds});
        document.getElementById("clickTimeInterval").innerText = intervalSeconds;
        return true;
    }
</script>

<a class="btn btn-click-event" > Click with class btn-click-event </a> <br />

<a class="btn btn-click-event"  
    onClick = "clickTimeInterval()" > Click with data layer data </a> <br />

<div id="clickTimeInterval"></div>

<a class="btn"> Click not triggering the tag  </a>

