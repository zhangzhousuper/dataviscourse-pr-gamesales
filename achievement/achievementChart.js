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
        this.drawDistributionPie("Nintendo");
        this.drawGenrePie("Nintendo");
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

    }

    drawSalesChart(company) {
        console.log(company);
        let salesData = d3.group(this.data, d => d.Publisher).get(company);
        console.log(salesData);
        
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
            .attr("id", "achievement_info_sales_chart")
            .attr("transform", `translate(${margin.left + 10}, ${margin.top + 180})`);
        
        g.append("g").call(yAxis).attr("transform", `translate(0, 0)`);
        g.append("g").call(xAxis).attr("transform", `translate(0, ${innerHeight})`);

        let lineGenerator = d3.line()
            .x(d => xScale(d[0]))
            .y(d => yScale(d[1].globalTotal));

        g.append("path")
            .attr("d", lineGenerator(salesDataByYear))
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

    drawDistributionPie(company) {
        let salesData = d3.group(this.data, d => d.Publisher).get(company);
        let totalSales = d3.sum(salesData, d => d.Global_Sales);
        let naSales = d3.sum(salesData, d => d.NA_Sales);
        let euSales = d3.sum(salesData, d => d.EU_Sales);
        let jpSales = d3.sum(salesData, d => d.JP_Sales);
        let otherSales = d3.sum(salesData, d => d.Other_Sales);
        let saleDistribution = {
            naSales: naSales / totalSales,
            euSales: euSales / totalSales,
            jpSales: jpSales / totalSales,
            otherSales: otherSales / totalSales
        }
        saleDistribution = Array.from(Object.entries(saleDistribution));
        // console.log(saleDistribution);

        let infoSvg = d3.select(".achievement_info_svg")
        .attr("width", 800)
        .attr("height", 800);

        let margin = {top: 20, right: 20, bottom: 20, left: 20};
        let innerWidth = 800 - margin.left - margin.right;
        let innerHeight = 200 - margin.top - margin.bottom;

        let radius = 80;
        let color = d3.scaleOrdinal()
            .domain(saleDistribution.map(d => d[0]))
            .range(d3.schemeCategory10);
        
        let pie = d3.pie()
            .value(d => d[1])
            .sort(null);

        // console.log(pie(saleDistribution));

        let arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius);


        let arcs = pie(saleDistribution);
        // console.log(arcs);
        let g = infoSvg.append("g")
            .attr("id", "achievement_info_distribution_chart")
            .attr("transform", `translate(${innerWidth-140}, ${margin.top + 80})`);

        let path = g.selectAll("path")
            .data(arcs)
            .join("path")
            .attr("fill", d => color(d.data[0]))
            .attr("d", arc)
            .attr("stroke", "white")
            .style("stroke-width", "2px")
            .style("opacity", 0.7);
        
        g.selectAll("text")
            .data(arcs)
            .join("text")
            // .attr("transform", d => `translate(${arc.centroid(d)})`)
            .attr("x", d => arc.centroid(d)[0]*1.5)
            .attr("y", d => arc.centroid(d)[1]*1.5)
            .attr("text-anchor", "middle")
            .attr("font-size", "10px")
            .attr("fill", "black")
            .attr("font-weight", "bold")
            .text(d => (d.data[1] * 100).toFixed(1) + "%");

        let legend = infoSvg.append("g")
            .attr("id", "achievement_info_distribution_legend")
            .attr("transform", `translate(${innerWidth-40}, ${margin.top + 10})`);
        
        legend.selectAll(null)
            .data(saleDistribution)
            .enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", (d, i) => i * 20)
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", d => color(d[0]));
        
        legend.selectAll(null)
            .data(saleDistribution)
            .enter()
            .append("text")
            .attr("x", 15)
            .attr("y", (d, i) => i * 20 + 9)
            .text(d => d[0])
            .attr("font-size", "10px")
            .attr("fill", "black");
        
        
    }

    drawGenrePie(company) {
        let salesDataByGenre = d3.group(this.data, d => d.Publisher).get(company);
        let totalSales = d3.sum(salesDataByGenre, d => d.Global_Sales);
        console.log(salesDataByGenre);
        salesDataByGenre = d3.group(salesDataByGenre, d => d.Genre);
        salesDataByGenre.forEach((value, key) => {
            salesDataByGenre.set(key, d3.sum(value, d => d.Global_Sales / totalSales));
        });
        salesDataByGenre = Array.from(salesDataByGenre);
        console.log(salesDataByGenre);

        let infoSvg = d3.select(".achievement_info_svg")
        .attr("width", 800)
        .attr("height", 800);

        let margin = {top: 20, right: 20, bottom: 20, left: 20};
        let innerWidth = 800 - margin.left - margin.right;
        let innerHeight = 200 - margin.top - margin.bottom;

        let radius = 80;
        let color = d3.scaleOrdinal()
            .domain(salesDataByGenre.map(d => d[0]))
            .range(d3.schemeCategory10);
        
        let pie = d3.pie()
            .value(d => d[1])
            .sort(null);

        console.log(pie(salesDataByGenre));

        let arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius);


        let arcs = pie(salesDataByGenre);
        let g = infoSvg.append("g")
            .attr("id", "achievement_info_distribution_chart")
            .attr("transform", `translate(${innerWidth-400}, ${margin.top + 80})`);

        let path = g.selectAll("path")
            .data(arcs)
            .join("path")
            .attr("fill", d => color(d.data[0]))
            .attr("d", arc)
            .attr("stroke", "white")
            .style("stroke-width", "2px")
            .style("opacity", 0.7);
        
        // g.selectAll("text")
        //     .data(arcs)
        //     .join("text")
        //     // .attr("transform", d => `translate(${arc.centroid(d)})`)
        //     .attr("x", d => arc.centroid(d)[0]*2.2)
        //     .attr("y", d => arc.centroid(d)[1]*2.2)
        //     // .attr("text-anchor", "middle")
        //     .attr("font-size", "10px")
        //     .attr("fill", "black")
        //     .attr("font-weight", "bold")
        //     .text(d => (d.data[1] * 100).toFixed(1) + "%");

        let legend = infoSvg.append("g")
            .attr("id", "achievement_info_distribution_legend")
            .attr("transform", `translate(${innerWidth-305}, ${margin.top })`);
        
        legend.selectAll(null)
            .data(salesDataByGenre)
            .enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", (d, i) => i * 14)
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", d => color(d[0]));
        
        legend.selectAll(null)
            .data(salesDataByGenre)
            .enter()
            .append("text")
            .attr("x", 15)
            .attr("y", (d, i) => i * 14 + 9)
            .text(d => d[0])
            .attr("font-size", "10px")
            .attr("fill", "black");
    }
    
    drawInfoCard(company) {
        let infoSvg = d3.select(".achievement_info_svg");
        let infoCard = infoSvg.append("g")
            .attr("id", "achievement_info_card");
        
        infoCard.append("rect")
            .attr("x", 20)
            .attr("y", 10)
            .attr("width", 250)
            .attr("height", 180)
            .attr("fill", "white")
            .attr("background-color", "#ef802e");
        
        infoCard.append("text")
            .attr("x", 30)
            .attr("y", 30)
            .text(company)
            .attr("font-size", "20px")
            .attr("fill", "red");
        
        infoCard.append("text")
            .attr("x", 30)
            .attr("y", 50)
            .text("Total Sales: " + d3.sum(this.data, d => d.Publisher == company ? d.Global_Sales : 0).toFixed(2))
            .attr("font-size", "15px")
            .attr("fill", "black");

        infoCard.append("text")
            .attr("x", 30)
            .attr("y", 70)
            .text("Total Games: " + d3.sum(this.data, d => d.Publisher == company ? 1 : 0))
            .attr("font-size", "15px")
            .attr("fill", "black");

        infoCard.append("text")
            .attr("x", 30)
            .attr("y", 90)
            .text("Average Sales: " + (d3.sum(this.data, d => d.Publisher == company ? d.Global_Sales : 0) / d3.sum(this.data, d => d.Publisher == company ? 1 : 0)).toFixed(2))
            .attr("font-size", "15px")
            .attr("fill", "black");

        // the best sales game
        let bestSalesGame = d3.max(this.data, d => d.Publisher == company ? d.Global_Sales : 0);
        let bestSalesGameName = this.data.filter(d => d.Publisher == company && d.Global_Sales == bestSalesGame)[0].Name;
        infoCard.append("text")
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
        infoCard.append("text")
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
        infoCard.append("text")
            .attr("x", 30)
            .attr("y", 150)
            .text("Best Sales Region: " + bestSalesRegionName)
            .attr("font-size", "15px")
            .attr("fill", "black");
            




    }
}