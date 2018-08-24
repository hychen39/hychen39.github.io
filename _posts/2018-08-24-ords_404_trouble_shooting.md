---
layout: post
title: Oracle ORDS Trouble Shooting
date:   2018-08-24
categories: oracle_apex
---

## Introduction

Oracle REST Data Services (ORDS)  maps HTTP(S) verbs (GET, POST, PUT, DELETE, etc.) to database transactions and returns any results formatted using JSON. 

If you want to use the web container (such as: Tomcat or Glassfish) as the listener for the Oracle Apex, you have to deploy the `ORDS.war` application to it. 

`404 Not Found` has been a ccommon problem after we install the ORDS to a web container. 

![](https://ruepprich.files.wordpress.com/2017/07/resterror.png?w=768)

The article proposes a procedure the trouble shooting the `404 Not Found` problem.

The deployment for the Oracle Apex in our case is shown in the following:

![The deployment for the Oracle Apex]({{"/assets/img/180824/img04.jpg" | absolute_url }})

## Procedure

<!-- <div class="step-start"></div> -->
<span class="step">Step</span> Check the Oracle DB listener.

Make sure the listener working properly. 

Login to `Oracle` user in the `Oracle DB` Server. Use the following command to show the listener status:
```
lsnrctl status
```

<span class="step">Step</span> Check the RESTFul Service of the Apex in the Oracle DB

You should have the following three accounts for the RESTFul Service in the Oracle DB:
- APEX_PUBLIC_USER
- APEX_LISTENER
- APEX_REST_PUBLIC_USER

Connect to the `Oracle DB` and use the following SQL statement to check these users.
```sql
select * from dba_users where USERNAME IN ('APEX_PUBLIC_USER', 'APEX_LISTENER', 'APEX_REST_PUBLIC_USER');
```

![]({{"/assets/img/180824/img01.jpg" | absolute_url }})

If you don't have the three users, run the scrip `@apex_rest_config.sql` in the Apex install directory.

<span class="step">Step</span> Check ORDS configurations.

Make sure the DB user `ORDS_PUBLIC_USER` exist in the Oracle DB.

If not, you have to reinstall the ORDS. 

Login to the `ORDS_NODE` server (where you install the ORDS service), run the following commands:

```bash
# Change to ORDS installation directory.
cd /usr/share/ords/
# Set the configuration directory
java -jar ords.war configdir /usr/share/ords/conf
java -jar ords.war
```
The installation process will use the `sys` account to connect to the `Oracle DB` server and then install the required schema (Oracle REST Data Services) and create the `ORDS_PUBLIC_USER` user.

After completing the installation, we can validate it by running the command:
```
java -jar ords.war validate
```

The logs of the installation and validation will be generated at `/usr/share/ords/logs`.

![]({{"/assets/img/180824/img02.jpg" | absolute_url }})

<span class="step">Step</span> Check the status of the accounts used by the ORDS to connects to Oracle DB.

Four accounts have been created:
- APEX_PUBLIC_USER
- APEX_LISTENER
- APEX_REST_PUBLIC_USER
- ORDS_PUBLIC_USER
  
Make sure the four accounts do not be locked and with expired passwords in the Oracle DB.

Login as `sys` to the `Oracle DB`, run the following statement to check:
```sql
select * from dba_users where USERNAME IN ('APEX_PUBLIC_USER', 'APEX_LISTENER', 'APEX_REST_PUBLIC_USER', 'ORDS_PUBLIC_USER' );
```

<span class="step">Step</span> Check the passwords of the previous accounts for the ORDS application.

ORDS application will use the four accounts to connect to Oracle DB. The passwords of the four accounts are stored at the configuration directory you have specified by the `configdir` parameter for `ords.war`. For example, run the following command in the `ORDS_NODE` server:

```bash
java -jar ords.war configdir /usr/share/ords/conf
```
specify the configuration directory at `usr/share/ords/conf/ords/conf`.

In this configuration directory, you can see four xml files:

![]({{"/assets/img/180824/img03.jpg" | absolute_url }})

These xml files stores the names and passwords for the four accounts. Make sure the these accounts are consistent with those in the Oracle DB.

If the password is inconsistent, the Tomcat cannot create the connection pool for the account for connecting to Oracle DB.
You can find the error message in the Tomcat log. See [How to Update the ORDS_PUBLIC_USER Password | ThatJeffSmith](https://www.thatjeffsmith.com/archive/2017/06/how-to-update-the-ords_public_user-password/) for more details.



# References

- [ruepprich, 2017. ORDS REST error after new installation](https://ruepprich.wordpress.com/2017/07/01/ords-rest-error-after-new-installation/)
-  [ThatJeffSmith, 2017. How to Update the ORDS_PUBLIC_USER Password](https://www.thatjeffsmith.com/archive/2017/06/how-to-update-the-ords_public_user-password/) 
-  [oracle-base, Oracle REST Data Services (ORDS) 3.0, 17.x and 18.x Installation on Tomcat 7, 8 and 9 ](https://oracle-base.com/articles/misc/oracle-rest-data-services-ords-installation-on-tomcat)




