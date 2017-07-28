import Dom from './Dom';
import axios from 'axios';
import Serialize from 'form-serialize';

export default class Event {
    constructor() {}

    static scrollMenu(elem) {
        elem.addEventListener('click', (e) => {
            scrollMenuAction(e.target.id);
        });
    }

    static view(elem) {
        let context = null;
        let penData = [];
        let lineWidth = document.getElementById('lineWidth').getAttribute('value');
        let strokeStyle = document.getElementById('strokeStyle').getAttribute('value');
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
            });

            view.addEventListener('mousedown', (e) => {
                let mode = document.getElementById('mode').getAttribute('value');
                let client = document.getElementById('client').getAttribute('value');

                document.getElementById('log').innerHTML += 'mousedown<br />';
                
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

                    let style = selectedItem.querySelector('input[name=Style]').value;
                    let edit = selectedItem.querySelector('input[name=Edit]').value;
                    //체크박스 선택
                    if(edit == 'true' && style == '2') {
                    if(!selectedItem.querySelector('.textContent input').checked) {

                        selectedItem.querySelector('.textContent input').checked = true;
                        selectedItem.querySelector('input[name=Checked]').setAttribute('value', 'true');    
                    } else {
                        selectedItem.querySelector('.textContent input').checked = false;
                        selectedItem.querySelector('input[name=Checked]').setAttribute('value', 'false');
                    }
                    }
                    //text 선택
                    if(edit == 'true' && style == '1') {
                        selectedItem.style['z-index'] = '1';
                    }
                } else if(mode =='pen' && client == 'pc') {
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
                }
            });

            view.addEventListener('mousemove', (e) => {
                if(context == null) return;
                let mode = document.getElementById('mode').getAttribute('value');

                document.getElementById('log').innerHTML += 'mousemove<br />';

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

                document.getElementById('log').innerHTML += 'mouseup<br />';

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
                } else if(mode =='pen' && client == 'pc') {
                    if(context == null) return;

                    context.closePath();
                    context = null;
                    pensDataUpdate(pens, penData);
                    penData = [];
                }
            });

            view.addEventListener('mouseout', (e) => {
                if(client == 'pc') {
                    document.getElementById('log').innerHTML += 'mouseout<br />';
                    if(context == null) return;
                    context.closePath();
                    pensDataUpdate(pens, penData);
                    context = null;
                }
            });
            
            view.querySelectorAll('canvas').forEach(function(panel) {
                panel.addEventListener('touchstart', (e) => {
                    document.getElementById('log').innerHTML += 'touchstart<br />';
                    document.getElementById('log').innerHTML += e.touches[0].offsetX+', ';
                    document.getElementById('log').innerHTML += e.touches[0].offsetX+'///';
                });
            });
            /*
            view.addEventListener('touchstart', (e) => {
                document.getElementById('log').innerHTML += 'touchstart<br />'+e.changedTouches.length+'///';
                let mode = document.getElementById('mode').getAttribute('value');

                var i;
                for (i=0; i < e.changedTouches.length; i++) {
                    document.getElementById('log').innerHTML += ' x='+e.changedTouches[i].pageX;
                    document.getElementById('log').innerHTML += ' y='+e.changedTouches[i].pageY;
                }

                

                let pointX = e.offsetX || e.layerX;
                let pointY = e.offsetY || e.layerY;
                let point = {'x':pointX, 'y': pointY};

                if(mode == 'pen') {
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
                }
            });

            view.addEventListener('touchmove', (e) => {
                document.getElementById('log').innerHTML += 'touchmove<br />';
                let mode = document.getElementById('mode').getAttribute('value');

                var i;
                for (i=0; i < e.changedTouches.length; i++) {
                    document.getElementById('log').innerHTML += ' x='+e.changedTouches[i].pageX;
                    document.getElementById('log').innerHTML += ' y='+e.changedTouches[i].pageY;
                }

                if(mode == 'pen') {
                    let pointX = e.offsetX || e.layerX;
                    let pointY = e.offsetY || e.layerY;
                    let point = {'x':pointX, 'y': pointY};

                    context.lineTo(point.x, point.y);
                    context.stroke();
                    penData.push(point.x+','+point.y+','+lineWidth);
                }
            });
            view.addEventListener('touchend', (e) => {
                document.getElementById('log').innerHTML += 'touchend<br />';
            });
            view.addEventListener('touchstart', (e) => {
                document.getElementById('log').innerHTML += 'touchstart<br />';
            });
            view.addEventListener('touchcancel', (e) => {
                document.getElementById('log').innerHTML += 'touchcancel<br />';
            });
            view.addEventListener('touchleave', (e) => {
                document.getElementById('log').innerHTML += 'touchleave<br />';
            });
            */
        });
    }
}

let pensDataUpdate = (pens, penData) => {
    let pensValue = pens.getAttribute('value');
    let lineWidth = document.getElementById('lineWidth').getAttribute('value');
    let strokeStyle = document.getElementById('strokeStyle').getAttribute('value');

    if(pensValue != '') pensValue += '|^@@^|';
    pensValue += strokeStyle+'|^@^|'+penData.join(':');

    pens.setAttribute('value', pensValue);

    console.log(lineWidth, strokeStyle, pensValue, penData);
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
        } else {
            setTimeout(exec, 100);
        }
    }
    exec();
}

//scrollMenu 이벤트
let scrollMenuAction = (type) => {
    switch(type) {
        case 'btnSave': //저장
            let strType = document.querySelector('#searchForm input[name=type]').value;
            let url = '';
            if(strType == 'new') url = 'https://on-doc.kr:47627/hospital/signpenChartEmrSave.php';
            else if(strType == 'old') url = 'https://on-doc.kr:47627/hospital/signpenChartOldEmrSave.php';

            let arrView = document.querySelectorAll('.View');

            arrView.forEach((view, idx) => {
                flagDataSaveCheck[idx] = false;
            });
            fnDataSaveCheck();
            arrView.forEach((view, idx) => {
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
                    //console.log(response.data);
                    flagDataSaveCheck[idx] = true;
                })
                .catch((error) => {
                    console.log(error);
                });
            });

            break;
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
            document.onselectstart = () => {return false};
            break;
        case 'btnEraser':
            document.querySelectorAll('#scrollMenu .edit').forEach((elem) => {
                elem.classList.remove('active');
            });
            document.querySelector('#scrollMenu #btnEraser').classList.add('active');
            document.getElementById('mode').setAttribute('value', 'eraser');
            break;
        case 'btnHighlighter': 
            document.querySelectorAll('#scrollMenu .edit').forEach((elem) => {
                elem.classList.remove('active');
            });
            document.querySelector('#scrollMenu #btnHighlighter').classList.add('active');
            break;
        default: 
            break;
    }
}