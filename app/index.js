import Sheet from './classes/Sheet';
import Dom from './classes/Dom';
import Serialize from 'form-serialize';
import './css/common.css';

import sheet1 from './sheet/sheet1';
import sheet2 from './sheet/sheet2';
import sheet3 from './sheet/sheet3';
import sheet4 from './sheet/sheet4';
import sheet5 from './sheet/sheet5';
import sheet6 from './sheet/sheet6';

console.log(Serialize(document.getElementById('searchForm')));

(function() {
    function exec() {
        if(document.querySelector('#searchForm input[name=name]').value == '') {

            setTimeout(exec, 100);
        } else {
            console.log(Serialize(document.getElementById('searchForm')));
        }
    }
    exec();
})();

setTimeout(function() {
    document.querySelector('#searchForm input[name=name]').value = "김다솜";
}, 1000);

let arrBesId = document.querySelector('#searchForm input[name=arr_bes_id]').value;

arrBesId.split(',').forEach(function(id) {
    document.querySelector('#searchForm input[name=bes_id]').value = id;

    let url = 'https://on-doc.kr:47627/hospital/signpenChartEmr.php?';
    url = '/sheet/sheet.html?';
    let query = Serialize(document.getElementById('searchForm'));

    fetch(url + query, {mode: 'no-cors'})
    .then(function(response) {
        response.json()
        .then(function(data) {
            console.log(data);
        });
    })
    .catch(function(err) {
        console.log(err);
    });
});

//Dom.sheetToDom(Sheet.load(sheet6));
//Dom.sheetToDom(Sheet.load(sheet5));
//Dom.sheetToDom(Sheet.load(sheet2));
//Dom.sheetToDom(Sheet.load(sheet3));
//Dom.sheetToDom(Sheet.load(sheet4));


//화면을 서식화한다.
//console.log(Dom.domToSheet());