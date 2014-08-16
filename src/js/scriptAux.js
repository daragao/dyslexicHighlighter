'use strict';
(function() {
    var extensionId = chrome.i18n.getMessage("@@extension_id");
    var extensionNamespace = "dyslexia"+extensionId;
    var wordsClass = 'word'+extensionId;
    var wordHighliterId = 'wordHighlighter';

    var isFreeline = false; //follow the mouse withouth caring for word position
    var highlightLine = true; //highglight a whole line or just a word
    // Main function to retrieve mouse x-y pos.s
    function getMouseXY(e) {
        var tempX = e.clientX;
        var tempY = e.clientY;
        // catch possible negative values in NS4
        if (tempX < 0){tempX = 0;}
        if (tempY < 0){tempY = 0;}
        // show the position values in the form named Show
        // in the text fields named MouseX and MouseY
        if(isFreeline) {
            var $wordHighliterElem = $('#'+wordHighliterId);
            $wordHighliterElem.css('top',(e.pageY-10));
        } else {
            var  elementMouseIsOver = document.elementFromPoint(tempX,tempY);
            var $elementMouseIsOver = $(elementMouseIsOver);
            var wordCoord = highlightWords($elementMouseIsOver);
            var hasChanged = moveWordHighlighter(wordCoord);
            if(hasChanged) {
                //console.log($(elementMouseIsOver).text());
            }
        }
        return true;
    }

    function setActiveElement($newActiveElement) {
        var activeClassName = "active";
        $('.' + wordsClass).removeClass(activeClassName);
        $newActiveElement.addClass(activeClassName);
    }

    function moveWordHighlighter(wordCoord) {
        var $wordHighliterElem = $('#'+wordHighliterId);
        if(!_.isEqual(wordCoord,$wordHighliterElem.data('wordCoord'))
           && wordCoord &&
           $.isPlainObject(wordCoord)) {
               $wordHighliterElem.data('wordCoord',_.clone(wordCoord));
               var options = {
                   queue:false,
                   duration: 100
               };
               var sideSpace = 5;
               wordCoord.top += -sideSpace;
               wordCoord.height += sideSpace*2;
               if(!highlightLine) {
                   wordCoord.left += -sideSpace;
                   wordCoord.width += sideSpace*2;
               }
               $wordHighliterElem.animate(wordCoord,options);
               return true;
           }
           return false;
    }

    function unwrapWords() {
        var $wordElems = $('.'+wordsClass);
        if($wordElems.length)
            $wordElems.contents().unwrap();
    }

    function highlightWords($element) {
        var classStr = wordsClass;
        var $dyslexiaElems = $element.find('.'+classStr).andSelf().
            filter('.'+classStr);
        if(!$dyslexiaElems.length) {
            var contents = $element.contents();
            var textContents = contents.filter(
                function(){
                return this.nodeType !== 1
            });
            textContents.replaceWith(function() {
                return (this.nodeValue || "").replace(
                    /(\w+)/g,
                    function(match) {
                        return "<span class=\""+classStr+"\">" + match + "</span>";
                    });
            });
        } else if($dyslexiaElems.length===1) {
            setActiveElement($dyslexiaElems);
            var wordCoord = {
                top: $dyslexiaElems.offset().top,
                left: highlightLine ? 0 : $dyslexiaElems.offset().left,
                height: $dyslexiaElems.height(),
                width: highlightLine ? '100%' : $dyslexiaElems.width(),
                'border-radius': highlightLine ? 0 : 10
            };
            return wordCoord;
        }
        return undefined;
    }

    var onKeypress = (function() {
        var keyTimestamp = {};
        return function(event) {
            var $activeElem = $('.' + wordsClass + '.active');
            var $allWords = $('.' + wordsClass);
            var activeIndex = $allWords.index($activeElem);
            var acceptedKeyCodes = [37,38,39,40];
            if(!_.contains(acceptedKeyCodes,event.keyCode) ||
               (keyTimestamp[String(event.keyCode)] &&
                (event.timeStamp - keyTimestamp[String(event.keyCode)]) < 500))
                return;
            keyTimestamp[String(event.keyCode)] = event.timeStamp;
            var newActiveIndex = activeIndex;
            switch (event.keyCode) {
                case 37: //left
                    if(!highlightLine) { //step word by word if hilighting words
                        newActiveIndex--;
                        break;
                    }
                case 38: //up
                    for(var i = activeIndex-1; -1 != i; i--) {
                    if($activeElem.offset().top > $($allWords.get(i)).offset().top) {
                        newActiveIndex = i;
                        break;
                    }
                }
                break;
                case 39: //right
                    if(!highlightLine) { //step word by word if hilighting words
                        newActiveIndex++;
                        break;
                    }
                case 40: //down
                    for(var i = activeIndex+1; $allWords.length > i; i++) {
                    if($activeElem.offset().top < $($allWords.get(i)).offset().top) {
                        newActiveIndex = i;
                        break;
                    }
                }
                break;
            }
            var $newActiveElem = $($allWords.get(newActiveIndex));
            var wordCoord = highlightWords($newActiveElem);
            var hasChanged = moveWordHighlighter(wordCoord);
        }
    })();

    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
        toggleScript(request.isScriptOn);
        //sendResponse({farewell: "goodbye"});
    });

    function setOptions() {
        chrome.storage.sync.get(function (items) {
            highlightLine = items.highlightLine;
        });
    }

    function toggleScript(scriptOn) {
        var $wordHighliterElem = $('#'+wordHighliterId);
        var keypressNamespace = "keydown."+extensionNamespace;
        var mousemoveNamespace = "mousemove."+extensionNamespace;
        if(!$wordHighliterElem.length) { //append to body if doesn't exest
            var div = document.createElement( 'div' );
            div.id = wordHighliterId;
            $wordHighliterElem = $(div);
        }
        if(scriptOn) {
            console.log('script on!');
            setOptions();
            $(document).bind(mousemoveNamespace,getMouseXY);
            $(document).bind(keypressNamespace, onKeypress);
            $wordHighliterElem.appendTo("body");
        } else {
            console.log('script off!');
            $(document).unbind(mousemoveNamespace,getMouseXY);
            $(document).unbind(keypressNamespace, onKeypress);
            $wordHighliterElem.remove();
            unwrapWords();
        }
    }
})();
