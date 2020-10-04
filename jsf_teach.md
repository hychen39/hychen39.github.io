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

### Java EE
- [Enterprise Java (605.784.31) Fall 2019 |  John's Hopkins University, Engineering Programs for Professionals](https://webdev.jhuep.com/~jcs/ejava-javaee/)

### JavaServer Faces
- [JSF 2.2 View Declaration Language: Facelets Variant](https://docs.oracle.com/javaee/7/javaserver-faces-2-2/vdldocs-facelets/index.html)
- [JavaServer Faces API (2.0)](https://docs.oracle.com/cd/E17802_01/j2ee/javaee/javaserverfaces/2.0/docs/api/)
- [JSF Showcase - Liferay Faces - Liferay Community](https://faces.liferay.dev/jsf-showcase)

### Java SE
- [Java 字串的 interning 的功能 (String Pool)](https://www.baeldung.com/java-string-pool)
- [How ArrayList Works Internally in Java](https://codenuclear.com/how-arraylist-works-internally-java/)