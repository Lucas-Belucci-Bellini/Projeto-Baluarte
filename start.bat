@echo off
REM ============================================================
REM  Projeto Baluarte Mark XIII — Inicializador (Windows)
REM  Duplo-clique para subir o dev server.
REM ============================================================

cd /d "%~dp0"

echo.
echo  ============================================================
echo   PROJETO BALUARTE — Mark XIII
echo   Inicializando ambiente de desenvolvimento...
echo  ============================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo  [ERRO] Node.js nao encontrado no PATH.
  echo  Instale Node.js 18+ em https://nodejs.org/
  pause
  exit /b 1
)

if not exist node_modules (
  echo  [INFO] Instalando dependencias pela primeira vez...
  call npm install
  if errorlevel 1 (
    echo  [ERRO] Falha no npm install.
    pause
    exit /b 1
  )
)

echo  [INFO] Subindo Vite em http://localhost:5173 ...
echo  [INFO] Pressione Ctrl+C para parar.
echo.
call npm run dev
pause
