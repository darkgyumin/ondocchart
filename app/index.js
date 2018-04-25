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

            //Sheet 하나만 열 경우 중간으로 가도록 위치 조정
            if(document.querySelectorAll('.View').length == 1) {
                let sheetHeight = 20;
                document.querySelectorAll('.View .Panel').forEach((panel) => {
                    sheetHeight += parseInt(panel.style.height, 10);
                });

                if(window.innerHeight > sheetHeight) {
                    let marginHeight = Math.floor((window.innerHeight - sheetHeight) / 3);

                    let view = document.querySelector('.View');
                    view.style['margin-top'] = marginHeight + 'px';
                }
            }
            //Sheet 하나만 열 경우 중간으로 가도록 위치 조정

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
                            console.log(key, view.querySelector('.Page input[name=Key]').value);
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
                    //L^PATIENT^bpt_name:13,33,41|^@@^|L^BASIC^DATE:39|^@@^|L^SIGN^sign.png:50^rec.png:51,52
                    
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
                     
                        if(!(dataName == 'SIGN' || dataName == 'CHECK' || dataName == 'CAMERA')) {
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
                        } else if(dataName == 'SIGN') {
                            arrDataField.forEach((arrData, index) => {
                                document.querySelector('#searchForm input[name=data_field]').value = arrData;
                                document.querySelector('#searchForm input[name=item_field]').value = arrItemField[index];
                                
                                //UNM: C:\StNeo\Bin\Sign\사용자이름.bmp - style:12
                                //HOSNM: C:\StNeo\Bin\Sign\병원이름.bmp - style:13

                                let arrItem = arrItemField[index].split(',');
                                arrItem.forEach((data) => {
                                    let item = panel.querySelector('.item_'+data);

                                    if(arrData == 'UNM') item.querySelector('input[name=Style]').value = 12;
                                    else if(arrData == 'HOSNM') item.querySelector('input[name=Style]').value = 13;
                                });
                            });

                            /*싸인 이미지가 자동으로 변환되면 안되서 주석처리(이벤트 필요)
                            let url = 'https://on-doc.kr:47627/hospital/signimagedownload.php?';

                            arrDataField.forEach((arrData, index) => {
                                document.querySelector('#searchForm input[name=data_field]').value = arrData;
                                document.querySelector('#searchForm input[name=item_field]').value = arrItemField[index];

                                let query = Serialize(document.getElementById('searchForm'));
                                axios.get(url + query)
                                .then((response) => {
                                    response.data.data.forEach((data) => {
                                        let key = String(Object.keys(data)).split(',');
                                        let value = data[Object.keys(data)];

                                        key.forEach((data) => {
                                            let item = panel.querySelector('.item_'+data);
                                            item.querySelector('input[name=BackImageString]').value = value;

                                            let image = Dom.createElement(item, 'img', '', {'position':'absolute', 'top':'0px', 'left':'0px'}, null, null);
                                            image.setAttribute('width', '100%');
                                            image.setAttribute('height', '100%');
                                            image.setAttribute('src', value);
                                        });
                                    });
                                })
                                .catch((error) => {
                                    console.log(error);
                                });
                            });
                            */
                        } else if(dataName == 'CAMERA') {
                            arrDataField.forEach((arrData, index) => {
                                document.querySelector('#searchForm input[name=data_field]').value = arrData;
                                document.querySelector('#searchForm input[name=item_field]').value = arrItemField[index];
                                
                                if(arrData == 'USE') {
                                    let arrItem = arrItemField[index].split(',');

                                    arrItem.forEach((data) => {
                                        let item = panel.querySelector('.item_'+data);
                                        let val = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAIAAAD/gAIDAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RkIyOUE5MzIzQzc2MTFFODk4RjZCMTVEOUMzRUQ2MTciIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RkIyOUE5MzMzQzc2MTFFODk4RjZCMTVEOUMzRUQ2MTciPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpGQjI5QTkzMDNDNzYxMUU4OThGNkIxNUQ5QzNFRDYxNyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpGQjI5QTkzMTNDNzYxMUU4OThGNkIxNUQ5QzNFRDYxNyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PnxefyMAABnQSURBVHja7J15bJXVusbbsjsCZW7LTFs4DAWkrSCIiICCUhzukSPo0SAe7uEqMfGPc0NyT8w9MdH4h3EgGBKMcUgQFMUrKhWZQQEZRApUaBnK3DIUKQh0gvvb39O+fOy9u2nLbqkcPpNms/f6vr3Ws973eZ/3XWttw69cuRLmdwV8s6YrPDw8rC5X8G/U0+r6zODdrt/T/B8eUY/eXKm+wv6dLhCPqAdS7nf+rSCLCLt91fry3LiT154p3C2DfEW9KaamG+vKZQHb09jTcF2pU7OQcPAt4oa3BrVFNCZSf3TIIhoZqT80XhENCtOthFSjuuEtQFuN54a3rM6qh7qR012+fNmSoYiICI/Hw4uKioqoqCg1Pnv27K5du3799dfi4uLIyMjKysry8vLIyCie4W+Abj1hTs1fHtulS5d77723ffv2lZWXo6OjeNObjkRE1EmX8O0BG9eUn4aHauYNLMOLrjRr1iw6OloNAGXv3r1z585du3ZtaWlZTEw0n9KGlg5ekUDg/1ie5h8lGAaP7d69+6RJk7KysiKciynx6kZPHaa/rmB5Qmuo9k1cFUz65SsxMTEa5MmTJ//vq682bNjQokWLVq2alZaWXrhwgUECE6i5b3RffBRQfFy6dAkLXbToy4SExMzMDLADpoZWtp6QsxLj1zvRUVEaqmxt9+7d2UuWXLx4UV4JUsAEcKDGLUwy7wcHy76I9nFxcbz49dfcNWtWDxkyuKysjE95YE2eGJK0IcRguQ0Ym5Iz8s+SkpKdO3eeOXMmISEBo8Dv+BR0eIe/jFCgBHFDsZJe84LHchef5uXl7du3Lzk5uRGCSejd0E35MhaAKCwsBKz4+HgInhGOGDFi+vT/6tq1CyYXFxvrbRYe3iyQUfCR2wf16ueff/7vf/wDv+NRBw8e3LJlS8+ePWuCuylaln2xuwfMP66BKTH/uCFjKy+vIIT169ePcNa8eXMLmjVxFg7rT1gtmjfHMPFo3jl//jyWde7cudatWze4zrrBxM19u/+AFc5///134mBRURFDIui1b9+uV69eAFRRUclfBUR5nP+lJ+hqVn117NgR21S0pQEzgRYJbcbKY0W114DF/PBupXMZGesRJgKsgf/FRzaYMFfFWQ9hMPA3Prh69WrsCDonbKWkpKSlpcXGxkRFRbqJKSLQFXCcrVq1wjbFhrQ5fvx4bm4uPBhEIgTsuXtoPv7BRQhimt0NPOJgnEWdxmUUy+1OOiE25U1NtYzI/upb/Z2Iu3gaN+7YsZPJb9OmDQREFOvduzeoKWjaQwI+oaaLh/Tv3x/QgYleMar8/PzDhw937dpV3fbpYU2WJX1nxiUJbZPHt1xyLsUibwMpFMM1yon3wpJ/8jgC1m+//YYBchtmYh5nwzPv8wmLmgZu+fnnraAjtu7cuXN6eroCv4kDzUGdiLlTp07Dhg1bsGAB9/IVuDnGi0x1g+UOqW7grIGiKlhgqgQf/mL+6o/mDzToc1kZmHq83KrPzHb0T8egKo4ePZKTk7Nt2zYYFEkJWDW5d8AKMtqHmeCveJoXdCU1NbVHjx7CUewexN2CXNB537599e1AX1BQMGfOnJqQZWT+c6Fg7XGuli1b9uiRnJ4+CO+mewDnBcLhU4ZgplOVu2nAghNQkEUbN2787rul27f/gk1xgwivroG5wrkkuEAET4St6Iq+3mCqawinPe6DGw4YMIC5BCz6xuhMD/sRQkXAx/AQRqdUifizefNm1MyQIUMeeughQpCkjMKIbM0jZnViU4VkHkTwzTffrFixYv/+/YwTpKQhaYPB15IR3DJClkvLdu3aZWZm+iRf/sxaywuPHjx4MJpLMRFncZOgz9+ArFVeThLuTVFpw18QYMgMHzci62QmlNjKH71gaXotAh45cmThwoWLFy+WM/OXTvACs4+NjfUhLB8K8AFO+YcsSHkyk0bUN22lr1Zgkl3UCSx4kPEMGjQIglcHhJp/Z0yF+LCqhAsh7+zZEtmKyNRJ9UunTp2KpzN2UdtV19Oz0EHz5s2bP3++Ui2NFh/GJuHOxMRExY7g4sXsRRCor/QDrElKIGZ3/qh+GHnVSSUxvNOniw8eLECXYvtuT7wmn3dQCNhDZamEr4KCg3l5ewjZAMcYxUujRo2aNm0aJKsswjvfxtAAhFl99913EBYA8zHDwxbGjx8/cOBA3rnBtN4nDthrS5Vrih41PY3+JCaSa3Zwp9k28ZohOVdNcyxpKc4ibcrOzl6+fDkgyCHWr1+PQElKSop0Lq836KH8heqIvjQFI5oCOSp5ypQpGBSv9X1NcHXPJ81S8HWjRueDIA5M4iw02uTJk2Nj4z7/fCFqiXcwmq1bt2Zm3tm79580o1WyGxWFJS9atEh3QiO43sSJEzt36SIKrKsUavzlNfnX5Wp5qQm+bp9legKO+JOVNX706NEOo0djNGRR+Cb8pW/xMgWzERERjk0dOHAAxQFqzZvH4YDQGxxwpXqW6iodGnMpxJR3uDMkCUa9kKarCHQZNRNiZIAdOnQgwjpRyGschMUjRw4rY/fOgSl9IAQpdQL1SFLCCybHJ91r4palIOumpD178tatWwtz+z+Blui+MfffH16dEfMEQhledfToUTn16dOnAatt27ZelERPxMHz53/H41S35Cvbt2+vdEdQNinCCoiUsb71U/FuxYrlX3/9tT9YCpSAdeeddypvBQcpZ6BxlkW8pkKyhzTRM71uKEQimnn9kdd8H7EPfaEpMpHdOGDVw5CtpSSbDyVhI+Qk/lUH0MEyDh06BBYyCC01cYuiIX7sFPsvWr3boyfycXlZudVwlU+YTd2IWZngcitDFTmrKNl5kx5j8KdOnTp79ixj0DzHxMQmJSVi45o85lLMon5atcv92j615Th3rdU9ED5SHma6WsJAiFv3ZG5VPq4nXhWproKJzz/rCpPSVLMRs02nM2XSfqCzZ8+eLVu2kKsXFxfDDlL8zLAt/HTr1g0OJcUdOXIkmlZwABxD1agk3CU+jbCs7EFLt8W5pYZ1STBZ9cXdZzcJehrOoTRLKpZpohgPFuQE9SgwWrVqFWkwuRjWhKihDaTJpxJ93Ahr0PP8/Pz4+Fa//PILipGwg0iGg2lJm7jmzVWac2oEvsQqvFq1amX6wMfkcU/MVnUY3a6paqQFCx+wgAgTRsTFxsaII7AR0CFLX7lyJS/OOxcjJxDLZJR1a/AaALfQAMTJS7gLqY2mGTbs7vT0QZerUyU3qVtu6MDtQVWS64FsQMsCLCkMW44LopAaEKzqGnmz6Ohw9Zt+kCSQpWtZjHdAge4CIoPhnyaLHOfyCD4Iy10yhpJhN0xy7Nix47OyYqKrVrbNoVRC0L28uOuuIW+//Xa18sRq8K9w/lMxD7Nq3bq11bVxbRU4GxssjVylW3rDCNesWfPBBx8cO3aM8ROh6ZYTfr2XppRb6DqZBw2KioowItwWINCKmF5hYSF/wRR24/WcOXNQ0c899xy3uKnaJycnueN2N+36uKr6aYsUAdf0GxwsM3XGxgiXLFnC8FQLvOhcTvkUxErhoJEj7xs06I4+ffpIGJsvgBcymvQeg+JGBQHskddowy+++AJMX3zxRYKAkhs3KDxfFu0ucvh7ojsaBFdIDQiWZklx9qOPPlq4cCFvknApHjNUhCKCcNKkSRkZGTIZC2p6jVnRALsjXwO1BQsWfP7556oBgBqPAuh169bRfvr06RCZrdnIrm1NJMhyt9xfisTqRcHAkvkpszFh4t7iU79Eh2fSDwZM1HvvvfdatoyHlBi5FA1URZZPaCN9lSC0qRbZqRRnhE0cnDlzZlZW1ptvvpmTk5OQkABSCp2wPi1nzJhBTmfCEMUgEgwegtxLJ7Y6WWP7Bo2GJefO7d+/f/bs2U4+Ua7OMcjk5ORXX31V9R8ZkQZGA7mYqkbaaWP+xZvp6enOjc+eOHHCdjIBWXZ2NjmNSoByYbf3NdG9Dj5Zy/lz59566y1cpkWLFsCESmAM99133wsvvJCSkuKWr1xyIi27EStJ0JBIMi5Br4o4N/7tb8/FNY/76MMPuQVnVBkTXiMy3H///TINqylKOoUkV/M0HFJIvg0bNqBx8I5S58IE0jMypjz7LHysAVwis3HMITc3F825efNm1CmAQufgSyDr37//mDFj8EH8ToJeue4Tf/kL0vbdd9/FmgARA9y7dy/fBXNp9dDytlAh1SBgGdOhFebNm8fIQU28S8oyedKk/mlpJohgLxTTmjVrV69exbji41uCEYikpaXxt6CgYNOmTV9++eWIESMUByA4zUR8fPy4ceNIkpctW37+/O9xcVhYLCp/x44duLbCSMDtFzdELA1UPMGOsBQIS0Vq3kHsENSGDx9u9IQ5oCfeeeedlStXYCzt27fDT6UMaY8z0gyvJBRgoS+99BJCgVxSdUusrEuXLsSHjh2TSJ+0sgmR/fTTTyBoi2+h5ayIhkBKPggQ0uiq+eAgqtjiOF4HvHRp2bJlH374IUJJGpq0Bp7CVRGcvKkKFO+ADgYFiHPnzp01axYfWe2oV69eMCDA0RjoAZdAiT/CgNqiERbSHW61Aqs2lmwyUlOKksSsQErFA/7efffdkJf0BHEdevrss4W0kb6H0bELlWik2qXR+CcSjNu1lwSVQLakohufgjJg4bNa5eRN0gOcV4Vgd7GlocAK97v8y3L+JTqNTaUFXi9d+r3WPhmhNPo999wj+cebWvTev3+flrt5R7V/7pVBOdvevHU42qu8pR3KoIwzQkym1JmAfmlpVmjnrry8POjSSUWvWPEySM9r7zcRoYp99kLjz8/P0xYELf2npqZCyQpMDAkm3r17ty1ZMzYwUuHJR0OrsGXlTdUewEtVBNBEXvRMTe3cubNcngYYF3bqgBsV2mp4yMCyCeQvqUxeXj5d175IOJ44aHIcz9q5cyfGpTV9iU8oTEVtXEdYWdYmZ5JMlaVs3bqVFFq5N0/AbCF7WZ/AgvWUFd4EzrquUneXdOklYCFElbiEOduWk5NTbNH8xMmTx44dVw4o+JTuAJaVgK0xtsP7KrmQiuDiCq/YpiyRNoRLIoA2QdMMI4Uxtdpaj81MDR4N3ek7PXYYukIlJDCEdzp0aG9i/dTJk8XFp2krtrKkv/q19xY3y4B/NWQRpp4gJttLAvdDecyTvpEGzBbtbR2/CaU7tu6gLBQItJrimENVEVIbk0XDaHR4BxBUzLXx+J8DscUOqwcg0XBW0ZyB5SxtxLi30NgRBFvEbyrpjgK5bbLwLhSVl0NDkJTtkY2MjLKua8VJVWPV3gIuAhoVCmIVpwRQmVMGu1bWhNuKg8Vls9mb4IYBTklVG4J7J4SCl82zlAQzXeVrjiGAozS36eyAq1UCWkSmtRyHtr0Ld7Z4Xr2EUyqMtCjvngP1pH7i8YY4y19/2WKRuzgb61yOYzaTBCOWe23BOUaBkkRGyFVla4prPgpIX6GqdHUhwSOpwRN69OhhSPEoLZRa5qxVIltGDg90hdX9V2RCIx1MQOnrSQMhKcfcqmq7hw4d8oY2x0n5NCEhQZFLMx9855fOKjqVlnDdxS1oERswDFhSck5CQQtFiC/bkxWk+Ok+KVkb4EKfG2rvaFJSki1Bkx7v2rVLazCMISEhsXfv3mTOtkMzyB5JR+JWVbtASkccmIk+ffqYXkGyFRUVyvpkd6rnWEi5rki0Ax0NDpatQclAtB0aOKTmdbxmz5498hSuli1bpKend+3aDQS0+Bykl44vh5sIwMr4lqysLOcMqxeFSues09GjR8WJoCnLtZOfwaWWG6nr2lcoLcuKk7wYOHBgtaQs1wZMZGS1towAypEj742Li0UQVW/Evxx0D0CYtlxBT8OGDZswYYKSc76iyDlvRlZgFpSSkqItQLabKjiXK27UJt8OAViaQPdaA/9MS0tLTExU2U+rYevXrwcazSR+9MADD5BaEwesxB5Y2ng8zgrrFQVEgJg8eTKUpE8R6zk5OTt27LRkCAaAzvBE93aN2ltWg4MlIa4+aYsmkHXq1Gnw4MH8MzY2BjjwREaFCdjaHA2eeuqpoUOHqvAUZERiOvwLIGbOnNm/f389geEVF5/ZsmXL8ePHPM5mKt7hsaRWKh/aZv/a1JdqbhYeSrBEpZocyULeQUmNGzfOme1wvY8nLlq06PDhwxqqSnczZsx48sknsS9sEApzM6ARGQ/EMIH+5ZdfzszMlFKp3jG86vvvvw+r3jXF34yMjB49ursP3iFZfHSJO/zRQLpP5TCzcfm4AjoPq/LokCTSPruUdEFMY8aMWb58uSgWgicmfvvtkr/+9SncUGc6unXrBljw/VdffbV161YSYG7UYQXgk25g/I8++ihUpQI8MJSWlUVFRm7btm3BggVaslWsxPeHDx9OM0M8+G7lsJoPHl3bpurNkC1Y+B/vBxEc7YcfftC2DsynqKho5coVrVrFjx07Fg4WXmgIgMC50GJ79+4tLCyUguV2gtqgQYMAlHtVq6qa7bCwjRs3zpo1C2tV5UcrkpCgd9NwtTx2z+VNSKSDqzufPQQMD509ffr0119/vWPHjrA77xDjMQfG88gjj+gggrMVyXtgDLz69utX4VCYxU070CKmV3sC6+zZs7UaIh/kIwxw5MiRKFJLKo31b0LVoZa/FuZ+ARwY0e7du7/99tu2bdsqxTl27BhD3b49Z+rUZ1NTU52jHDGSl4juSqccaPFeWyPlxUBTUlIC8c2fPx8WwyQvXLhIYkNMTE5Ofvzxx3mas0396hK8uyTZJCwr4CGTsOrDVNjUtGnTdECNfypndDZArMzL2zNp0iTQJNIrj7HdCcCqAryQkmRD2b7//vsrVqzAfLBETJWPCguLwWjKlCn4oKzJdnf6J/lNaJHVp08mnbt37/7888+fPVty6NBBLVjp7PSBAwdeeeWVTz/9FKMYPXo0LKZN1Nongw2S9AEu2QzGSLOlS5fiyLwDTAKdNnj61KlTR40aJX1vakM+qKJFqH5MxOOTJ/lX9Wppwz690dKh0p2y8nIC/7/+9b9vvPFGfn6+hJhEEH4KFq+99hqooSSGDBnC4GNj4+R3Z84Ub9q0iSgZ5hwi148RSNMqaMD9cCJA8/22n80yPiva1FSlqWlj8bX+EWYAeNR1p6JWrh7Y2VZGq82p9E9UWlPgC/h9UgDeFVbn3j59+/7PP//56YJPs7OXqKwuKLVH1lubP3ECAWG7OuVNGCDcRDccIVahI9xiepT6008/PWLECP96i3xZhQct5QcUolhofHy8u8qonEGYyH9LS/neKlg8ogOVjbTnW2ShjN9++8T289b1skwi0uPpmZr697//Z1pav8WLF8P6ypNAwbZPq0DsPgWpFWnRPH3Q/Ol3HSZOnNi1a9frpspB5KEWK8Oqz927t7JblLDfFQrT2R2xIHda6YfOwRddnCNh5eUVOm4QfNtzQOMyBWBb8pOSkh577DGE+LJly9auXYuqYuYJZ3aW3bGsqpULHTXS0qyyIrIZiHzU6NEZ6elVx9qcLmnM1z076uODqlaHXftLMBecS312JqmqjlhlWQKyU6eONNJvCpDE79u3b+DAgdpqbQWyesyhQewtLVdWRjvGCzERIh988MF169b9+OOPyFHwcp9aqC6rh+vkK+aGNSFQBw8Z8qdevZxOhrtJx31Eog6VT9deUy0gVTjKpqCgwH6lql27tlotrrIsAdy5cxctKAmsDRs2oPGg0jDnoe5YU6dLjqz1VNvnqgQFgf7EE0+QymBfED9/T506pdVpKXLsGjoD2Z49e2KSuKTtCFQe4/h3pQmOuoY8LRdEuE7ZgxcCBbCEI4ym38xRlLi6lxAISTsQxyqGcA856oQJE5hGVVrqt0Rmv7xjhU2rJutNupKSkkKfjNfdRVfVD9xnY8zdSKTFs3bmpt78BSlWOnBs37591apVjFexBQWn0xwiNY+toDCT//HnP+fm5tKoRYuWtED+tWnTNjMzA4Dt0H5d2d0CjZ2zsekxna3tv/6Lhu67lPHZjTr5rNBkSxs2N7VUPLbhWLEPpD777LOcnByxp7awYtRXA6UdAqFFZkbGgAEDdu7cyXP4VtLUTz75BAcZMKC/NvK7jxHVvi5oew5qmvmaftoh+AEr7ToRQPUuW9IfbWElh8/OzsZWbB8CIm7o0KG4f2X18aAqXgyrPve5Y8eOjz/+GB+UCIK8cOPExESIA8qoSd1d1xlrA03tQawNlLVsydjJNw8fPgyva3+w4GOwzzzzzMMPP9KmTdVhFS9nmaXIBFB6Dz/8MLoBruWvDrYeOXIU+xK6YbfQJddWKLQtPd7DZnFxhJ1x48aR4VtF04uStgXYr+hxG63x2yVLlkB1WBb8hWFquTy0m1Ju+uXOus368LusrKzx48eTOdjBdMQmIffqiVLhp0N/d9xxB3aI623atPngwYPFxae1Jv6H+NX2OuksI1aCPrGvb9++qLm77rqLmGZLMA6aeGKzcG2tM7EvK7PtjSC1Kzf3YEEBaZRtTanlr/b49CzIz/3c4ANv8FHaH4xBAZZOWlmtURmYvQjXXn6lr1bQsGOwkt3lZWUIRZ/DxjVVJkJufT5fEaR+UJuW/gFEYOlnxpT3mHCzd6p+NLbk3LkYZ0+xJYmmaASW7Te89S73Xgf3ImOl64CsPK8q+yEfVLpgVOf+7VSf+N34v4PRoP/foVqanjXzWMrmv+gQvGp8s2C6kcHfaO23Nmvct68qy/Lf3NWkgGtanQn4/0xoCl1sCm4YeMHCvbm6Sc3nDf6fkUKs+JtCJ/4wUuM2OvW3rNvXbbBug9Xo1/8LMAA1es3ui9jiEwAAAABJRU5ErkJggg==';

                                        item.querySelector('input[name=BackImageString]').value = val;
                                        //Style값을 강제로 11로 변경(Style이 11인경우 이벤트 적용을 위해서)
                                        item.querySelector('input[name=Style]').value = 11;

                                        let image = document.createElement("img");
                                        image.style['position'] = 'absolute';
                                        image.style['width'] = '100%';
                                        image.style['height'] = '100%';
                                        image.style['top'] = '0px';
                                        image.style['left'] = '0px';
                                        image.setAttribute('src', val);
                                
                                        item.appendChild(image);
                                    });
                                }
                            });
                        } else if(dataName == 'CHECK') {//CHECK는 저장시 사용자가 선택한 값을 저장하는 명령어
                            //console.log(document.querySelector('#searchForm input[name=data_field]').value);
                            //console.log(document.querySelector('#searchForm input[name=item_field]').value);
                        }
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
                
                //다른 사용자 편집중일 때 수정 맡는건 추후 적용할지 말지 판단 일단 보류
                /*
                if(oec_lockyn == '1') {
                    view.classList.add('viewProhibit');
                    Dom.doShowProhibit(view);
                }*/
            });

            //Data 로딩 및 Dom 생성 끝
            loadingbar.style.display = 'none';

            //Sheet 하나만 열 경우 중간으로 가도록 위치 조정
            if(document.querySelectorAll('.View').length == 1) {
                let sheetHeight = 20;
                document.querySelectorAll('.View .Panel').forEach((panel) => {
                    sheetHeight += parseInt(panel.style.height, 10);
                });

                if(window.innerHeight > sheetHeight) {
                    let marginHeight = Math.floor((window.innerHeight - sheetHeight) / 3);

                    let view = document.querySelector('.View');
                    view.style['margin-top'] = marginHeight + 'px';
                }
            }
            //Sheet 하나만 열 경우 중간으로 가도록 위치 조정

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


/*
let fnDrawImage = (val) => {
    val = 'data:image/png;base64,'+val;
    let item = document.querySelector('.item_'+document.getElementById('cameraKey').getAttribute('value'));

    item.querySelector('input[name=BackImageString]').value = val;

    let image = Dom.createElement(item, 'img', '', {'position':'absolute', 'top':'0px', 'left':'0px'}, null, null);
    image.setAttribute('width', '100%');
    image.setAttribute('height', '100%');
    image.setAttribute('src', val);
}
*/

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