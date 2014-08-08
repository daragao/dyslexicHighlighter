var toggleScript = (function() {
    var isScriptOn = false;
    return function(){
        var scriptFile;
        if(isScriptOn){
        //chrome.browserAction.setIcon({path:"inactive.png"});
            chrome.tabs.executeScript(null, {file: "src/js/scriptOff.js"})
        } else {
        //chrome.browserAction.setIcon({path:"icon.png"});
        chrome.tabs.executeScript(null, {file: "src/js/scriptOn.js"})
        }
        isScriptOn = !isScriptOn;
        };
    }
)();


/* When the browser-action button is clicked... */
chrome.browserAction.onClicked.addListener(
function(tab) {
    chrome.tabs.sendMessage(tab.id, { text: "report_back" }, toggleScript);
});
