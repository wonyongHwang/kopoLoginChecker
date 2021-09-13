<template>
    

<html>
<head>
  <meta charset="utf-8">
  <title>jsQR Demo</title>
  <link href="https://fonts.googleapis.com/css?family=Ropa+Sans" rel="stylesheet">
  
</head>
<body>
  <h1>jsQR Demo</h1>
  <a id="githubLink" href="https://github.com/cozmo/jsQR">View documentation on Github</a>
  <p>Pure JavaScript QR code decoding library.</p>
  <div id="loadingMessage">🎥 Unable to access video stream (please make sure you have a webcam enabled)</div>
  <canvas id="canvas" hidden></canvas>
  <div id="output" hidden>
    <div id="outputMessage">No QR code detected.</div>
    <div hidden><b>Data:</b> <span id="outputData"></span></div>
  </div>
  
</body>
</html>
</template>

<script>
// import { jsQR } from "../js/jsQR.js"
import jsQR from "jsqr";
export default {
  name: 'signup',
  data() {
      return {
            video : null,
            canvasElement  : null,
            canvas  : null,
            loadingMessage  : null,
            outputContainer  : null,
            outputMessage  : null,
            outputData  : null
      }
  },
  mounted() {
     this.video = document.createElement("video");
     this.canvasElement = document.getElementById("canvas");
     this.canvas = this.canvasElement.getContext("2d");
     this.loadingMessage = document.getElementById("loadingMessage");
     this.outputContainer = document.getElementById("output");
     this.outputMessage = document.getElementById("outputMessage");
     this.outputData = document.getElementById("outputData");

     // Use facingMode: environment to attemt to get the front camera on phones
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(stream=> {
      this.video.srcObject = stream;
      this.video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
      this.video.play();
      requestAnimationFrame(this.tick);
    });
  },
  methods: {
      drawLine(begin, end, color) {
        this.canvas.beginPath();
        this.canvas.moveTo(begin.x, begin.y);
        this.canvas.lineTo(end.x, end.y);
        this.canvas.lineWidth = 4;
        this.canvas.strokeStyle = color;
        this.canvas.stroke();
    },
    tick() {
      this.loadingMessage.innerText = "⌛ Loading video..."
      if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
        this.loadingMessage.hidden = true;
        this.canvasElement.hidden = false;
        this.outputContainer.hidden = false;

        this.canvasElement.height = this.video.videoHeight;
        this.canvasElement.width = this.video.videoWidth;
        this.canvas.drawImage(this.video, 0, 0, this.canvasElement.width, this.canvasElement.height);
        var imageData = this.canvas.getImageData(0, 0, this.canvasElement.width, this.canvasElement.height);
        var code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });
        if (code) {
          this.drawLine(code.location.topLeftCorner, code.location.topRightCorner, "#FF3B58");
          this.drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "#FF3B58");
          this.drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF3B58");
          this.drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF3B58");
          this.outputMessage.hidden = true;
          this.outputData.parentElement.hidden = false;
          this.outputData.innerText = code.data;
        } else {
          this.outputMessage.hidden = false;
          this.outputData.parentElement.hidden = true;
        }
      }
       requestAnimationFrame(this.tick);
    }
  },
}



   
    

    
  </script>

<style>
    body {
      font-family: 'Ropa Sans', sans-serif;
      color: #333;
      max-width: 640px;
      margin: 0 auto;
      position: relative;
    }

    #githubLink {
      position: absolute;
      right: 0;
      top: 12px;
      color: #2D99FF;
    }

    h1 {
      margin: 10px 0;
      font-size: 40px;
    }

    #loadingMessage {
      text-align: center;
      padding: 40px;
      background-color: #eee;
    }

    #canvas {
      width: 100%;
    }

    #output {
      margin-top: 20px;
      background: #eee;
      padding: 10px;
      padding-bottom: 0;
    }

    #output div {
      padding-bottom: 10px;
      word-wrap: break-word;
    }

    #noQRFound {
      text-align: center;
    }
  </style>