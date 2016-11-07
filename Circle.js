function analyser() {
  var scene = document.getElementById('scene');
  var width = scene.clientWidth, height = scene.clientHeight;
  var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  var music = document.getElementById('musicFile');
  if (music) {
    music.value = "";
  }
  var analyser;
  music.addEventListener("change", function(event) {
    var back = document.getElementById('titleholder');
    back.style.display = "None";
    var newAudio = new Audio();
    newAudio.src = URL.createObjectURL(event.target.files[0]);
    newAudio.addEventListener('canplay', function () {
      var Source = audioCtx.createMediaElementSource(newAudio);
      analyser = audioCtx.createAnalyser();
      Source.connect(analyser);
      Source.connect(audioCtx.destination);
      newAudio.play();
      paint();
    });
  });

  function paint() {
    var freq = new Uint8Array(analyser.frequencyBinCount);

    var sequenceQueue = [];
    var r = width / 20;
    var x0 = 0.5 * width, y0 = 0.5 * height;
    sequenceQueue.push([x0, y0]);
    for (var j = 1; j < 4; j++)
      for (var i = 0; i < 360; i = i + 60 / j) {
        var radius = j * r;
        var degree = Math.PI * i / 180.0;
        x = x0 + radius * Math.cos(degree);
        y = y0 + radius * Math.sin(degree);
        sequenceQueue.push([x, y]);
      }

    var voronoi = d3.geom.voronoi()
      .clipExtent([0, 0], [width, height]);

    var svg = d3.select("svg");
    svg.selectAll("path")
      .data(voronoi.triangles(sequenceQueue).map(d3.geom.polygon))
      .enter().append("path")
      .attr("d", function (d) {return "M" + d.join("L") + "Z";})
      .style("fill", function (d) {return color(d.centroid());})
      .style("stroke", function (d) {return color(d.centroid());})
      .style("display", "none");

    var dx, dy;

    function color(d) {
      dx = Math.abs(d[0] - 0.5 * width);
      dy = Math.abs(d[1] - 0.5 * height);
      return d3.lab(100 - (dx * dx + dy * dy) / 1000, dx, 100 - dy / 2);
    }

    function renderChart() {
      requestAnimationFrame(renderChart);
      analyser.getByteFrequencyData(freq);
      svg.selectAll('path')
        .data(freq)
        .style("display", "block")
        .attr("fill-opacity", function (d) {return d * 0.002})
        .attr("stroke-opacity", function (d) {return d * 0.002});
    }

      var promise = new RSVP.Promise(function (yes) {
        renderChart();
      });
      promise.then(console.log(freq));
    }
}