/** Class representing the map view. */
class MapVis {
    /**
     * Creates a Map Visuzation
     * @param globalApplicationState 
     * @param mapData
     * @param vgsalesData 
     */
  
    constructor(mapData, vgsalesData) {
        
        this.mapData = mapData
        this.vgsalesData = vgsalesData
        console.log(vgsalesData)

        this.mapCreate();
        this.donutCreate();
        this.barCreate();
        this.lineCreate();
        this.zoomCreate();


        // this.genereColorScale = d3.scaleOrdinal().domain(Sales.map(d=>d.region)).range(["#66c2a5","#f88d62","#8da0cb","#e78ac3","#a6d854"]);
        
    }

    mapCreate(){
        let json = topojson.feature(this.mapData, this.mapData.objects.countries);

        // Set up the map projection
        const projection = d3.geoWinkel3()
        .scale(150)
        .translate([200, 300]);

        let svg = d3.select(".world_map");
        let path = d3.geoPath().projection(projection);

        svg.selectAll("path").data(json.features)
            .join("path")
            .attr("d", (path))
            .attr("fill", "#ffffff")

    }

    donutCreate(){
        let vgsalesData = this.vgsalesData

        // donut chart
        let Sales = {
            "EU":0,
            "JP":0,
            "NA":0,
            "other":0,
            "global":0,
        }   

        vgsalesData.forEach(element => {
            Sales["EU"] += parseFloat(element["EU_Sales"])
            Sales["JP"] += parseFloat(element["JP_Sales"])
            Sales["NA"] += parseFloat(element["NA_Sales"])
            Sales["other"] += parseFloat(element["Other_Sales"])
            Sales["global"] += parseFloat(element["Global_Sales"])
        });

        Sales = [
            {region:"EU",value:Sales["EU"]},
            {region:"JP",value:Sales["JP"]},
            {region:"NA",value:Sales["NA"]},
            {region:"other",value:Sales["other"]},
            {region:"global",value:Sales["global"]},
        ]

        // create pie
        let pie = d3.pie();
        pie.value(function (d) {
            return d.value;
        });

        let pieData = pie(Sales.slice(0,4));

        console.log(Sales.slice(0,4))

        let arc = d3.arc();
        arc.outerRadius(150);
        arc.innerRadius(120);

        d3.select(".pie").style("background-color","white").style("width", "95%")
        .style("height", "100%").style("border-radius","25px").style("margin-top","10px").style("margin-left","10px").style("box-shadow","0px 5px 15px lightgray")

        d3.select(".pie").select("svg").attr("width", "100%")
        .attr("height", "100%");

        let width = 210.35
        let height = 438

        let SalesInfo = [["Global",0],["1000",16]]

        this.colorScale = d3.scaleOrdinal().domain(Sales.map(d=>d.region)).range(["#66c2a5","#f88d62","#8da0cb","#e78ac3","#a6d854"]);

        let piep = d3.select(".pie").select("svg").selectAll("g").data(pieData).join("g").attr('transform', `translate (${width-30}, ${height/2})`);
        let pieText = d3.select(".pie").select("svg").selectAll("text").data(SalesInfo).join("text").text(d=>d[0]).attr('transform', (d,i)=>`translate (${width-60+d[1]}, ${height/2+30*i})`).attr("font-size","20");


        function arcTween(a) {
            var i = d3.interpolate(this._current, a);
            this._current = i(0);
            return function(t) {
              return arc(i(t));
            };
        }

        piep.selectAll("path").data(d=>[d]).join("path")
            .style("fill", d => this.colorScale(d.data.value)).transition().duration(1000)
            .attrTween("d", arcTween)
    }

    barCreate(){
        let vgsalesData = this.vgsalesData;
        let height = 340;
        let width = 200;
        let moveX = 50;

        let genereGrouped = d3.group(vgsalesData, (d)=>d.Genre);

        d3.select(".line").style("background-color","white").style("width", "98%")
        .style("height", "100%").style("border-radius","25px").style("margin-top","10px").style("margin-left","10px").style("box-shadow","0px 5px 15px lightgray")
        
        let svg = d3.select(".line").select("svg").attr("width","100%").attr("height","100%");
        let xg = svg.select(".xAxis").attr('transform', `translate (${moveX}, 400)`);
        let yg = svg.select(".yAxis").attr('transform', `translate (${moveX}, 60)`);

        // x
        let genereName = genereGrouped.keys();
        let xrange = []
        let i = 0
        for (let j = 0; j<13; j++)
        {
          xrange.push(i);
          i+= width/13;
        }

        let Xscale = d3.scaleBand().domain(genereName).range([0,480]).paddingInner([10]);
      
        let XAxis = d3.axisBottom();
        XAxis.scale(Xscale)
        xg.call(XAxis)
        

        // y
        let Yscale = d3.scaleLinear().domain([0, d3.max(genereGrouped, d=>d[1].length)]).range([height, 0]).nice();
        let YAxis = d3.axisLeft().tickSize(-500);
        YAxis.scale(Yscale)
        yg.call(YAxis)
        yg.select("path").attr("visibility","hidden");
        yg.selectAll("line").attr("stroke-dasharray","1 1").attr("stroke","lightgray")
        
        svg.selectAll("rect").data(genereGrouped).join("rect")
                                                 .attr("x",(d,i)=>Xscale(d[0])+moveX)
                                                 .attr("y",(d,i)=>Yscale(d[1].length)+10)
                                                 .attr("width", width/13)
                                                 .attr("height", d=>height-Yscale(d[1].length))
                                                 .attr("fill","lightblue")
                                                 .attr("transform","translate(0,50)")

        xg.selectAll("text").attr("transform","rotate(-45) translate(-20,-1)").attr("font-size","8");
        xg.select("path").attr("visibility","hidden");
        xg.selectAll("line").attr("visibility","hidden");



    }

    lineCreate(){
        let vgsalesData = this.vgsalesData;
        let overViewheight = 30;
        let width = 950;
        let moveX = 50;

        d3.select(".chartsDown").style("background-color","white").style("width", "99%")
        .style("height", "100%").style("border-radius","25px").style("margin-top","10px").style("margin-left","10px").style("box-shadow","0px 5px 15px lightgray")
        
        // sort by date
        vgsalesData.sort((a,b)=>d3.ascending(Math.abs(a["Year"]), Math.abs(b["Year"])));
        let yearGrouped = d3.group(vgsalesData, (d)=>d.Year);
        console.log(yearGrouped)

        // overView create
        let svgOver = d3.select(".chartsDown").select(".overView").attr("width","100%").attr("height","20%").select(".area");
        let yearName = yearGrouped.keys();
        let xrange = []
        let i = 0
        for (let j = 0; j<43; j++)
        {
          xrange.push(i);
          i+= width/43;
        }

        let Xscale = d3.scaleOrdinal().domain(yearName).range(xrange);
        let XAxis = d3.axisBottom();
        XAxis.scale(Xscale)
        d3.select(".chartsDown").select(".overView").select(".xAxis").attr("transform","translate(20,130)").call(XAxis)

        let textg = d3.select(".chartsDown").select(".overView").select(".xAxis").selectAll("g");
        textg._groups[0].forEach((d,i)=>{
            if((i)%5!=0)
                d3.select(d).attr("visibility","hidden");
            else
                d3.select(d).select("line").attr("visibility","hidden");
        })
        d3.select(".chartsDown").select(".overView").select(".xAxis").select("path").attr("visibility","hidden");


        let Yscale = d3.scaleLinear().domain([0, d3.max(yearGrouped, d=>d[1].length)]).range([overViewheight, 0]).nice();

        let areaGeneratorA = d3.area()
                               .x(d => Xscale(d[0]))
                               .y0(0)
                               .y(overViewheight);

        let areaGeneratorB = d3.area()
                                .x(d => Xscale(d[0]))
                                .y0(overViewheight)
                                .y1(d => Yscale(d[1].length));
        
        svgOver.select("path")
            .datum(yearGrouped)
            .attr("d", areaGeneratorA)
            .transition().duration(3000)
            .attr("d", areaGeneratorB)
            .attr("transform","translate(0,0)")
            .attr("fill","lightblue")
        
        
        // small create
        let smallheight = 240;

        let svgSmall = d3.select(".chartsDown").select(".small").attr("width","100%").attr("height","80%").select(".lines");

        let genereGrouped = d3.group(vgsalesData, (d)=>d.Genre);

        console.log(genereGrouped)

        const lineGenerator = d3.line()
                                .x(d=>Xscale(d[0]))
                                .y(d=>YscaleSmall(d[1].length))

        let path = svgSmall.selectAll("path").data(genereGrouped).join("path");

        let maxY = 0;
        genereGrouped = [...genereGrouped]
        genereGrouped.forEach(item=>{
            let year = d3.group(item[1],d=>d["Year"])
            if(d3.max([...year],d=>d[1].length)>maxY)
                maxY = d3.max([...year],d=>d[1].length);
        })

        let YscaleSmall = d3.scaleLinear().domain([0, maxY]).range([smallheight, 0]).nice();

        path._groups[0].forEach((item,i)=>{
            let yeargrouped = d3.group(genereGrouped[i][1],d=>d["Year"])
            console.log([...yeargrouped])

            d3.select(item).datum([...yeargrouped]).attr("d",lineGenerator).attr("stroke", "lightblue")
            .attr("stroke-width", 1.5).attr("transform","translate(0,10)").attr("fill","none");
        })
        
    }

    zoomCreate(){
        let zoom = d3.zoom().on('zoom', this.handleZoom);

        d3.select(".chartsDown").select(".small").call(zoom);

    }

    fhandleZoom(e) {
        // apply transform to the chart
        d3.select(".chartsDown").select(".small").attr('transform', e.transform);
        console.log(1)
    }

}