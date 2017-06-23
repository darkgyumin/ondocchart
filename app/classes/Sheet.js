export default class Sheet {
    constructor() {}

    static load(sheet) {
        //sheet 서식 데이터
        let rtnObj = {};
        
        let splSheet = sheet.split('|^@4@^|');

        splSheet.forEach(function(data) {
            let splSheet = data.split('|^@3@^|');
            
            console.log(splSheet);
            rtnObj[splSheet[0]] = splSheet[1];
        });

        console.log(rtnObj);

        return sheet;
    }
}