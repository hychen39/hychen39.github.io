---
layout: page
title: JSF 教學
keywords:
    - JavaServer Faces 教學
    - JSF 教學
    - JSF 入門
    - JSF 介紹
---

## Lecture Units

{% for post in site.categories["jsf_teaching"] reversed %}
<a href="{{ post.url }}">{{ post.title }}</a>
{% endfor %}

## Other Resources

- [JSF 2.2 View Declaration Language: Facelets Variant](https://docs.oracle.com/javaee/7/javaserver-faces-2-2/vdldocs-facelets/index.html)
- [JavaServer Faces API (2.0)](https://docs.oracle.com/cd/E17802_01/j2ee/javaee/javaserverfaces/2.0/docs/api/)
- [JSF Showcase - Liferay Faces - Liferay Community](https://faces.liferay.dev/jsf-showcase)