export default class Dom {
    constructor() {}

    static createSheet(jsonSheet) {
        //페이지 생성(PageTitle, Page)
        Dom.createPage(document.querySelector('.View'), jsonSheet.PAGE_NAMEVALUE);
    }

    static createPage(parentElem, json) {
        //param 부모엘리먼트, 생성할엘리먼트종류, 클래스명, 스타일, 내용, 속성
        Dom.createElement(parentElem, 'div', 'PageTitle', {}, json.Date + ' ' + json.Time + ' ' + json.Title, null);
        Dom.createElement(parentElem, 'div', 'Page', {}, null, json);
    }
    
    static createElement(parentElem, elementType, cla, style, content, hiddenAttr) {
        let element = document.createElement(elementType);  //element 생성
        if(cla) element.classList.add(cla); //class 삽입
        if(content) element.innerHTML = content; //content 삽입
        
        parentElem.appendChild(element);

        if(hiddenAttr) {
            for(let key in hiddenAttr) {
                if(key == 'PANEL_NAMEVALUE') {
                    hiddenAttr.PANEL_NAMEVALUE.forEach(function(data) {
                        Dom.createElement(element, 'div', 'Panel', {}, null, data);
                    });
                } else if(key == 'ITEM_NAMEVALUE') {
                    hiddenAttr.ITEM_NAMEVALUE.forEach(function(data) {
                        Dom.createElement(element, 'div', 'Item', {}, null, data);
                    });
                } else {
                    Dom.createHiddenAttr(element, key, hiddenAttr[key]);
                }
            }
        }

        return element;
    }

    static createHiddenAttr(parentElem, name, value) {
        let element = document.createElement('input');  //element 생성        
        element.setAttribute('type', 'hidden');
        element.setAttribute('name', name);
        element.setAttribute('value', value);
        parentElem.appendChild(element);

        return element;
    }
}