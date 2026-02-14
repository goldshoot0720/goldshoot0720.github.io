# 啟動本地伺服器
Write-Host "正在啟動本地伺服器..." -ForegroundColor Green
Write-Host "請在瀏覽器開啟 http://localhost:8000/taoyuan_weather.html" -ForegroundColor Yellow
Write-Host ""
python -m http.server 8000
