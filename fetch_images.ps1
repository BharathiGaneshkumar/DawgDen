$queries = @('ikea desk', 'calculus textbook', 'mini fridge', 'computer monitor', 'coffee maker', 'office chair');
foreach ($q in $queries) {
  $url = 'https://unsplash.com/napi/search/photos?query=' + [uri]::EscapeDataString($q) + '&per_page=1';
  $req = Invoke-RestMethod -Uri $url -Headers @{'User-Agent'='Mozilla/5.0'} -ErrorAction SilentlyContinue;
  if ($req -and $req.results) {
    Write-Output ($q + ': ' + $req.results[0].id)
  } else {
    Write-Output ($q + ': FAILED')
  }
}
