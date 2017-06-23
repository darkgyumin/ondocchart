export default class Sheet {
    constructor() {}

    static load(sheet) {
        //sheet 서식 데이터
        let rtnObj = {};
        
        let splSheet = sheet.split('|^@4@^|');

        splSheet.forEach(function(data) {
            let splSheet = data.split('|^@3@^|');

            if(splSheet[0] == 'PAGE_NAMEVALUE') {
                rtnObj[splSheet[0]] = Sheet.property(splSheet[1]);                
            }
            
            //if(rtnObj[splSheet[0]] == undefined) rtnObj[splSheet[0]] = [];
            //rtnObj[splSheet[0]] = splSheet[1];
        });

        console.log(rtnObj);

        return sheet;
    }

    //parameter value
    //return object
    //세부서식을 객체화
    static property(value) {
        let rtnObj = {};

        let splValue = value.split('|^@2@^|');
        console.log(splValue);

        return {};
    }
}