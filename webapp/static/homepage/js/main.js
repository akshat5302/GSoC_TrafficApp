
var box = null;
var down = false;

window.onload = function () {
    box = document.getElementById('box');
    data = localStorage.getItem("notifications") ? JSON.parse(localStorage.getItem('notifications')) : '';;
    var notifi_class = document.getElementsByClassName('notifi-no');
    for (var i = 0; i < notifi_class.length; i++) {
        notifi_class[i].innerHTML = data.length;
    }
    data.forEach(function (item) {
        generateNotifi(item);
    });
};
function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}


function toggleNotifi() {
    if (down) {
        // box.style.height  = '0px';
        box.style.opacity = 0;
        box.style.visibility = "hidden";
        down = false;
    } else {
        // box.style.height  = '510px';	
        box.style.opacity = 1;
        box.style.visibility = "visible";
        down = true;
    }
}

function generateNotifi(item) {
    // console.log(box);
    var notifi_item = document.createElement('div');
    notifi_item.setAttribute('class', 'notifi-item');
    var imageElement = document.createElement('img');
    imageElement.setAttribute('src', 'https://www.clipartmax.com/png/middle/33-335325_caution-warning-road-sign-uk.png');
    imageElement.setAttribute('alt', 'img');
    var textElement = document.createElement('div');
    textElement.setAttribute('class', 'text');
    var notifiTitleElement = document.createElement('h4');
    notifiTitleElement.innerHTML = item.title;
    var notifiBodyElement = document.createElement('p');
    notifiBodyElement.innerHTML = item.body;
    textElement.appendChild(notifiTitleElement);
    textElement.appendChild(notifiBodyElement);
    notifi_item.appendChild(imageElement);
    notifi_item.appendChild(textElement);
    box.appendChild(notifi_item);
}