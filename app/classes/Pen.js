export default class Pen {
    constructor() {}

    static createPen(parentElem, penValue) {
        let width = parentElem.querySelector('input[name=Width]').getAttribute('value');
        let height = parentElem.querySelector('input[name=Height]').getAttribute('value');

        let canvas = parentElem.querySelector('canvas');
        if(canvas == null) canvas = document.createElement('canvas');
        canvas.setAttribute('width', width + 'px');
        canvas.setAttribute('height', height + 'px');

        parentElem.appendChild(canvas);

        let context = canvas.getContext('2d');
        
        if(penValue == '') {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.beginPath();
            return;
        }

        let arrPen = penValue.split("|^@@^|");

        arrPen.forEach(function(data) {
            let pen = data.split("|^@^|");
            let strokeStyle = pen[0];
            let penData = pen[1];

            context.beginPath();
            try {
                Pen.drawLine(context, penData);
            } catch(e) {}
            context.strokeStyle = strokeStyle;
            context.lineCap = 'butt';
            context.stroke();
            context.closePath();
        });
    }

    static drawLine(context, penData) {
        let penLineGroup = penData.split(':');
        let nWidth = 1;

        penLineGroup.forEach(function(pen, i) {
            let penLine = pen.split(',');

            if(i == 0) {
                context.moveTo(penLine[0], penLine[1]);
            } else {
                context.lineTo(penLine[0], penLine[1]);
            }
            
            nWidth = penLine[2];
        });

        context.lineWidth = nWidth;
    }

    static eraserPen(point, penValue) {
        let tempArrPen = [];
        let arrPen = penValue.split("|^@@^|");
        arrPen = arrPen.reverse();

        arrPen.forEach(function(data) {
            let pen = data.split("|^@^|");
            let strokeStyle = pen[0];
            let penData = pen[1];
            let penLineGroup = penData.split(':');
            let flagMatching = true;

            penLineGroup.forEach(function(pen, i) {
                let penLine = pen.split(',');
                let diffX = Math.abs(point.x - penLine[0]);
                let diffY = Math.abs(point.y - penLine[1]);
                if(diffX <= 10 && diffY <= 10) flagMatching = false;
            });
            
            if(flagMatching) tempArrPen.push(data);
            flagMatching = true;
        });

        tempArrPen = tempArrPen.reverse();

        return tempArrPen.join('|^@@^|');
    }
}