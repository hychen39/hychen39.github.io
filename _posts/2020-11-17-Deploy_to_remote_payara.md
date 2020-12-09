---
layout: post
title: 使用 Maven Cargo plugin 部署 JSF 專案到遠端 Payara Server
date:  2020/11/27
categories: maven
description: "使用 Maven Cargo plugin 部署 JSF 專案到遠端 Payara Server。"
keywords:
    - maven
    - cargo plugin
    - deploy
    - remote deploy
---    
  
  
## 簡介

使用 Maven Cargo plugin 部署 JSF 專案到遠端 Payara Server

先前已介紹使用 Maven Cargo plugin 部署 JSF 專案到本地端的 Payara Server。


## 實作步驟

### 加入主機名稱及通訊埠到 `pom.xml`

加入主機及通訊埠特性到 `pom.xml`:

```xml
<project ...>
...
<properties>
    ...
    <payara.adminPort>4848</payara.adminPort>
    <payara.username>admin</payara.username>
    ...
</properties>
```

### 加入需要的 Plugins

使用的 Plugins 包括:
- cargo

Cargo plugin 需要加入以下相依套件(dependencies)
- JSR88 client API
- jaxb-api
- jaxb-impl
- jaxb-core
- activation

加入的 plugins 如下:
```xml
 <plugin>
      <groupId>org.codehaus.cargo</groupId>
      <artifactId>cargo-maven2-plugin</artifactId>
      <version>1.8.1</version>
      <!--<version>1.6.7</version>-->
      <executions>
          <execution>
              <id>deploy_remote</id>
              <phase>install</phase>
              <goals>
                  <goal>redeploy</goal>
              </goals>
          </execution>
      </executions>
      <configuration>
          <container>
              <containerId>payara</containerId>
              <!--<containerId>glassfish4x</containerId>-->
              <type>remote</type>
          </container>
          <configuration>
              <type>runtime</type>
              <properties>
                  <!--<cargo.runtime.args>force=true</cargo.runtime.args>-->
                  <cargo.remote.username>${payara.username}</cargo.remote.username>
                  <cargo.remote.password>${payara.password}</cargo.remote.password>
                  <cargo.glassfish.admin.port>${payara.adminPort}</cargo.glassfish.admin.port>
                  <cargo.hostname>${payara.hostname}</cargo.hostname>
              </properties>
          </configuration>
      </configuration>
      <!-- provides JSR88 client API to deploy on Payara Server -->
      <dependencies>
          <dependency>
              <groupId>org.glassfish.main.deployment</groupId>
              <artifactId>deployment-client</artifactId>
              <version>5.1.0</version>
              <!--<version>4.1.1</version>-->
          </dependency>   
   <!-- Avoid the exception: java.lang.ClassNotFoundException: javax.xml.bind.DatatypeConverter   -->
          <dependency>
              <groupId>javax.xml.bind</groupId>
              <artifactId>jaxb-api</artifactId>
              <version>2.3.0</version>
          </dependency>
          <dependency>
              <groupId>com.sun.xml.bind</groupId>
              <artifactId>jaxb-impl</artifactId>
              <version>2.3.0</version>
          </dependency>
          <dependency>
              <groupId>com.sun.xml.bind</groupId>
              <artifactId>jaxb-core</artifactId>
              <version>2.3.0</version>
          </dependency>
          <dependency>
              <groupId>javax.activation</groupId>
              <artifactId>activation</artifactId>
              <version>1.1.1</version>
          </dependency>      
      </dependencies>
  </plugin>
```

若沒有為 Cargo plugin 加入相依套件, 會產生以下的例外訊息:

> Caused by: org.apache.maven.plugin.PluginExecutionException: Execution default-cli of goal org.codehaus.cargo:cargo-maven2-plugin:1.8.1:deployer-deploy failed: error submitting remote command
> Caused by: java.lang.NoClassDefFoundError: javax/xml/bind/DatatypeConverter
> Caused by: java.lang.ClassNotFoundException: javax.xml.bind.DatatypeConverter


Ref: [Ref: 真正解决方案：java.lang.NoClassDefFoundError: javax/xml/bind/DatatypeConverter - 姜飞祥 - 开发者的网上家园](https://www.cnblogs.com/smfx1314/p/11071718.html)

### 將 Server 的登入資訊另外存放

Server 的連線資訊可以不要放在專案的 pom.xml。

Maven 會依序讀取底下位置的 `settings.xml`:

1. The Maven install: `$MAVEN_HOME/config/settings.xml`
2. A user's install `$USER_HOME/.m2./settings.xml`

把登入的資訊放在上述的其中位置之一。


在 `$MAVEN_HOME\conf\settings.xml` 加入以下 `<server>` 設定:

```xml
<server>
      <id>Payara_Server_logi</id>
      <configuration>
        <cargo.remote.username>server_account</cargo.remote.username>
        <cargo.remote.password>server_password</cargo.remote.password>
      </configuration>
</server>
```

接著, 修改 `pom.xml`, 在 cargo plugin 的 configuration 加入以下的 property:
```xml
 <cargo.server.settings>Payara_Server_logi</cargo.server.settings>
```
並把 `cargo.remote.username` 及 `cargo.remote.password` 註解掉:

```xml
<!--<cargo.runtime.args>force=true</cargo.runtime.args>-->
<!--<cargo.remote.username>${payara.username}</cargo.remote.username>-->
<!--<cargo.remote.password>${payara.password}</cargo.remote.password>-->
<cargo.server.settings>Payara_Server_logi</cargo.server.settings>
```

Maven 執行時，會注入 `settings.xml` 中的 `<server>` 設定。

在 Maven 的輸出結果中, 尋找關鍵字 Injected property 以查看注入的結果:

```
 [DEBUG] [DeployerRedeployMojo] Resolved artifact and dependencies: [file:/C:/Users/user/.m2/repository/org/codehaus/cargo/cargo-core-container-payara/1.8.1/cargo-core-container-payara-1.8.1.jar, file:/C:/Users/user/.m2/repository/org/codehaus/cargo/cargo-core-container-glassfish/1.8.1/cargo-core-container-glassfish-1.8.1.jar]
 [INFO] [DeployerRedeployMojo] Resolved container artifact org.codehaus.cargo:cargo-core-container-payara:jar:1.8.1 for container payara
 [DEBUG] Found cargo.server.settings: Payara_Server_logi
 [INFO] The Maven settings.xml file contains a reference for the server with identifier [Payara_Server_logi], injecting configuration properties
 [DEBUG] 	Injected property: cargo.remote.username = admin
 [DEBUG] 	Injected password property: cargo.remote.password= ***
 [DEBUG] Performing deployment action into [Payara Remote]...
```

### 執行

執行 maven 的 install phase, 
```
mvn install
```

或者執行 cargo 的 redeploy goal:
```
mvn cargo:redeploy
```