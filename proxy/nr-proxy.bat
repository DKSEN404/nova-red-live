@echo off
title Nova-Red Live Proxy (localhost:23456)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0nr-proxy.ps1"
pause
