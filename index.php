<?php
	$revision = "20220919v1";
?>
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Certy</title>
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
					<div class="field">
						<div class="name">Wildcard:</div>
						<div class="input">
							<input type="checkbox" name="wildcard" checked>
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
	<div class="footer">&copy; <?php echo date("Y"); ?>&nbsp;<a href="https://eskimosoftware" target="_blank">Eskimo Software</a></div>
</body>
</html>