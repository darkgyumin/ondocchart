import Sheet from './classes/Sheet';
import Dom from './classes/Dom';
import Event from './classes/Event';
import Serialize from 'form-serialize';
import axios from 'axios';
import './css/common.css';

let flagLoadDataPage = [];
let flagLoadDataPanel = [];
let flagChkLoadDataPagePanel = [];

let loadingbar = document.getElementById('loadingbar');

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
        let url = 'https://on-doc.kr:47627/hospital/signpenChartEmr.php?';
        
        let query = Serialize(document.getElementById('searchForm'));

        axios.get(url + query)
        .then(function (response) {
            let key = response.data.data[0].key;
            let date = response.data.data[0].date;
            let time = response.data.data[0].time;
            let befForm = Sheet.load(response.data.data[0].bef_form);

            befForm.PAGE_NAMEVALUE.Key = key;
            befForm.PAGE_NAMEVALUE.Date = date;
            befForm.PAGE_NAMEVALUE.Time = time;
            console.log(befForm.PAGE_NAMEVALUE);
            
            flagLoadDataPage[idx] = befForm;
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

            //Data 로딩 및 Dom 생성 끝
            loadingbar.style.display = 'none';

            //디비에서 치환할 값 가져와 변환하기
            let arrPanel = document.querySelectorAll('.Panel');
            arrPanel.forEach(function(panel) {
                let dataName = null;
                let dataField = null;
                let itemField = null;

                //데이터 치환을 위한 필드 값 가져오기
                let Datas = panel.querySelector('input[name=Datas]').value;
                //Datas = 'L^BASIC^DATE:40,77';
                //L^PATIENT^bpt_ptno:9^bpt_name:15^bpt_resno:16^bpt_sex:91^bpt_yage:90^bpt_telno:92^bpt_hpno:93^bpt_addr:6^bpt_pname:94
                
                //요청 가능한 데이터로 가공
                let arrReplace = Datas.split('|^@@^|');

                arrReplace.forEach(function(data) {
                    //빈값일 경우 패스
                    if(data == '') return; 

                    //request 단위
                    let arrVal = data.split('^');

                    dataName = arrVal[1];
                    
                    //앞의 배열 2개는 삭제하여 값만 추출
                    arrVal.splice(0, 2);

                    let arrDataField = [];
                    let arrItemField = [];

                    arrVal.forEach(function(val) {
                        let valSplit = val.split(':');
                        arrDataField.push(valSplit[0]);
                        arrItemField.push(valSplit[1]);
                    });

                    dataField = arrDataField.join('^');
                    itemField = arrItemField.join('^');

                    document.querySelector('#searchForm input[name=data_name]').value = dataName;
                    document.querySelector('#searchForm input[name=data_field]').value = dataField;
                    document.querySelector('#searchForm input[name=item_field]').value = itemField;

                    let url = 'https://on-doc.kr:47627/hospital/signpenChartEmrReplace.php?';
                    
                    let query = Serialize(document.getElementById('searchForm'));
                    axios.get(url + query)
                    .then(function (response) {
                        response.data.data.forEach(function(data) {
                            let key = String(Object.keys(data)).split(',');
                            let value = data[Object.keys(data)];

                            //데이터 치환
                            key.forEach(function(data) {
                                let item = panel.querySelector('.item_'+data);
                                item.querySelector('.textContent').innerHTML = value;
                                item.querySelector('input[name=Text]').value = value;
                            });
                        });
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
                });

                //data_name=QUALIFY&data_field=rqu_hcode^rqu_hcode&item_field=38^32
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
            let url = 'https://on-doc.kr:47627/hospital/signpenChartEmr.php?';
            
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

//Event를 등록한다.
window.onload = function() {
    Event.scrollMenu(document.getElementById('scrollMenu'));
}