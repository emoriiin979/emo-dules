@echo off
setlocal

set COMMAND=%1
set TARGET=%2

if "%COMMAND%"=="up" goto :up
if "%COMMAND%"=="bash" goto :bash
if "%COMMAND%"=="test" goto :test
if "%COMMAND%"=="down" goto :down

echo [Usage]
echo server.bat up [service_name]   - Start dev containers
echo server.bat bash [service_name] - Enter container shell
echo server.bat test [service_name] - Run automated test
echo server.bat down                - Stop and remove all containers
goto :eof

:up
if "%TARGET%"=="" (
    echo [INFO] Run all dev containers in background ...
    docker compose --env-file .env.dev up -d
) else (
    echo [INFO] Run dev container: %TARGET% ...
    docker compose --env-file .env.dev up -d %TARGET%
)
goto :eof

:bash
if "%TARGET%"=="" (
    set TARGET=app
)
docker compose --env-file .env.dev ps %TARGET% | findstr "Up running" > nul
if %errorlevel% == 0 (
    echo [INFO] Container %TARGET% is running. Using 'exec' ...
    docker compose --env-file .env.dev exec %TARGET% bash
    if errorlevel 1 docker compose --env-file .env.dev exec %TARGET% sh
) else (
    echo [INFO] Container %TARGET% is not running. Using 'run --rm' ...
    docker compose --env-file .env.dev run --rm %TARGET% bash
    if errorlevel 1 docker compose --env-file .env.dev run --rm %TARGET% sh
)
goto :eof

:test
if "%TARGET%"=="" (
    set TARGET=app
)
echo [INFO] Run automated tests on %TARGET% ...
docker compose --env-file .env.testing run --rm %TARGET% npm run test
goto :eof

:down
echo [INFO] Stopping and removing containers ...
docker compose --env-file .env.dev down
goto :eof
