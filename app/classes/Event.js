import Dom from './Dom';
import Pen from './Pen';
import axios from 'axios';
import Serialize from 'form-serialize';

export default class Event {
    constructor() {}

    static scrollMenu(elem) {
        elem.addEventListener('click', (e) => {
            scrollMenuAction(e.target.id);
        });
    }

    static colorMenu(elem) {
        elem.addEventListener('click', (e) => {
            colorMenuAction(e.target, e.target.id);
        });
    }

    static view(elem) {
        let context = null;
        let penData = [];
        let lineWidth = null;
        let strokeStyle = null;
        let pens = null;

        //panel에 canvas 생성 및 이동
        document.querySelectorAll('.View .Panel').forEach(function(panel) {
            let canvas = panel.querySelector('canvas');
            if(canvas == null) {
                //canvas가 없으면 canvas 생성해줌
                let width = panel.querySelector('input[name=Width]').getAttribute('value');
                let height = panel.querySelector('input[name=Height]').getAttribute('value');

                let canvas = document.createElement('canvas');
                canvas.setAttribute('width', width + 'px');
                canvas.setAttribute('height', height + 'px');
                panel.appendChild(canvas);

                let Pens = document.createElement('input');
                Pens.setAttribute('type', 'hidden');
                Pens.setAttribute('name', 'Pens');
                Pens.setAttribute('value', '');
                panel.appendChild(Pens);
            } else {
                //canvas가 ItemContainer뒤로 가도록 이동시킴
                panel.appendChild(canvas);
            }
        });
        //panel에 canvas 생성 및 이동

        elem.forEach(function(view) {
            //락이 걸려 있는 View는 이벤트 등록 안함
            if(view.classList.contains('viewProhibit')) return;

            //textContent에서 글씨 수정 후 input Text에 적용
            view.addEventListener('focusout', (e) => {
                let textContent = e.target;
                let text = textContent.innerHTML;
                
                while (text.indexOf("nbsp;") > -1) {text = text.replace("nbsp;", "|^@^|");}
                while (text.indexOf("<br>") > -1) {text = text.replace("<br>", "|^@^|");}
                while (text.indexOf("</div><div>") > -1) {text = text.replace("</div><div>", "|^@^|");}
                while (text.indexOf("<div>") > -1) {text = text.replace("<div>", "|^@^|");}
                while (text.indexOf("</div>") > -1) {text = text.replace("</div>", "|^@^|");}

                textContent.parentElement.querySelector(':scope > input[name=Text]').value = text;
                textContent.parentElement.style['z-index'] = '0';
                
                //PageTitle에 * 표시
                Dom.doShowModifyMark(textContent.closest('.View'));
            });

            view.addEventListener('mousedown', (e) => {
                let mode = document.getElementById('mode').getAttribute('value');
                let client = document.getElementById('client').getAttribute('value');

                //document.getElementById('log').innerHTML += 'mousedown<br />';
                //선택된 서식 배경색 변경
                let viewActive = document.querySelector('.viewActive');
                if(viewActive) viewActive.classList.remove('viewActive');

                let view = e.target.closest('.View');
                view.classList.add('viewActive');
                //선택된 서식 배경색 변경
                
                let selectedItem = null;
                let pointX = e.offsetX || e.layerX;
                let pointY = e.offsetY || e.layerY;
                let point = {'x':pointX, 'y': pointY};
                
                if(mode == 'edit') {    
                    if(e.target.tagName != 'CANVAS') return;

                    let ItemContainer = e.target.parentElement.querySelector('.ItemContainer');
                    ItemContainer.querySelectorAll('.Item').forEach(function(item) {
                        let lowX = parseInt(item.style['left'], 10);
                        let lowY = parseInt(item.style['top'], 10);
                        let maxX = parseInt(item.style['width'], 10) + lowX;
                        let maxY = parseInt(item.style['height'], 10) + lowY;

                        if((lowX < point.x && maxX > point.x) && (lowY < point.y && maxY > point.y)) {
                            selectedItem = item;
                        }
                    });

                    if(selectedItem == null) return;

                    let style = selectedItem.querySelector('input[name=Style]').value;
                    let edit = selectedItem.querySelector('input[name=Edit]').value;
                    //체크박스 선택
                    if(edit == 'true' && style == '2') {
                        if(!selectedItem.querySelector('.textContent input').checked) {
                            //체크그룹 체크해제하기
                            let CheckGroupVal = selectedItem.querySelector('input[name=CheckGroup]').getAttribute('value');
                            if(CheckGroupVal != '') {
                                let Panel = selectedItem.closest('.Panel');
                                let arrCheckbox = Panel.querySelectorAll('.checkbox');

                                arrCheckbox.forEach((checkbox) => {
                                let CheckGroup = checkbox.querySelector('input[name=CheckGroup]').getAttribute('value');
                                if(CheckGroup == CheckGroupVal) {
                                    checkbox.querySelector('.textContent input').checked = false;
                                    checkbox.querySelector('input[name=Checked]').setAttribute('value', 'false'); 
                                }
                                });
                            }
                            //체크그룹 체크해제하기

                            //체크하기
                            selectedItem.querySelector('.textContent input').checked = true;
                            selectedItem.querySelector('input[name=Checked]').setAttribute('value', 'true');    
                        } else {
                            //체크취소
                            selectedItem.querySelector('.textContent input').checked = false;
                            selectedItem.querySelector('input[name=Checked]').setAttribute('value', 'false');
                        }

                        //PageTitle에 * 표시
                        Dom.doShowModifyMark(e.target.closest('.View'));
                    }
                    //text 선택
                    if(edit == 'true' && style == '1') {
                        selectedItem.style['z-index'] = '1';
                    }
                } else if(mode =='pen' && client == 'pc') {
                    lineWidth = document.getElementById('lineWidth').getAttribute('value');
                    let strokeBorder = document.getElementById('strokeBorder').getAttribute('value');
                    let strokeColor = document.getElementById('strokeColor').getAttribute('value');
                    strokeStyle = 'rgba('+strokeColor+', '+strokeBorder+')';

                    let canvas = e.target;
                    //input Pens에 있는 현재 값을 가져옴
                    pens = canvas.parentElement.querySelector('input[name=Pens]');
                    context = canvas.getContext('2d');

                    context.strokeStyle = strokeStyle;
                    context.lineCap = 'butt';

                    context.beginPath();
                    context.lineWidth = lineWidth;

                    context.moveTo(point.x, point.y);
                    penData.push(point.x+','+point.y+','+lineWidth);

                    //PageTitle에 * 표시
                    Dom.doShowModifyMark(canvas.closest('.View'));
                } else if(mode == 'eraser') {
                    let canvas = e.target;

                    let Pens = canvas.parentElement.querySelector('input[name=Pens]');
                    //input Pens에 있는 현재 값을 가져옴
                    let penValue = Pens.getAttribute('value');
                    
                    penValue = Pen.eraserPen(point, penValue);
                    Pens.setAttribute('value', penValue);

                    //삭제 선택된 pen을 제외하고 다시 그리기
                    Pen.createPen(canvas.parentElement, penValue);

                    //PageTitle에 * 표시
                    Dom.doShowModifyMark(canvas.closest('.View'));
                }
            });

            view.addEventListener('mousemove', (e) => {
                if(context == null) return;
                let mode = document.getElementById('mode').getAttribute('value');
                let client = document.getElementById('client').getAttribute('value');

                //document.getElementById('log').innerHTML += 'mousemove<br />';

                let pointX = e.offsetX || e.layerX;
                let pointY = e.offsetY || e.layerY;
                let point = {'x':pointX, 'y': pointY};

                if(mode == 'edit') {
                } else if(mode =='pen' && client == 'pc') {
                    context.lineTo(point.x, point.y);
                    context.stroke();
                    penData.push(point.x+','+point.y+','+lineWidth);
                }
            });

            view.addEventListener('mouseup', (e) => {
                let mode = document.getElementById('mode').getAttribute('value');
                let client = document.getElementById('client').getAttribute('value');

                //document.getElementById('log').innerHTML += 'mouseup<br />';

                let pointX = e.offsetX || e.layerX;
                let pointY = e.offsetY || e.layerY;
                let point = {'x':pointX, 'y': pointY};

                if(mode == 'edit') {
                    let selectedItem = null;

                    //text 선택 후 focus이동
                    selectedItem = e.target;
                    if(selectedItem.classList.contains('Item')) {
                        selectedItem = selectedItem.querySelector('.textContent');
                    }
                    selectedItem.focus();
                    
                    //Set Cursor at the End of a ContentEditable
                    setEndOfContenteditable(selectedItem);
                } else if(mode =='pen' && client == 'pc') {
                    if(context == null) return;

                    context.closePath();
                    context = null;
                    pensDataUpdate(pens, penData);
                    penData = [];

                    //투명도 표시를 위해 다시 그리기
                    let canvas = e.target;
                    let penValue = canvas.parentElement.querySelector('input[name=Pens]').getAttribute('value');
                    Pen.createPen(canvas.parentElement, penValue);
                }
            });

            view.addEventListener('mouseout', (e) => {
                if(client == 'pc') {
                    //document.getElementById('log').innerHTML += 'mouseout<br />';
                    if(context == null) return;

                    context.closePath();
                    context = null;
                    pensDataUpdate(pens, penData);
                    penData = [];

                    //투명도 표시를 위해 다시 그리기
                    let canvas = e.target;
                    let penValue = canvas.parentElement.querySelector('input[name=Pens]').getAttribute('value');
                    Pen.createPen(canvas.parentElement, penValue);
                }
            });
            
            view.querySelectorAll('canvas').forEach(function(canvas) {
                canvas.addEventListener('touchstart', (e) => {
                    let mode = document.getElementById('mode').getAttribute('value');

                    //선택된 서식 배경색 변경
                    let viewActive = document.querySelector('.viewActive');
                    if(viewActive) viewActive.classList.remove('viewActive');

                    let view = e.target.closest('.View');
                    view.classList.add('viewActive');
                    //선택된 서식 배경색 변경

                    if(mode == 'pen') {                    
                        e.preventDefault();

                        lineWidth = document.getElementById('lineWidth').getAttribute('value');
                        let strokeBorder = document.getElementById('strokeBorder').getAttribute('value');
                        let strokeColor = document.getElementById('strokeColor').getAttribute('value');
                        strokeStyle = 'rgba('+strokeColor+', '+strokeBorder+')';

                        let touch = e.targetTouches[0];
                        let canvas = e.target;
                        let canvasRect = canvas.getBoundingClientRect();

                        let point = {'x':Math.round(touch.clientX - canvasRect.left), 'y': Math.round(touch.clientY - canvasRect.top)};
                        let client = {'width': canvas.clientWidth, 'height': canvas.clientHeight};
                        
                        //input Pens에 있는 현재 값을 가져옴
                        pens = canvas.parentElement.querySelector('input[name=Pens]');
                        context = canvas.getContext('2d');

                        context.strokeStyle = strokeStyle;
                        context.lineCap = 'butt';

                        context.beginPath();
                        context.lineWidth = lineWidth;
                        context.moveTo(point.x, point.y);
                        penData.push(point.x+','+point.y+','+lineWidth);

                        //PageTitle에 * 표시
                        Dom.doShowModifyMark(canvas.closest('.View'));
                    }
                });

                canvas.addEventListener('touchmove', (e) => {
                    let mode = document.getElementById('mode').getAttribute('value');

                    if(mode == 'pen') {
                        e.preventDefault();

                        let touch = e.targetTouches[0];
                        let canvas = e.target;
                        let canvasRect = canvas.getBoundingClientRect();

                        let point = {'x':Math.round(touch.clientX - canvasRect.left), 'y': Math.round(touch.clientY - canvasRect.top)};
                        let client = {'width': canvas.clientWidth, 'height': canvas.clientHeight};
                                    
                        if(point.x > client.width) {point.x = client.width;}
                        if(point.x < 0) {point.x = 0;}

                        if(point.y > client.height) {point.y = client.height;}
                        if(point.y < 0) {point.y = 0;}

                        context.lineTo(point.x, point.y);
                        context.stroke();
                        penData.push(point.x+','+point.y+','+lineWidth);
                    }
                });

                canvas.addEventListener('touchend', (e) => {
                    let mode = document.getElementById('mode').getAttribute('value');

                    if(mode == 'pen') {
                        e.preventDefault();

                        if(context == null) return;
                        context.closePath();
                        context = null;
                        pensDataUpdate(pens, penData);
                        penData = [];

                        //투명도 표시를 위해 다시 그리기
                        let canvas = e.target;
                        let penValue = canvas.parentElement.querySelector('input[name=Pens]').getAttribute('value');
                        Pen.createPen(canvas.parentElement, penValue);

                        //PageTitle에 * 표시
                        Dom.doShowModifyMark(textContent.closest('.View'));
                    }
                });
            });

        });
    }
}

let pensDataUpdate = (pens, penData) => {
    let pensValue = pens.getAttribute('value');
    let lineWidth = document.getElementById('lineWidth').getAttribute('value');
    let strokeBorder = document.getElementById('strokeBorder').getAttribute('value');
    let strokeColor = document.getElementById('strokeColor').getAttribute('value');
    let strokeStyle = 'rgba('+strokeColor+', '+strokeBorder+')';

    if(pensValue != '') pensValue += '|^@@^|';
    pensValue += strokeStyle+'|^@^|'+penData.join(':');

    pens.setAttribute('value', pensValue);
};

let flagDataSaveCheck = [];
let fnDataSaveCheck = () => {
    loadingbar.style.display = 'block';
    let exec = () => {
        let flagLoadCheck = true;
        flagDataSaveCheck.forEach((data) => {
            if(data == false && flagLoadCheck) {
                flagLoadCheck = false;
            }
        });
        if(flagLoadCheck) {
            //파일 저장 완료

            //Data 로딩 및 Dom 생성 끝
            loadingbar.style.display = 'none';

            //완료 메시지 나타남
            document.querySelector('#saveComplete .message').innerHTML = '저장이 완료되었습니다.';
            document.getElementById('saveComplete').style['display'] = 'block';
            setTimeout(() => {
                //완료 메시지 사라짐
                document.getElementById('saveComplete').style['display'] = 'none';

                let client = document.getElementById('client').value;

                if(client == 'mobile') {
                    let type = document.querySelector('#searchForm input[name=type]').value;
                    let ptno = document.querySelector('#searchForm input[name=ptno]').value;
                    let inout = document.querySelector('#searchForm input[name=inout]').value;
                    let date = document.getElementById('date').value;

                    if(type == 'new') {//신규 동의서
                        location.href = '/chart/signpenOldChart.php?ptno='+ptno+'&inout='+inout;
                    } else if(type == 'old') {//기존 동의서
                        location.href = '/chart/signpenOldChart.php?ptno='+ptno+'&inout='+inout+'&date='+date;
                    }
                } else if (client == 'pc') {
                    Dom.doHideModifyMark();
                }
            }, 1000);
        } else {
            setTimeout(exec, 100);
        }
    }
    exec();
}

//scrollMenu 이벤트
let scrollMenuAction = (type) => {
    let colorMenu = document.getElementById('colorMenu');

    if(type == 'btnPen' || type == 'btnHighlighter') {
        colorMenu.style['opacity'] = 1;
    } else if(type == 'btnSave' || type == 'btnEraser' || type == 'btnEdit') {
        
        colorMenu.style['opacity'] = 0;
    }
    
    switch(type) {
        case 'btnUndo': //이전화면으로
            //window.history.back();
            fnGoBack();
            break;
        case 'btnSave': //저장
            //저장중이면 stop
            if(loadingbar.style.display == 'block') return;

            let strType = document.querySelector('#searchForm input[name=type]').value;
            let url = '';
            if(strType == 'new') url = 'https://on-doc.kr:47627/hospital/signpenChartEmrSave.php';
            else if(strType == 'old') url = 'https://on-doc.kr:47627/hospital/signpenChartOldEmrSave.php';

            let arrView = document.querySelectorAll('.View');
            let arrSaveView = [];

            /*
            if(strType == 'new') {
                arrSaveView = arrView;
            } else if(strType == 'old') {
                arrView.forEach((view) => {
                    if(view.querySelector('.PageTitle .tagModify') != null) arrSaveView.push(view);
                });
            }
            */

            arrView.forEach((view) => {
                if(view.querySelector('.PageTitle .tagModify') != null) arrSaveView.push(view);
            });

            //if(strType == 'old' && arrSaveView.length == 0) {
            if(arrSaveView.length == 0) {
                //수정한 내역이 없으면 저장하지 않음
                document.querySelector('#saveComplete .message').innerHTML = '수정한 내역이 없습니다.<br />수정후 저장하세요.';
                document.getElementById('saveComplete').style['display'] = 'block';
                setTimeout(() => {
                    document.getElementById('saveComplete').style['display'] = 'none';
                }, 2000);
                return;
            }

            arrSaveView.forEach((view, idx) => {
                flagDataSaveCheck[idx] = false;
            });
            fnDataSaveCheck();
            arrSaveView.forEach((view, idx) => {
                //Dom을 서식데이터로 변환
                document.querySelector('#searchForm input[name=sheet]').value = Dom.domToSheet(view);
                document.querySelector('#searchForm input[name=key]').value = view.querySelector('input[name=Key]').value;
                document.querySelector('#searchForm input[name=title]').value = view.querySelector('input[name=Title]').value;
                document.querySelector('#searchForm input[name=date]').value = view.querySelector('input[name=Date]').value;
                document.querySelector('#searchForm input[name=time]').value = view.querySelector('input[name=Time]').value;
           
                let query = Serialize(document.getElementById('searchForm'));
                
                axios({
                    method: 'post',
                    url: url,
                    data: query
                })
                .then((response) => {
                    flagDataSaveCheck[idx] = true;
                })
                .catch((error) => {
                    console.log(error);
                });
            });

            break;
        /*
        case 'btnFixed': //고정
            if(document.querySelector('html').classList.contains('notouch')) {
                //고정 취소
                let marginTop = -1 * parseInt(document.querySelector('#contentWrap').style['margin-top']);
                let marginLeft = -1 * parseInt(document.querySelector('#contentWrap').style['margin-left']);

                document.querySelector('#contentWrap').style['margin-top'] = 0
                document.querySelector('#contentWrap').style['margin-left'] = 0;

                //잠시 여유를 줘야 고정이 정상 작동함
                setTimeout(() => {}, 1000);

                document.querySelector('html').classList.remove('notouch');
                document.querySelector('body').classList.remove('notouch');

                document.querySelector('body').scrollTop = marginTop;
                document.querySelector('body').scrollLeft = marginLeft;

                document.querySelector('#btnFixed').classList.remove('scrollMenuFixed');
            } else {
                //고정 하기
                
                document.querySelector('#contentWrap').style['margin-top'] = -1 * Number(document.querySelector('body').scrollTop) + 'px';
                document.querySelector('#contentWrap').style['margin-left'] = -1 * Number(document.querySelector('body').scrollLeft) + 'px';

                document.querySelector('html').classList.add('notouch');
                document.querySelector('body').classList.add('notouch');

                document.querySelector('#btnFixed').classList.add('scrollMenuFixed');
            }
            break;
        */
        case 'btnEdit':
            document.querySelectorAll('#scrollMenu .edit').forEach((elem) => {
                elem.classList.remove('active');
            });
            document.querySelector('#scrollMenu #btnEdit').classList.add('active');
            document.getElementById('mode').setAttribute('value', 'edit');
            document.onselectstart = () => {return true};
            break;
        case 'btnPen':
            document.querySelectorAll('#scrollMenu .edit').forEach((elem) => {
                elem.classList.remove('active');
            });
            document.querySelector('#scrollMenu #btnPen').classList.add('active');
            document.getElementById('mode').setAttribute('value', 'pen');
            document.getElementById('lineWidth').setAttribute('value', '1');
            document.getElementById('strokeBorder').setAttribute('value', '1');
            document.onselectstart = () => {return false};
            break;
        case 'btnHighlighter': 
            document.querySelectorAll('#scrollMenu .edit').forEach((elem) => {
                elem.classList.remove('active');
            });
            document.querySelector('#scrollMenu #btnHighlighter').classList.add('active');
            document.getElementById('mode').setAttribute('value', 'pen');
            document.getElementById('lineWidth').setAttribute('value', '15');
            document.getElementById('strokeBorder').setAttribute('value', '0.5');
            document.onselectstart = () => {return false};
            break;
        case 'btnEraser':
            document.querySelectorAll('#scrollMenu .edit').forEach((elem) => {
                elem.classList.remove('active');
            });
            document.querySelector('#scrollMenu #btnEraser').classList.add('active');
            document.getElementById('mode').setAttribute('value', 'eraser');
            break;
        case 'btnMenuClose':
            document.getElementById('scrollMenu').style['top'] = '-270px';
            break;
        case 'btnMenuOpen':
            document.getElementById('scrollMenu').style['top'] = '10px';
            break;
        default: 
            break;
    }
}

//colorMenu 이벤트
let colorMenuAction = (target, type) => {
    switch(type) {
        case 'cmBlack':
            document.getElementById('strokeColor').setAttribute('value', '0,0,0');
            colorMenuUnSelected(target);
            break;
        case 'cmBlue':
            document.getElementById('strokeColor').setAttribute('value', '2,136,209');
            colorMenuUnSelected(target);
            break;
        case 'cmRed':
            document.getElementById('strokeColor').setAttribute('value', '198,40,40');
            colorMenuUnSelected(target);
            break;
        case 'cmGreen':
            document.getElementById('strokeColor').setAttribute('value', '56,142,60');
            colorMenuUnSelected(target);
            break;
        case 'cmOrange':
            document.getElementById('strokeColor').setAttribute('value', '239,108,0');
            colorMenuUnSelected(target);
            break;
        default:
            break;
    }
}

let colorMenuUnSelected = (menu) => {
    document.querySelectorAll('#colorMenu button').forEach(function(elem) {
    
        elem.style['opacity'] = '0.5';
    });

    menu.style['opacity'] = '1';
}

//contentEditable 커서 맨 뒤로 이동하도록
let setEndOfContenteditable = (contentEditableElement) => {
    var range, selection;

    range = document.createRange();//Create a range (a range is a like the selection but invisible)
    range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
    range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
    selection = window.getSelection();//get the selection object (allows you to change selection)
    selection.removeAllRanges();//remove any selections already made
    selection.addRange(range);//make the range you have just created the visible selection
}