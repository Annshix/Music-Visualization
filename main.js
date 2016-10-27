function analyser(){
  var scene = document.getElementById('scene');
  var width = scene.clientWidth, height = scene.clientHeight;
  var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  var music = document.getElementById('musicFile');
  if (music){
    music.value = "";
  }
  var analyser;
  music.addEventListener("change",function(event){
    var selectFile = document.getElementById('titleholder');
    selectFile.style.display = "None";
    newAudio = new Audio();
    newAudio.src = window.URL.createObjectUrl(event.target.files[0]);
    newAudio.addEventListener("canPlay", function(){
      var Source = audioCtx.createMediaElementSource(newAudio);
      analyser = audioCtx.createAnalyser();
      Source.connect(analyser);
      Source.connect(audioCtx.destination);
      newAudio.play();
      visualize();
    });
  });

  function paint(){
    var freq = new Uint8Array(analyser.frequencyBinCount);
    var radius = 20;
    var samplesNum = 10;
    function randomSelect(width,height,radius,samplesNum){
      size = radius * Math.SQRT1_2;
      cellWidth = Math.ceil(width / size);
      cellHeight = Math.ceil(height / size);
      cell = new Array(cellWidth * cellHeight);
      sampleNum = 0;
      queue = [];
      queueSize = 0;

      function sampleQueue(){
        if (!sampleNum)
          return sample(Math.random() * width, Math.random() * height);
        while(queueSize){
          sampleIndex = Math.ceil(Math.random() * queueSize);
          sample_out = queue[sampleIndex];

        }
      }
    }
  }


}