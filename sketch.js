//integrated code:
//https://codepen.io/michaelphipps/pen/RBwbvv
//https://blog.addpipe.com/using-recorder-js-to-capture-wav-audio-in-your-html5-web-site/

//
console.clear();

window.AudioContext =
    window.AudioContext ||
    window.webkitAudioContext ||
    window.mozAudioContext ||
    window.oAudioContext;

var context = new AudioContext();

//

URL = window.URL || window.webkitURL;
var gumStream;
//stream from getUserMedia() 
var rec;
//Recorder.js object 
var input;
//MediaStreamAudioSourceNode we'll be recording 
// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext = new AudioContext;
//new audio context to help us record 
var recordButton = document.getElementById("recordButton");
var stopButton = document.getElementById("stopButton");
var pauseButton = document.getElementById("pauseButton");
//add events to those 3 buttons 
recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);
pauseButton.addEventListener("click", pauseRecording);


// setup the master volume control
var master = context.createGain();
master.connect(context.destination);

//global variables
var voicesmono = []; //this will be used for mouse events - monophonic
var mouseState = false;

//control initial settings
var attack = 0.4;
var release = 0.4;
var density = 0.85; //0.85;
var spread = 0.52; //0.52;
var pitch = 1; // this is pitch.  1 is normal

var global_offset = 0.1;

var grainDuration = 1.5; //1.5;

var source_file; // sound file


//mic variables
var mic, recorder, soundFile
let state = 0;

// snake variables
let pursuer;
let target;

var fr;


function preload() {
    //soundFormats('mp3');
    source_file = loadSound(
        "https://s3-us-west-2.amazonaws.com/s.cdpn.io/132550/Light_Years_Away.mp3"
    ); // preload the sound
}

function setup() {
  createCanvas(600, 800);
  pursuer = new Snake(100, 100);
  target = new Target(200, 100);
  
  //frames
  fr = createP('');

  //mic in
  mic = new p5.AudioIn();
  mic.start();

  recorder = new p5.SoundRecorder();
  recorder.setInput(mic);

  soundFile = new p5.SoundFile();

  //sound

  source_file.amp(0.5);
  noLoop();


}

//record


function draw() {
  //draw snake algorithmn

  background(155);

  let steering = pursuer.pursue(target);
  pursuer.applyForce(steering);

  let d = p5.Vector.dist(pursuer.pos, target.pos);
  if (d < pursuer.r + target.r) {
    target = new Target(random(20,width-20), random(20,height-20));
    //pursuer.pos.set(width / 2, height / 2);
  }

  pursuer.update();
  pursuer.show();

  target.edges();
  target.update();
  target.show();

  fr.html(floor(frameRate()));

}


///

function startRecording() {
  console.log("recordButton clicked");

/* Simple constraints object, for more advanced audio features see

https://addpipe.com/blog/audio-constraints-getusermedia/ */

var constraints = {
    audio: true,
    video: false
} 
/* Disable the record button until we get a success or fail from getUserMedia() */

recordButton.disabled = true;
stopButton.disabled = false;
pauseButton.disabled = false

/* We're using the standard promise based getUserMedia()

https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia */

navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
    console.log("getUserMedia() success, stream created, initializing Recorder.js ..."); 
    /* assign to gumStream for later use */
    gumStream = stream;
    /* use the stream */
    input = audioContext.createMediaStreamSource(stream);
    /* Create the Recorder object and configure to record mono sound (1 channel) Recording 2 channels will double the file size */
    rec = new Recorder(input, {
        numChannels: 1
    }) 
    //start the recording process 
    rec.record()
    console.log("Recording started");
}).catch(function(err) {
    //enable the record button if getUserMedia() fails 
    recordButton.disabled = false;
    stopButton.disabled = true;
    pauseButton.disabled = true
});

}
function pauseRecording() {
    console.log("pauseButton clicked rec.recording=", rec.recording);
    if (rec.recording) {
        //pause 
        rec.stop();
        pauseButton.innerHTML = "Resume";
    } else {
        //resume 
        rec.record()
        pauseButton.innerHTML = "Pause";
    }
}

function stopRecording() {
    console.log("stopButton clicked");
    //disable the stop button, enable the record too allow for new recordings 
    stopButton.disabled = true;
    recordButton.disabled = false;
    pauseButton.disabled = true;
    //reset button just in case the recording is stopped while paused 
    pauseButton.innerHTML = "Pause";
    //tell the recorder to stop the recording 
    rec.stop(); //stop microphone access 
    gumStream.getAudioTracks()[0].stop();
    //create the wav blob and pass it on to createDownloadLink 
    rec.exportWAV(createDownloadLink);
}

function createDownloadLink(blob) {
    var url = URL.createObjectURL(blob);
    var au = document.createElement('audio');
    var li = document.createElement('li');
    var link = document.createElement('a');
    //add controls to the <audio> element 
    au.controls = true;
    au.src = url;
    //link the a element to the blob 
    link.href = url;
    link.download = new Date().toISOString() + '.mp3';
    link.innerHTML = link.download;
    //add the new audio and a elements to the li element 
    li.appendChild(au);
    li.appendChild(link);
    //add the li element to the ordered list 

    var filename = new Date().toISOString();
    //filename to send to server without extension 
    //upload link 
    var upload = document.createElement('a');
    upload.href = "#";
    upload.innerHTML = "Upload";
    upload.addEventListener("click", function(event) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function(e) {
            if (this.readyState === 4) {
                console.log("Server returned: ", e.target.responseText);
            }
        };
        var fd = new FormData();
        fd.append("audio_data", blob, filename);
        xhr.open("POST", "upload.php", true);
        xhr.send(fd);
    })
    li.appendChild(document.createTextNode(" ")) //add a space in between 
    li.appendChild(upload) //add the upload link to li

    recordingsList.appendChild(li);
}
///


function grain(buffer, attack, release, spread) {

    var that = this; //

    this.now = context.currentTime; //update the time val
    this.amp = 0.5; // set the volume of this grain

    this.source = context.createBufferSource();
    this.source.playbackRate.value = this.source.playbackRate.value * pitch;

    this.source.buffer = buffer.buffer;

    this.gain = context.createGain();
    this.source.connect(this.gain);
    this.gain.connect(master);

    //this.offset = 50;
    this.offset = mouseX/25; //global_offset ; //55

    //parameters
    this.attack = attack * 0.4;
    this.release = release * 1.5;
    this.sustain = grainDuration - attack - release;

    if (this.release < 0) {
        this.release = 0.1; // 0 - release can cause sound to mute for some reason
    }

    //this.spread = spread;
    this.spread = mouseY/50; // needed to call that.gain.disconnect() in garbage handling.

    this.randomoffset = Math.random() * this.spread - this.spread / 2; //in seconds

    if (1 == 1) {
        // VERSION 1 - using .linearRampToValueAtTime()

        // Start Plaing the sound 
        this.source.start(
            0,
            this.offset + this.randomoffset,
            this.attack + this.sustain + this.release
        ); //parameters (when,offset,duration)

        this.gain.gain.setValueAtTime(0.0, this.now); // Set value of sound at start to 0
        this.gain.gain.linearRampToValueAtTime(this.amp, this.now + this.attack); // fade in
        this.gain.gain.linearRampToValueAtTime(
            0,
            this.now + (this.attack + this.sustain + this.release)
        ); // fade out

    } else {

        // VERSION 2 - using .setValueCurveAtTime()
        // Start Plaing the sound 
        this.source.start(
            0,
            this.offset + this.randomoffset,
            this.attack + this.sustain + this.release
        ); //parameters (when,offset,duration)

        var zero = 0.0000001; // because 0 gain can cause clicks and pops.
        envArray = [zero, 0.5, 0.5, zero];
        var envelope = new Float32Array(envArray.length);
        envelope = envArray; // The envelope supplied to .setValueCurveAtTime() must be a Float32Array
        this.gain.gain.setValueCurveAtTime(envelope, this.now, this.attack + this.sustain + this.release);
    }

    //garbage collection
    this.source.stop(this.now + this.attack + this.sustain + this.release + 0.1);

    var tms = (this.attack + this.sustain + this.release) * 1000; //calculate the time in miliseconds
    setTimeout(function() {
        that.gain.disconnect();
    }, tms + 200);
}

function voice(id) {
    this.touchid = id; //the id of the touch event
}

//play function for mouse event
voice.prototype.playmouse = function() {
    this.grains = [];
    this.graincount = mouseY;
    var that = this; //for scope issues
    this.play = function() {
        //push a new grain to the array
        that.grains[that.graincount] = new grain(
            source_file,
            attack,
            release,
            spread
        );
        that.graincount += 1;

        if (that.graincount > 20) {
            that.graincount = mouseY;
        }

        // next interval (While the mouse is down, do it again)
        this.dens = map(density, 1, 0, 0, 1);
        this.interval = this.dens * 500 + 70;

        //global_offset = global_offset+ 1.5;
        that.timeout = setTimeout(that.play, this.interval);
    };
    this.play();
};

//stop method
voice.prototype.stop = function() {
    clearTimeout(this.timeout);
};

//mouse events
function mousePressed() {

loop();

getAudioContext().resume()

if (state === 0 && mic.enabled) {
    // Tell recorder to record to a p5.SoundFile which we will use for playback
    recorder.record(soundFile);
    //state++;
  } 

mouseState = true;
    if (mouseState) {
        var v = new voice();
        v.playmouse();
        voicesmono[0] = v; //have in the array
    }

}


function mouseReleased() {
  mouseState = false;
  for (var i = 0; i < voicesmono.length; i++) {
    voicesmono[i].stop();
    voicesmono.splice(i);
    //state++;
  }
  noLoop();

  recorder.stop(); // stop recorder, and send the result to soundFile
  //saveSound(soundFile, 'mySound.wav'); // save file
  soundFile.stop(); // play the result!


}

//make this work
