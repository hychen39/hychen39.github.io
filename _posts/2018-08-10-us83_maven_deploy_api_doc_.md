---
layout: post
title:  "使用 Maven 自動部署 Natural Doc 編譯完成的 api document 到指定的 Web Server"
date:   2018-08-02
categories: Oracle Apex
---

<!-- # 使用 Maven 自動部署 Natural Doc 編譯完成的 api document 到指定的 Web Server -->


## User Story

使用 Maven 編譯 API doc:

```text
mvn orclapex:run-natural-docs
```

或者在 `compile` phase 中一併執行。

產生出來的文件位於 `src/main/database/technical-docs` 目錄下。

要使用 Maven 進行自動部署, 部署到遠端的 Web Server. 遠端 Server 的名稱為 remote\_server, 使用者名稱為 u01, 目的目錄為 /var/www/html/api. 對應的 url 名稱為 [http://remote\_server/api](http://remote_server/api)

本地端的 console 使用 Cygwin。

## 設定程序

### Procedure Overview

1. 設定 Web Server 的 alias 
2. 設定 SSH 金鑰
3. 設定 `pom.xml`
4. 測試

### Steps

#### Task 1: 設定 Web Server 的 alias

 <span class="step"> Step </span> 登入 remote\_server, 修改 `/etc/httpd/conf.d/mysite.conf`, 其中 `mysite.conf` 是你的 virtual host 的設定。

 <span class="step"> Step </span> 在 Virtual Host 的標籤內加入以下的設定:

```text
 alias /api "/var/www/html/api"
    <Directory /var/www/html/api/>
        Options FollowSymLinks
        AllowOverride All
        Order allow,deny
        allow from all
    </Directory>
```

 <span class="step">Step</span> 確認 `/var/www/html/api/` 目錄存在, 並且有適當的寫入的權限, 以利用 `scp` 進本地端的檔案寫入到此目錄中。
 Restart the web server

```text
$ systemctl stop httpd.service
$ systemctl start httpd.service
```

#### Task 2: 設定 SSH 金鑰

我們會在本地端產生 ssh 連線所需要的公鑰及私鑰, 並將公鑰放置到 remote\_server。

 <span class="step">Step</span> 開啟 CygwinXX Terminal. 執行指令產生公鑰及私鑰:

```text
$ ssh-keygen -t rsa -b 4096 -C "Comment for the key"
```

使用 RSA加密演算法, 長度為 4096 bits.

完整的 SSH KEY 教學參考: [How To Set Up SSH Keys on CentOS 7 \| DigitalOcean](https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys-on-centos7%20)

產生的公鑰和私鑰會放在 `~/.ssh/` 目錄下, 名稱分別為: `id_rsa.pub` 及 `id_rsa`。

 <span class="step">Step</span> 將公鑰放置到 remote\_server:

```text
$ ssh-copy-id u01@remore_server
```

 <span class="step">Step</span> 測試本地端是否可以直接登入, 不需要輸入密碼。

#### Task 3: 設定 `pom.xml`

我們會在 `pom.xml` 中加入 antrun maven plugin, 之後再設定 `sshexec` 及 `scp` 這兩個 task 的參數及屬性。

 <span class="step">Step</span> 在 `pom.xml` 的 plugins section 加入 `maven-antrun-plugin` 的設定。

此設定包含: `dependency`, `executions`, 兩個小節. 在 `executions` 小節中加入一個 `execution` 小節, 設定該小節的 `id`, `goal`, 及 `configuration`. 我們會在 `configuration` 小節中放入 `target` 小節, 內含有兩個 ant tasks: `sshexec` 及 `scp`。 使用 `sshexec` task 移除 remote\_server 上 `/var/www/html/api/` 目錄內的內容。 使用 `scp` task 複製 本地端 `src/main/database/technical-docs` 目錄內的內容到 remote\_server 上。

```text
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-antrun-plugin</artifactId>
    <version>1.7</version>
    <dependencies>
        <dependency>
            <groupId>org.apache.ant</groupId>
            <artifactId>ant-jsch</artifactId>
            <version>1.9.4</version>
        </dependency>
    </dependencies>

    <executions>
        <execution>
            <id>file-copy-api-doc</id>
            <goals>
                <goal>
                    run
                </goal>
            </goals>
            <configuration>
                <target>
                    <!-- put ant commands here -->
                    <!-- Remove the existing content in the target directory -->
                    <sshexec host="server"
                        username="u01"
                        keyfile="~/.ssh/id_rsa"
                        trust="true"
                        verbose="false"
                        command="rm -rf /var/www/html/api/*"/>
                    <!-- Copy the files in the source directory to the target directory -->
                    <scp todir="u01@server:/var/www/html/api/"
                        keyfile="~/.ssh/id_rsa"
                        trust="true"
                        verbose="false">
                        <fileset dir="src/main/database/technical-docs/" />
                    </scp>
                </target>
            </configuration>
        </execution>
    </executions>
</plugin>
```

`sshexec` task 的參數中, `keyfile` 指向私鑰檔案存放的位置, 就可以不用輸入密碼。 `scp` task 中的 `keyfile` 參數也是相同的作用。

有關 `sshexec` 及 `scp` 兩個 task 的詳細參數說明, 參考:

* [SSHEXEC Task](https://ant.apache.org/manual/Tasks/sshexec.html%20)
* [SCP Task](https://ant.apache.org/manual/Tasks/scp.html%20)

#### Task 4: 測試

 <span class="step">Step</span> 開啟 Cygwin terminal, 輸入以下指令執行 antrun task 中的 run goal 下的 `file-copy-api-doc` execution.

```text
$ mvn antrun:run@file-copy-api-doc
```

輸出結果如下:

```text
$ mvn antrun:run@file-copy-api-doc
[INFO] Scanning for projects...
[INFO]
[INFO] ------------------------------------------------------------------------
[INFO] Building im_space_mgt_system_devp 0.3.3
[INFO] ------------------------------------------------------------------------
[INFO]
[INFO] --- maven-antrun-plugin:1.7:run (file-copy-api-doc) @ im_space_mgt_system_devp ---
[INFO] Executing tasks

main:
  [sshexec] Connecting to l746:22
  [sshexec] cmd : rm -rf /var/www/html/api/*
      [scp] Connecting to l746:22
      [scp] done.
[INFO] Executed tasks
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 8.537 s
[INFO] Finished at: 2018-08-10T08:27:20+08:00
[INFO] Final Memory: 8M/245M
[INFO] ------------------------------------------------------------------------
```

## References

* Buytaert, N. \(2015\). Lifecycle Management. In Gault, D. et al \(Eds.\), _Expert Oracle Application Express_ \(pp. 359-402\), Apress 
