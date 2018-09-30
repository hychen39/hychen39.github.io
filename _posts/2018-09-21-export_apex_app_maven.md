---
layout: post
title: Export Oracle Apex Application from remote to local computers using Maven
date: 2018-08-29
categories: oracl_apex
---  

## Abstract
Oracle Apex application needs to be exported as a sql file from the Workspace in order to deploy to another workspace. 
Other than exporting manually, this article introduces an automatic way to export the Apex file and copy it to the local computer by using Maven. The automation enables automated build and release process.


## Introduction

An Apex application is, in most of the cases, developed in the development environment. After it is tested, the application is deployed to other environment, such as production environment.

Several artifacts are required to prepare for the deployment:
- Apex Application file
- Supporting objects, including:
    - non-replaceable objects, such as tables, sequences, and so on.
    - replaceable objects, such as packages, views, and so on. 
- Share components, including plug-ins, images, CSS files, JavaScript files and other files which must be managed independently.

Oracle Apex provides several ways to export an Apex application to a sql file. 
- Use GUI of the App Builder to export the application.See [Exporting an Application and Application Components](https://docs.oracle.com/database/apex-5.1/HTMDB/exporting-an-application-and-application-components.htm#GUID-CA08D090-882F-4745-87D9-149373F285F1)
- Command line export utilities: two java classes are provided to exporting the Apex application[5]. 


## Implementation Procedure

<span class="step">Step</span> Set up the SSH public-key authentication.

Set up the SSH key to avoiding typing password when logging to remote server. Refer to [How To Set Up SSH Keys | DigitalOcean](https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys--2) to generate SSH key and deploy the public key to remote. 


<span class="step">Step</span> Create a shell script to export in the remote server the Apex Application file. 

```bash
#! /bin/bash
# Export the Apex Application file
# Version: Oracle REST Data Services 3.0.12.263.15.32
java -classpath /home/u01/download/apex513/utilities/:/u01/app/oracle/product/11.2.0/xe/jdbc/lib/ojdbc6.jar oracle.apex.APEXExport -db xe:1521:xe -user ur_username -password ur_password -applicationid 103
```
The script use the `APEXExport` class in the Oracle Application Express Command-line Export Utilities to export the Apex file. 
We need to specify:
- class paths for the `APEXExport` class and ojdbc classes.
- database info
- user 
- password
- application id

You can find more information in the `Readme.txt` in the `utilities` directory in the unzipped Apex files.
Or here is a [one minute read by John Otander](https://nikitsky.github.io/oracle/apex/2017/05/09/apex-export-cli/).

<span class="step">Step</span> Create the Maven `pom.xml` and add the `antrun`plugin to it. The `antrun` plugin is to execute the previous shell script in the remote and copy the exported file to local. 

```xml
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
        <!-- Ant task to export Apex Application file -->
            <execution>
                <id>export-apex-appl-file</id>
                <phase>generate-resources</phase>
                <goals>
                    <goal>
                        run
                    </goal>
                </goals>
                <configuration>
                    <target>
                    <!-- ssh to remote to execute the shell script  -->
                        <sshexec host="xe.local.me"
                                    username="root"
                                    keyfile="~/.ssh/id_rsa"
                                    trust="true"
                                    verbose="false"
                                    command="cd /home/u01/apex_prj/im_space_mgt_sys/app &amp;&amp; sh ./export_app_1.sh"/>
                        <!-- Use scp to copy the exported file from remote to local -->
                        <scp file="root@xe.local.me:/home/u01/apex_prj/im_space_mgt_sys/app/f103.sql"
                                    keyfile="~/.ssh/id_rsa"
                                    trust="true"
                                    verbose="false"
                                    todir="src/main/apex">
                        </scp>
                    </target>
                </configuration>
            </execution>
        </executions>
</plugin>
```

The `antrun` execute two tasks. The first is SSH to the remote server, change to the target directory, and execute the shell script defined in the previous step. The second is to copy the exported Apex file from the remote to the local computer.

## Case Study

Develop applications at the developing workspace at a developing site. 
Use Git for the version control for files of the replaceable and non-replaceable objects. 

When the application is ready to release, we will deploy it to the testing workspace at the developing site.
Maven is used to auto-deploy the application the testing workspace. The following tasks are executed in various phases by the Maven:

**`generate-resources` phase**

Export the Apex Application file from the developing workspace at the developing site to a local directory.

**`compile` phase**

1. Deploy all sql files of non-replaceable and replaceable objects to the schema for the testing workspace.
2. Import the Apex Application file to the target schema.

**`install` phase**

1. Generate the API documents for the documented non-replaceable and replaceable objects.
2. Copy the generated API documents to a document server. 

The deployment testing helps us to identify error configurations for the Liquibase[1]. 
After the deployment procedure has passed the test, we deploy the application the production workspace in production site. 

## References

[1] [Liquibase | Database Refactoring](https://www.liquibase.org/)
[2] [Introducing the Oracle APEX Maven plugin](https://apexplained.wordpress.com/2014/04/08/introducing-the-oracle-apex-maven-plugin/)  
[3] [nbuytaert1/orclapex-maven-demo](https://github.com/nbuytaert1/orclapex-maven-demo)
[4] [Christoph Ruepprich et.al., 2015. Chapter 9 Lifecycle Management, Expert Oracle Application Express, Second Edition. O'Reilly.](https://www.oreilly.com/library/view/expert-oracle-application/9781484204849/)
[5] [Apex Export CLI: one minute read by John Otander](https://nikitsky.github.io/oracle/apex/2017/05/09/apex-export-cli/)

  
  