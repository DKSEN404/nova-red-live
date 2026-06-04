$port = 23456
$prefix = "http://localhost:$port/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Host "[nr-proxy] Listening on http://localhost:$port"
Write-Host "[nr-proxy] Press Ctrl+C to stop."

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 -bor [Net.SecurityProtocolType]::Tls13

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $req = $ctx.Request
  $res = $ctx.Response

  $res.Headers.Add("Access-Control-Allow-Origin", "*")
  $res.Headers.Add("Access-Control-Allow-Methods", "GET, OPTIONS")
  $res.Headers.Add("Access-Control-Allow-Headers", "*")

  if ($req.HttpMethod -eq "OPTIONS") {
    $res.StatusCode = 204
    $res.Close()
    continue
  }

  try {
    if ($req.RawUrl -eq "/health") {
      $body = '{"status":"ok"}'
      $buf = [Text.Encoding]::UTF8.GetBytes($body)
      $res.ContentType = "application/json"
      $res.OutputStream.Write($buf, 0, $buf.Length)
      $res.StatusCode = 200
    } elseif ($req.RawUrl -match "^/fetch\?url=(.+)") {
      $targetUrl = [Uri]::UnescapeDataString($matches[1])
      Write-Host "[nr-proxy] Fetching $targetUrl"
      $wc = New-Object Net.WebClient
      $wc.Headers.Add("User-Agent", "nr-proxy/2.0")
      $res.Headers.Add("X-NR-Proxy-Version", "2.1")
      try {
        $responseBody = $wc.DownloadString($targetUrl)
        $res.StatusCode = 200
      } catch [System.Net.WebException] {
        $httpRes = $_.Exception.Response
        if ($httpRes) {
          $res.StatusCode = [int]$httpRes.StatusCode
          $reader = New-Object System.IO.StreamReader($httpRes.GetResponseStream())
          $responseBody = $reader.ReadToEnd()
          $reader.Dispose()
        } else { throw }
      }
      $buf = [Text.Encoding]::UTF8.GetBytes($responseBody)
      $res.ContentType = "application/json"
      $res.OutputStream.Write($buf, 0, $buf.Length)
    } else {
      $body = '{"error":"Not found"}'
      $buf = [Text.Encoding]::UTF8.GetBytes($body)
      $res.ContentType = "application/json"
      $res.OutputStream.Write($buf, 0, $buf.Length)
      $res.StatusCode = 404
    }
  } catch {
    Write-Host "[nr-proxy] ERROR: $_"
    try {
      $body = '{"error":"' + $_.Exception.Message.Replace('"', "'") + '"}'
      $buf = [Text.Encoding]::UTF8.GetBytes($body)
      $res.StatusCode = 502
      $res.ContentType = "application/json"
      $res.OutputStream.Write($buf, 0, $buf.Length)
    } catch {}
  }

  try { $res.Close() } catch {}
}

$listener.Stop()
Write-Host "[nr-proxy] Stopped."
