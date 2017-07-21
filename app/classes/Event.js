import Dom from './Dom';
import axios from 'axios';
import Serialize from 'form-serialize';

export default class Event {
    constructor() {}

    static scrollMenu(elem) {
        elem.addEventListener('click', function(e) {
            scrollMenuAction(e.target.id);
        });
    }
}

//scrollMenu 이벤트
function scrollMenuAction(type) {
    switch(type) {
        case 'btnSave': //저장
            let arrView = document.querySelectorAll('.View');
            arrView.forEach(function(view) {
                document.querySelector('#searchForm input[name=sheet]').value = Dom.domToSheet(view);
           
                let query = Serialize(document.getElementById('searchForm'));
                
                axios({
                    method: 'post',
                    url: 'https://on-doc.kr:47627/hospital/signpenChartEmrSave.php',
                    data: query
                })
                .then(function (response) {
                    console.log(response.data);
                })
                .catch(function (error) {
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

                setTimeout(function() {}, 1000);

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
        default: 
            break;
    }
}