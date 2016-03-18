load("init.js");

testOnAllDevices("index.html test", "/", function (driver, device) {
    // Here the driver will be provided and you don't have to take care of it
    // Also once the test finishes it will automatically quit the driver.

    // Here we call standard checkLayout function from Galen Api (http://galenframework.com/docs/reference-galen-javascript-api/#checkLayout)
    checkLayout(driver, "homepage.gspec", device.tags, device.excludedTags);
});
