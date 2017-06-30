export default class Style {
    constructor() {}

    //서식의 속성을 style로 적용한다.
    static attrToStyle(parentElem, name, value) {  
        //속석명 소문자로      
        let attrName = name.toLowerCase();
        
        //서식의 속성과 style의 속성이 일치하지 않아 변경한다.
        if(attrName == 'x') attrName = 'left';
        if(attrName == 'y') attrName = 'top';   
        if(attrName == 'backcolor') attrName = 'background-color';   
        if(attrName == 'textcolor') attrName = 'color';   
        //  

        //style Name, Value를 적용한다.(width, height, top, left는 px적용)
        let attrToStyle = ['width', 'height', 'top', 'left', 'background-color', 'textcolor'];
        let attrToStyleString = '|'+attrToStyle.join('|')+'|';
        
        if(attrToStyleString.indexOf(attrName) != -1) {
            if(attrName == 'width' || attrName == 'height' || attrName == 'top' || attrName == 'left') value += 'px';
            parentElem.style[attrName] = value;
        }
        //

        //text 입력
        if(attrName == 'text') {
            //수정가능한 div 삽입(text)
            let textContent = document.createElement('div');
            textContent.innerHTML = value;
            textContent.setAttribute('contenteditable', true);

            parentElem.insertBefore(textContent, parentElem.firstChild);
        }
    }

    //서식의 TextFont를 style에 맞도록 변경하여 적용한다.
    static fontStyle(element) {
        let PropertyTextAlign = [
            "LeftTop", "LeftMiddle", "LeftBottom", 
            "CenterTop", "CenterMiddle", "CenterBottom", 
            "RightTop", "RightMiddle", "RightBottom"
        ];

        let textFont = element.querySelector('input[name=TextFont]').getAttribute('value');
        let text = element.querySelector('input[name=Text]').getAttribute('value');
        let textAlign = element.querySelector('input[name=TextAlign]').getAttribute('value');
        textAlign = PropertyTextAlign[textAlign].toLowerCase();
        let textLineSpacing = element.querySelector('input[name=TextLineSpacing]').getAttribute('value');

        let align = textAlign.replace(/top|middle|bottom/, '');
        let valign = textAlign.replace(/left|center|right/, '');

        element.style['text-align'] = align;
        element.style['vertical-align'] = valign;        
       
        if(textFont) {
            let arrTextFont = textFont.split(' ');
            if(arrTextFont.length == 2) {
                let fontFamily = arrTextFont[1];
                let fontSize = arrTextFont[0];

                if(text) {
                    
                }

            } else if(arrTextFont.length == 3) {

            }
        }

        //TextFont(폰트크기 폰트체, 폰트특징 폰트크기 폰트체)
    }
};