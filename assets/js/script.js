import * as asn1js from "./asn1js/asn1.js";
import Certificate from "./pkijs/Certificate.js";
import AttributeTypeAndValue from "./pkijs/AttributeTypeAndValue.js";
import Extension from "./pkijs/Extension.js";
import { getCrypto, getAlgorithmParameters, getAlgorithmByOID } from "./pkijs/common.js";
import BasicConstraints from "./pkijs/BasicConstraints.js";
import ExtKeyUsage from "./pkijs/ExtKeyUsage.js";
import AltName from "./pkijs/AltName.js";
import GeneralName from "./pkijs/GeneralName.js";

let keySize = 4096;
let hashAlg = "SHA-256";
let signAlg = "RSASSA-PKCS1-v1_5";

let certBuffer = new ArrayBuffer(0);
let keyBuffer = new ArrayBuffer(0);
let pubkeyBuffer = new ArrayBuffer(0);

function createCert(domain, wildcard, days) {
	let sequence = Promise.resolve();

	let publicKey;
	let privateKey;

	const crypto = getCrypto();
	if (typeof crypto === "undefined") {
		return Promise.reject(`Your browser doesn't support the Web Crypto API.`);
	}

	if (!domain.length) {
		return Promise.reject("Please enter a domain name.");
	}
	if (days < 1) {
		return Promise.reject("Please enter how many days this certificate should be valid for.");
	}
	if (days > 3650) {
		return Promise.reject("Please enter an amount of days that's not more than 3650.");
	}

	const certificate = new Certificate();
	certificate.version = 2;
	certificate.serialNumber = new asn1js.Integer({
		value: Math.floor(Math.random() * 99999999999),
	});

	let subjectAndIssuer = new AttributeTypeAndValue({
		type: "2.5.4.3",
		value: new asn1js.Utf8String({ value: domain }),
	});
	certificate.subject.typesAndValues.push(subjectAndIssuer);
	certificate.issuer.typesAndValues.push(subjectAndIssuer);

	let notBefore = new Date();
	let notAfter = new Date();
	notAfter = notAfter.setDate(
		notBefore.getDate() + Number(days)
	);
	certificate.notBefore.value = notBefore;
	certificate.notAfter.value = new Date(notAfter);

	certificate.extensions = [];
	const basicConstr = new BasicConstraints({
		cA: false,
	});

	certificate.extensions.push(
		new Extension({
			extnID: "2.5.29.19",
			critical: true,
			extnValue: basicConstr.toSchema().toBER(false),
			parsedValue: basicConstr,
		})
	);

	const bitArray = new ArrayBuffer(1);
	const bitView = new Uint8Array(bitArray);
	bitView[0] |= 0x0080;
	bitView[0] |= 0x0020;

	const keyUsage = new asn1js.BitString({ valueHex: bitArray });
	certificate.extensions.push(
		new Extension({
			extnID: "2.5.29.15",
			critical: true,
			extnValue: keyUsage.toBER(false),
			parsedValue: keyUsage,
		})
	);

	const extKeyUsage = new ExtKeyUsage({
		keyPurposes: ["1.3.6.1.5.5.7.3.1"],
	});

	certificate.extensions.push(
		new Extension({
			extnID: "2.5.29.37",
			critical: false,
			extnValue: extKeyUsage.toSchema().toBER(false),
			parsedValue: extKeyUsage,
		})
	);

	const altNames = [];
	const sans = [domain];
	if (wildcard) {
		sans.push("*."+domain);
	}

	$.each(sans, (k, san) => {
		altNames.push(
			new GeneralName({
				type: 2,
				value: san
			})
		);
	});

	const altName = new AltName({ altNames: altNames });
	certificate.extensions.push(
		new Extension({
			extnID: "2.5.29.17",
			critical: false,
			extnValue: altName.toSchema().toBER(false),
			parsedValue: altName,
		})
	);

	sequence = sequence.then(() => {
		const algorithm = getAlgorithmParameters(signAlg, "generatekey");
		if ("hash" in algorithm.algorithm) {
			algorithm.algorithm.hash.name = hashAlg;
		}
		if (String(keySize).startsWith("P-")) {
			algorithm.algorithm.namedCurve = keySize;
		} 
		else {
			algorithm.algorithm.modulusLength = keySize;
		}

		return crypto.generateKey(algorithm.algorithm, true, algorithm.usages);
	});

	sequence = sequence.then(
		(keyPair) => {
			publicKey = keyPair.publicKey;
			privateKey = keyPair.privateKey;
		},
		(error) => Promise.reject(`Error during key generation: ${error}`)
	);

	sequence = sequence.then(() =>
		certificate.subjectPublicKeyInfo.importKey(publicKey)
	);

	sequence = sequence.then(
		() => certificate.sign(privateKey, hashAlg),
		(error) => Promise.reject(`Error during exporting public key: ${error}`)
	);

	sequence = sequence.then(
		() => {
			certBuffer = certificate.toSchema(true).toBER(false);
		},
		(error) => Promise.reject(`Error during signing: ${error}`)
	);

	sequence = sequence.then(() => crypto.exportKey("pkcs8", privateKey));

	sequence = sequence.then(
		(result) => {
			keyBuffer = result;
		},
		(error) => Promise.reject(`Error during exporting of private key: ${error}`)
	);

	sequence = sequence.then(() => crypto.exportKey("spki", publicKey));

	sequence = sequence.then(
		(result) => {
			pubkeyBuffer = result;
		},
		(error) => Promise.reject(`Error during exporting of public key: ${error}`)
	);
	return sequence;
}

function log(s) {
	console.log(s);
}

function splitString(length, string) {
	return string.match(/.{1,64}/g).join("\r\n");
}

function formatCert(type, data) {
	var name;
	switch (type) {
		case "cert":
			name = "CERTIFICATE";
			break;

		case "key":
			name = "PRIVATE KEY";
			break;

		case "pub":
			name = "PUBLIC KEY";
			break;
	}

	let header = "-----BEGIN "+name+"-----\r\n";
	let body = splitString(64, data)+"\r\n";
	let footer = "-----END "+name+"-----\r\n";

	return header+body+footer;
}

function setData(el, key, data) {
	el.data(key, data).attr("data-"+key, data);
}

function afterSubmit(e, response) {
	let button = $(e.target);
	let action = button.data("action");

	button.removeClass("disabled");

	if (response.success) {
		switch (action) {
			case "createCert":
				let domain = response.data.domain;
				setData($("#results .result[data-type=cert]"), "domain", domain);
				$("#results .result[data-type=cert] .name span").text(domain);
				$("#results .result[data-type=key] .name span").text(domain);

				setData($("#results .result[data-type=cert]"), "content", response.data.cert);
				setData($("#results .result[data-type=key]"), "content", response.data.key);
				setData($("#results .result[data-type=tlsa]"), "content", response.data.tlsa);

				$("#cert").fadeOut(250, () => {
					$("#results").fadeIn(250);
				});
				break;
		}
	}
	else {
		alert(response.message);
	}
}

async function api(data) {
	let output = new Promise(function(resolve) {
		$.post("/api", JSON.stringify(data), function(response){
			if (response) {
				let json = JSON.parse(response);

				if (json.message) {
					alert(json.message);
				}

				resolve(json);
			}
		});
	});

	return await output;
}

function generateTLSA(cert) {
	let data = {
		action: "getTLSA",
		cert: cert
	};

	return api(data);
}

async function generateTSLA(buffer) {
	let output = new Promise(function(resolve) {
		const crypto = getCrypto();
		crypto.digest(hashAlg, buffer).then((result) => {
			const array = Array.from(new Uint8Array(result));
			const hex = array.map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
			resolve("3 1 1 "+hex);
		});
	});

	return await output;
}

function download(filename, text) {
	var element = $("<a/>");
	element.attr("href", 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	element.attr("download", filename);
	element.addClass("download");
	element.css("display", "none");
	$("body").append(element);
	element[0].click();
	element.remove();
}

function clipboard(link, text) {
	let title = link.text();
	navigator.clipboard.writeText(text);

	link.text("Copied!");
	setTimeout(() => {
		link.text(title);
	}, 1000);
}

$(() => {
	$("html").on("click", ".button", (e) => {
		e.preventDefault();

		let button = $(e.target);
		if (button.hasClass("disabled")) {
			return;
		}
		else {
			button.addClass("disabled");
		}

		let form = button.closest("form");
		let action = button.data("action");

		switch (action) {
			case "createCert":
				let domain = form.find("input[name=domain]").val();
				let days = form.find("input[name=days]").val();
				let wildcard = form.find("input[name=wildcard]").prop("checked");

				createCert(domain, wildcard, days).then(() => {
					const certificateString = String.fromCharCode.apply(
						null,
						new Uint8Array(certBuffer)
					);
					let certData = btoa(certificateString);
					let cert = formatCert("cert", certData);

					const privateKeyString = String.fromCharCode.apply(
						null,
						new Uint8Array(keyBuffer)
					);
					let keyData = btoa(privateKeyString);
					let key = formatCert("key", keyData);

					generateTSLA(pubkeyBuffer).then((tlsa) => {
						let response = {
							success: true,
							data: {
								domain: domain,
								cert: cert,
								key: key,
								tlsa: tlsa
							}
						};
						afterSubmit(e, response);
					});
				}, (error) => {
					let response = {
						success: false,
						message: error
					};
					afterSubmit(e, response);
				});
				break;

			case "startOver":
				$("input").val("");
				afterSubmit(e, { success: true });
				$("#results").fadeOut(250, () => {
					$("#cert").fadeIn(250);
				});
				break;
		}
	});

	$("html").on("click", ".link", (e) => {
		let target = $(e.target);
		let result = target.closest(".result");
		let type = result.data("type");
		let data = result.data("content");
		let domain = $("#results .result[data-type=cert]").data("domain");

		switch (type) {
			case "cert":
				download(domain+".crt", data);
				break;

			case "key":
				download(domain+".key", data);
				break;

			case "tlsa":
				clipboard(target, data);
				break;
		}
	});

	$("html").on("keyup", "input", (e) => {
		if (e.which == 13) {
			e.preventDefault();
			$(e.target).closest("form").find(".button").click();
		}
	});
});