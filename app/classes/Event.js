import Dom from './Dom';
import axios from 'axios';
import Serialize from 'form-serialize';

export default class Event {
    constructor() {}

    static scrollMenu(elem) {
        elem.addEventListener('click', function(e) {
            scrollMenuAction(e.target.id);
        });
    }
}

//scrollMenu 이벤트
function scrollMenuAction(type) {
    switch(type) {
        case 'btnSave': //저장
            let arrView = document.querySelectorAll('.View');
            arrView.forEach(function(view) {
                document.querySelector('#postForm input[name=sheet]').value = Dom.domToSheet(view);

                //Serialize(document.getElementById('postForm'));

                axios.post('http://127.0.0.1:9000/json/device.html', {})
                .then(function (response) {
                    console.log(response.data);
                })
                .catch(function (error) {
                    console.log(error);
                });
            });

            break;
        default: 
            break;
    }
}