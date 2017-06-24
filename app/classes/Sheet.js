export default class Sheet {
    constructor() {}
    
    //서식파일을 객체화
    static load(sheet) {
        //sheet 서식 데이터
        let rtnObj = {};
        let tempPAGE_NAMEVALUE = null;
        let tempPAGE_NAMEVALUE_index = 0;
        let tempPANEL_NAMEVALUE = null;
        let tempPANEL_NAMEVALUE_index = 0;
        
        let splSheet = sheet.split('|^@4@^|');

        splSheet.forEach((data) => {
            let splSheet = data.split('|^@3@^|');

            if(splSheet[0] == 'PAGE_NAMEVALUE') {
                rtnObj[splSheet[0]] = Sheet.property(splSheet[1]);

                tempPAGE_NAMEVALUE = rtnObj[splSheet[0]];
            } else if(splSheet[0] == 'PANEL_NAMEVALUE') {

                if(tempPAGE_NAMEVALUE[splSheet[0]] === undefined) tempPAGE_NAMEVALUE[splSheet[0]] = [];

                tempPAGE_NAMEVALUE[splSheet[0]][tempPAGE_NAMEVALUE_index] = Sheet.property(splSheet[1]);
                tempPANEL_NAMEVALUE = tempPAGE_NAMEVALUE[splSheet[0]][tempPAGE_NAMEVALUE_index];

                tempPAGE_NAMEVALUE_index++;
            } else if(splSheet[0] == 'ITEM_NAMEVALUE') {

                if(tempPANEL_NAMEVALUE[splSheet[0]] === undefined) tempPANEL_NAMEVALUE[splSheet[0]] = [];

                tempPANEL_NAMEVALUE[splSheet[0]][tempPANEL_NAMEVALUE_index] = Sheet.property(splSheet[1]);

                tempPANEL_NAMEVALUE_index++;
            }
        });

        console.log(rtnObj);
        
        return rtnObj;
    }

    //parameter value
    //return object
    //세부서식을 객체화
    static property(value) {
        let rtnObj = {};

        let splValue = value.split('|^@2@^|');
        splValue.forEach((data) => {
            let splValue = data.split('|^@1@^|');

            rtnObj[splValue[0]] = splValue[1];
        });

        return rtnObj;
    }
}