---
title:  "Apex 應用程式的 Google Social Account Sign-in 設定"
categories: oracle_apex
description: "在 Oracle Apex 中使用 Google Social Account Sign-in 時所需要的原理與設定"
keywords:
- oracle apex
- google social sign-in
---


<link rel="stylesheet" href="/assets/css/header_numbering.css">
<link rel="stylesheet" href="/assets/css/step_numbering.css">

<!-- # Apex 應用程式的版本控管 -->

## 測試環境

設定參考文件: [Apex Login using Google &#8211; Social Sign In](https://doyensys.com/blogs/apex-login-using-google-social-sign-in/)

程序概覽:

Step 1. 去申請與設定 Google API，以取得 OAuth 的用戶端 ID 及 用戶端密鑰。接著，再設定已授權的重新導向 URI: `https://host/ords/apex_authentication.callback`

Step 2. 到 App 的 Shared Component, 設定 Web Credentials。
- 在此輸入 OAuth 的 用戶端 ID 及 用戶端密鑰


![](/assets/img/oracle_apex/23-05-23-23-15-46.png)

Step 3. 在 App 中，新增一個 Authentication Schema。 
- Schema 中使用 Step 2 建立的 Web Credentials 作為 Credential Store. 

Step 4. 若 public user 要取用 private page, 系統會 redirect 到 Google 做身份鑑別。
![](/assets/img/oracle_apex/23-05-23-23-20-03.png)

![](/assets/img/oracle_apex/23-05-23-23-21-01.png)



## 工作原理 

使用 OAuth 做身份鑑別 

1. 當身份驗證過程開始時，用戶首先被重定向到授權端點(Authorization Point);
   - 這個互動是瀏覽器執行的。
2. 身份驗證成功後，身份提供者 (Identity Provider, IdP) 呼叫 Apex 的 Authentication Callback URL (https://host/ords/apex_authentication.callback), 配合必要的參數。
3. 之後，Apex 會存取 IdP 的端點(Endpoint), 以取得 Token 及使用者資訊(User Info)
   - 取得 Token 的端點： https://www.googleapis.com/oauth2/v4/token
   - 取得 User Info 的端點: https://www.googleapis.com/oauth2/v2/userinfo
4. Apex 使用 APEX_WEB_SERVICE API 存取上述兩端點，而且是使用 https 協定。
   - 需要設定 ACL, 允許 APEX_WEB_SERVICE API 存取外部資源
   - 需要設定 WALLET, 提供 https 需要的端點網站的憑證(certificates)

參考: [Certs for APEX Social Sign-In | Thinking Anew](https://fuzziebrain.com/content/id/1725) 

## 取得 Session 的 debug Info

如何取得 session 的 debug info (詳細 trace 資料)？ 

S1. 登入帳號後， Administration > Monitor Activity > Sessions > Active Sessions 
![](/assets/img/oracle_apex/23-05-19-08-34-47.png)

S2. 進去後，可以看到目前 Active Session. 點目標 session, 設定 Debug Level 及 Trace Mode 

![](/assets/img/oracle_apex/23-05-19-08-36-03.png)

參考： [Debugging APEX Authentication Issues](https://chrisonoracle.wordpress.com/2020/04/03/debugging-apex-authentication-issues/)

## 問題 1： 點選 Google 帳號後，進行身份鑑別，出現 "Error processing request" 錯誤


登入時發生錯誤
![](/assets/img/oracle_apex/23-05-13-12-57-50.png)

主要錯誤訊息：
```
RA-24247: 存取控制清單 (ACL) 拒絕網路存取
```

錯誤原因: 
- DB PDB3 的 ACL 沒有設定, 無法存取 googleapis.com 的 Token 及 User Info
- SYS.UTL_HTTP 引起的 error 
  
```
Exception in "begin_request":
Error Stack: ORA-29273: HTTP 要求失敗
ORA-24247: 存取控制清單 (ACL) 拒絕網路存取
ORA-06512: 在 "SYS.UTL_HTTP", line 380
ORA-06512: 在 "SYS.UTL_HTTP", line 1127
Backtrace: ORA-06512: 在 "SYS.UTL_HTTP", line 380
ORA-06512: 在 "SYS.UTL_HTTP", line 1127
ORA-06512: 在 "APEX_210100.WWV_FLOW_WEB_SERVICES", line 735
```


![](/assets/img/oracle_apex/23-05-13-13-00-49.png)



###  解決方式

- 為 APEX_210100 帳號設定 ACL 並指派到 Network 
- 加入 Privileges: 
  - connect: 允許連線
  - use-client-certificates: 允許取得 Wallet 中的安全憑證
- 在 Apex 所在的 PDB (pdb3) 設定 


12c 之後: 

```sql 
--- Grant acl

-- Use append
-- Granting Privileges to a Database Role External Network Services
-- Ref: 
-- https://docs.oracle.com/en/database/oracle/oracle-database/19/dbseg/managing-fine-grained-access-in-pl-sql-packages-and-types.html#GUID-6E5E9D6E-A2E6-43EA-A1DC-7CF6D6006141
--  https://oracle-base.com/articles/12c/fine-grained-access-to-network-services-enhancements-12cr1
BEGIN
-- Note: You will never create a host ACL directly. Instead, they are implicitly created when you append a host Access Control Entry (ACE) using the DBMS_NETWORK_ACL_ADMIN.APPEND_HOST_ACE procedure

 DBMS_NETWORK_ACL_ADMIN.APPEND_HOST_ACE(
  host       => '*',
  ace        =>  xs$ace_type(privilege_list => xs$name_list('http', 'connect'),
                             principal_name => 'APEX_210100',
                             principal_type => xs_acl.ptype_db));

END;
/

begin
DBMS_NETWORK_ACL_ADMIN.ADD_PRIVILEGE(
acl          => 'apex_acl_file.xml', 
    principal    => 'APEX_210100',
    is_grant     => TRUE, 
    privilege    => 'use-client-certificates'
);
end;
/
```

查看 ACE (Access Control Entry) 設定的 view: dba_host_aces
```
select * from dba_host_aces;
```
![](/assets/img/oracle_apex/23-05-19-09-16-51.png)

11g 以前的 view: 
- dba_network_acls 
- dba_network_acl_privileges


Ref: 
- https://docs.oracle.com/en/database/oracle/oracle-database/19/dbseg/managing-fine-grained-access-in-pl-sql-packages-and-types.html#GUID-6E5E9D6E-A2E6-43EA-A1DC-7CF6D6006141
- https://oracle-base.com/articles/12c/fine-grained-access-to-network-services-enhancements-12cr1

## 問題 2: ORA-29024: 憑證驗證失敗 (ORA-29024: Certificate validation failure)

設定完成 ACL 後，遇到此錯誤: 
```
ORA-29273: HTTP 要求失敗
ORA-29024: 憑證驗證失敗
```

![](/assets/img/oracle_apex/23-05-16-16-24-09.png)


SYS.UTL_HTTP 嘗試存取端點 `https://www.googleapis.com/oauth2/v4/token` 失敗，因為找不到該端點的安全憑證。

```
0.24036	0.05153	
make_rest_request_int p_url=>https://www.googleapis.com/oauth2/v4/token,p_http_method=>POST,p_auth_scheme.scheme=>Basic,p_auth_scheme.username=>,p_body=>code=4%2F0AbUR2VNcWGkLqxO9MUPj7Rqg-8Vn7LFwcrRZgFXycreOEr7EngtzOUuy0GPRakLjUf42vg&grant_type=authorization_code&redirect_uri=https://m1.im.cyut.edu.tw/ords/apex_authentication.callback&client_id=663770886743-da3ig9socf4q5ptqpa1vauhmib9m5lud%2Eapps%2Egoogleusercontent%2Ecom&client_secret=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

begin_request p_url=>https://www.googleapis.com/oauth2/v4/token,p_method=>POST,p_proxy_override=>,p_transfer_timeout=>180,p_https_host=>,p_wallet_path=>

looking up SSL_WALLET in sys.database_properties

...not found
```

```
Exception in "begin_request":
Error Stack: ORA-29273: HTTP 要求失敗
ORA-29024: 憑證驗證失敗
ORA-06512: 在 "SYS.UTL_HTTP", line 380
ORA-06512: 在 "SYS.UTL_HTTP", line 1127
Backtrace: ORA-06512: 在 "SYS.UTL_HTTP", line 380
ORA-06512: 在 "SYS.UTL_HTTP", line 1127
ORA-06512: 在 "APEX_210100.WWV_FLOW_WEB_SERVICES", line 735
```

身份驗證完後，APEX_WEB_SERVICE APIs 會依序存取以下兩個端點：
- Google	Token	https://www.googleapis.com/oauth2/v4/token
- User Info	https://www.googleapis.com/oauth2/v2/userinfo

所以需要有這兩個端點的安全憑證。
Ref: [Certs for APEX Social Sign-In | Thinking Anew](https://fuzziebrain.com/content/id/1725)

### 解決方式

使用 `orapki` 將 `https://www.googleapis.com/` 的 CA 憑證加入到 DB wallet 中。

設定程序：

Step 1: Create a new wallet

Step 2: Export the relevant Root Authority and Certification Authority certificates of Google in PEM format (using Chrome or Firefox to export)

Step 3: Import these certificates into the new wallet

Step 4: assign the wallet in the database for the APEX db session to use
  
Ref： 
1. https://forums.oracle.com/ords/apexds/post/issue-using-google-authorization-in-oracle-apex-6815
2. [ORA-29024: Certificate validation failure - Apex and HTTPS](https://stackoverflow.com/questions/62851314/ora-29024-certificate-validation-failure-apex-and-https)


### 詳細步驟

主要參考： 
- [Application Express and HTTPS: Never see "Certificate Validation Error" again](https://apex.oracle.com/pls/apex/germancommunities/apexcommunity/tipp/6121/index-en.html)
- [We Have a Wallet, Thinking Anew](https://fuzziebrain.com/content/id/1720)

#### Step 1: Create a wallet 

使用 `oracle` 帳號 
在 `/home/oracle` 下建立 `https_wallet` 的 wallet:

```
cd /home/oracle
orapki wallet create -wallet https_wallet -pwd ****** -auto_login
```
密碼自訂

執行結果：
```
[oracle@db12cr2-im ~]$  orapki wallet create -wallet https_wallet -pwd *****
 -auto_login
Oracle PKI Tool : Version 12.2.0.1.0
Copyright (c) 2004, 2016, Oracle and/or its affiliates. All rights reserved.
```

```
[oracle@db12cr2-im ~]$ ls https_wallet/
cwallet.sso  cwallet.sso.lck  ewallet.p12  ewallet.p12.lck
```

#### Step 2: 取得目的網站的安全憑證 

到 `https://pki.goog/repository/` 下載 Google 提供的 Root CAs.

也可以從 `https://pki.goog/roots.pem` 下載  root certificates 的集合, 涵蓋 Google, Facebook, Microsoft 三家 IdP. 

如果自 `https://pki.goog/roots.pem` 下載，單個檔案中會有多個 root certificates。

#### Step 3: 安裝憑證

Fuzziebrain 提供了 [Bash Script: createBaseWallet.sh](https://gist.github.com/fuzziebrain/202f902d8fc6d8de586da5097a501047), 將下載檔案內的憑證匯入到 Oracle Wallet 中。

使用 `createBaseWallet.sh` 時要提供的參數：
- TMPDIR=/u01/temp
- WALLET_PATH=/home/oracle/https_wallet 
- WALLET_PWD (執行時輸入)

此 Script 會先建立新的 Wallet. 但在 Step 1 我們已建立，所以把 Script 中的建立 Wallet 命令註解掉：
```
# orapki wallet create -wallet ${WALLET_PATH} -pwd ${WALLET_PWD}
```

建議 Wallet 目錄不要使用 `$ORACLE_BASE/admin/orcl/ssl_wallet` 的系統目錄，`SYS.UTL_HTTP` 會引起錯誤：
```
ORA-28759 無法開啟檔案 (failure to open file) 
```

本次安裝使用的 Bash Script 請參考[附件](#附件：匯入憑證至-oracle-wallet-的-bash-script)。

完成後，如想查看 Oracle Wallet 的內容: 

```
orapki wallet display -wallet /home/oracle/https_wallet
```

```
[oracle@db12cr2-im ~]$ orapki wallet display -wallet /home/oracle/https_wallet
Oracle PKI Tool : Version 12.2.0.1.0
Copyright (c) 2004, 2016, Oracle and/or its affiliates. All rights reserved.

Requested Certificates:
User Certificates:
Trusted Certificates:
Subject:        OU=Starfield Class 2 Certification Authority,O=Starfield Technol
ogies\, Inc.,C=US
Subject:        CN=GlobalSign,O=GlobalSign,OU=GlobalSign Root CA - R3
Subject:        CN=DigiCert Assured ID Root G3,OU=www.digicert.com,O=DigiCert In
c,C=US
...
```

#### Step 4: 設定 Apex Instance 使用 Oracle Wallet 內的憑證

Login to APEX as the instance administrator and navigate to "Manage Instance > Instance Settings".

![](/assets/img/oracle_apex/23-05-20-09-46-59.png)

設定 Wallet Path 欄位： 

![](/assets/img/oracle_apex/23-05-20-09-47-35.png)


#### 測試

身份鑑別成功後，Apex 會取得使用者的 email 名稱，並顯示：

![](/assets/img/oracle_apex/23-05-20-09-57-22.png)

現在，可以成功的存取 `https://www.googleapis.com/oauth2/v4/token` 端點。

![](/assets/img/oracle_apex/23-05-20-10-02-34.png)


## 附件：加入 roots.pem 到 `$ORACLE_BASE/admin/ssl_wallet` 目錄中

自 [https://pki.goog/roots.pem](https://pki.goog/roots.pem) 取得 root certificates
使用 [Load an Oracle Wallet with certificates contained in a bundle file.](https://gist.github.com/fuzziebrain/202f902d8fc6d8de586da5097a501047) script, 將 root certificates 內的 CA 加入到 wallet 中。

完成後，執行，出現以下錯誤
```
ORA-28759 無法開啟檔案 (failure to open file)
```

APEX_WEB_SERVICE.make_rest_request() 產生的: 
![](/assets/img/oracle_apex/23-05-17-06-19-47.png)


原因：目錄權限有問題 

解決方式： 改使用 `/home/oracle/https_wallet` 目錄 



## 附件： 其它相關參考資料

1. [20.4.3.10 Social Sign-In, Oracle Apex: App Builder User's Guide 22.2](https://docs.oracle.com/en/database/oracle/apex/22.2/htmdb/social-sign-in.html#GUID-592A3256-F94B-40D8-9DBB-91CA5E4A6D9D)

2. [Script to load an Oracle Wallet with certificates contained in a bundle file.](https://gist.github.com/fuzziebrain/202f902d8fc6d8de586da5097a501047)

3. [Google CA Repository](https://pki.goog/repository/)


4. [3.5.3.5 Configuring Wallet Information, Administration Guide, Oracle Application Express Administration Guide 20.1](https://docs.oracle.com/en/database/oracle/application-express/20.1/aeadm/configuring-instance-settings.html)


5. [Enabling Network Services in Oracle Database 11g or Later, Application Express Installation Guide 5.1](https://docs.oracle.com/database/apex-5.1/HTMIG/enabling-network-services-in-Oracle-db11g-or-later.htm#HTMIG29487)
