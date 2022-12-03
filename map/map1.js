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
        // this.lineCreate();
        // this.zoomCreate();

        // this.heatmap(vgsalesData);

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
            .attr("fill", "#black")
            .attr("stroke","none")
            .attr("stroke-width","0px")
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

    // lineCreate(){
    //     let vgsalesData = this.vgsalesData;
    //     let overViewheight = 30;
    //     let width = 950;
    //     let moveX = 50;

    //     d3.select(".chartsDown").style("background-color","white").style("width", "99%")
    //     .style("height", "100%").style("border-radius","25px").style("margin-top","10px").style("margin-left","10px").style("box-shadow","0px 5px 15px lightgray")
        
    //     // sort by date
    //     vgsalesData.sort((a,b)=>d3.ascending(Math.abs(a["Year"]), Math.abs(b["Year"])));
    //     let yearGrouped = d3.group(vgsalesData, (d)=>d.Year);
    //     console.log(yearGrouped)

    //     // overView create
    //     let svgOver = d3.select(".chartsDown").select(".overView").attr("width","100%").attr("height","20%").select(".area");
    //     let yearName = yearGrouped.keys();
    //     let xrange = []
    //     let i = 0
    //     for (let j = 0; j<43; j++)
    //     {
    //       xrange.push(i);
    //       i+= width/43;
    //     }

    //     this.Xscale = d3.scaleTime().domain(yearName).range(xrange);
    //     let XAxis = d3.axisBottom();
    //     XAxis.scale(this.Xscale)
    //     d3.select(".chartsDown").select(".overView").select(".xAxis").attr("transform","translate(20,130)").call(XAxis)

    //     // let textg = d3.select(".chartsDown").select(".overView").select(".xAxis").selectAll("g");
    //     // textg._groups[0].forEach((d,i)=>{
    //     //     if((i)%5!=0)
    //     //         d3.select(d).attr("visibility","hidden");
    //     //     else
    //     //         d3.select(d).select("line").attr("visibility","hidden");
    //     // })
    //     // d3.select(".chartsDown").select(".overView").select(".xAxis").select("path").attr("transform","translate(0,-120)");


    //     let Yscale = d3.scaleLinear().domain([0, d3.max(yearGrouped, d=>d[1].length)]).range([overViewheight, 0]).nice();

    //     let areaGeneratorA = d3.area()
    //                            .x(d =>this.Xscale(d[0]))
    //                            .y0(0)
    //                            .y(overViewheight);

    //     let areaGeneratorB = d3.area()
    //                             .x(d =>this.Xscale(d[0]))
    //                             .y0(overViewheight)
    //                             .y1(d => Yscale(d[1].length));
        
    //     svgOver.select("path")
    //         .datum(yearGrouped)
    //         .attr("d", areaGeneratorA)
    //         .transition().duration(3000)
    //         .attr("d", areaGeneratorB)
    //         .attr("transform","translate(0,0)")
    //         .attr("fill","lightblue")
        
        
    //     // small create
    //     let smallheight = 240;

    //     let svgSmall = d3.select(".chartsDown").select(".small").attr("width","100%").attr("height","80%").select(".lines");

    //     let genereGrouped = d3.group(vgsalesData, (d)=>d.Genre);

    //     console.log(genereGrouped)

    //     const lineGenerator = d3.line()
    //                             .x(d=>this.Xscale(d[0]))
    //                             .y(d=>this.YscaleSmall(d[1].length))

    //     let path = svgSmall.selectAll("path").data(genereGrouped).join("path");

    //     let maxY = 0;
    //     genereGrouped = [...genereGrouped]
    //     genereGrouped.forEach(item=>{
    //         let year = d3.group(item[1],d=>d["Year"])
    //         if(d3.max([...year],d=>d[1].length)>maxY)
    //             maxY = d3.max([...year],d=>d[1].length);
    //     })

    //     this.YscaleSmall = d3.scaleLinear().domain([0, maxY]).range([smallheight, 0]).nice();

    //     path._groups[0].forEach((item,i)=>{
    //         let yeargrouped = d3.group(genereGrouped[i][1],d=>d["Year"])

    //         d3.select(item).datum([...yeargrouped]).attr("d",lineGenerator).attr("stroke", "lightblue")
    //         .attr("stroke-width", 1.5).attr("transform","translate(0,10)").attr("fill","none");
    //     })

    //     // x
    //     d3.select(".chartsDown").select(".small").select(".xAxis").attr("transform","translate(20,130)").call(XAxis)
        
    // }

    // lineUpdate(){
    //     let vgsalesData = this.vgsalesData;

    //     // small create
    //     let smallheight = 240;

    //     let svgSmall = d3.select(".chartsDown").select(".small").attr("width","100%").attr("height","80%").select(".lines");

    //     let genereGrouped = d3.group(vgsalesData, (d)=>d.Genre);

    //     console.log(genereGrouped)

    //     const lineGenerator = d3.line()
    //                             .x(d=>this.Xscale(d[0]))
    //                             .y(d=>this.YscaleSmall(d[1].length))

    //     let path = svgSmall.selectAll("path").data(genereGrouped).join("path");

    //     let maxY = 0;
    //     genereGrouped = [...genereGrouped]
    //     genereGrouped.forEach(item=>{
    //         let year = d3.group(item[1],d=>d["Year"])
    //         if(d3.max([...year],d=>d[1].length)>maxY)
    //             maxY = d3.max([...year],d=>d[1].length);
    //     })

    //     path._groups[0].forEach((item,i)=>{
    //         let yeargrouped = d3.group(genereGrouped[i][1],d=>d["Year"])

    //         d3.select(item).datum([...yeargrouped]).attr("d",lineGenerator).attr("stroke", "lightblue")
    //         .attr("stroke-width", 1.5).attr("transform","translate(0,10)").attr("fill","none");
    //     })

    //     // x
    //     let XAxis = d3.axisBottom();
    //     XAxis.scale(this.Xscale)
    //     d3.select(".chartsDown").select(".small").select(".xAxis").attr("transform","translate(20,130)").call(XAxis)
    // }

    // zoomCreate(){
    //     let width = document.getElementsByClassName("small")[0].clientWidth;
    //     let height = document.getElementsByClassName("small")[0].clientHeight;

    //     let zoom = d3.zoom()
    //                  .scaleExtent([1,Infinity])
    //                  .translateExtent([[0, 0], [width, height]])
    //                  .extent([[0, 0], [width, height]])
    //                  .on("zoom", this.handleZoom.bind(this));

    //     d3.select(".chartsDown").select(".small").call(zoom);

    // }


    // handleZoom(event) {
    //     let t = event.transform;
    //     console.log(t)
         
    //     let vgsalesData = this.vgsalesData;
    //     vgsalesData.sort((a,b)=>d3.ascending(Math.abs(a["Year"]), Math.abs(b["Year"])));
    //     let yearGrouped = d3.group(vgsalesData, (d)=>d.Year);
    //     let yearName = yearGrouped.keys();
    //     // d3.timeFormat("%m/%d")(d3.timeParse("%d-%b")(d.date))

    //     yearGrouped.forEach(d=>{
    //         console.log(d[0]['Year'])
    //         console.log(new Date(parsetoFloat(d[0]['Year'])+1))
    //     })

    //     let xrange = []
    //     let i = 0
    //     for (let j = 0; j<43; j++)
    //     {
    //         xrange.push(i);
    //         i+= 210.35/43;
    //     }

    //     var x2 = d3.scaleTime().domain(yearName).range(xrange);

    //     let maxY = 0;
    //     let genereGrouped = d3.group(vgsalesData, (d)=>d.Genre);
    //     genereGrouped = [...genereGrouped]
    //     genereGrouped.forEach(item=>{
    //         let year = d3.group(item[1],d=>d["Year"])
    //         if(d3.max([...year],d=>d[1].length)>maxY)
    //             maxY = d3.max([...year],d=>d[1].length);
    //     })

    //     let smallheight = 240;
    //     var y2 = d3.scaleLinear().domain([0, maxY]).range([smallheight, 0]).nice();

    //     this.Xscale.domain(t.rescaleX(x2).domain());
    //     // this.YscaleSmall.domain(t.rescaleY(y2).domain());
    //     this.lineUpdate();

    //     // if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    //     // var t = d3.event.transform;
    //     // x.domain(t.rescaleX(x2).domain());
    //     // Line_chart.select(".line").attr("d", line);
    //     // focus.select(".axis--x").call(xAxis);
    //     // context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
    // }

    heatmap(vgsalesData){
        // basic
        let svg = d3.select(".small").attr("width","100%").attr("height","100%")
        let width = document.getElementsByClassName("small")[0].clientWidth;
        let height = document.getElementsByClassName("small")[0].clientHeight;

        // x label name
        let Year = d3.group(vgsalesData,d=>d.Year).keys();
        let yearLabel = []
        d3.map(Year, d=>yearLabel.push(d))
        yearLabel.sort((a,b)=>a-b)
        
        // y label name
        let Genre = d3.group(vgsalesData,d=>d.Genre).keys();
        let genreLabel = []
        d3.map(Genre, d=>genreLabel.push(d))

        // data
        vgsalesData.sort((a,b)=>a-b);
        let YGData = []
        yearLabel.forEach(j=>{
            genreLabel.forEach(i=>{
                let Global_Sales = 0;

                vgsalesData.filter(d=>{
                    if(d.Year===j && d.Genre===i)
                    {
                       Global_Sales += parseFloat(d.Global_Sales)
                    }
                })

                let data = {
                    Year:j,
                    Genre:i,
                    Global_Sales:Global_Sales,
                }
                YGData.push(data)
            })
        })      

        console.log(YGData) 


        // Build X scales and axis:
        var x = d3.scaleBand()
                  .range([0, width])
                  .domain(yearLabel)
                  .padding(0.05);

        svg.append("g")
           .style("font-size", 15)
           .attr("transform", "translate(0," + height + ")")
           .call(d3.axisBottom(x).tickSize(0))
           .select(".domain").remove()

         // Build Y scales and axis:
        var y = d3.scaleBand()
                  .range([ height, 0 ])
                  .domain(genreLabel)
                  .padding(0.05);

        svg.append("g")
           .style("font-size", 15)
           .call(d3.axisLeft(y).tickSize(0))
           .select(".domain").remove()

        // Build color scale
        let salesMax = d3.max(YGData,d=>d.Global_Sales)

        var myColor = d3.scaleSequential()
                        .interpolator(d3.interpolateReds)
                        .domain([0,salesMax])


        svg.selectAll()
            .data(YGData)
            .enter()
            .append("rect")
            .attr("x", function(d) { return x(d.Year) })
            .attr("y", function(d) { return y(d.Genre) })
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("width", x.bandwidth() )
            .attr("height", y.bandwidth() )
            .style("fill", function(d) { return myColor(d.Global_Sales)} )
            .style("stroke-width", 4)
            .style("stroke", "none")
            .style("opacity", 0.8)
    }
}