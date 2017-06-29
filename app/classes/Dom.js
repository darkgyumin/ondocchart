export default class Dom {
    constructor() {}

    static sheetToDom(jsonSheet) {
        //페이지 생성(PageTitle, Page)
        Dom.createElementPage(document.querySelector('.View'), jsonSheet.PAGE_NAMEVALUE);
    }

    static createElementPage(parentElem, json) {
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
                        //Panel Container 생성
                        let container = Dom.createElement(element, 'div', 'PanelContainer', {}, null, null);
                        //Panel 생성
                        Dom.createElement(container, 'div', 'Panel', {}, null, data);
                    });
                } else if(key == 'ITEM_NAMEVALUE') {
                    hiddenAttr.ITEM_NAMEVALUE.forEach(function(data) {
                        //Item Container 생성
                        let container = Dom.createElement(element, 'div', 'ItemContainer', {}, null, null);
                        //Item 생성
                        Dom.createElement(container, 'div', 'Item', {}, null, data);
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

    //element를 서식화
    static domToSheet() {
        let arrPara = [];
        
        //PAGE_NAMEVALUE
        arrPara.push("PAGE_NAMEVALUE|^@3@^|"+Dom.createSheetAttr(document.querySelectorAll('.Page > input')));

        let PanelContainer = document.querySelectorAll('.Page > .PanelContainer');

        PanelContainer.forEach(function(panelContainer) {
            //PANEL_NAMEVALUE
            arrPara.push("PANEL_NAMEVALUE|^@3@^|"+Dom.createSheetAttr(panelContainer.querySelectorAll('.Panel > input')));

            let ItemContainer = panelContainer.querySelectorAll('.Panel > .ItemContainer');
            
            //ITEM_NAMEVALUE
            ItemContainer.forEach(function(itemContainer) {
                arrPara.push("ITEM_NAMEVALUE|^@3@^|"+Dom.createSheetAttr(itemContainer.querySelectorAll('.Item > input')));
            });
        });

        return arrPara.join('|^@4@^|');
    }

    static createSheetAttr(attr) {        
        let arrAttr = [];
        attr.forEach(function(data) {
            arrAttr.push(data.getAttribute('name')+'|^@1@^|'+data.getAttribute('value'));
        });

        return arrAttr.join('|^@2@^|');
    }
}