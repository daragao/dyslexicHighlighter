var toggleScript = (function() {
    var isScriptOn = false;
    return function(tab){
        var scriptFile;

        isScriptOn = !isScriptOn;
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {isScriptOn: isScriptOn},
                function(response) {
                    console.log(response.farewell);
                });
        });
    };
})();

/* When the browser-action button is clicked... */
chrome.browserAction.onClicked.addListener(toggleScript);
