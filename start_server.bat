@echo off
chcp 65001 >nul
echo 正在啟動本地伺服器...
echo 請在瀏覽器開啟 http://localhost:8000/taoyuan_weather.html
echo.
python -m http.server 8000
pause
