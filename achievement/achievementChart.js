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

        this.infoSvg = d3.select(".achievement_info_svg")
            .attr("width", 1200)
            .attr("height", 800);
        this.infoCard = this.infoSvg.append("g")
            .attr("id", "achievement_info_card");
        
        let margin = {top: 20, right: 20, bottom: 20, left: 20};
        let innerWidth = 800 - margin.left - margin.right;
        let innerHeight = 300 - margin.top - margin.bottom;
        this.g = this.infoSvg.append("g")
            .attr("id", "achievement_info_sales_chart")
            .attr("transform", `translate(${margin.left + 30}, ${margin.top + 180})`);
        this.g.append("g").attr("id", "achievement_info_sales_chart_y_axis")
            .attr("transform", `translate(0, 0)`);
        this.g.append("g").attr("id", "achievement_info_sales_chart_x_axis")
            .attr("transform", `translate(0, ${innerHeight})`);
        this.g.append("path").attr("id", "achievement_info_sales_chart_line");
        this.dropDown = d3.select("#achievement_info_select");
        this.dropDown.on("change", () => {
           console.log(this.dropDown.property("value"));
           this.drawDistributionWaffle("Nintendo",this.dropDown.property("value"));
        });
        this.drawBarChart();
        this.drawSalesChart("Nintendo");
        this.drawDistributionWaffle("Nintendo", "Sales");
        // this.drawDistributionPie("Nintendo");
        // this.drawGenrePie("Nintendo");
        this.drawInfoCard("Nintendo");
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

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Publisher");
        
        svg.append("text")
            .attr("transform", `translate(${innerWidth / 2}, ${innerHeight + margin.top + 10})`)
            .style("text-anchor", "middle")
            .text("Global Sales (in millions)");

        
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
            .attr("fill", d => colorScale(d[0]))
            .on("click", d => {
                console.log(d.target.__data__);
                this.drawSalesChart(d.target.__data__[0]);
                // this.drawDistributionPie(d.target.__data__[0]);
                // this.drawGenrePie(d.target.__data__[0]);
                this.drawDistributionWaffle(d.target.__data__[0], this.dropDown.property("value"));
                this.drawInfoCard(d.target.__data__[0]);
                
            });
        
        

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

    }

    drawSalesChart(company) {
        console.log(company);
        let salesData = d3.group(this.data, d => d.Publisher).get(company);
        // console.log(salesData);
        
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
        // console.log(salesDataByYear);
    
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
        

        // let g = infoSvg.append("g")
        //     .attr("id", "achievement_info_sales_chart")
        //     .attr("transform", `translate(${margin.left + 10}, ${margin.top + 180})`);
        
        // this.g.append("g").call(yAxis).attr("transform", `translate(0, 0)`);
        // this.g.append("g").call(xAxis).attr("transform", `translate(0, ${innerHeight})`);

        d3.select("#achievement_info_sales_chart_x_axis").transition().duration(1000).call(xAxis);
        d3.select("#achievement_info_sales_chart_y_axis").transition().duration(1000).call(yAxis);
        d3.select("#achievement_info_sales_chart").append("text")
            .attr("transform", `translate(${innerWidth / 2}, ${innerHeight + margin.top + 30})`)
            .style("text-anchor", "middle")
            .text("Year");
        d3.select("#achievement_info_sales_chart").append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left - 30)
            .attr("x", 0 - (innerHeight / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Global Sales (in millions)");

        d3.select("#achievement_info_sales_chart_x_axis").selectAll("text")
            .attr("transform", "rotate(-45)")
            .attr("y", 0)
            .attr("x", 0)
            .attr("dy", "1em")
            .style("text-anchor", "end");
        let lineGenerator = d3.line()
            .x(d => xScale(d[0]))
            .y(d => yScale(d[1].globalTotal));

        d3.select("#achievement_info_sales_chart_line")
            .transition()
            .duration(1000)
            .attr("d", lineGenerator(salesDataByYear))
            .attr("transform", `translate(${xScale.bandwidth() / 2}, 0)`)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2);


        // g.selectAll("rect")
        //     .data(salesDataByYear)
        //     .join("rect")
        //     .attr("x", d => xScale(d[0]))
        //     .attr("y", d => yScale(d[1].globalTotal))
        //     .attr("width", xScale.bandwidth())
        //     .attr("height", d => innerHeight - yScale(d[1].globalTotal))
        //     .attr("fill", "steelblue")
    }

    drawDistributionWaffle(company, selection) {
        let margin = {top: 20, right: 20, bottom: 20, left: 20};
        let innerWidth = 800 - margin.left - margin.right;
        let innerHeight = 300 - margin.top - margin.bottom;
        if (selection === "Sales") {
            let salesData = d3.group(this.data, d => d.Publisher).get(company);
            console.log(salesData);
            let totalSales = d3.sum(salesData, d => d.Global_Sales);
            let naSales = d3.sum(salesData, d => d.NA_Sales);
            let euSales = d3.sum(salesData, d => d.EU_Sales);
            let jpSales = d3.sum(salesData, d => d.JP_Sales);
            let otherSales = d3.sum(salesData, d => d.Other_Sales);
            // let saleDistribution = {
            //     naSales: naSales / totalSales,
            //     euSales: euSales / totalSales,
            //     jpSales: jpSales / totalSales,
            //     otherSales: otherSales / totalSales
            // }
            let saleDistribution = {
                naSales: naSales ,
                euSales: euSales,
                jpSales: jpSales,
                otherSales: otherSales
            }
            saleDistribution = Array.from(Object.entries(saleDistribution));
            // console.log(saleDistribution);

            

            let waffleChart = d3waffle();

            d3.select("#achievement_info_waffle_chart")
                .attr("transform", `translate(${innerWidth-300}, ${margin.top - 20})`)
                .datum(saleDistribution)
                .call(waffleChart);
        } else if (selection === "Genres") {
            let salesDataByGenre = d3.group(this.data, d => d.Publisher).get(company);
            let totalSales = d3.sum(salesDataByGenre, d => d.Global_Sales);
            console.log(salesDataByGenre);
            salesDataByGenre = d3.group(salesDataByGenre, d => d.Genre);
            salesDataByGenre.forEach((value, key) => {
                salesDataByGenre.set(key, d3.sum(value, d => d.Global_Sales / totalSales));
            });
            salesDataByGenre = Array.from(salesDataByGenre);

            let waffleChart = d3waffle();

            d3.select("#achievement_info_waffle_chart")
                .attr("transform", `translate(${innerWidth-300}, ${margin.top - 20})`)
                .datum(salesDataByGenre)
                .call(waffleChart);
        } else if (selection === "Platform") {
            let salesDataByPlatform = d3.group(this.data, d => d.Publisher).get(company);
            console.log(salesDataByPlatform);
            salesDataByPlatform = d3.group(salesDataByPlatform, d => d.Platform);
            salesDataByPlatform.forEach((value, key) => {
                salesDataByPlatform.set(key, d3.sum(value, d => d.Global_Sales));
            });
            salesDataByPlatform = Array.from(salesDataByPlatform);
            console.log(salesDataByPlatform);

            let waffleChart = d3waffle();

            d3.select("#achievement_info_waffle_chart")
                .attr("transform", `translate(${innerWidth-300}, ${margin.top - 20})`)
                .datum(salesDataByPlatform)
                .call(waffleChart);
        }
    }

    
    drawInfoCard(company) {
        d3.select("#achievement_info_card").selectAll("*").remove();
        
        this.infoCard.append("rect")
            .attr("x", 20)
            .attr("y", 10)
            .attr("width", 250)
            .attr("height", 180)
            .attr("fill", "white")
            .attr("background-color", "#ef802e");
        
            this.infoCard.append("text")
            .attr("x", 30)
            .attr("y", 30)
            .text(company)
            .attr("font-size", "18px")
            .attr("fill", "red");
        
            this.infoCard.append("text")
            .attr("x", 30)
            .attr("y", 50)
            .text("Total Sales: " + d3.sum(this.data, d => d.Publisher == company ? d.Global_Sales : 0).toFixed(2))
            .attr("font-size", "15px")
            .attr("fill", "black");

            this.infoCard.append("text")
            .attr("x", 30)
            .attr("y", 70)
            .text("Total Games: " + d3.sum(this.data, d => d.Publisher == company ? 1 : 0))
            .attr("font-size", "15px")
            .attr("fill", "black");

            this.infoCard.append("text")
            .attr("x", 30)
            .attr("y", 90)
            .text("Average Sales: " + (d3.sum(this.data, d => d.Publisher == company ? d.Global_Sales : 0) / d3.sum(this.data, d => d.Publisher == company ? 1 : 0)).toFixed(2))
            .attr("font-size", "15px")
            .attr("fill", "black");

        // the best sales game
        let bestSalesGame = d3.max(this.data, d => d.Publisher == company ? d.Global_Sales : 0);
        let bestSalesGameName = this.data.filter(d => d.Publisher == company && d.Global_Sales == bestSalesGame)[0].Name;
        this.infoCard.append("text")
            .attr("x", 30)
            .attr("y", 110)
            .text("Best Sales Game: " + bestSalesGameName)
            .attr("font-size", "15px")
            .attr("fill", "black");

        // the most genre they made
        let genreCount = new Map();
        this.data.filter(d => d.Publisher == company).forEach(d => {
            if (genreCount.has(d.Genre)) {
                genreCount.set(d.Genre, genreCount.get(d.Genre) + 1);
            } else {
                genreCount.set(d.Genre, 1);
            }
        }
        );
        let maxGenre = d3.max(Array.from(genreCount.values()));
        let maxGenreName = Array.from(genreCount.keys()).filter(d => genreCount.get(d) == maxGenre)[0];
        this.infoCard.append("text")
            .attr("x", 30)
            .attr("y", 130)
            .text("Most Genre: " + maxGenreName)
            .attr("font-size", "15px")
            .attr("fill", "black");
        
        // the best sales is eusales or jp sales or other sales or na sales
        let bestSalesRegion = d3.max([d3.sum(this.data, d => d.Publisher == company ? d.EU_Sales : 0), d3.sum(this.data, d => d.Publisher == company ? d.JP_Sales : 0), d3.sum(this.data, d => d.Publisher == company ? d.Other_Sales : 0), d3.sum(this.data, d => d.Publisher == company ? d.NA_Sales : 0)]);
        let bestSalesRegionName = "";
        if (bestSalesRegion == d3.sum(this.data, d => d.Publisher == company ? d.EU_Sales : 0)) {
            bestSalesRegionName = "EU";
        }
        if (bestSalesRegion == d3.sum(this.data, d => d.Publisher == company ? d.JP_Sales : 0)) {
            bestSalesRegionName = "JP";
        }
        if (bestSalesRegion == d3.sum(this.data, d => d.Publisher == company ? d.Other_Sales : 0)) {
            bestSalesRegionName = "Other";
        }
        if (bestSalesRegion == d3.sum(this.data, d => d.Publisher == company ? d.NA_Sales : 0)) {
            bestSalesRegionName = "NA";
        }
        this.infoCard.append("text")
            .attr("x", 30)
            .attr("y", 150)
            .text("Best Sales Region: " + bestSalesRegionName)
            .attr("font-size", "15px")
            .attr("fill", "black");
            




    }
}