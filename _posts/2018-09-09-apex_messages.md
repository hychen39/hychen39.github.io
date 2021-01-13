---
title: 在 Apex 由後端程式顯示自訂訊息
date:   2018-08-29
categories: oracle_apex
---
  
  
 
## 簡介

在 APEX 應用程式中, 執行 Process 後或者過程中常常需要後端由顯示訊息給使用者或開發人員.

## 顯示 debug 訊息

使用 `APEX_DEBUG` package 顯示訊息於 debug 頁面.

`APEX_DEBUG` package 提供管理 debug message log 的工具函數. 這些工具函數包括: 
- 啟用或停止不同 level 的 debug 訊息.
- 清除 message log 的工具程序

啟用應用程式的 debug mode 後, debug message 會顯示在 [Debug Report](https://docs.oracle.com/database/121/HTMDB/debug_mode.htm#HTMDB28546). 瀏覽 Application Builder > Select your application > (B)Edit Application Properties > (T)Properties, 將 `Debug` 屬性設為 `true`. 執行應用程式時預設進入 Debug Mode. 

![]({{"/assets/img/180909/img02.jpg"}})

也可使用 `APEX_DEBUG.ENABLE` 啟用 debug mode, `APEX_DEBUG.DISABLE` 結束 debug mode. 

在 `APEX_DEBUG` package 定義了以下的常數, 表示不同的 [debug message log level](https://docs.oracle.com/database/121/AEAPI/apex_debug.htm#AEAPI29184):
```sql
subtype t_log_level is pls_integer; 
c_log_level_error constant t_log_level := 1; -- critical error 
c_log_level_warn constant t_log_level := 2; -- less critical error 
c_log_level_info constant t_log_level := 4; -- default level if debugging is enabled (for example, used by apex_application.debug) 
c_log_level_app_enter constant t_log_level := 5; -- application: messages when procedures/functions are entered 
c_log_level_app_trace constant t_log_level := 6; -- application: other messages within procedures/functions 
c_log_level_engine_enter constant t_log_level := 8; -- Application Express engine: messages when procedures/functions are entered 
c_log_level_engine_trace constant t_log_level := 9; -- Application Express engine: other messages within procedures/functions 
```

預設的的 log level 為 `info`.

使用 [`APEX_DEBUG.INFO`](https://docs.oracle.com/database/121/AEAPI/apex_debug.htm#AEAPI29204) 程序顯示 log 於 debug report 中. `APEX_DEBUG.INFO` 的簽名如下:
```sql
APEX_DEBUG.INFO ( 
    p_message IN VARCHAR2, 
    p0 IN VARCHAR2 DEFAULT NULL, 
    p1 IN VARCHAR2 DEFAULT NULL, 
    p2 IN VARCHAR2 DEFAULT NULL, 
    p3 IN VARCHAR2 DEFAULT NULL, 
    p4 IN VARCHAR2 DEFAULT NULL, 
    p5 IN VARCHAR2 DEFAULT NULL, 
    p6 IN VARCHAR2 DEFAULT NULL, 
    p7 IN VARCHAR2 DEFAULT NULL, 
    p8 IN VARCHAR2 DEFAULT NULL, 
    p9 IN VARCHAR2 DEFAULT NULL, 
    p_max_length IN PLS_INTEGER DEFAULT 1000 ); 
```

在 `p_message` 參數設定顯示訊息文字. 訊息中可放佔位字元 `%s`, 由後面的 `p1` 至 `p9` 參數依序取代. 也可使用 `%<n>` 指定特定的 `p<n>` 參數來取代.

## 顯示 Process 執行錯誤成功訊息

`APEX_APPLICATION` package 是實作 APEX Render Engine 的套件. 套件裡面定義了許多和 Render Engine 相關的 global 變數.

設定 `APEX_APPLICATION.G_PRINT_SUCCESS_MESSAGE` 全域變數的值, 用來顯示 Process 執行後的成功訊息.


例如:

```sql
apex_application.g_print_success_message := '借用單號:' || :P2730_ARR_ORDER_ID;
```
![]({{"/assets/img/180909/img03.jpg"}})

這個變數在 APEX API 文件上沒有說明.


## 顯示 Process 執行錯誤訊息
  
  
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