(function(){
  var VIZ = {};
  var rrenderer, sscene = new THREE.Scene();
  var width = window.innerWidth, height = window.innerHeight;

  // camera = new THREE.PerspectiveCamera(40, width/height , 1, 10000);
  // camera.position.z = 3000;
  // camera.setLens(30);

  VIZ.drawElements = function (data) {

    var randomizeFillOpacity = function() {
        var rand = Math.random(0,1);
        for (var i = 0; i < 100; i++) { // modify sine amplitude
            data[4].values[i].y = Math.sin(i/(5 + rand)) * .4 * rand - .25;
        }
        data[4].fillOpacity = rand;
        chart.update();
    };

    nv.addGraph(function() {
        chart = nv.models.lineChart()
            .options({
                transitionDuration: 300,
                useInteractiveGuideline: true
            })
        ;

        // chart sub-models (ie. xAxis, yAxis, etc) when accessed directly, return themselves, not the parent chart, so need to chain separately
        chart.xAxis
            .axisLabel("Time (s)")
            .tickFormat(d3.format(',.1f'))
            .staggerLabels(true)
        ;

        chart.yAxis
            .axisLabel('Voltage (v)')
            .tickFormat(function(d) {
                if (d == null) {
                    return 'N/A';
                }
                return d3.format(',.2f')(d);
            })
        ;

        data = sinAndCos();

        var margin = {top: 17, right: 0, bottom: 16, left: 20};
            width  = 225 - margin.left - margin.right,
            height = 140 - margin.top  - margin.bottom;

        var elements = d3.selectAll('.element')
            .datum(data)
            .call(chart);

        elements.append("svg")
          .attr("width",  width  + margin.left + margin.right)
          .attr("height", height + margin.top  + margin.bottom)
        .append("g")
          .attr("class", "chartg")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

              elements.each(setData);
              elements.each(objectify);

    });

    function sinAndCos() {
        var sin = [],
            sin2 = [],
            cos = [],
            rand = [],
            rand2 = []
            ;

        for (var i = 0; i < 100; i++) {
            sin.push({x: i, y: i % 10 == 5 ? null : Math.sin(i/10) }); //the nulls are to show how defined works
            sin2.push({x: i, y: Math.sin(i/5) * 0.4 - 0.25});
            cos.push({x: i, y: .5 * Math.cos(i/10)});
            rand.push({x:i, y: Math.random() / 10});
            rand2.push({x: i, y: Math.cos(i/10) + Math.random() / 10 })
        }

        return [
            {
                area: true,
                values: sin,
                key: "Sine Wave",
                color: "#ff7f0e",
                strokeWidth: 4,
                classed: 'dashed'
            },
            {
                values: cos,
                key: "Cosine Wave",
                color: "#2ca02c"
            },
            {
                values: rand,
                key: "Random Points",
                color: "#2222ff"
            },
            {
                values: rand2,
                key: "Random Cosine",
                color: "#667711",
                strokeWidth: 3.5
            },
            {
                area: true,
                values: sin2,
                key: "Fill opacity",
                color: "#EF9CFB",
                fillOpacity: .1
            }
        ];
    }

    VIZ.count = data.length;

    if (false) {

    var margin = {top: 17, right: 0, bottom: 16, left: 20},
        width  = 225 - margin.left - margin.right,
        height = 140 - margin.top  - margin.bottom;

    var legendArr = d3.keys(data[0].recs[0])
        .filter(function (key) {
          return key !== 'year';
        });

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], 0, 0)
        .domain(d3.range('201107','201607').map(function (d) { return d + ""; }));

    var y = d3.scale.linear().range([height, 0]).domain([0, 135]);

    var xAxis = d3.svg.axis().scale(x).orient("bottom");
    var yAxis = d3.svg.axis().scale(y).orient("left");

    var area = d3.svg.area()
        .interpolate("cardinal")
        .x(function (d) { return x(d.label) + x.rangeBand() / 2; })
        .y0(function (d) { return y(d.y0); })
        .y1(function (d) { return y(d.y0 + d.y); });

    var color = d3.scale.ordinal()
        .range(['rgb(166,206,227)','rgb(31,120,180)','rgb(178,223,138)','rgb(51,160,44)','rgb(251,154,153)','rgb(227,26,28)','rgb(253,191,111)','rgb(255,127,0)']);

    var elements = d3.selectAll('.element')
        .data(data).enter()
        .append('div')
        .attr('class', 'element');

    elements.append('div')
      .attr('class', 'chartTitle')
      .html(function (d) { return d.name; });
    //
    // elements.append('div')
    //   .attr('class', 'investData')
    //   .html(function (d, i) { return d.awards; })
    //
    // elements.append('div')
    //   .attr('class', 'investLabel')
    //   .html("Investments (10 Yrs)")

    elements.append("svg")
      .attr("width",  width  + margin.left + margin.right)
      .attr("height", height + margin.top  + margin.bottom)
    .append("g")
      .attr("class", "chartg")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    elements.select(".chartg")
      .append("g").attr("class", "seriesg")
      .selectAll("series")
      .data(function (d) { return prepData(d.recs); })
      .enter()
        .append("path")
        .attr("class", "series")
        .attr("d", function (d) { console.log(d.values,area(d.values)); return area(d.values); })
        .style("fill", function (d) { return color(d.name); });

    elements.select(".chartg")
      .append("g")
      .attr("class", "legend")
      .attr("transform", "translate(15, -15)")
      .selectAll(".legendItem")
      .data(setLegend(legendArr))
      .enter()
        .append("g")
        .attr("class", "legendItem")
        .each(function (d) {
          d3.select(this).append("rect")
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            .attr("width", 4)
            .attr("height",4)
            .style("fill", function (d) { return color(d.name); });

          d3.select(this).append("text")
            .attr("class", "legendText")
            .attr("x", function (d) { return d.x + 5; })
            .attr("y", function (d) { return d.y + 4; })
            .text(function (d) { return d.name; });
       });

    elements.select(".chartg").append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    elements.select(".chartg").append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Information");

    elements.each(setData);
    elements.each(objectify);

    function prepData(data) {
      var stack = d3.layout.stack()
          .offset("zero")
          .values(function (d) { return d.values; })
          .x(function (d) { return x(d.label) + x.rangeBand() / 2; })
          .y(function (d) { return d.value; });

      var varNames = d3.keys(data[0])
          .filter(function (key) {
            return key !== 'year';
          });

      var seriesArr = [], series = {};
      varNames.forEach(function (name) {
        series[name] = {name: name, values:[]};
        seriesArr.push(series[name]);
      });

      data.forEach(function (d) {
        varNames.map(function (name) {
          series[name].values.push({
            name: name,
            label: d.year,
            value: +d[name]
          });
        });
      });
      return stack(seriesArr);
    }
  };

  function setLegend(arr) {
    return arr.map(function (n, i) {
      return {name: n, x: (i % 4) * 48, y: Math.floor(i / 4) * 8};
    });
  }

  }

  function objectify(d) {
    var object = new THREE.CSS3DObject(this);
    object.position = d.helix.position;
    sscene.add(object);
  }

  function setData(d, i) {
    var vector, phi, theta;

    var helix = new THREE.Object3D();
    vector = new THREE.Vector3();
    phi = (i + 12) * 0.250 + Math.PI;
    helix.position.x = 1000 * Math.sin(phi);
    helix.position.y = - (i * 8) + 500;
    helix.position.z = 1000 * Math.cos(phi);
    vector.x = 0;
    vector.y = 0;
    vector.z = 0;
    helix.lookAt(vector);
    d.helix = helix;
  }

  VIZ.render = function () {
    rrenderer.render(sscene, camera);
  };

  VIZ.transform = function (layout) {
    var duration = 1000;

    TWEEN.removeAll();

    sscene.children.forEach(function (object){
      var newPos = object.element.__data__[layout].position;
      var coords = new TWEEN.Tween(object.position)
            .to({x: newPos.x, y: newPos.y, z: newPos.z}, duration)
            .easing(TWEEN.Easing.Sinusoidal.InOut)
            .start();

      var newRot = object.element.__data__[layout].rotation;
      var rotate = new TWEEN.Tween(object.rotation)
            .to({x: newRot.x, y: newRot.y, z: newRot.z}, duration)
            .easing(TWEEN.Easing.Sinusoidal.InOut)
            .start();
    });

   var update = new TWEEN.Tween(this)
       .to({}, duration)
       .onUpdate(VIZ.render)
       .start();
  };

  VIZ.animate = function () {
    requestAnimationFrame(VIZ.animate);
    TWEEN.update();
    // controls.update();
  };

  rrenderer = new THREE.CSS3DRenderer();
  rrenderer.setSize(width, height);
  rrenderer.domElement.style.position = 'absolute';
  document.getElementById('container').appendChild(rrenderer.domElement);

  VIZ.onWindowResize = function () {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    rrenderer.setSize(window.innerWidth, window.innerHeight);
    VIZ.render();
  };
  window.VIZ = VIZ;



  d3.json("data/oasi_5year.json", function (error, ddata) {
    var b = [];
    // for (var dtype in ddata) {
    dtype = 'temperature';
      for (var key in ddata[dtype]) {
        b.push({
          'recs': [],
          'name': key + ' ' + dtype,
          'symb': ddata[dtype][key].resolution
        });
        dd = ddata[dtype][key].locations[0].data;
        for (var i = 0; i < dd.length; i++) {
          var ddr = dd[i];
          var val = ddr.values[0].value;
          if (isNaN(val)) continue;
          b[b.length-1].recs.push({
            'year': ddr.date.split('-')[0] +
                    ddr.date.split('-')[1],
            'val': ddr.values[0].value
          });
        }
      }
    // }
    // console.log(b);

    VIZ.drawElements(b);
    // VIZ.transform('helix');
    VIZ.render();
    // VIZ.animate();
    window.addEventListener('resize', VIZ.onWindowResize, false);
  });
}());
