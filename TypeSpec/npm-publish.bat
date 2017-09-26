XCOPY Scripts\TypeSpec\*.d.ts dist\src /E /C /I /Q /G /H /R /K /Y /Z /J

XCOPY Scripts\TypeSpec\*.js dist\src /E /C /I /Q /G /H /R /K /Y /Z /J

XCOPY ..\README.md dist /Y

XCOPY package.json dist /Y


cd ./dist/
call npm publish
pause