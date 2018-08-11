---
layout: post
title:  "自動產生 HTML 文件的目錄 (table of content) "
date:   2018-08-11
categories: Frontend Javascript
---


## 需求

有一 HTML 文件有以下的內容. 需要自動產生目錄\(Table of Content\)的超連結, 放置於 `div#toc` 上.

```markup
<body>
    <div id="toc"></div>
    <article>
        <h1>header 1</h1>
        <h2>header 1-1 </h2>
        <h2>header 1-2 </h2>
        <h1>header 2</h1>
        <h2>header 2-1 </h2>
        <h2>header 2-2 </h2>
    </article>
</body>
```

## 實作 1 \(by Hendrik \[1\]\)

```javascript
/*
  Parameter:
    container - 含有 h1 ~ h6 標題的容器的 selector, 例如: 'article'.
    output - 要放置輸出結果的容器的 selector, 例如, 'div#toc'.

  Example:
    TableOfContents('article', 'div#toc');
*/

function TableOfContents(container, output) {
    // 目錄輸出的結果
    var toc = "";
    // 在第幾層的目錄
    var level = 0;
    // 含有 h1 ~ h6 標題的容器
    var container = document.querySelector(container) || document.querySelector('#contents');
    // 要放置輸出結果的容器
    var output = output || '#toc';

    container.innerHTML =
        container.innerHTML.replace(
            /<h([\d])>([^<]+)<\/h([\d])>/gi,
            // Replacer
            // str: 比對到的字串
            // openLevel: regexp 中第 1 個括弧的內容, 表示起始標籤內的標題級數.
            // titleText: regexp 中第 2 個括弧的內容, 標題標籤間的文字
            // closeLevel: regexp 中第 3 個括弧的內容, 表示結束標籤內的標題級數.
            function (str, openLevel, titleText, closeLevel) {
                // 錯誤的 <h[\d]> 標籤, 起始和結束的標題級數不一致.
                if (openLevel != closeLevel) {
                    return str;
                }

                if (openLevel > level) {
                    // Start a new level
                    toc += (new Array(openLevel - level + 1)).join('<ul>');
                } else if (openLevel < level) 
                {
                    // Close a level
                    toc += (new Array(level - openLevel + 1)).join('</li></ul>');
                } else {
                    // in the same level
                    toc += (new Array(level + 1)).join('</li>');
                }

                // Current Level. Default is 0
                level = parseInt(openLevel);

                // Make anchor string. Replace all space with underline char.
                var anchor = titleText.replace(/ /g, "_");

                // Accmulate the content using the local variable
                toc += '<li><a href="#' + anchor + '">' + titleText +
                    '</a>';

                // Return a reformated header with the anchor.
                var item = '<h' + openLevel + '><a id="' + anchor + '">' +
                    '</a> ' +  titleText + '</h' + closeLevel + '>';
                return item;
            }
        );
    // Append the final close tag for ul.
    if (level) {
        toc += (new Array(level + 1)).join('</ul>');
    }
    // append content to the output element.
    document.querySelector(output).innerHTML += toc;
};
```

## 實作 2 \(by matthewkastor \[2\]\)

```javascript
function htmlTableOfContents(documentRef) {
    var documentRef = documentRef || document;
    var toc = documentRef.getElementById('toc');

    // Convert to array
    // the resultant arrary will contain the header elements in the order of the locations they appear.
    // For example: h1 h2 h2 h1 h2 h2 
    var headings = [].slice.call(documentRef.body.querySelectorAll('h1, h2, h3, h4, h5, h6'));

    // Generate a toc link for each header. Also, put an anchor before each header. 
    headings.forEach(function (heading, index) {
       // Generate the anchor 
        var anchor = documentRef.createElement('a');
        anchor.setAttribute('name', 'toc' + index);
        anchor.setAttribute('id', 'toc' + index);
        // put the anchor before the heading in the document.
        heading.parentNode.insertBefore(anchor, heading);

        // Make the TOC item link.
        var link = documentRef.createElement('a');
        link.setAttribute('href', '#toc' + index);
        link.textContent = heading.textContent;

        // put the line into a div
        var div = documentRef.createElement('div');
        div.setAttribute('class', heading.tagName.toLowerCase());
        div.appendChild(link);

        // append the div to toc element.
        toc.appendChild(div); 
    });
}
```

## 參考資料

1. [Is there a JavaScript solution to generating a "table of contents" for a page? stackoverflow.com](https://stackoverflow.com/questions/187619/is-there-a-javascript-solution-to-generating-a-table-of-contents-for-a-page#)
2. matthewkastor, [matthewkastor/html-table-of-contents](https://github.com/matthewkastor/html-table-of-contents/blob/master/src/html-table-of-contents.js)

