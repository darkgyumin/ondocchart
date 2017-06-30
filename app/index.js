import Sheet from './classes/Sheet';
import Dom from './classes/Dom';

import sheet1 from './sheet/sheet1';
import sheet2 from './sheet/sheet2';
import sheet3 from './sheet/sheet3';
import sheet4 from './sheet/sheet4';

import './css/common.css';

//서식을 불러와 객체화한다.
let jsonSheet = Sheet.load(sheet1);

//서식을 화면에 나타낸다.
Dom.sheetToDom(jsonSheet);

//화면을 서식화한다.
//console.log(Dom.domToSheet());