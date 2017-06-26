import Sheet from './classes/Sheet';
import Dom from './classes/Dom';

import sheet1 from './sheet/sheet1';
import sheet2 from './sheet/sheet2';
import sheet3 from './sheet/sheet3';

//서식을 불러와 객체화한다.
let jsonSheet = Sheet.load(sheet3);

//서식을 화면에 나타낸다.
Dom.createSheet(jsonSheet);