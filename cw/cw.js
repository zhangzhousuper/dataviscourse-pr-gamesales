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

    
}