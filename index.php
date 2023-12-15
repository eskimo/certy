<?php
	$revision = "20230329v2";
?>
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="darkreader" content="noplz">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Certy</title>
	<link rel="shortcut icon" href="/favicon.ico" type="image/x-icon">
	<link rel="stylesheet" type="text/css" href="/assets/css/style?r=<?php echo $revision; ?>">
	<script src="https://code.jquery.com/jquery-3.6.0.min.js" integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=" crossorigin="anonymous"></script>
	<script type="module" src="/assets/js/script?r=<?php echo $revision; ?>"></script>
</head>
<body>
	<div class="holder">
		<div class="title">Certy</div>
		<div class="subtitle">Generate SSL certificates locally in your browser.</div>
		<div class="main">
			<div class="content">
				<form id="cert">
					<div class="field">
						<input type="text" name="domain" placeholder="Domain Name">
					</div>
					<div class="field">
						<input type="number" name="days" placeholder="Days To Expire" min="1" max="3650">
					</div>
					<div class="field hidden">
						<input type="text" name="names" placeholder="Alternate Names (Comma Separated)">
					</div>
					<div class="fields">
						<div class="field">
							<div class="name">Wildcard:</div>
							<div class="input">
								<input type="checkbox" name="wildcard" checked>
							</div>
						</div>
						<div class="field">
							<div class="name">Alternate Names:</div>
							<div class="input">
								<input type="checkbox" name="alternateNames">
							</div>
						</div>
					</div>
					<div class="button" data-action="createCert">Submit</div>
				</form>
				<form id="results">
					<div class="result" data-type="cert">
						<div class="name"><span></span>.crt</div>
						<div class="link">Download</div>
					</div>
					<div class="result" data-type="key">
						<div class="name"><span></span>.key</div>
						<div class="link">Download</div>
					</div>
					<div class="result" data-type="tlsa">
						<div class="name">TLSA Record</div>
						<div class="link">Clipboard</div>
					</div>
					<div class="button" data-action="startOver">Start Over</div>
				</form>
			</div>
		</div>
	</div>
	<div class="footer">&copy; <?php echo date("Y"); ?>&nbsp;<a href="https://eskimo.software" target="_blank">Eskimo Software</a></div>
	<script>
	  var _paq = window._paq = window._paq || [];
	  _paq.push(["setCookieDomain", "*.certy.ca"]);
	  _paq.push(["setDomains", ["*.certy.ca","*.certy"]]);
	  _paq.push(['trackPageView']);
	  _paq.push(['enableLinkTracking']);
	  (function() {
	    var u="https://35k1m0.com/trkr/";
	    _paq.push(['setTrackerUrl', u+'trkr.php']);
	    _paq.push(['setSiteId', '15']);
	    var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
	    g.async=true; g.src=u+'trkr.js'; s.parentNode.insertBefore(g,s);
	  })();
	</script>
	<noscript><p><img src="https://35k1m0.com/trkr/trkr.php?idsite=15&amp;rec=1" style="border:0;" alt="" /></p></noscript>
</body>
</html>