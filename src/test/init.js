load("galen-bootstrap/galen-bootstrap.js");

$galen.settings.website = "http://testapp.galenframework.com";
$galen.registerDevice("mobile", inLocalBrowser("mobile emulation", "450x800", ["mobile"]));
$galen.registerDevice("tablet", inLocalBrowser("tablet emulation", "600x800", ["tablet"]));
$galen.registerDevice("desktop", inLocalBrowser("desktop emulation", "1024x768", ["desktop"]));

$galen.settings.website = "http://192.168.0.102:3000";
