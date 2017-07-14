import Sheet from './classes/Sheet';
import Dom from './classes/Dom';
import Serialize from 'form-serialize';
import axios from 'axios';
import './css/common.css';

import sheet1 from './sheet/sheet1';
import sheet2 from './sheet/sheet2';
import sheet3 from './sheet/sheet3';
import sheet4 from './sheet/sheet4';
import sheet5 from './sheet/sheet5';
import sheet6 from './sheet/sheet6';

//실제와 같은 상황을 만들기 위해 setTimeout 사용 -- dev용
setTimeout(function() {
    document.querySelector('#searchForm input[name=name]').value = "김다솜";
}, 1000);
//실제와 같은 상황을 만들기 위해 setTimeout 사용

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

let flagLoadDataPage = [];
let flagLoadDataPanel = [];
let flagChkLoadDataPage = [];

//fnDataLoad함수 실행에 의해 데이터 로딩이 완료될 때
let fnPageLoadDataCheck = () => {
    function exec() {
        let flagLoadCheck = true; 
        flagChkLoadDataPage.forEach(function(data) {
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
                flagChkLoadDataPage[idx] = arrTemp;
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
        flagChkLoadDataPage[idx] = false;
    });
    fnPageLoadDataCheck();

    //복수의 서식을 가져올때 처리 고민중
    arrBesIdSplit.forEach(function(id, idx) {
        document.querySelector('#searchForm input[name=bes_id]').value = id;
        //실전용
        //let url = 'https://on-doc.kr:47627/hospital/signpenChartEmr.php?';
        //개발용
        let url = '/sheet/sheet'+idx+'.html?';
        let query = Serialize(document.getElementById('searchForm'));

        axios.get(url + query)
        .then(function (response) {
            //실서버
            //flagLoadDataPage[idx] = Sheet.load(data.data[0].bef_form);
            //테스트서버
            /*
            setTimeout(function() {
                
            }, idx * 1000);
            */
            flagLoadDataPage[idx] = Sheet.load(response.data.data[0].bef_form);
            flagChkLoadDataPage[idx] = true;
        })
        .catch(function (error) {
            console.log(error);
        });
    });
};

let fnPanelLoadDataCheck = () => {
    function exec() {
        let flagLoadCheck = true; 
        flagChkLoadDataPage.forEach(function(data) {
            data.forEach(function(data) {
                if(data == false && flagLoadCheck) {
                    flagLoadCheck = false;
                }
            });
        });
        if(flagLoadCheck) {
            //Page서식 로딩이 완료된 상태 처리
            flagLoadDataPage.forEach(function(data, idx) {
                data.PAGE_NAMEVALUE.PANEL_NAMEVALUE.forEach(function(panel, idx2) {
                    flagLoadDataPage[idx].PAGE_NAMEVALUE.PANEL_NAMEVALUE[idx2] = flagLoadDataPanel[idx][idx2].PAGE_NAMEVALUE.PANEL_NAMEVALUE[0];
                });
            });

            flagLoadDataPage.forEach(function(data) {
                let pageKey = data.PAGE_NAMEVALUE.Key;
                data.PAGE_NAMEVALUE.PANEL_NAMEVALUE.forEach(function(data) {
                    data.PageKey = pageKey;
                });
            });

            console.log(flagLoadDataPage);

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

    flagChkLoadDataPage.forEach(function(data, idx) {
        data.forEach(function(data, idx2) {
            document.querySelector('#searchForm input[name=bef_no]').value = data;
            //실전용
            //let url = 'https://on-doc.kr:47627/hospital/signpenChartEmr.php?';
            //개발용
            let url = '/sheet/sheet'+data+'.html?';
            let query = Serialize(document.getElementById('searchForm'));

            axios.get(url + query)
            .then(function (response) {
                if(flagLoadDataPanel[idx] == undefined) flagLoadDataPanel[idx] = [];
                flagLoadDataPanel[idx][idx2] = Sheet.load(response.data.data[0].bef_form);
                flagChkLoadDataPage[idx][idx2] = true;
            })
            .catch(function (error) {
                console.log(error);
            });

            flagChkLoadDataPage[idx][idx2] = false;
        });
    });
    
    fnPanelLoadDataCheck();
};

//Dom.sheetToDom(Sheet.load(sheet6));
//Dom.sheetToDom(Sheet.load(sheet5));
//Dom.sheetToDom(Sheet.load(sheet2));
//Dom.sheetToDom(Sheet.load(sheet3));
//Dom.sheetToDom(Sheet.load(sheet4));


//화면을 서식화한다.
//console.log(Dom.domToSheet());