---
layout: post
title: 在 Apex 由後端程式顯示自訂訊息
date:   2018-08-29
categories: oracle_apex
---
  
  
 
## 簡介

在 APEX 應用程式中, 執行 Process 後或者過程中常常需要後端由顯示訊息給使用者或開發人員.

### 顯示 debug 訊息

使用 `APEX_DEBUG` package 顯示訊息於 debug 頁面.

`APEX_DEBUG` package 提供管理 debug message log 的工具函數. 這些工具函數包括: 

### 顯示 Process 執行錯誤成功訊息

`APEX_APPLICATION` package 是實作 APEX Render Engine 的套件. 套件裡面定義了許多和 Render Engine 相關的 global 變數.

設定 `APEX_APPLICATION.G_PRINT_SUCCESS_MESSAGE` 全域變數的值, 用來顯示 Process 執行後的成功訊息.


例如:

```sql
--sample codes here
```

這個變數在 APEX API 文件上沒有說明.


### 顯示 Process 執行錯誤訊息
  
  
使用 `APEX_ERROR` package 顯示錯誤訊息[1].

使用 `APEX_ERROR.ADD` 在畫面右上角 POPUP 上列表顯示多個錯誤訊息, 畫面如下[2]:

![](https://rimblas.com/blog/wp-content/uploads/2013/10/apex_error-example.png)

`APEX_ERROR.ADD` 會將錯誤訊息加入到 error stack 中, 這些錯誤訊息會以列表的方式顯示.

錯誤訊息顯示的位置:
- 在發生錯誤的欄位處, 位置常數 `APEX_ERROR.c_inline_with_field`.
- 在發生錯誤的欄位處和右上角 POPUP, 其位置常數 `APEX_ERROR.c_inline_with_field_and_notif`.
- 只顯示在右上角 POPUP, 其位置常數 `APEX_ERROR.c_inline_in_notification`.
- 顯示在錯誤頁面, 常數 `APEX_ERROR.c_on_error_page `.

`APEX_ERROR.ADD` 共有 5 中形式的簽名[3]:
- Signature 1: 在右上角 POPUP 和錯誤頁面 顯示訊息, 不能顯示訊息與錯誤的欄位
- Signature 2: 在錯誤的欄位處顯示訊息
- Signature 3: 在錯誤的欄位處顯示訊息, 錯誤訊息中可使用 placeholder (如: `printf`)
- Signature 4: 在 tabular form 中顯示錯誤訊息
- Signature 5: 在 tabular form 中顯示錯誤訊息, 錯誤訊息中可使用 placeholder.

ADD_ERROR Procedure Signature 1 簽名為:
```sql
APEX_ERROR.ADD_ERROR (
    p_message          in varchar2,
    p_additional_info  in varchar2 default null,
    p_display_location in varchar2 );
```

ADD_ERROR Procedure Signature 2 簽名為:
```sql
APEX_ERROR.ADD_ERROR (
    p_message          in varchar2,
    p_additional_info  in varchar2 default null,
    p_display_location in varchar2,
    p_page_item_name   in varchar2);
```


## 參考資料

[1] [APEX_ERROR use case](https://rimblas.com/blog/2013/10/apex_error-use-case/)

[2] [Using APEX_ERROR to manage custom error messages](https://www.apex-at-work.com/2017/01/using-apexerror-to-manage-custom-error.html)  

[3] [APEX_ERROR Package](https://docs.oracle.com/database/121/AEAPI/apex_error.htm#AEAPI2217)

[4] [APEX_APPLICATION Package](https://docs.oracle.com/cd/E59726_01/doc.50/e39149/apex_app.htm#AEAPI216)