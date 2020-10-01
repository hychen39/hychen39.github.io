---
layout: post
title: 使用 Maven Cargo plugin 部署 JSF 專案到 Payara Server
date:  2020/10/01
categories: maven
description: "使用 Maven Cargo plugin 部署 JSF 專案到 Payara Server。"
keywords:
    - maven
    - cargo plugin
    - deploy

---    
  
  
## 簡介

使用 Maven Cargo plugin 部署 JSF 專案到 Payara Server

主要參考來源:
- [Deploying to Payara Server Using the Maven Cargo Plugin](https://blog.payara.fish/deploying-to-payara-server-using-the-maven-cargo-plugin)
- [Using the Maven Cargo Plugin :: Payara Community Documentation](https://docs.payara.fish/community/docs/5.2020.4/documentation/user-guides/using-the-maven-cargo-plugin.html)
- [payara/Payara-Examples](https://github.com/payara/Payara-Examples/blob/master/ecosystem/payara-maven/pom.xml)

## 實作步驟

### 定義 pom.xml 內的變數

```xml
<properties>
    <payara.adminPort>4848</payara.adminPort>
    <payara.username>admin</payara.username>
    <payara.password>adminadmin</payara.password>
    <payara.hostname>localhost</payara.hostname>
    <payara.domainName>domain1</payara.domainName>
    <payara.home>c:/payara5</payara.home>
    <payara.domainDir>${payara.home}/glassfish/domains</payara.domainDir>
</properties>
```

Payara 5 的 admin 帳號的預設密碼為 adminadmin。

如果 Payara 的 admin 密碼為空值, 無法鑑別成功。

沒有給與 `<payara.password>` 時, 會使用 `$GLASSFISH_HOME/glassfish/domains/password.properties` 進行身份鑑別密碼。

### 加入 Maven Cargo Plugin


在 `install` phase 執行 Cargo Plugin 的 redeploy goal. 在 `<executions>` 進行上述的設定。

部署到 Local 的 Payara Server 需要的設定:
```xml
<plugin>
    <groupId>org.codehaus.cargo</groupId>
    <artifactId>cargo-maven2-plugin</artifactId>
    <version>1.8.1</version>
    <executions>
        <execution>
            <id>deploy</id>
            <phase>install</phase>
            <goals>
                <goal>redeploy</goal>
            </goals>
        </execution>
    </executions>
    <configuration>
        <container>
            <containerId>payara</containerId>
            <type>installed</type>
            <home>${payara.home}</home>
        </container>
        <configuration>
            <type>existing</type>
            <home>${payara.domainDir}</home>                 
            <properties>
                <cargo.glassfish.domain.name>${payara.domainName}</cargo.glassfish.domain.name>
            </properties>
        </configuration>
    </configuration>
    <!-- provides JSR88 client API to deploy on Payara -->
    <dependencies>
        <dependency>
            <groupId>org.glassfish.main.deployment</groupId>
            <artifactId>deployment-client</artifactId>
            <version>5.0</version>
        </dependency>
    </dependencies>
</plugin>
```

要部署到 Remote Payara Server, 參考 [Deploying to Payara Server Using the Maven Cargo Plugin](https://blog.payara.fish/deploying-to-payara-server-using-the-maven-cargo-plugin)。

執行命令:

```
mvn install
```

進行 build, package 及部署到 Local Payara Server instance 上。

或者執行 cargo 的 deployer-redeploy goal:

```
mvn cargo:deployer-redeploy
```

執行結果:
```
$ mvn cargo:deployer-redeploy
[INFO] Scanning for projects...
[INFO]
[INFO] --------------------< com.mycompany:BookEntryBean >---------------------
[INFO] Building BookEntryBean(B) 1.0-SNAPSHOT
[INFO] --------------------------------[ war ]---------------------------------
[INFO]
[INFO] --- cargo-maven2-plugin:1.8.1:deployer-redeploy (default-cli) @ BookEntryBean ---
[INFO] [DeployerRedeployMojo] Resolved container artifact org.codehaus.cargo:cargo-core-container-payara:jar:1.8.1 for container payara
[INFO] [talledLocalContainer] Parsed GlassFish version = [5.193.1]
[INFO] [talledLocalContainer] Application deployed with name BookEntryBean-1.0-SNAPSHOT.
[INFO] [talledLocalContainer] Command deploy executed successfully.
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  11.187 s
```

