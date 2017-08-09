import Sheet from './classes/Sheet';
import Dom from './classes/Dom';
import Event from './classes/Event';
import Serialize from 'form-serialize';
import axios from 'axios';
import './css/common.css';

import sheet1 from './sheet/sheet1';

let flagLoadDataPage = [];
let flagLoadDataPanel = [];
let flagChkLoadDataPagePanel = [];

let flagChkAuth = [];

let loadingbar = document.getElementById('loadingbar');

let fnAuthCheck = () => {
    let exec = () => {
        let flagLoadCheck = true; 
        flagChkAuth.forEach((data) => {
            if(data == false && flagLoadCheck) {
                flagLoadCheck = false;
            }
        });
        if(flagLoadCheck) {
            //이벤트 등록
            Event.view(document.querySelectorAll('.View'));
        } else {
            setTimeout(exec, 100);
        }
    }
    exec();
}

//fnDataLoad함수 실행에 의해 데이터 로딩이 완료될 때
let fnPageLoadDataCheck = () => {
    let exec = () => {
        let flagLoadCheck = true; 
        flagChkLoadDataPagePanel.forEach((data) => {
            if(data == false && flagLoadCheck) {
                flagLoadCheck = false;
            }
        });
        if(flagLoadCheck) {
            //Page서식 로딩이 완료된 상태 처리
            flagLoadDataPage.forEach((data, idx) => {
                let arrTemp = [];
                data.PAGE_NAMEVALUE.PANEL_NAMEVALUE.forEach((panel) => {
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
    arrBesIdSplit.forEach((id, idx) => {
        flagChkLoadDataPagePanel[idx] = false;
    });
    fnPageLoadDataCheck();

    //복수의 서식을 가져올때 처리 고민중
    arrBesIdSplit.forEach((id, idx) => {
        document.querySelector('#searchForm input[name=bes_id]').value = id;
        let url = 'https://on-doc.kr:47627/hospital/signpenChartEmr.php?';
        
        let query = Serialize(document.getElementById('searchForm'));

        axios.get(url + query)
        .then((response) => {
            let befNo = response.data.data[0].bef_no;
            let besName = response.data.data[0].bes_name;
            let key = response.data.data[0].key;
            let date = response.data.data[0].date;
            let time = response.data.data[0].time;
            let befForm = Sheet.load(response.data.data[0].bef_form);

            //PAGE_NAMEVALUE key, date, time값을 갱신
            befForm.PAGE_NAMEVALUE.SheetKey = befNo;
            befForm.PAGE_NAMEVALUE.Title = besName;
            befForm.PAGE_NAMEVALUE.Key = key;
            befForm.PAGE_NAMEVALUE.Date = date;
            befForm.PAGE_NAMEVALUE.Time = time;
            
            flagLoadDataPage[idx] = befForm;
            flagChkLoadDataPagePanel[idx] = true;
        })
        .catch((error) => {
            console.log(error);
        });
    });
};

let fnPanelLoadDataCheck = () => {
    let exec = () => {
        let flagLoadCheck = true; 
        flagChkLoadDataPagePanel.forEach((data) => {
            data.forEach((data) => {
                if(data == false && flagLoadCheck) {
                    flagLoadCheck = false;
                }
            });
        });
        if(flagLoadCheck) {
            //Panel서식 로딩이 완료된 상태 처리
            flagLoadDataPage.forEach((data, idx) => {
                data.PAGE_NAMEVALUE.PANEL_NAMEVALUE.forEach((panel, idx2) => {
                    let pageKey = flagLoadDataPage[idx].PAGE_NAMEVALUE.Key;
                    let panelKey = flagLoadDataPage[idx].PAGE_NAMEVALUE.PANEL_NAMEVALUE[idx2].Key;
                   
                    //Page에 지정된 PanelKey로 하위 키 번호를 맞춘다.
                    flagLoadDataPanel[idx][idx2].PAGE_NAMEVALUE.PANEL_NAMEVALUE[0].PageKey = pageKey;
                    flagLoadDataPanel[idx][idx2].PAGE_NAMEVALUE.PANEL_NAMEVALUE[0].Key = panelKey;
                    //Panel에 지정된 PageKey와 Item에 지정된 PageKey, PanelKey 하위 키 번호를 맞춘다.
                    flagLoadDataPanel[idx][idx2].PAGE_NAMEVALUE.PANEL_NAMEVALUE[0].ITEM_NAMEVALUE.forEach((item) => {
                        item.PageKey = pageKey;
                        item.PanelKey = panelKey;
                    });
                    flagLoadDataPage[idx].PAGE_NAMEVALUE.PANEL_NAMEVALUE[idx2] = flagLoadDataPanel[idx][idx2].PAGE_NAMEVALUE.PANEL_NAMEVALUE[0];
                });
            });

            flagLoadDataPage.forEach((data) => {
                Dom.sheetToDom(data);
            });

            //Data 로딩 및 Dom 생성 끝
            loadingbar.style.display = 'none';

            let arrView = document.querySelectorAll('.View');

            arrView.forEach((view, idx) => {
                flagChkAuth[idx] = false;
            });
            fnAuthCheck();
            
            //편집권한 체크하기 Start
            arrView.forEach((view, idx) => {
                let hospital = document.querySelector('#searchForm input[name=hospital]').value;
                let ptno = document.querySelector('#searchForm input[name=ptno]').value;
                let key = view.querySelector('.Page input[name=Key]').value;

                axios.get('https://on-doc.kr:47627/hospital/signpenChartAuth.php?hospital='+hospital+'&ptno='+ptno+'&seq='+key)
                .then((response) => {
                    let key = response.data.data[0].oec_seq;
                    let permissionView = response.data.data[0].xer_view;
                    let permissionEdit = response.data.data[0].xer_edit;
                    
                    //편집권한 없음
                    if(permissionEdit == 0) {
                        arrView.forEach((view, idx) => {
                            if(key == view.querySelector('.Page input[name=Key]').value) {
                                view.classList.add('viewProhibit');
                                Dom.doShowNoPermission(view);
                            }    
                        });
                    }

                    flagChkAuth[idx] = true;
                })
                .catch((error) => {
                    console.log(error);
                });
            });
            //편집권한 체크하기 End

            //Event.view(arrView);

            ////////////////////////////////////////////////////////////////////////////////////
            //디비에서 치환할 값 가져와 변환하기
            let arrPanel = document.querySelectorAll('.Panel');
            arrPanel.forEach((panel) => {
                let dataName = null;
                let dataField = null;
                let itemField = null;

                if(panel.querySelector('input[name=Datas]') != undefined) {
                    //데이터 치환을 위한 필드 값 가져오기
                    let Datas = panel.querySelector('input[name=Datas]').value;
                    //Datas = 'L^BASIC^DATE:40,77';
                    //L^PATIENT^bpt_ptno:9^bpt_name:15^bpt_resno:16^bpt_sex:91^bpt_yage:90^bpt_telno:92^bpt_hpno:93^bpt_addr:6^bpt_pname:94
                    
                    //요청 가능한 데이터로 가공
                    let arrReplace = Datas.split('|^@@^|');

                    arrReplace.forEach((data) => {
                        //빈값일 경우 패스
                        if(data == '') return; 

                        //request 단위
                        let arrVal = data.split('^');

                        dataName = arrVal[1];
                        
                        //앞의 배열 2개는 삭제하여 값만 추출
                        arrVal.splice(0, 2);

                        let arrDataField = [];
                        let arrItemField = [];

                        arrVal.forEach((val) => {
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
                        .then((response) => {
                            response.data.data.forEach((data) => {
                                let key = String(Object.keys(data)).split(',');
                                let value = data[Object.keys(data)];

                                //데이터 치환
                                key.forEach((data) => {
                                    let item = panel.querySelector('.item_'+data);
                                    item.querySelector('.textContent').innerHTML = value;
                                    item.querySelector('input[name=Text]').value = value;
                                });
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                    });
                }

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

    flagChkLoadDataPagePanel.forEach((data, idx) => {
        data.forEach((data, idx2) => {
            document.querySelector('#searchForm input[name=bef_no]').value = data;
            let url = 'https://on-doc.kr:47627/hospital/signpenChartEmr.php?';
            
            let query = Serialize(document.getElementById('searchForm'));

            axios.get(url + query)
            .then((response) => {
                if(flagLoadDataPanel[idx] == undefined) flagLoadDataPanel[idx] = [];
                flagLoadDataPanel[idx][idx2] = Sheet.load(response.data.data[0].bef_form);
                flagChkLoadDataPagePanel[idx][idx2] = true;
            })
            .catch((error) => {
                console.log(error);
            });

            flagChkLoadDataPagePanel[idx][idx2] = false;
        });
    });
    
    fnPanelLoadDataCheck();
};

let flagChkLoadDataFile = [];
let arrLoadDataFile = [];

let fnFileLoadDataCheck = () => {
    let exec = () => {
        let flagLoadCheck = true;
        flagChkLoadDataFile.forEach((data) => {
            if(data == false && flagLoadCheck) {
                flagLoadCheck = false;
            }
        });
        if(flagLoadCheck) {
            arrLoadDataFile.forEach((data, index) => {
                //서식파일 to DOM
                Dom.sheetToDom(Sheet.load(data.sheet));

                let view = document.querySelectorAll('.View')[index];
                
                //다른 사용자 편집중인지 확인후 편집중이면 편집금지
                let oec_lockyn = data.oec_lockyn;
                let oec_lockdt = data.oec_lockdt;
                let oec_loichost = data.oec_loichost;

                if(oec_lockyn == '1') {
                    view.classList.add('viewProhibit');
                    Dom.doShowProhibit(view);
                }
            });

            //Data 로딩 및 Dom 생성 끝
            loadingbar.style.display = 'none';

            let arrView = document.querySelectorAll('.View');

            arrView.forEach((view, idx) => {
                flagChkAuth[idx] = false;
            });
            fnAuthCheck();
            
            //편집권한 체크하기 Start
            arrView.forEach((view, idx) => {
                let hospital = document.querySelector('#searchForm input[name=hospital]').value;
                let ptno = document.querySelector('#searchForm input[name=ptno]').value;
                let key = view.querySelector('.Page input[name=Key]').value;

                axios.get('https://on-doc.kr:47627/hospital/signpenChartAuth.php?hospital='+hospital+'&ptno='+ptno+'&seq='+key)
                .then((response) => {
                    let key = response.data.data[0].oec_seq;
                    let permissionView = response.data.data[0].xer_view;
                    let permissionEdit = response.data.data[0].xer_edit;
                    
                    //편집권한 없음
                    if(permissionEdit == 0) {
                        arrView.forEach((view, idx) => {
                            if(key == view.querySelector('.Page input[name=Key]').value) {
                                view.classList.add('viewProhibit');
                                Dom.doShowNoPermission(view);
                            }    
                        });
                    }

                    flagChkAuth[idx] = true;
                })
                .catch((error) => {
                    console.log(error);
                });
            });
            //편집권한 체크하기 End

            //Event.view(arrView);
        } else {
            setTimeout(exec, 100);
        }
    }
    exec();
};

//파일로 저장된 동의서 불러오기
let fnFileDataLoad = () => {
    let arrSeq = document.querySelector('#searchForm input[name=arr_seq]').value;
    let arrSeqSplit = arrSeq.split(',');

    //파일 로딩시 lock걸기 위해 pc의ip를 대체하기 위해 uuid를 가져옴
    let uuid = document.querySelector('#authForm #uuid').getAttribute('value');
    document.querySelector('#searchForm #uuid').setAttribute('value', uuid);

    //서식파일 로딩 완료여부를 체크하기 위해 flag 세팅
    arrSeqSplit.forEach((id, idx) => {
        flagChkLoadDataFile[idx] = false;
    });
    fnFileLoadDataCheck();

    arrSeqSplit.forEach((id, idx) => {
        document.querySelector('#searchForm input[name=seq]').value = id;
        let url = 'https://on-doc.kr:47627/hospital/signpenChartOldEmr.php?';
        
        let query = Serialize(document.getElementById('searchForm'));

        axios.get(url + query)
        .then((response) => {
            if(response.data.status == 500) {
                document.querySelector('#saveComplete .message').innerHTML = '파일 로딩시 에러가 발생하였습니다.';
                document.getElementById('saveComplete').style['display'] = 'block';
                setTimeout(() => {
                    document.getElementById('saveComplete').style['display'] = 'none';
                    Dom.doHideModifyMark();
                }, 2000);
                return;
            }
            flagChkLoadDataFile[idx] = true;
            arrLoadDataFile[idx] = response.data.data[0];
        })
        .catch((error) => {
            console.log(error);
        });
    });
};

//===========================================================================================================
//cookie에서 jwt값 파싱해서 name값을 가져온 이후에 실행되도록 체크
(function() {
    let exec = () => {
        if(document.querySelector('#searchForm input[name=name]').value == '') {
            setTimeout(exec, 100);
        } else {
            let type = document.querySelector('#searchForm input[name=type]').value;

            if(type == 'new') fnPageDataLoad();
            else if(type == 'old') fnFileDataLoad();
        }
    }
    exec();
})();

//Dom.sheetToDom(Sheet.load(sheet1));

//Event를 등록한다.
window.onload = function() {
    Event.scrollMenu(document.getElementById('scrollMenu'));
    Event.colorMenu(document.getElementById('colorMenu'));   

    document.getElementById('scrollMenu').addEventListener('transitionend', function(e) {
        let scrollMenu = e.target;
        if(parseInt(scrollMenu.style['top'], 10) == -270) {
            document.getElementById('btnMenuClose').style['display'] = 'none';
            document.getElementById('btnMenuOpen').style['display'] = 'block';
        } else if(parseInt(scrollMenu.style['top'], 10) == 10) {
            document.getElementById('btnMenuClose').style['display'] = 'block';
            document.getElementById('btnMenuOpen').style['display'] = 'none';
        }
    });
}