@echo off
setlocal

if "%1"=="dev" goto :dev
if "%1"=="test" goto :test
if "%1"=="stop" goto :stop

echo [Usage]
echo server.bat dev  - Start dev containers
echo server.bat test - Run automated test
echo server.bat stop - Stop and remove all containers
goto :eof

:dev
echo [INFO] Run dev containers in background ...
docker compose --env-file .env.dev up -d
goto :eof

:test
echo [INFO] Run automated tests ...
docker compose --env-file .env.testing run --rm app npm run test
goto :eof

:stop
echo [INFO] Stopping and removing containers ...
docker compose --env-file .env.dev down
goto :eof
