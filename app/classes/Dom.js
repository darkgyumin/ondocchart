import Style from './Style';
import Pen from './Pen';

export default class Dom {
    constructor() {}

    static sheetToDom(jsonSheet) {
        //페이지 생성(PageTitle, Page)
        let viewElement = Dom.createElement(document.querySelector('.Board'), 'div', 'View', {}, null, null);
        Dom.createElementPage(viewElement, jsonSheet.PAGE_NAMEVALUE);
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
                        let container = null;
                        if(element.querySelector('.PanelContainer') == null) {
                            container = Dom.createElement(element, 'div', 'PanelContainer', {}, null, null);
                        } else {
                            container = element.querySelector('.PanelContainer');
                        }
                        //Panel 생성
                        Dom.createElement(container, 'div', 'Panel', {}, null, data);
                    });
                } else if(key == 'ITEM_NAMEVALUE') {
                    hiddenAttr.ITEM_NAMEVALUE.forEach(function(data) {
                        //Item Container 생성
                        let container = null;
                        if(element.querySelector('.ItemContainer') == null) {
                            container = Dom.createElement(element, 'div', 'ItemContainer', {}, null, null);
                        } else {
                            container = element.querySelector('.ItemContainer');
                        }
                        //Item 생성
                        Dom.createElement(container, 'div', 'Item', {}, null, data);
                    });
                } else {
                    Dom.createHiddenAttr(element, key, hiddenAttr[key]);
                    Style.attrToStyle(element, key, hiddenAttr[key]);
                    
                    //Panel의 Pens속성을 Canvas에 그린다.
                    if(key == 'Pens') {Pen.createPen(element, hiddenAttr[key]);}
                    
                    //바로적용 불가능한 연관된 스타일을 적용한다.
                    if(key == 'Text') {Style.relatedFontStyle(element);}
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
    static domToSheet(view) {
        let arrPara = [];
        
        //PAGE_NAMEVALUE
        arrPara.push("PAGE_NAMEVALUE|^@3@^|"+Dom.createSheetAttr(view.querySelectorAll('.Page > input')));

        let Panel = view.querySelectorAll('.Page > .PanelContainer > .Panel');

        Panel.forEach(function(panel) {
            //PANEL_NAMEVALUE
            arrPara.push("PANEL_NAMEVALUE|^@3@^|"+Dom.createSheetAttr(panel.querySelectorAll(':scope > input')));

            let Item = panel.querySelectorAll('.Panel > .ItemContainer > .Item');
            
            //ITEM_NAMEVALUE
            Item.forEach(function(item) {
                arrPara.push("ITEM_NAMEVALUE|^@3@^|"+Dom.createSheetAttr(item.querySelectorAll(':scope > input')));
            });
        });

        return arrPara.join('|^@4@^|');
    }

    static createSheetAttr(attr) {
        let arrAttr = [];
        attr.forEach(function(data) {
            //Pens 데이터 없으면 서식에 내용 생략함(데이터가 없는 경우 Pens 속성이 추가 되어 있으면 PC버전에서 로딩 에러발생)
            if(data.getAttribute('name') == 'Pens') {
                if(data.getAttribute('value') != '') 
                    arrAttr.push(data.getAttribute('name')+'|^@1@^|'+data.getAttribute('value'));
            } else {
                arrAttr.push(data.getAttribute('name')+'|^@1@^|'+data.getAttribute('value'));
            }
        });

        return arrAttr.join('|^@2@^|');
    }

    static doShowModifyMark(view) {
        let PageTitle = view.querySelector('.PageTitle');
        let tagModify = PageTitle.querySelector('.tagModify');
        if(tagModify == null) {
            let span = document.createElement('span');
            span.classList.add('tagModify');
            span.innerHTML = ' *';

            PageTitle.appendChild(span);
        }
    }

    static doShowProhibit(view) {
        let PageTitle = view.querySelector('.PageTitle');
        let tagModify = PageTitle.querySelector('.tagModify');
        if(tagModify == null) {
            let span = document.createElement('span');
            span.classList.add('tagModify');
            span.innerHTML = ' [편집불가]-다른사용자 편집중';

            PageTitle.appendChild(span);
        }
    }

    static doShowNoPermission(view) {
        let PageTitle = view.querySelector('.PageTitle');
        let tagModify = PageTitle.querySelector('.tagModify');
        if(tagModify == null) {
            let span = document.createElement('span');
            span.classList.add('tagModify');
            span.innerHTML = ' [편집불가]-권한없음';

            PageTitle.appendChild(span);
        }
    }

    static doHideModifyMark() {
        let arrView = document.querySelectorAll('.View');
        arrView.forEach(function(view) {
            let PageTitle = view.querySelector('.PageTitle');
            let tagModify = view.querySelector('.PageTitle .tagModify');

            if(tagModify != null) PageTitle.removeChild(tagModify);
        });
    }
}