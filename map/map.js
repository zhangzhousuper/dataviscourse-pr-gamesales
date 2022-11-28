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
        this.heatmapCreate(this.vgsalesData);
        this.lineCreate(this.vgsalesData);

        d3.select(".charts").style("width","94%").style("height","94%")
                            .style("background-color","white")
                            .style("margin-left","30px").style("margin-top","25px")
                            .style("border-radius","25px")
        
    }

    mapCreate(){
        // basic info
        let width = document.getElementsByClassName("world_map")[0].clientWidth;
        let height = document.getElementsByClassName("world_map")[0].clientHeight;

        // svg basic
        let svg = d3.select(".world_map").select("svg").attr("width","100%").attr("height","100%");

        // load map data
        let json = topojson.feature(this.mapData, this.mapData.objects.countries);

        // define regions
        let JP = ["JPN"]
        let NA = ["USA","CAN"]
        let EU = ["UK","FIN","SWE","NOR","ISL","DNK","EST","LVA","LTU","BLR","RUS","UKR","MDA","POL","CZE","SVK","HUN",
        "DEU","AUT","CHE","LIE","IRL","NLD","BEL","LUX","FRA","MCO","ROU","BGR","SRB","MKD","ALB","GRC","SVN","HRV","ITA",
        "VAT","SMR","MLT","ESP","PRT","AND","BIH"]

        // create a tooltip
        var tooltip = d3.select(".world_map")
                        .append("div")
                        .style("opacity", 0)
                        .attr("class", "tooltip")
                        .style("background-color", "white")
                        .style("border", "solid")
                        .style("border-width", "2px")
                        .style("border-radius", "5px")
                        .style("padding", "5px")
                        .style("position","absolute")
                        .style("z-index","2")
        
        // Three function that change the tooltip when user hover / move / leave a cell
        const mouseover = function(event,d) {
            tooltip
            .style("opacity", 1)
            .style("z-index","2")
            .html("Region: " + d.region + "<br> Sales: " + d.Sales)
            .style("left", (event.clientX) + "px")
            .style("top", (event.clientY) + "px")
            d3.select(this)
            .style("stroke", "black")
            .style("opacity", 1)

            // change region color
            let selectedReigon = d3.select(this)
            selectedReigon.attr("text",d=>{
                // change color
                let changeColor = function(region){
                    let allPath = d3.select(".world_map").select("svg").selectAll("path");
                    allPath = allPath._groups[0];
                    allPath.forEach(d=>{
                        let id = "";
                        d3.select(d).attr("text",d=>id=d["id"]);
                        if(region==="None")
                        { 
                            if(!(JP.includes(id)||NA.includes(id)||EU.includes(id)))
                            {
                                d3.select(d).attr("fill","#e3e0d4")
                            }
                        }
                        else
                        {
                            if(region.includes(id))
                            {
                                d3.select(d).attr("fill","#e3e0d4")
                            }
                        }    
                    })
                }
                // check
                let region = 0;
                if(JP.includes(d['id']))
                {
                    changeColor(JP);
                }
                else if(EU.includes(d['id']))
                {
                    changeColor(EU);
                }
                else if(NA.includes(d['id']))
                {
                    changeColor(NA);
                }
                else
                {
                    changeColor("None");
                }
            })
        }
        
        const mouseleave = function(event,d) {
            tooltip
            .style("opacity", 0)
            .style("z-index","-1")
            d3.select(this)
            .style("stroke", "none")
            .style("opacity", 0.8)
        }

        // Set up the map projection
        const projection = d3.geoWinkel3()
        .scale(100)
        .translate([width/2, height/2+10]);

        let path = d3.geoPath().projection(projection);
        
        svg.selectAll("path").data(json.features)
            .join("path")
            .attr("d", (path))
            .attr("fill", "lightgray")
            .attr("opacity",0.8)
            .attr("stroke","none")
            .attr("stroke-width","0px")
            .on("mouseout",function(){
                let allPath = d3.select(".world_map").select("svg").selectAll("path").attr("fill","gray");
            })
            .on("mouseover", mouseover)
            .on("mouseleave", mouseleave)
        
        // text
        svg.append("text").text("Sales by Regions").attr("transform","translate(20,20)").attr("fill","black").attr("font-size","14");
        svg.append("text").text("Global").attr("transform","translate(20,40)").attr("fill","gray").attr("font-size","12")

    }

    donutCreate(){

        // data
        let vgsalesData = this.vgsalesData;

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

        // pie data
        let pieData = pie(Sales.slice(0,4));

        // radius
        let arc = d3.arc();
        arc.outerRadius(80);
        arc.innerRadius(60);

        // div css
        // out
        d3.select(".pie").style("width","80%").style("height","90%")
                         .style("background-color","#f6f4f0")
                         .style("margin-left","50px").style("margin-top","30px")
                         .style("border-radius","25px")
                         .style("box-shadow","8px -8px 0px #e6e4e2");

        // in
        d3.select(".pie").select("div").style("width","80%").style("height","75%")
                         .style("background-color","white")
                         .style("margin-left","45px").style("margin-top","70px")
                         .style("border-radius","25px");
        
        // svg css
        d3.select(".pie").select("svg").attr("width","100%").attr("height","100%");

        // basic info
        let width = document.getElementsByClassName("pieSvg")[0].clientWidth;
        let height = document.getElementsByClassName("pieSvg")[0].clientHeight;

        // donut chart 
        let SalesInfo = [["Global",0],["1000",16]]

        this.colorScale = d3.scaleOrdinal().domain(Sales.map(d=>d.region)).range(["#1e2d4a","#989784","#b5b09a","#e3e0d4","#efeee5"]);

        let piep = d3.select(".pie").select("svg").select(".pieChart").selectAll("g").data(pieData).join("g").attr('transform', `translate (${width-110}, ${height/2-10})`);
        let pieText = d3.select(".pie").select("svg").select(".pieChart").selectAll("text").data(SalesInfo).join("text").text(d=>d[0]).attr('transform', (d,i)=>`translate (${width-140+d[1]}, ${height/2-10+20*i})`).attr("font-size","16");


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

        // donut label
        d3.select(".pie").select("svg").select(".label").selectAll("circle").data(Sales.slice(0,4)).join("circle").attr("r",6).attr("transform",(d,i)=>`translate(40,${i*30+80})`).attr("fill",d=>this.colorScale(d.region))
        d3.select(".pie").select("svg").select(".label").selectAll("text").data(Sales.slice(0,4)).join("text").attr("r",6).attr("transform",(d,i)=>`translate(55,${i*30+85})`).text(d=>d.region)
    }

    heatmapCreate(vgsalesData){
        // basic
        let svg = d3.select(".small").attr("transform","translate(0,0)").select(".heatmap").attr("transform","translate(75, 20)")
        let rectwidth = document.getElementsByClassName("small")[0].clientWidth-130;
        let rectheight = 365-100;
        
        // x label name
        let Year = d3.group(vgsalesData,d=>d.Year).keys();
        let yearLabel = []
        d3.map(Year, d=>yearLabel.push(d))
        yearLabel.sort((a,b)=>a-b)
        this.yearLabel = yearLabel;
        
        // y label name
        let Genre = d3.group(vgsalesData,d=>d.Genre).keys();
        let genreLabel = []
        d3.map(Genre, d=>genreLabel.push(d))
        this.genreLabel = genreLabel;

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

        this.YGData = YGData;

        // create a tooltip
        var tooltip = d3.select(".chartsDown").select("div")
                        .append("div")
                        .style("opacity", 0)
                        .attr("class", "tooltip")
                        .style("background-color", "white")
                        .style("border", "solid")
                        .style("border-width", "2px")
                        .style("border-radius", "5px")
                        .style("padding", "5px")
                        .style("position","absolute")
                        .style("z-index","2")
        
        // Three function that change the tooltip when user hover / move / leave a cell
        const mouseover = function(event,d) {
            tooltip
            .style("opacity", 1)
            .style("z-index","2")
            d3.select(this)
            .style("stroke", "black")
            .style("opacity", 1)
        }
        const mousemove = function(event,d) {
            console.log(d)
            if(event.clientX>1000)
            {
                tooltip
                .html("Year: " + d.Year + "<br> Genre: " + d.Genre + "<br> sales: " + d3.format(".2f")(d.Global_Sales) +"M")
                .style("left", (event.clientX)-750 + "px")
                .style("top", (event.clientY)-180 + "px")
            }
            else{
                tooltip
                .html("Year: " + d.Year + "<br> Genre: " + d.Genre + "<br> sales: " + d3.format(".2f")(d.Global_Sales) +"M")
                .style("left", (event.clientX)-600 + "px")
                .style("top", (event.clientY)-180 + "px")
            }
        }
        const mouseleave = function(event,d) {
            tooltip
            .style("opacity", 0)
            .style("z-index","-1")
            d3.select(this)
            .style("stroke", "none")
            .style("opacity", 0.8)
        }

        // Build X scales and axis:
        var x = d3.scaleBand()
                  .range([0, rectwidth])
                  .domain(yearLabel)
                  .padding(0.05);
        this.x = x;

        let XAxis = d3.axisBottom();
        XAxis.scale(x)
        d3.select(".small").select(".xAxis").call(XAxis).attr("transform",`translate(75, 0)`).style("font-size","9");
        d3.select(".small").select(".xAxis").selectAll("line").attr("visibility","hidden");
        d3.select(".small").select(".xAxis").selectAll("path").attr("visibility","hidden");
        let xtext = d3.select(".small").select(".xAxis").selectAll("text");
        xtext = xtext._groups[0];
        xtext.forEach((d,i)=>{
            if(i%5!=0)
            {
                d3.select(d).attr("visibility","hidden");
            }
        })

         // Build Y scales and axis:
        var y = d3.scaleBand()
                  .range([rectheight, 0 ])
                  .domain(genreLabel)
                  .padding(0.05);
        
        let YAxis = d3.axisLeft();
        YAxis.scale(y)
        d3.select(".small").select(".yAxis").call(YAxis).attr("transform","translate(75, 20)").style("font-size","9");
        d3.select(".small").select(".yAxis").selectAll("line").attr("visibility","hidden");
        d3.select(".small").select(".yAxis").selectAll("path").attr("visibility","hidden");

        // Build color scale
        let salesMax = d3.max(YGData,d=>d.Global_Sales)

        var myColor = d3.scaleSequential()
                        .interpolator(d3.interpolateReds)
                        // .interpolatord3(interpolateRgb(a, b))
                        .domain([0,salesMax])


        svg.selectAll()
            .data(YGData)
            .enter()
            .append("rect")
            .attr("x", function(d) { return x(d.Year) })
            .attr("y", function(d) { return y(d.Genre) })
            .attr("rx", 2)
            .attr("ry", 2)
            .attr("width", x.bandwidth() )
            .attr("height", y.bandwidth() )
            .style("fill", function(d) { return myColor(d.Global_Sales)} )
            .style("stroke-width", .2)
            .style("stroke", "lightgray")
            .style("opacity", 0.8)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
        
    }

    lineCreate(vgsalesData){
        // let pHeight = document.getElementsByClassName("chartsDown")[0].clientHeight;

        let svg = d3.select(".lineChart").attr("width","100%").attr("height",370).select(".line").attr("width","100%").attr("height","100%").attr("transform","translate(85.45, 15)");
        let height = document.getElementsByClassName("line")[0].clientHeight;
        let width = document.getElementsByClassName("line")[0].clientWidth;

        // data
        let YGData = this.YGData;
        
        let YGDataSum = [];

        let yearLabel = this.yearLabel;
        let genreLabel = this.genreLabel;

        // data
        vgsalesData.sort((a,b)=>a-b);
        yearLabel.forEach(j=>{
            
            let Global_Sales = 0;

            vgsalesData.filter(d=>{
                if(d.Year===j)
                {
                    Global_Sales += parseFloat(d.Global_Sales)
                }
            })

            let data = {
                Year:j,
                Global_Sales:Global_Sales,
            }
            YGDataSum.push(data)

        })      
        this.YGDataSum = YGDataSum;

        // Build X scales and axis:
        let rectwidth = 967-130;
        var x = d3.scaleBand()
                  .range([0, rectwidth])
                  .domain(yearLabel)
                  .padding(0.05);

        // y
        let y = d3.scaleLinear()
                  .range([350, 0 ])
                  .domain([0, d3.max(YGDataSum, d=>d.Global_Sales)])
        let YAxis = d3.axisLeft();
        YAxis.scale(y)
        d3.select(".lineChart").select(".yAxis").call(YAxis).attr("transform","translate(70,15)")
        d3.select(".lineChart").select(".yAxis").selectAll("line").attr("stroke-dasharray","1 1").attr("stroke","lightgray").attr("x2","820");
        d3.select(".lineChart").select(".yAxis").selectAll("path").attr("visibility","hidden");
        


        // create line
        const lineGenerator = d3.line()
                                .x(d=>x(d.Year))
                                .y(d=>y(d.Global_Sales))

        svg.select("path").datum(YGDataSum).attr("d", lineGenerator)
           .attr("stroke", "#cc0000")
           .attr("stroke-width", 1.5)
           .attr("fill","none")
        
    }
}