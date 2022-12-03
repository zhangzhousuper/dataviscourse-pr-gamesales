/** Class representing the map view. */
class cwVis {
    /**
     * Creates a Map Visuzation
     * @param globalApplicationState 
     * @param mapData
     * @param vgsalesData 
     */
  
    constructor(vgsalesData) {
        this.vgsalesData = vgsalesData
        console.log(vgsalesData)

        d3.select(".tabelInfo").style("width","100%").style("height","100%");
        d3.select("#mainTable").style("width","250%").style("height","100%").style("padding-top","10px");
        d3.select("#columnHeaders").selectAll("i").style("padding-left","10px")

        // basic info
        this.page = 1;
        this.headerData = [
            {
                sorted: false,
                ascending: false,
                key: 'Name'
            },
            {
                sorted: false,
                ascending: false,
                key: 'Platform',
            },
            {
                sorted: false,
                ascending: false,
                key: 'Year',
            },
            {
                sorted: false,
                ascending: false,
                key: 'Genre'
            },
            {
                sorted: false,
                ascending: false,
                key: 'Publisher'
            },
            {
                sorted: false,
                ascending: false,
                key: 'NA_Sales'
            },
            {
                sorted: false,
                ascending: false,
                key: 'EU_Sales'
            },
            {
                sorted: false,
                ascending: false,
                key: 'JP_Sales'
            },
            {
                sorted: false,
                ascending: false,
                key: 'Other_Sales'
            },
            {
                sorted: false,
                ascending: false,
                key: 'Global_Sales'
            },
        ]

        this.drawTable(this.vgsalesData, this.page);
        this.nextPage();
        this.attachSortHandlers(this.vgsalesData, this);
        this.changeSelectorInfo();
        this.button(this);
        this.Bubblechart("NA_Sales", "NA_Sales");
        this.addTutorial();
        
    }

    drawTable(tableData=this.vgsalesData, page) {
        d3.select(".paginationInfo").select("text").text(`Showing ${(page-1)*15+1} to ${(page-1)*15+15} of ${tableData.length} entries`)

        tableData = tableData.slice((page-1)*15,(page-1)*15+14);

        let rowSelection = d3.select('#mainTableBody')
            .selectAll('tr')
            .data(tableData)
            .join('tr')
            .attr("style",(d,i)=>{
                if(i%2==1)
                    return "background-color:#F9F9F9"
            })

        rowSelection.on('click', (event, d) => 
            {
                if (d.isForecast)
                {
                    this.toggleRow(d, tableData.indexOf(d));
                }
            });

        let forecastSelection = rowSelection.selectAll('td')
            .data(this.rowToCellDataTransform)
            .join('td')
            .attr("style","font-size:8px;color:#423D33;")
            .attr("width","100px")

        let textSelection = forecastSelection.filter(d => d.type === 'text');
        textSelection.text(d=>d.value);
    }

    rowToCellDataTransform(d) {
        let Name = {
            type: 'text',
            class: "Name",
            value: d.Name
        };

        let Platform = {
            type: 'text',
            class: "Platform",
            // category: d.Platform,
            value: d.Platform
        };

        let Year = {
            type: 'text',
            class: "Year",
            value: parseFloat(d.Year)
        };

        let Genre = {
            type: 'text',
            class: "Genre",
            value: d.Genre
        };

        let Publisher = {
            type: 'text',
            class: "Publisher",
            value: d.Publisher
        };

        let NA_Sales = {
            type: 'text',
            class: "NA_Sales",
            value: parseFloat(d.NA_Sales)
        };

        let EU_Sales = {
            type: 'text',
            class: "EU_Sales",
            value: parseFloat(d.EU_Sales)
        };
        
        let JP_Sales = {
            type: 'text',
            class: "JP_Sales",
            value: parseFloat(d.JP_Sales)
        };

        let Other_Sales = {
            type: 'text',
            class: "Other_Sales",
            value: parseFloat(d.Other_Sales)
        };

        let Global_Sales = {
            type: 'text',
            class: "Global_Sales",
            value: parseFloat(d.Global_Sales)
        };

        let dataList = [Name, Platform, Year, Genre, Publisher, NA_Sales, EU_Sales, JP_Sales, Other_Sales, Global_Sales];

        return dataList;
    }

    nextPage(){
        d3.select(".right").on("click",()=>{
            this.page = this.page+1;
            this.drawTable(this.vgsalesData, this.page);
        })

        d3.select(".left").on("click",()=>{
            if(this.page!=1)
            {
                this.page = this.page-1;
                this.drawTable(this.vgsalesData, this.page);
            }
        })
    }

    attachSortHandlers(tabledata=this.vgsalesData, out){
        d3.select("#columnHeaders").selectAll(".sortable").on("click", function(){
            let textSelected = d3.select(this).text();
            if(textSelected==="NA")
                textSelected="NA_Sales";
            if(textSelected==="EU")
                textSelected="EU_Sales";
            if(textSelected==="JP")
                textSelected="JP_Sales";
            if(textSelected==="Other")
                textSelected="Other_Sales";
            if(textSelected==="Global")
                textSelected="Global_Sales";

            out.headerData.forEach(d=>{
                if(d.key===textSelected)
                {
                    if(d.sorted===true)
                    {
                        d3.select(this).select("i").attr("class","fa-solid fa-sort");
                        d.sorted = false;
                    }
                    else if(d.ascending===true)
                    {
                        d.ascending = false;
                        d.sorted = true;
                        tabledata.sort((a,b)=>d3.descending((a[textSelected]), (b[textSelected])));
                        out.vgsalesData = tabledata;
                        out.drawTable(out.vgsalesData, out.page);
                        d3.select(this).select("i").attr("class","fa-solid fa-sort-down");
                    }
                    else if(d.ascending===false)
                    {
                        d.ascending = true;
                        tabledata.sort((a,b)=>d3.ascending((a[textSelected]), (b[textSelected])));
                        out.vgsalesData = tabledata;
                        out.drawTable(out.vgsalesData, out.page);
                        d3.select(this).select("i").attr("class","fa-solid fa-sort-up");
                    }
                }
            })

        })
    }

    Barchart(xText, yText){
        // basic info
        let width = document.getElementsByClassName("chartSvg")[0].clientWidth-50;
        let height = document.getElementsByClassName("chartSvg")[0].clientHeight-50;

        console.log(width)

        console.log(xText,yText);
        let vgsalesData = this.vgsalesData;
        
        // x axis
        let x = d3.group(vgsalesData,d=>d[xText]).keys();
        let xLabel = []
        d3.map(x, d=>xLabel.push(d))
        xLabel.sort((a,b)=>a-b)

        let Xscale = d3.scaleBand().domain(xLabel).range([0, width]).padding(.5)
        let XAxis = d3.axisBottom();
        XAxis.scale(Xscale);
        
        d3.select(".xAxis").call(XAxis).attr("transform",`translate(45,${height+10})`);

        // y axis
        if(yText==='Name(Count)')
        {
            vgsalesData.sort((a,b)=>a.Year-b.Year);
            let nameCount = d3.group(vgsalesData,d=>d[xText])

            let domainMax = 0;
            nameCount.forEach(item=>{
                if(domainMax<item.length)
                    domainMax = item.length;
            })

            console.log(domainMax)
            
            let Yscale = d3.scaleLinear().domain([0,domainMax]).range([height, 0]).nice()
            let YAxis = d3.axisLeft();
            YAxis.scale(Yscale);

            d3.select(".yAxis").call(YAxis).attr("transform",`translate(45,10)`);
        }
        else if(yText==='Genre(Count)')
        {
            vgsalesData.sort((a,b)=>a.Year-b.Year);
            let nameCount = d3.group(vgsalesData,d=>d[xText])

            // genreLabel
            let Genre = d3.group(vgsalesData,d=>d.Genre).keys();
            let genreLabel = []
            d3.map(Genre, d=>genreLabel.push(d))
            this.genreLabel = genreLabel;
            
            let Yscale = d3.scaleLinear().domain([0,domainMax]).range([height, 0]).nice()
            let YAxis = d3.axisLeft();
            YAxis.scale(Yscale);

            d3.select(".yAxis").call(YAxis).attr("transform",`translate(45,10)`);
        }

        // bar
    }

    Bubblechart(xText, yText){
        // basic info
        let width = document.getElementsByClassName("chartSvg")[0].clientWidth;
        let height = document.getElementsByClassName("chartSvg")[0].clientHeight;

        // x
        let xdomainMax = d3.max(this.vgsalesData,d=>d[xText])
        let Xscale = d3.scaleLinear().domain([0,xdomainMax]).range([0, width]).nice()
        let XAxis = d3.axisTop();
        XAxis.scale(Xscale);

        // y
        let ydomainMax = d3.max(this.vgsalesData,d=>d[xText])
        let Yscale = d3.scaleLinear().domain([0,ydomainMax]).range([height, 0]).nice()
        let YAxis = d3.axisRight();
        YAxis.scale(Yscale);

        // color
        // genreLabel
        let Genre = d3.group(this.vgsalesData,d=>d.Genre).keys();
        let genreLabel = []
        d3.map(Genre, d=>genreLabel.push(d))
        this.genreLabel = genreLabel;
        console.log(genreLabel)

        // color
        this.colorScale = d3.scaleOrdinal().domain(genreLabel).range(["#FF9DA7","#BAB0AB","#F28E2C","#76B7B2","#59A14F", '#EDC949', '#AF7AA1', '#4E79A7', '#E15759', '#76B7B2' ,'#FF9DA7', '#E15759']);

        // label
        d3.select(".chartMain").select(".label").selectAll("text").data(genreLabel).join("text").text(d=>d).attr("transform",(d,i)=>`translate(${i*75+15},${15})`).attr("font-size","10")
        d3.select(".chartMain").select(".label").selectAll("circle").data(genreLabel).join("circle").attr("fill",d=>this.colorScale(d)).attr("transform",(d,i)=>`translate(${i*75+10},${12})`).attr("r","3")

        // hover
        d3.select(".chartMain").select(".label").selectAll("text").on("click",(e)=>{
            let select = d3.select(e.path[0]).text();
            this.changeBubble(select, xText, yText ,Xscale ,Yscale);
        })
        d3.select(".chartSvgDiv").on("click",(e)=>{
            let select = d3.select(e.path[0]).text();
            svg.selectAll("circle").attr("z-index","0").attr("display","block")
        })

        // bubble
        let svg = d3.select(".chartSvg").select(".Main");

        svg.selectAll("circle").data(this.vgsalesData).join("circle")
                               .attr("cx",d=>Xscale(parseFloat(d[xText]))).attr("cy",d=>Yscale(parseFloat(d[yText]))).attr("r", 5)
                               .attr("transform","translate(0,0)")
                               .attr("fill","none")
                               .attr("stroke",d=>this.colorScale(d.Genre))
                               .attr("stroke-width","1px")
                               .attr("opacity",'.5')

        // create a tooltip
        var tooltip = d3.select(".chartSvgDiv")
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

        const mouseover = function(event,d){
            console.log(d3.select(this).attr("opacity"))
            if(d3.select(this).attr("opacity")===".5")
            {
                tooltip
                .style("opacity", 1)
                .style("z-index","2")
                .html("Name: " + d["Name"] + `<br> ${xText}: ` + d[xText] + "M" + `<br> ${yText}: ` + d[yText] + "M")
                .style("left", ()=>{
                    console.log(event.clientX-700)
                    if(event.clientX-700 < 0)
                        return (event.clientX-500) + "px"
                    else if(event.clientX-700 > 700)
                        return (event.clientX-900) + "px"
                    else
                        return (event.clientX-600) + "px"
                })
                .style("top", ()=>{
                    if(event.clientY-150 > 500)
                        return (event.clientY-250) + "px"
                    else
                        return (event.clientY-200) + "px"
                })
                d3.select(this)
                .style("opacity", "10")
            }
        }

        const mouseleave = function(event,d) {
            if(d3.select(this).attr("opacity")===".5")
            {
                tooltip
                .style("opacity", 0)
                .style("z-index","-1")
                d3.select(this)
                .style("opacity", ".5")
            }
        }

        d3.selectAll("circle")
            .on("mouseover", mouseover)
            .on("mouseleave", mouseleave)

        // call xy
        d3.select(".xAxis").call(XAxis).attr("transform",`translate(0,${height})`);
        d3.select(".yAxis").call(YAxis).attr("transform",`translate(0,${0})`);

        // zoom
        const zoom = d3.zoom()
                        .scaleExtent([0.5, 32])
                        .on("zoom", zoomed);

        const gx = d3.select(".xAxis");

        const gy = d3.select(".yAxis");

        let zoomSVG = d3.select(".chartSvg");
        zoomSVG.call(zoom).call(zoom.transform, d3.zoomIdentity);

        function zoomed({transform}) {
            console.log(transform)
            const zx = transform.rescaleX(Xscale).interpolate(d3.interpolateRound);
            const zy = transform.rescaleY(Yscale).interpolate(d3.interpolateRound);
            svg.selectAll("circle").attr("transform", `translate(${transform.x+0},${transform.y+0}) scale(${transform.k})`).attr("r", 5 / transform.k);
            
            gx.call(d3.axisTop(zx).ticks(12));
            gy.call(d3.axisRight(zy).ticks(12));
        }
        
    }

    changeBubble(select, xText, yText ,Xscale, Yscale, transform){
        let svg = d3.select(".chartSvg").select(".Main");

        svg.selectAll("circle").attr("display",(d,i)=>{
                                    if(d.Genre!=select)
                                        return "none";
                                    else
                                        return "block";
                                })  
                               .attr("position","relative")
                               .attr("z-index",(d,i)=>{
                                    if(d.Genre===select)
                                        return "2";
                                    else return "0";
                                })
    }

    changeSelectorInfo(){
        d3.select(".selector").select("select").on("change",(e)=>{
            let sel = document.querySelector("select");
            let index = sel.selectedIndex;
            let text = sel.options[index].text;

            if(text === "Bar chart")
            {
                let x = ['Year','Name','Platform','Genere','Publisher','Sales'];
                let y = ['Name(Count)','Platform(Count)','Genre(Count)','Sales'];
                d3.select(".selector").select(".x").select("select").selectAll("option").data(x).join("option").text(d=>d);
                d3.select(".selector").select(".y").select("select").selectAll("option").data(y).join("option").text(d=>d);
            }
            else if(text === "Bubble chart")
            {
                let x = ['NA_Sales','EU_Sales','JP_Sales','Other_Sales','Global_Sales'];
                let y = ['NA_Sales','EU_Sales','JP_Sales','Other_Sales','Global_Sales'];
                d3.select(".selector").select(".x").select("select").selectAll("option").data(x).join("option").text(d=>d);
                d3.select(".selector").select(".y").select("select").selectAll("option").data(y).join("option").text(d=>d);
            }
        })

    }

    button(out){
        d3.select(".run").on("click",()=>{
            // // chart type
            // let sel = d3.select(".selector").select(".type");
            // console.log(sel)
            
            // x
            let selX = document.querySelector(".selx");
            let indexX = selX.selectedIndex;
            let textX = selX.options[indexX].text;

            // y
            let selY = document.querySelector(".sely");
            let indexY = selY.selectedIndex;
            let textY = selY.options[indexY].text;

            // if(text === "Bar chart"){
            //     out.Barchart(textX, textY);
            // }
            // else if(text === "Bubble chart"){
            out.Bubblechart(textX, textY);
            // }
        })
    }

    addTutorial(){
        d3.select(".tt").style("display","none");

        d3.select(".tutorial").on("click",()=>{
            d3.select(".tt").style("display","block");
        })

        d3.select(".tt").on("click",()=>{
            d3.select(".tt").style("display","none");
        })
    }
    
}