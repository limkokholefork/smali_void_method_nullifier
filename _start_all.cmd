@echo off
chcp 65001          2>nul >nul

::----------------------------------------------------
::- this batch file takes a list of arguments,       -
::- each argument is a folder.                       -
::- it runs a batch file for each of the arguments   -
::-   in a non-blocking way (in parallel).           -
::----------------------------------------------------


pushd "%~dp0"


:LOOP
  ::has argument ?
  if ["%~1"] EQU [""] ( 
    echo done.
    goto END;
  )
  ::argument exist ?
  if not exist %~sf1 (
    echo not exist.
    goto NEXT;
  )
  ::folder exist ?
  echo exist
  if exist %~sf1\NUL (
    echo is a folder, I was expecting a file.
    goto NEXT;
  )
  ::OK
  echo is a file


::--------------------------------------------------------------------------------

  start /min /low "cmd /c "call index.cmd "%~sdp1%~nx1"""

::--------------------------------------------------------------------------------


:NEXT
  echo.
  shift
  goto LOOP

:END
::pause
  exit /b 0
