class achievementChart {
    constructor(data) {
        this.data = data;
        this.data = d3.filter(this.data, d => d.Year != "N/A");
        console.log(this.data);
        this.companyData = d3.group(this.data, d => d.Publisher);
        this.companyNumbers = this.companyData.size;
        console.log(this.companyData);
        this.companyData.forEach((value, key) => {
            let globalTotal = 0;
            let count = 0;
            let euSales = 0;
            let naSales = 0;
            let jpSales = 0;
            let otherSales = 0;
            value.forEach(d => {
                globalTotal += d.Global_Sales;
                count++;
                euSales += d.EU_Sales;
                naSales += d.NA_Sales;
                jpSales += d.JP_Sales;
                otherSales += d.Other_Sales;

            });
            this.companyData.set(key, {globalTotal: globalTotal, count: count, euSales: euSales, naSales: naSales, jpSales: jpSales, otherSales: otherSales});
        });
        this.companyData = d3.filter(this.companyData, d => d[1].globalTotal > 100);
        console.log(this.companyData);

        this.drawBarChart();
        this.drawSalesChart("Nintendo");
    }
    
    drawBarChart() {
        let svg = d3.select(".achievement_chart_svg");
        let width = 540;
        let height = 500;
        let margin = {top: 20, right: 20, bottom: 20, left: 20};
        let innerWidth = 500 - margin.left - margin.right;
        let innerHeight = height - margin.top - margin.bottom;
        
        svg.attr("width", width)
            .attr("height", height);

        let xScale = d3.scaleLinear()
            .domain([0, d3.max(this.companyData, d => d[1].globalTotal)])
            .range([margin.left, innerWidth])
            .nice();

        console.log(this.companyData.map(d => d[0]));

        let yScale = d3.scaleBand()
            .domain(this.companyData.map(d => d[0]))
            .rangeRound([margin.top, innerHeight])
            .padding(0.2);
        
        let achievement_chart_y_axis = svg.append("g")
            .attr("id", "achievement_chart_y_axis")
            .attr("transform", `translate(${margin.left}, 0)`);
        
        achievement_chart_y_axis.call(d3.axisLeft(yScale))
            .selectAll("text")
            .remove();
        
        achievement_chart_y_axis.selectAll("line")
            .remove();
        // achievement_chart_y_axis.selectAll("path")
        //     .remove();
        achievement_chart_y_axis.selectAll("domain")
        .remove();

        let achievement_chart_x_axis = svg.append("g")
            .attr("id", "achievement_chart_x_axis")
            .attr("transform", `translate(0, ${innerHeight})`);
        
        achievement_chart_x_axis.call(d3.axisBottom(xScale));
        
        let colorScale = d3.scaleOrdinal()
            .domain(this.companyData.map(d => d[0]))
            .range(d3.schemeSet2);
        let achievement_bar_chart = svg.append("g")
            .attr("id", "achievement_bar_chart");
        
        // console.log(this.companyData.get
        achievement_bar_chart.selectAll("rect")
            .data(this.companyData)
            .join("rect")
            .attr("x", d => xScale(0))
            .attr("y", d => yScale(d[0]))
            .attr("width", d => xScale(d[1].globalTotal))
            .attr("height", yScale.bandwidth())
            .attr("fill", d => colorScale(d[0]));

        let label = svg.append("g")
            .attr("font", "sans-serif")
            .attr("font-size", 10)
            .style("font-variant-numeric", "tabular-nums")
            .selectAll("text");

        label.data(this.companyData)
            .join("text")
            .attr("font-weight", "bold")
            .attr("x", d => xScale(d[1].globalTotal) + 20)
            .attr("y", d => yScale(d[0]) + yScale.bandwidth() / 2)
            .text(d => d[0]);

        label.data(this.companyData)
            .join("text")
            .attr("font-size", 9)
            .attr("x", d => xScale(d[1].globalTotal) + 20)
            .attr("y", d => yScale(d[0]) + yScale.bandwidth() / 2 + 10)
            .text(d => d[1].globalTotal.toFixed(2));

        
        // let infoSize = {
        //     width: 400,
        //     height: 800
        // }
        // let infoSvg = d3.select(".achievement_info_svg")
        // .attr("width", infoSize.width)
        // .attr("height", infoSize.height);
        
    
        // let radius = 80;
        // console.log(radius);
        // let pie = d3.pie()
        //     .padAngle(0.005)
        //     .value(d => d[1].globalTotal)
        //     .sort(null);
        // let arc = d3.arc()
        //     .innerRadius(radius * 0.67)
        //     .outerRadius(radius);
        // let arcs = pie(this.companyData);
        // console.log(arcs);

        // infoSvg.selectAll("path")
        //     .data(arcs)
        //     .join("path")
        //     .attr("fill", d => colorScale(d.data[0]))
        //     .attr("d", arc)
        //     .attr("transform", `translate(${margin.left + 40}, ${margin.top + 80})`);

        

        
        
        // let content = "Nintendo was founded in 1889 as Nintendo Karuta by craftsman Fusajiro Yamauchi and originally produced handmade hanafuda playing cards. After venturing into various lines of business during the 1960s and acquiring a legal status as a public company, Nintendo distributed its first console, the Color TV-Game, in 1977. It gained international recognition with the release of Donkey Kong in 1981 and the Nintendo Entertainment System and Super Mario Bros. in 1985.";

        // let textData = textbox(content,18)
        // function textbox (content, chars) {

        //     let temp = Array.from(content);
        //     let paragraph =[];
        //         paragraph[0]="";
        //     let j=0;
        //     let offset = 0,start = 0;
            
            
        //   var pattern = new RegExp("[A-Za-z0-9. ]+"); //filter
          
        //     for (var i = 0; i < temp.length; i++ ){
              
        //       if(pattern.test(temp[i])){
        //             offset += 1;   
        //                     };
           
        //       if ( i == start + chars + Math.floor(offset / 3)){
             
        //       start = i;
        //       offset = 0;
        //       j++;
        //       paragraph[j] ="";
           
        //       }
        //       paragraph[j] += temp[i];
        //       console.log(paragraph[j])
               
        //     }
          
        //     return paragraph
        // }
        
        // let companyDescription = infoSvg.append("g")
        //     .attr("id", "achievement_info_description");

        // companyDescription.append("rect")
        //     .attr("width", 400)
        //     .attr("height", 800)
        //     .attr("fill", "background")

        // companyDescription.selectAll("text")
        //     .data(textData)
        //     .join("text")
        //     .attr("x", 20)
        //     .attr("y", (d, i) => 20 + i * 20)
        //     .text(d => d)
        //     .attr("class", "achievement_info_description_text")

    }

    drawSalesChart(company) {
        console.log(company);
        let salesData = d3.group(this.data, d => d.Publisher).get(company);
        console.log(salesData);
        let salesDataByDistrict = salesData.map(d => {
            return {
                year: d.Year,
                global: d.Global_Sales,
                na: d.NA_Sales,
                eu: d.EU_Sales,
                jp: d.JP_Sales,
                other: d.Other_Sales
            }
        })

        console.log(salesDataByDistrict);
        let salesDataByYear = d3.group(salesData, d => d.Year);
        // salesDataByYear = d3.filter(salesDataByYear, d => d[0] != "N/A");
        salesDataByYear.forEach((value, key) => {
            let globalTotal = 0;
            let naTotal = 0;
            let euTotal = 0;
            let jpTotal = 0;
            let otherTotal = 0;
            value.forEach(d => {
                globalTotal += d.Global_Sales;
                naTotal += d.NA_Sales;
                euTotal += d.EU_Sales;
                jpTotal += d.JP_Sales;
                otherTotal += d.Other_Sales;
            })
            salesDataByYear.set(key, {
                globalTotal: globalTotal,
                naTotal: naTotal,
                euTotal: euTotal,
                jpTotal: jpTotal,
                otherTotal: otherTotal
        })
        })
        console.log(salesDataByYear);
        let infoSvg = d3.select(".achievement_info_svg")
        .attr("width", 800)
        .attr("height", 800);
        let margin = {top: 20, right: 20, bottom: 20, left: 20};
        let innerWidth = 800 - margin.left - margin.right;
        let innerHeight = 300 - margin.top - margin.bottom;

        salesDataByYear = new Map([...salesDataByYear.entries()].sort((a, b) => a[0] - b[0]));
        let xScale = d3.scaleBand()
            .domain(salesDataByYear.keys())
            .range([0, innerWidth])
            .padding(0.4);

        let yScale = d3.scaleLinear()
            .domain([0, d3.max(salesDataByYear.values(), d => d.globalTotal)])
            .range([innerHeight, 0]);

        let xAxis = d3.axisBottom(xScale);
        let yAxis = d3.axisLeft(yScale);

        let g = infoSvg.append("g")
            .attr("transform", `translate(${margin.left + 10}, ${margin.top + 180})`);
        
        g.append("g").call(yAxis).attr("transform", `translate(0, 0)`);
        g.append("g").call(xAxis).attr("transform", `translate(0, ${innerHeight})`);

        g.selectAll("rect")
            .data(salesDataByYear)
            .join("rect")
            .attr("x", d => xScale(d[0]))
            .attr("y", d => yScale(d[1].globalTotal))
            .attr("width", xScale.bandwidth())
            .attr("height", d => innerHeight - yScale(d[1].globalTotal))
            .attr("fill", "steelblue")

        
        

    }

}