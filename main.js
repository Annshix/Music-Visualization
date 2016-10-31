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
    var back = document.getElementById('titleholder');
    back.style.display = "None";
    var newAudio = new Audio();
    newAudio.src = URL.createObjectURL(event.target.files[0]);
    newAudio.addEventListener('canplay', function(){
      var Source = audioCtx.createMediaElementSource(newAudio);
      analyser = audioCtx.createAnalyser();
      Source.connect(analyser);
      Source.connect(audioCtx.destination);
      newAudio.play();
      paint();
    });
  });

  function paint(){
    var freq = new Uint8Array(analyser.frequencyBinCount);
    radius = 30;
    var samplesNum = 30;
    var visual = visualBlock(width+2*radius,height+2*radius,radius,samplesNum);
    var sequenceQueue = [];
    var sequence;
    while (sequence = visual()) sequenceQueue.push([sequence[0]-radius,sequence[1]-radius]);
    var voronoi = d3.geom.voronoi()
      .clipExtent([0,0],[width, height]);

    var svg = d3.select("svg");
    svg.selectAll("path")
      .data(voronoi.triangles(sequenceQueue).map(d3.geom.polygon))
      .enter().append("path")
      .attr("d", function(d){return "M" + d.join("L") + "Z";})
      .style("fill", function(d){return color(d.centroid());})
      .style("stroke", function(d){return color(d.centroid());})
      .style("display","none");

    var dx, dy;
    function color(d){
      dx = Math.abs(d[0]-0.5*width);
      dy = Math.abs(d[1]-0.5*height);
      return d3.lab(60 - (dx * dx + dy * dy) / 10000, dx / 7, dy / 7);
    }

    function visualBlock(width,height,radius,sampleMax) {
      var radiusSquare = radius * radius,
        R = 3 * radiusSquare,
        size = radius * Math.SQRT1_2,
        cellWidth = Math.ceil(width / size),
        cellHeight = Math.ceil(height / size),
        cell = new Array(cellWidth * cellHeight),
        sampleNum = 0,
        queue = [],
        queueSize = 0;

      return function () {
        if (!sampleNum)
          return sample(0, width * 0.5);
        while (queueSize) {
          var sampleIndex = Math.random() * queueSize | 0 ;
          var sample_out = queue[sampleIndex];
          for (var i = 0; i < sampleMax; ++i) {
            var a = 2 * Math.PI * Math.random();
            var r = Math.sqrt(Math.random() * R + radiusSquare);
            var x = sample_out[0] + r * Math.cos(a);
            var y = sample_out[1] + r * Math.sin(a);
            if (0 <= x && x < width && 0 <= y && y < height && far(x, y)) return sample(x, y);
          }
          queue[sampleIndex] = queue[--queueSize];
          queue.length = queueSize;
        }
      };

      function far(x, y) {
        var i = x / size | 0,
          j = y / size | 0,
          i0 = Math.max(i - 2, 0),
          j0 = Math.max(j - 2, 0),
          i1 = Math.min(i + 3, cellWidth),
          j1 = Math.min(j + 3, cellHeight);

          for(j = j0; j < j1; ++j){
          var o = j * cellWidth;
          for (i = i0; i < i1; ++i) {
            if (s = cell[o + i]) {
              var s,
                dx = s[0] - x,
                dy = s[1] - y;
              if (dx * dx + dy * dy < radiusSquare) return false;
            }
          }
        }
        return true;
      }

      function sample(x, y) {
        var ord = [x, y];
        queue.push(ord);
        cell[cellWidth * (y / size | 0) + (x / size | 0)] = ord;
        ++sampleNum;
        ++queueSize;
        return ord;
      }
    }

    function renderChart() {
      requestAnimationFrame(renderChart);
      analyser.getByteFrequencyData(freq);
      svg.selectAll('path')
        .data(freq)
        .style("display","block")
        .attr("fill-opacity", function(d){
          return d*0.012})
        .attr("stroke-opacity", function(d){
          return d*0.012});
    }

    var promise = new RSVP.Promise(function(yes){
      renderChart();
    });
    promise.then(console.log("Done!"));
  }

}