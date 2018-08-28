---
layout: page
title: JSF Teaching
---

{% for post in site.categories["jsf_teaching"] reversed %}
<a href="{{ post.url }}">{{ post.title }}</a>
{% endfor %}