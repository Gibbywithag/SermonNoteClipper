-- Portable launcher: find the project folder as the folder this .app lives in,
-- then run the launcher script there. Lets the whole project folder (with the
-- app inside) be copied to any Mac and just work.
set mePath to POSIX path of (path to me)
set projectDir to do shell script "dirname " & quoted form of mePath
do shell script "nohup /bin/bash " & quoted form of (projectDir & "/launch-sermon-app.sh") & " >/tmp/sermon-app.log 2>&1 &"
