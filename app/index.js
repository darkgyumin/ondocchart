import Sheet from './classes/Sheet';
import Dom from './classes/Dom';
import Event from './classes/Event';
import Serialize from 'form-serialize';
import axios from 'axios';
import './css/common.css';

let REAL_SERVER = (document.URL.indexOf('127.0.0.1') > -1) ? false : true;

let flagLoadDataPage = [];
let flagLoadDataPanel = [];
let flagChkLoadDataPagePanel = [];

//fnDataLoad함수 실행에 의해 데이터 로딩이 완료될 때
let fnPageLoadDataCheck = () => {
    function exec() {
        let flagLoadCheck = true; 
        flagChkLoadDataPagePanel.forEach(function(data) {
            if(data == false && flagLoadCheck) {
                flagLoadCheck = false;
            }
        });
        if(flagLoadCheck) {
            //Page서식 로딩이 완료된 상태 처리
            flagLoadDataPage.forEach(function(data, idx) {
                let arrTemp = [];
                data.PAGE_NAMEVALUE.PANEL_NAMEVALUE.forEach(function(panel) {
                    arrTemp.push(panel.ExPageKey);
                });
                flagChkLoadDataPagePanel[idx] = arrTemp;
            });
            fnPanelDataLoad();
        } else {
            setTimeout(exec, 100);
        }
    }  
    exec();
};

let fnPageDataLoad = () => {
    let arrBesId = document.querySelector('#searchForm input[name=arr_bes_id]').value;
    let arrBesIdSplit = arrBesId.split(',');

    //서식 로딩 완료여부를 체크하기 위해 flag 세팅
    arrBesIdSplit.forEach(function(id, idx) {
        flagChkLoadDataPagePanel[idx] = false;
    });
    fnPageLoadDataCheck();

    //복수의 서식을 가져올때 처리 고민중
    arrBesIdSplit.forEach(function(id, idx) {
        document.querySelector('#searchForm input[name=bes_id]').value = id;
        let url = '';
        if(REAL_SERVER)
            url = 'https://on-doc.kr:47627/hospital/signpenChartEmr.php?';
        else 
            url = '/sheet/sheet'+idx+'.html?';
        
        let query = Serialize(document.getElementById('searchForm'));

        axios.get(url + query)
        .then(function (response) {
            //실서버
            //flagLoadDataPage[idx] = Sheet.load(data.data[0].bef_form);
            //테스트서버
            flagLoadDataPage[idx] = Sheet.load(response.data.data[0].bef_form);
            flagChkLoadDataPagePanel[idx] = true;
        })
        .catch(function (error) {
            console.log(error);
        });
    });
};

let fnPanelLoadDataCheck = () => {
    function exec() {
        let flagLoadCheck = true; 
        flagChkLoadDataPagePanel.forEach(function(data) {
            data.forEach(function(data) {
                if(data == false && flagLoadCheck) {
                    flagLoadCheck = false;
                }
            });
        });
        if(flagLoadCheck) {
            //Panel서식 로딩이 완료된 상태 처리
            flagLoadDataPage.forEach(function(data, idx) {
                data.PAGE_NAMEVALUE.PANEL_NAMEVALUE.forEach(function(panel, idx2) {
                    let pageKey = flagLoadDataPage[idx].PAGE_NAMEVALUE.Key;
                    let panelKey = flagLoadDataPage[idx].PAGE_NAMEVALUE.PANEL_NAMEVALUE[idx2].Key;
                   
                    //Page에 지정된 PanelKey로 하위 키 번호를 맞춘다.
                    flagLoadDataPanel[idx][idx2].PAGE_NAMEVALUE.PANEL_NAMEVALUE[0].PageKey = pageKey;
                    flagLoadDataPanel[idx][idx2].PAGE_NAMEVALUE.PANEL_NAMEVALUE[0].Key = panelKey;
                    //Panel에 지정된 PageKey와 Item에 지정된 PageKey, PanelKey 하위 키 번호를 맞춘다.
                    flagLoadDataPanel[idx][idx2].PAGE_NAMEVALUE.PANEL_NAMEVALUE[0].ITEM_NAMEVALUE.forEach(function(item) {
                        item.PageKey = pageKey;
                        item.PanelKey = panelKey;
                    });
                    flagLoadDataPage[idx].PAGE_NAMEVALUE.PANEL_NAMEVALUE[idx2] = flagLoadDataPanel[idx][idx2].PAGE_NAMEVALUE.PANEL_NAMEVALUE[0];
                });
            });

            flagLoadDataPage.forEach(function(data) {
                Dom.sheetToDom(data);
            });

            ///Dom.sheetToDom(Sheet.load(sheet4))
            
        } else {
            setTimeout(exec, 100);
        }
    }  
    exec();
};

let fnPanelDataLoad = () => {
    document.querySelector('#searchForm input[name=bes_id]').value = '';
    document.querySelector('#searchForm input[name=arr_bes_id]').value = '';

    flagChkLoadDataPagePanel.forEach(function(data, idx) {
        data.forEach(function(data, idx2) {
            document.querySelector('#searchForm input[name=bef_no]').value = data;
            let url = '';
            if(REAL_SERVER)
                url = 'https://on-doc.kr:47627/hospital/signpenChartEmr.php?';
            else 
                url = '/sheet/sheet'+data+'.html?';
            
            let query = Serialize(document.getElementById('searchForm'));

            axios.get(url + query)
            .then(function (response) {
                if(flagLoadDataPanel[idx] == undefined) flagLoadDataPanel[idx] = [];
                flagLoadDataPanel[idx][idx2] = Sheet.load(response.data.data[0].bef_form);
                flagChkLoadDataPagePanel[idx][idx2] = true;
            })
            .catch(function (error) {
                console.log(error);
            });

            flagChkLoadDataPagePanel[idx][idx2] = false;
        });
    });
    
    fnPanelLoadDataCheck();
};

//Dom.sheetToDom(Sheet.load(sheet6));
//Dom.sheetToDom(Sheet.load(sheet5));
//Dom.sheetToDom(Sheet.load(sheet2));
//Dom.sheetToDom(Sheet.load(sheet3));
//Dom.sheetToDom(Sheet.load(sheet4));

//===========================================================================================================
//cookie에서 jwt값 파싱해서 name값을 가져온 이후에 실행되도록 체크
(function() {
    function exec() {
        if(document.querySelector('#searchForm input[name=name]').value == '') {
            setTimeout(exec, 100);
        } else {
            fnPageDataLoad();
        }
    }
    exec();
})();

//화면을 서식화한다.
//console.log(Dom.domToSheet());
window.onload = function() {
    Event.scrollMenu(document.getElementById('scrollMenu'));

    document.querySelector('body').addEventListener('touchmove', function(e) {
        e.preventDefault();
        e.stopPropagation();
    });
}