console.log('script off!');

if(getMouseXY)
    document.removeEventListener("mousemove",getMouseXY,false);
if(div)
    div.remove();
unwrapWords();
