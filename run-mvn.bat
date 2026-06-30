@echo off
set "JAVA_HOME=D:\jdk-21"
set "PATH=D:\jdk-21\bin;D:\BaseApp\apache-maven-3.9.8\bin;%PATH%"
cd /d "F:\Code\Auramix\Auramix"
"D:\BaseApp\apache-maven-3.9.8\bin\mvn.cmd" %*
