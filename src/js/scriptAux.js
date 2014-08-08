'use strict';

var wordsClass = 'word';
var wordHighliterId = 'wordHighlighter';
var div = document.createElement( 'div' );
div.id = wordHighliterId;

var isFreeline = false;
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
        div.style.top = (e.pageY-10)+'px';
    } else {
        var  elementMouseIsOver = document.elementFromPoint(tempX,tempY);
        var wordCoord = highlightWords(elementMouseIsOver);
        var hasChanged = moveWordHighlighter(wordCoord);
        if(hasChanged) {
            console.log($(elementMouseIsOver).text());
        }
    }
    return true;
}

function moveWordHighlighter(wordCoord) {
    var $wordHighliterElem = $('#'+wordHighliterId);
    if( !_.isEqual(wordCoord,$wordHighliterElem.data('wordCoord')) && wordCoord && $.isPlainObject(wordCoord)) {
        $wordHighliterElem.data('wordCoord',_.clone(wordCoord));
        var options = {queue:false};
        var sideSpace = 5;
        wordCoord.top += -sideSpace;
        wordCoord.height += sideSpace*2;
        wordCoord.left += -sideSpace;
        wordCoord.width += sideSpace*2;
        $wordHighliterElem.animate(wordCoord,options,100);
        return true;
    }
    return false;
}

function unwrapWords() {
    var $wordElems = $('.'+wordsClass);
    if($wordElems.length)
        $wordElems.contents().unwrap();
}

function highlightWords(element) {
    var classStr = wordsClass;
    var $element = $(element);
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
        var wordCoord = {
            top: $dyslexiaElems.offset().top,
            left: $dyslexiaElems.offset().left,
            height: $dyslexiaElems.height(),
            width: $dyslexiaElems.width()
        };
        return wordCoord;
    }
    return undefined;
}

