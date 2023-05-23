---
title:  "Apex 應用程式的版本控管"
categories: oracle_apex
description: "Oracle Apex 的匯出與版本控管"
keywords:
- oracle apex
- git
- export
---


<link rel="stylesheet" href="/assets/css/header_numbering.css">
<link rel="stylesheet" href="/assets/css/step_numbering.css">

<!-- # Apex 應用程式的版本控管 -->

## 工作流程

需要管理的源碼：
- Apex app definition 
- Schema objects： 如 tables, views, packages, sequences 等

Oracle 建議的控管流程：
1. 建立一個暫時的目錄，做為當前目錄，以存放 DB 匯出的 Apex app 及 schema objects. 
2. 匯出 Apex app definition 檔案至當前目錄
3. 匯出 DB schema object definition 至當前目錄
4. 由當前目錄 Copy Apex app definition 檔案至 Git work area.
5. Copy DB schema object definition 檔案至 Git work area
6. 使用 Git 做控管

![](/assets/img/oracle_apex/23-04-21-23-10-53.png)
Figure source: [1]

## 工具

### SQLcl  

SQLcl 是  SQL Command Line utility 的縮寫。


使用 SQLcl 連線至 DB:
- 匯出 Apex app definition
- 匯出 DB schema object definition

SQLcl 具有追蹤、版本管理、及部署資料庫異動的功能。

安裝 SQLcl 需要:
- Java 11 is installed first
- download and unzip the latest version from:
  - https://download.oracle.com/otn_software/java/sqldeveloper/sqlcl-latest.zip
  - 需要 22.x 以上

在 Mac 安裝：
```
brew install sqlcl
```

### Git 

[Git 下載](https://git-scm.com/downloads)

[安裝教學](https://git-scm.com/book/zh-tw/v2/%E9%96%8B%E5%A7%8B-Git-%E5%AE%89%E8%A3%9D%E6%95%99%E5%AD%B8)

### apexexport2git Utility script 

下載 Oracle 提供的 `apexexport2git` 命令稿，執行前述的工作流程。

下載： [https://www.oracle.com/a/tech/docs/orclapex-lifecycle-paper-files.zip](https://www.oracle.com/a/tech/docs/orclapex-lifecycle-paper-files.zip)

解壓縮後，在 `script/` 找到 apexexport2git.sh 或 apexexport2git.bat

## 執行 apexexport2git 

執行 apexexport2git 要提供 3 個引數：
1. APEX App Id 
2. Git workarea directory
3. DB connection string

例如：
```
apexexport2git 500 /home/teamdev/greatapp username/password@host:port/service
```

執行時，匯出參數 `READABLE_YAML` 有可能引起以下錯誤：
```
ORA-06502: PL/SQL: numeric or value error
ORA-06512: at "APEX_210100.WWV_FLOW_EXPORT_API", line 117
ORA-06512: at "APEX_210100.WWV_FLOW_EXPORT_API", line 111
ORA-06512: at line 3
```

迴避方法，不要使用 `READABLE_YAML`


## 補充

Libquibase(lb) 指令的使用
- https://oracle-base.com/articles/misc/sqlcl-automating-your-database-deployments-using-sqlcl-and-liquibase
- https://docs.oracle.com/en/database/oracle/sql-developer-command-line/19.2/sqcug/using-liquibase-sqlcl.html

Export Apex app using SQLcl:
- [3.12.11.1.6 Exporting One or More Applications, Administration Guide, R22.2](https://docs.oracle.com/en/database/oracle/apex/22.2/aeadm/exporting-one-or-more-applications.html#GUID-644620C3-4E8C-467D-82FB-093908B68D2D)

## 附件 - 修改後的 apexexport2git.sh 的內容 (Oracle)

```bash
#!/bin/bash
# APEX Export to Git
# SQLcl version > 22.X
#-----------------------------
# $1 = APEX App Id
# $2 = Git workarea directory
# $3 = DB connection string
#-----------------------------
# Recreate the temporary stage directory and change directory to it
if [ -d ${TMPDIR}tmp/stage_f$1 ]
then   
    rm -rf ${TMPDIR}tmp/stage_f$1
fi
mkdir -p ${TMPDIR}tmp/stage_f$1
cd ${TMPDIR}tmp/stage_f$1
# Export APEX application and schema to stage directory
sql /nolog <<EOF
connect $3
apex export -applicationid $1 -split -skipExportDate -expOriginalIds -expComments -expSupportingObjects Y -expType APPLICATION_SOURCE
set ddl storage off
set ddl partitioning off
set ddl segment_attributes off
set ddl tablespace off
set ddl emit_schema off
lb generate-schema -split
EOF
# Copy APEX application export files in the ./fNNN subdirectory to Git Working Area directory
rsync --delete --recursive ${TMPDIR}tmp/stage_f$1/f$1/* $2
# Remove APEX export files, leaving only Liquibase DB export artifacts
rm -rf ${TMPDIR}tmp/stage_f$1/f$1
# Copy the Liquibase DB export artifacts to ./database subdir of Git Working Area
rsync --delete --recursive ${TMPDIR}tmp/stage_f$1/* $2/database
# Change directory to the Git Workarea 
cd $2
# Add all changed files to the Git worklist from any subdirectory
git add .
```

## References 

1. [Oracle, 2022, Understanding the Oracle APEX Application Development Lifecycle, Oracle APEX Technical Paper, v3](https://apex.oracle.com/go/lifecycle-technical-paper)
  
