---
layout: post
title: 使用 Maven 建置專案網站
date:  2018-12-20
categories: maven
description: "使用 Maven 建置專案網站的設定步驟說明. 步驟包含: 建立網站目錄、網站版面的設定、 導覽列選單的設定、報表設定、網站部署設定及執行部署."
keywords:
    - maven
    - site plugin
    - 網站
    - 部署
---    
  
  
## 簡介

使用 Maven 建置專案網站的設定步驟說明. 步驟包含: 建立網站目錄、網站版面的設定、 導覽列選單的設定、報表設定、網站部署設定及執行部署

## 實作步驟

### 建立網站目錄

專案網站的目錄位於 `src/site`. 可用不同的標記格式撰寫網頁內容。`src/site` 目錄下以撰寫格式分類頁面。
. 例如, 要使用 Markdown 格式撰寫, 需要在 `src/site/` 下建立 `markdown` 目錄. 

每個撰寫格式目錄相當於專案的根目錄。例如, 有一目錄如下:
<pre>
+- src/
   +- site/
      +- markdown/
      |  +- index.md
      |  +- pub/
      |     +- page01.md
      +- site.xml
</pre>

`index.md` 的頁面 url 為: `http://host/project_name/index.html`. `page01.md` 的 url 為 `http://host/project_name/pub/page01.md`。

## 網站版面的設定
`site.xml` 用來描述網站的版面配置(Layout)。可以設定:
1. 網站的 left 及 right banner
2. 計劃 Logo 下方的 links
3. 左側導覽列選單 (Menu)

更多詳細的設定參考: [Apache Maven Site Plugin: Configuring the Site Descriptor](https://maven.apache.org/plugins/maven-site-plugin/examples/sitedescriptor.html)

`site.xml` 的基本文件結構如下:

```xml
<project>
    <bannerLeft></bannerLeft>
    <bannerRight></bannerRight>
    
    <menu name="your_menu_title">
        <item name="item_name" href="url_to_page" />
    </menu>

    <menu ref="reports_generated_by_maven_site_plugin" >
    ...
</project>
```

### 導覽列選單的設定

要自訂導覽列選單, 在 `<project>` 下使用 `<menu>`. `<menu>` 的 `name` 屬性用來指定選單的名稱。在`<menu>` 內使用 `<item>` 設定選單項目。

要在導覽列中加入 Maven Site Plugin 產生的 report, 使用 `<menu>` 的 `ref` 屬性。目前 `ref` 屬性的值有底下的三種選項:
- reports: a menu with links to all the generated reports for your project
- parents: a menu with a link to the parent project's site
- modules: a menu containing the links to the sites of the submodules of this project

例如, 要產生一個自訂選單提供計劃簡介頁面的連結, 並在產生另一個選單, 內有不同的 plugin 產生的報告。此 `site.xml` 的內容如下:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/DECORATION/1.8.0" 
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/DECORATION/1.8.0 http://maven.apache.org/xsd/decoration-1.8.0.xsd"
  name="Program Unit Text Replacer" >
<body>

<menu name="About">
    <item name="Introduction" href="/introduction.html">
</menu>
<!-- Inject by maven -->
<menu ref="reports"/> 

</body>
</project>
```

若要在 `pom.xml` 中放入更多的專案資訊, 供 Maven 自動產生, 參考 [More Project Information](https://maven.apache.org/pom.html#More_Project_Information)

### 報表設定

在 Maven 的 `pom.xml` 加入不同的 plugin 以自動產生需要的 reports。

在 `<build>` 下加入 `maven-site-plugin`, 用以建置網站。

```xml
<plugin>
    <!-- solve the problem:  -->
    <!-- Execution default-cli of goal org.apache.maven.plugins:maven-site-plugin:3.3:run failed: A required class was missing while executing org.apache.maven.plugins:maven-site-plugin:3.3:run: org/apache/maven/doxia/siterenderer/DocumentContent  -->
    <!-- See: https://stackoverflow.com/a/51099913/7820390 -->
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-site-plugin</artifactId>
    <version>3.7.1</version>
</plugin>
```

在 `<project>` 下, 加入 `<reporting>`, 設定產生報表所需要的 plugins. 要產生 javadoc, 使用 `maven-java-doc-plugin`。要產生測試報告, 使用 `maven-surefire-report-plugin`

```xml
<reporting>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-javadoc-plugin</artifactId>
            <version>3.0.1</version>
            <!--Remove the classpath environment variable-->
            <!--Ref: https://stackoverflow.com/a/13278628/7820390-->
            <configuration>
                <additionalOptions>
                    <additionalOption>-Xdoclint:none</additionalOption>
                </additionalOptions>
            </configuration>
        </plugin>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-surefire-report-plugin</artifactId>
            <version>3.0.0-M1</version>
        </plugin>
    </plugins>
</reporting>
```


### 網站部署設定

在 `pom.xml` 的 `<project>` 加入 `<distributionManagement>` 指定要部署的目的主機, 例如:

```xml
<!--Deployment-->
<distributionManagement>
    <site>
        <id>hychen39.cyut.edu.tw</id>
        <url>scp://l746/var/www/html/lc2-1</url>
    </site>
</distributionManagement>
```

部署時的敏感資訊, 如賬號或密碼等, 可以不需放在 `pom.xml` 內。這些設定的資訊可以放在 `settings.xml` 檔案內, 不隨 Maven 散佈出去。

`settings.xml` 檔案可以放在兩個地方 [2]: 
- Maven 的安裝目錄: `${maven.home}/conf/settings.xml`, 或者
- 使用者的安裝目錄: `${user.home}/.m2/settings.xml`

在 `settings.xml` 中使用 `<servers>` 指定多個 `<server>` 的 id, username, 及 password. 其中, id 的值要和 `pom.xml` 中的 `<side>` 內的 id 一致:

```xml
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0
                          https://maven.apache.org/xsd/settings-1.0.0.xsd">
  <servers>
    <server>
        <id>hychen39.cyut.edu.tw</id>
        <username>user</username>
        <password>pwd</password>
    </server>
  </servers>
</settings>
```

更多的設定選項前參考 [2].


### 執行部署

要部署的 `pom.xml` 內指定的伺服器, 執行:
```bash
mvn site-deploy
```
會在 `target/site/` 目錄下產生網站內容, 並部署到指定的 Server。

若要在本地端單純產生網站內容, 執行:
```bash
mvn site:site
```


## References

1. Apache Maven Project, Creating a site, https://maven.apache.org/guides/mini/guide-site.html, accessed on 2018/12/19
2. Apache Maven Project, Settings Reference, https://maven.apache.org/settings.html, accessed on 2018/12/20