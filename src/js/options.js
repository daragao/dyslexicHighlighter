$(document).ready(function() {
    var $highlightLineCheckbox = $('#highlight-line');
    chrome.storage.sync.get(function (items) {
        $highlightLineCheckbox.prop('checked',items.highlightLine);
    });
    $('form').change(function(event) {
        chrome.storage.sync.set({
            'highlightLine': $highlightLineCheckbox.prop('checked')
        },function(){
            console.log('Set storage');
        });
    });
});
