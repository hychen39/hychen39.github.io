---
title: Show the message generated from the PL/SQL process
date:   2018-10-17
categories: oracle_apex
description: This article presents another way to show the message from the PL/SQL process. We use the Application Item to store the message from the PL/SQL process. There is a Application Process executing on the page loading to show the message in the Application Item using the JS functions in the  `apex.message` namespace.
keywords:
    - plsql
    - oracle apex
    - javascript
    - showing notification
    - apex.message
    - application item
---
  
 
## Introduction

We need to show the messages from the PL/SQL process (back-end) to the user (front-end) very often.

One way is to use the global variable `APEX_APPLICATION.G_PRINT_SUCCESS_MESSAGE`. The Apex will shows the message in the upper right corner with the green box. The method is suitable for showing information that doesn't need the user to interact with. 

The second way is to use `APEX_ERROR.ADD_ERROR` procedure to add the message to the error stack. When loading the page, the Apex will show these messages. We can specify the locations of showing the messages either on the upper right corner or associate with pages items or event an error page. However, the  `APEX_ERROR.ADD_ERROR` procedure will interrupt the request processing process such that the codes after the `APEX_ERROR.ADD_ERROR` will not be executed. The method is appropriate for the form validation. 

This article presents another way to show the message from the PL/SQL procees. We use the Application Item to store the message from the PL/SQL procees. There is a Application Process executing on the page loading to show the message in the Application Item using the JS functions in the  `apex.message` namespace.

## API Review

### Using PL/SQL to run JS codes

Refer to [Execute Javascript through PL/SQL by Denes Kubicek](http://deneskubicek.blogspot.com/2009/05/execute-javascript-throuhg-plsql.html).

The process responses the JS codes to the browser. The process must be executed when the Apex loading the page. 
If the process is run on the point of After Submit, the responses made by calling `htp.p()` cannot send to the browser.

### Accessing the application item from the PL/SQL 

Use `APEX_UTIL.SET_SESSION_STATE` and `APEX_UTIL.GET_SESSION_STATE` to set or get the value of an application item.

Refer to [SET_SESSION_STATE Procedure](https://docs.oracle.com/database/apex-18.2/AEAPI/SET_SESSION_STATE-Procedure.htm#AEAPI181) and [GET_SESSION_STATE Function](https://docs.oracle.com/database/apex-18.2/AEAPI/GET_SESSION_STATE-Function.htm#AEAPI151).

Can we directly accessing the application item from the frond-end using JS codes? 
Unfortunately, we can only directly access the page item by using the JS codes. Use `$s()` or `apex.item( "P1_ITEM" ).setValue( "10", "SALES", true );` to set the value of the application item. 

If we want to access the application item from the browser, we need to make a AJAX call to submit a request to run the target PL/SQL procedure. Refer to  [Oracle Apex Application Item value setting using javascript](https://stackoverflow.com/questions/45051098/oracle-apex-application-item-value-setting-using-javascript) for more information.


### Show messages using JS

The [apex.message namespace](https://docs.oracle.com/database/apex-18.2/AEAPI/apex-message-namespace.htm#AEAPI-GUID-D15040D1-6B1A-4267-8DF7-B645ED1FDA46) offers a lots of functions to show messages in different ways. 

This article uses [apex.message.alert](https://docs.oracle.com/database/apex-18.2/AEAPI/apex-message-namespace.htm#AEAPI-GUID-55AFECC0-6C0B-4276-A1A5-C8FE02D136D3) to show the alert message on the borwser to users. An example of the `apex.message.alert` is as the following:

```js
apex.message.alert( "Load complete.", function(){
    afterLoad();
});
```

## Implementation

The procedure to show the message from the PL/SQL process using the application item is as the following:

1. Create an application item.
2. Create an application process to show the message. The process is executed after the page footer has been loaded. The process will:
    1. Read the value of the application item.
    2. Response the Javascript code to show the message.
    3. Clean the value of the application item.

The implementation steps are:

<span class="step">Step</span> Create an application item `APP_MSG`.

![Navigate the the application item page]({{"/assets/img/oracle_apex/i01.jpg"}})
![Create an application item]({{"/assets/img/oracle_apex/i02.jpg"}})

<span class="step">Step</span> Create an application process. 

![Create an application item]({{"/assets/img/oracle_apex/i03.jpg"}})

<span class="step">Step</span> Enter the codes for the application process:

```sql
-- APPLICATION PROCESS
-- Execute when On Load: After Footer

declare
    v_msg varchar2(1000);
    v_js_str varchar2(1000);
begin
  v_js_str := '<script> apex.message.alert("#MSG#"); </script>';

  -- save to local
  v_msg := apex_util.get_session_state(
        p_item => 'APP_MSG'
  );

  apex_debug.info(
        p_message => 'Msg Value: %s'
      , p0 => v_msg
  );

  -- clear the application item
  apex_util.set_session_state(
        p_name => 'APP_MSG'
      , p_value => ''
  );

  -- make the js code.
  v_js_str := replace(v_js_str, '#MSG#', v_msg);
  
  apex_debug.info(
        p_message => 'JS code: %s'
      , p0 => v_js_str
  );
  -- response the js code to the browser.
  if (v_msg is not null) then
    htp.p(v_js_str);
  end if;

end;
```

<span class="step">Step</span> Testing result

Navigate to the [demo site](https://apex.oracle.com/pls/apex/f?p=83970:10:12233266426283:::::) to see how it works.

![function demo site]({{"/assets/img/oracle_apex/i04.jpg"}})

You can enter a message in the Message field and press Show Message button. A dialog will pop up showing the message you just entered. 

When press the Show Message button, the page is submitted to the Apex. Apex runs the process with the codes:
```sql
begin
 apex_util.set_session_state(
        p_name => 'APP_MSG'
      , p_value => :P10_Message
  );
end;
```
