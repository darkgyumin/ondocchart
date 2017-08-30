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
            if(attrName == 'width' || 
                attrName == 'height' || 
                attrName == 'top' || 
                attrName == 'left') value += 'px';

            parentElem.style[attrName] = value;
        }
        //
    }

    //서식의 TextFont를 style에 맞도록 변경하여 적용한다.
    static relatedFontStyle(element) {
        let PropertyTextAlign = [
            "LeftTop", "LeftMiddle", "LeftBottom", 
            "CenterTop", "CenterMiddle", "CenterBottom", 
            "RightTop", "RightMiddle", "RightBottom"
        ];
        
        let key = element.querySelector('input[name=Key]').getAttribute('value');
        let style = element.querySelector('input[name=Style]').getAttribute('value');
        let edit = element.querySelector('input[name=Edit]').getAttribute('value');
        let width = element.querySelector('input[name=Width]').getAttribute('value');
        let height = element.querySelector('input[name=Height]').getAttribute('value');
        let backImageString = element.querySelector('input[name=BackImageString]').getAttribute('value');
        let borderColor = element.querySelector('input[name=BorderColor]').getAttribute('value');
        let borderWidth = element.querySelector('input[name=BorderWidth]').getAttribute('value');
        let checked = element.querySelector('input[name=Checked]').getAttribute('value');
        let textFont = element.querySelector('input[name=TextFont]').getAttribute('value');
        let text = element.querySelector('input[name=Text]').getAttribute('value');
        let textAlign = element.querySelector('input[name=TextAlign]').getAttribute('value');
        let textLineSpacing = element.querySelector('input[name=TextLineSpacing]').getAttribute('value');
        let isBorderLeft = element.querySelector('input[name=IsBorderLeft]').getAttribute('value');
        let isBorderRight = element.querySelector('input[name=IsBorderRight]').getAttribute('value');
        let isBorderTop = element.querySelector('input[name=IsBorderTop]').getAttribute('value');
        let isBorderBottom = element.querySelector('input[name=IsBorderBottom]').getAttribute('value');

        textAlign = PropertyTextAlign[textAlign].toLowerCase();
        let align = textAlign.replace(/top|middle|bottom/, '');
        let valign = textAlign.replace(/left|center|right/, '');

        element.style['text-align'] = align;
        element.style['vertical-align'] = valign;

        if(style == '1' && !backImageString) element.classList.add('text');
        else if(style == '2' && !backImageString) element.classList.add('checkbox');
        else if(backImageString) element.classList.add('image');

        //Item에 key값을 줘서 값 대치시
        element.classList.add('item_'+key);

        //item border 세팅        
        if(isBorderLeft == 'true') element.style['border-left'] = borderWidth + 'px';
        else if(isBorderLeft == 'false') element.style['border-left'] = '0px';
        if(isBorderRight == 'true') element.style['border-right'] = borderWidth + 'px';
        else if(isBorderRight == 'false') element.style['border-right'] = '0px';
        if(isBorderTop == 'true') element.style['border-top'] = borderWidth + 'px';
        else if(isBorderTop == 'false') element.style['border-top'] = '0px';
        if(isBorderBottom == 'true') element.style['border-bottom'] = borderWidth + 'px';
        else if(isBorderBottom == 'false') element.style['border-bottom'] = '0px';
        if(borderColor) element.style['border-color'] = borderColor;

        element.style['border-style'] = 'solid';

        if(borderWidth == '1') {
            element.style['width'] = (parseInt(width) - 1) + 'px';    
            element.style['height'] = (parseInt(height) - 1) + 'px';
        }
       
        //font-family, font-size, line-height, font-style(weight)
        if(textFont) {
            let arrTextFont = textFont.split(' ');
            if(arrTextFont.length == 2) {
                element.style['font-family'] = arrTextFont[1];
                element.style['font-size'] = arrTextFont[0];

                if(text) {
                    if(textLineSpacing == 0) {
                        if(text.indexOf('|^@^|') > -1) {//줄바꿈이 있는 경우
                            if(valign == 'middle') {
                                //element.style['line-height'] = height + 'px';
                            }
                        } else {//줄바꿈이 없는 경우
                            if(valign == 'middle') {
                                element.style['line-height'] = height + 'px';
                            }
                        }
                    }
                }

            } else if(arrTextFont.length == 3) {
                element.style['font-family'] = arrTextFont[2];
                element.style['font-size'] = arrTextFont[1];
                element.style['line-height'] = arrTextFont[1];

                if(text) {
                    if(textLineSpacing == 0) {
                        if(text.indexOf('|^@^|') > -1) {//줄바꿈이 있는 경우
                            if(valign == 'middle') {
                                //element.style['line-height'] = height + 'px';
                            }
                        } else {//줄바꿈이 없는 경우
                            if(valign == 'middle') {
                                element.style['line-height'] = height + 'px';
                            }
                        }
                    }
                }

                if(arrTextFont[0] == 'bold') element.style['font-weight'] = 'bold';
            }
        }
        
        //text 입력
        let textContent = null;
        if(style == '1') {
            //특수문자 출력
            if(text && edit == 'false') text = Style.convertHtmlTag(text);
            
            textContent = document.createElement('div');
            textContent.classList.add('textContent');

            if(edit == 'true') {
                //textContent 편집 가능하도록
                textContent.setAttribute('contenteditable', true);
                ///////////////////////////////////////////////////
                ////////////////////////////////////////////////////
                //vertical정렬에 대한 고민중... TODO
                //textContent.style['height'] = '100%';
            }

            if(element.style['vertical-align'] == 'middle') {
                //수정 불가능한 라벨형의 vertical-align: middle인 경우 중간 정렬 되도록
                textContent.style['position'] = 'relative';
                textContent.style['top'] = '50%';
                textContent.style['transform'] = 'translateY(-50%)';
            }
            
            element.insertBefore(textContent, element.firstChild);
            
            //line-height값이 없고 vertical-align이 middle이면 line-height값을 적용.
            if(element.style['line-height'] == '') {
                if(element.style['vertical-align'] == 'middle') {
                    if(parseInt(element.style['height'], 10) <= 30) {
                        //element.style['line-height'] = element.style['height'];
                    }
                }
            }

            //text 입력
            if(text) {    
                //|^@^|을 <br />로 변경
                while (text.indexOf("|^@^|") > -1) {text = text.replace("|^@^|", "<br>");}
                //html <, > 출력시 출력이 안되서 태그처리 Edit 상태가 false일때만 Edit 가능할 경우는 태그 변경하면 안됨.
                
                textContent.innerHTML = text;
            }
        }

        //Style이 2이면 checkbox형태/
        if(style == '2') {
            textContent = document.createElement('div');
            textContent.classList.add('textContent');

            element.style['line-height'] = element.style['height'];

            if(checked == 'true') {
                textContent.innerHTML = '<input type="checkbox" id="key_'+key+'" checked="checked"><label for="key_'+key+'">'+text+'</label>';
            } else {
                textContent.innerHTML = '<input type="checkbox" id="key_'+key+'"><label for="key_'+key+'">'+text+'</label>';
            }

            element.insertBefore(textContent, element.firstChild);
        }

        //image 입력
        if(backImageString) {
            let itemImage = document.createElement('img');
            itemImage.setAttribute('width', '100%');
            itemImage.setAttribute('height', '100%');
            itemImage.setAttribute('src', backImageString);
            itemImage.style['position'] = 'absolute';
            itemImage.style['top'] = '0';
            itemImage.style['left'] = '0';

            element.insertBefore(itemImage, element.firstChild);
        }

        if(style == '1' && edit == 'true') {
            if(borderWidth == '0') {
                //element.style['border'] = '1px';
                element.style['border'] = '0';
                element.style['border-style'] = 'dotted';
                element.style['border-color'] = 'rgba(0, 0, 0, 0.3)';
                element.style['background-color'] = 'rgba(253, 255, 109, 0.1)';
            } else {
                element.style['background-color'] = 'rgba(253, 255, 109, 0.1)';
            }
        }

        if(style == '1' && !backImageString && edit == 'false') {
            if(text.indexOf('<br />') > -1) {
                textContent.style['line-height'] = '14px';
                textContent.style['display'] = 'inline-block';

                element.style['line-height'] = (parseInt(element.style.height, 10) + 
                                                    parseInt(textContent.offsetHeight, 10) / 2) + 'px';
            }
        }
    }

    static convertHtmlTag(str) {
        str = str.replace(/&/g, '&amp;');
        str = str.replace(/</g, '&lt;');
        str = str.replace(/>/g, '&gt;');
        str = str.replace(/\"/g, '&quot;');
        str = str.replace(/\'/g, '&#39;');

        return str;
    }
};