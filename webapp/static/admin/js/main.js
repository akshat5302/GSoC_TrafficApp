'use strict';
let mediaRecorder;
let recordedBlobs;
let stream;
const codecPreferences = document.querySelector('#codecPreferences');

const errorMsgElement = document.querySelector('span#errorMsg');
const recordedVideo = document.querySelector('video#recorded');
const recordButton = document.querySelector('button#record');
const stopCameraButton = document.querySelector('button#stop');

recordButton.addEventListener('click', () => {

    if (recordButton.textContent === 'Start Recording') {
        startRecording();
    } else {
        stopRecording();
        recordButton.textContent = 'Start Recording';
        playButton.disabled = false;
        downloadButton.disabled = false;
        codecPreferences.disabled = false;

    }
});
stopCameraButton.addEventListener('click', async () => {
    console.log('stopCameraButton clicked');
    await stopBothVideoAndAudio(stream);

    stopCameraButton.disabled = true;
    recordButton.disabled = true;
    document.querySelector('button#start').disabled = false;

});

const playButton = document.querySelector('button#play');
playButton.addEventListener('click', () => {
    const mimeType = codecPreferences.options[codecPreferences.selectedIndex].value.split(';', 1)[0];
    const superBuffer = new Blob(recordedBlobs, { type: mimeType });
    recordedVideo.src = null;
    recordedVideo.srcObject = null;
    recordedVideo.src = window.URL.createObjectURL(superBuffer);
    recordedVideo.controls = true;
    recordedVideo.play();
});



const downloadButton = document.querySelector('button#download');
downloadButton.addEventListener('click', () => {
    let road_text = document.getElementById('road').value;
    if (road_text != "") {
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0');
        var yyyy = today.getFullYear();
        var city = myJson.city;
        today = mm + '/' + dd + '/' + yyyy;
        const blob = new Blob(recordedBlobs, { type: 'video/webm' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = city + '_' + road_text + '_' + today + '.webm';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    }
    else {
        alert("Please enter road name");
    }
});

function handleDataAvailable(event) {
    console.log('handleDataAvailable', event);
    if (event.data && event.data.size > 0) {
        recordedBlobs.push(event.data);
    }
}
function stopBothVideoAndAudio(stream) {
    stream.getTracks().forEach(function (track) {
        if (track.readyState == 'live') {
            track.stop();
        }
    });
    document.querySelector('video#gum').srcObject = null;
}
function getSupportedMimeTypes() {
    const possibleTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=h264,opus',
        'video/mp4;codecs=h264,aac',
    ];
    return possibleTypes.filter(mimeType => {
        return MediaRecorder.isTypeSupported(mimeType);
    });
}

function startRecording() {
    recordedBlobs = [];
    const mimeType = codecPreferences.options[codecPreferences.selectedIndex].value;
    const options = { mimeType };

    try {
        mediaRecorder = new MediaRecorder(window.stream, options);
    } catch (e) {
        console.error('Exception while creating MediaRecorder:', e);
        errorMsgElement.innerHTML = `Exception while creating MediaRecorder: ${JSON.stringify(e)}`;
        return;
    }

    console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
    recordButton.textContent = 'Stop Recording';
    playButton.disabled = true;
    downloadButton.disabled = true;
    codecPreferences.disabled = true;
    mediaRecorder.onstop = (event) => {
        console.log('Recorder stopped: ', event);
        console.log('Recorded Blobs: ', recordedBlobs);
    };
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start();
    console.log('MediaRecorder started', mediaRecorder);
}

function stopRecording() {
    mediaRecorder.stop();
}

function handleSuccess(stream) {
    recordButton.disabled = false;
    stopCameraButton.disabled = false;
    console.log('getUserMedia() got stream:', stream);
    window.stream = stream;

    const gumVideo = document.querySelector('video#gum');
    gumVideo.srcObject = stream;

    getSupportedMimeTypes().forEach(mimeType => {
        const option = document.createElement('option');
        option.value = mimeType;
        option.innerText = option.value;
        codecPreferences.appendChild(option);
    });
    codecPreferences.disabled = false;
}

async function init(constraints) {
    try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        handleSuccess(stream);

    } catch (e) {
        console.error('navigator.getUserMedia error:', e);
        errorMsgElement.innerHTML = `navigator.getUserMedia error:${e.toString()}`;
    }
}

document.querySelector('button#start').addEventListener('click', async () => {

    document.querySelector('button#start').disabled = true;
    const hasEchoCancellation = document.querySelector('#echoCancellation').checked;
    const constraints = {
        audio: {
            echoCancellation: true
        },
        video: {
            width: 1280, height: 720
        }
    };
    console.log('Using media constraints:', constraints);
    await init(constraints);

});
function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}
var notifications = null;
window.onload = function () {
    notifications = localStorage.getItem("notifications") ? JSON.parse(localStorage.getItem('notifications')) : [];
};
function pushNotifications() {
    event.preventDefault();
    var notifiTitle = document.getElementById("notifiTitle").value;
    var notifiDesc = document.getElementById("notifiBody").value;
    if (notifiTitle != "" && notifiDesc != "") {
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        window.scrollTo(0, 0);
        $('.alert').addClass("show");
        $('.alert').removeClass("hide");
        $('.alert').addClass("showAlert");
        setTimeout(function () {
            $('.alert').removeClass("show");
            $('.alert').addClass("hide");
        }, 5000);
        var notififcation = {
            "id": uuidv4(),
            "title": notifiTitle,
            "body": notifiDesc,
            "icon": "https://www.clipartmax.com/png/middle/33-335325_caution-warning-road-sign-uk.png",
            "timestamp": new Date().toLocaleString()
        }
        notifications.push(notififcation);
        localStorage.setItem("notifications", JSON.stringify(notifications));
        document.getElementById("notifiTitle").value = "";
        document.getElementById("notifiBody").value = "";
        console.log("Notification pushed successfully");
    }
    else {
        alert("Please enter title and description");
    }


};
$('.close-btn').click(function () {
    $('.alert').removeClass("show");
    $('.alert').addClass("hide");
});