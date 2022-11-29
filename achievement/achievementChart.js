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

        // apend a text at the middle of the page
        this.title = d3.select("#title")
            .append("text")
            .attr("fill", "black")
            .text("Achievements of Publishers");



        
        let margin = {top: 20, right: 20, bottom: 20, left: 20};
        let innerWidth = 800 - margin.left - margin.right;
        let innerHeight = 300 - margin.top - margin.bottom;
        this.infoSvg = d3.select(".achievement_info_svg")
            .attr("width", 1200)
            .attr("height", 800)
            .attr("transform", `translate(${100}, ${margin.top})`);
        this.infoCard = this.infoSvg.append("g")
        .attr("id", "achievement_info_card");
        this.g = this.infoSvg.append("g")
            .attr("id", "achievement_info_sales_chart")
            .attr("transform", `translate(${margin.left + 30}, ${margin.top + 260})`);
        
        this.g.append("g").attr("id", "achievement_info_sales_chart_y_axis")
            .attr("transform", `translate(0, 0)`);
        this.g.append("g").attr("id", "achievement_info_sales_chart_x_axis")
            .attr("transform", `translate(0, ${innerHeight})`);
        // this.g.append("path").attr("id", "achievement_info_sales_chart_line");
        this.g.append("g").attr("id", "achievement_info_sales_chart_tooltip");
        this.dropDown = d3.select("#achievement_info_select");
        document.getElementById("achievement_info_select").setAttribute("style","transform: translate(" + 100 + "px," + 5 + "px)");
        this.company = "Nintendo";
        this.dropDown.on("change", () => {
           console.log(this.dropDown.property("value"));
           this.drawDistributionWaffle(this.company,this.dropDown.property("value"));
        //    this.drawInfoCard(this.company);
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
        let width = 840;
        let height = 600;
        let margin = {top: 20, right: 20, bottom: 20, left: 20};
        let innerWidth = 800 - margin.left - margin.right;
        let innerHeight = height - margin.top - margin.bottom;
        svg.attr("width", width)
            .attr("height", height);

        let xScale = d3.scaleLinear()
            .domain([0, d3.max(this.companyData, d => d[1].globalTotal)])
            .range([margin.left, innerWidth])
            .nice();


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
            .attr("id", "achievement_bar_chart")
            
        
        // console.log(this.companyData.get
        achievement_bar_chart.selectAll("rect")
            .data(this.companyData)
            .join("rect")
            .attr("x", d => xScale(0))
            .attr("y", d => yScale(d[0]))
            .attr("width", d => xScale(d[1].globalTotal))
            .attr("height", yScale.bandwidth())
            .attr("fill", d => colorScale(d[0]))
            .on("mouseover", d => {
                //change opacity of all other bars
                achievement_bar_chart.selectAll("rect")
                    .attr("opacity", 0.2);
                //highlight the bar that is being hovered over
                d3.select(event.target)
                    .attr("opacity", 1);
            })
            .on("mouseout", d => {
                //change opacity of all other bars
                achievement_bar_chart.selectAll("rect")
                    .attr("opacity", 1);
            })
            .on("click", (e, d) => {
                console.log(this);
                this.company = d[0];
                this.updateSalesChart(d[0]);
                this.drawDistributionWaffle(d[0], this.dropDown.property("value"));
                this.drawInfoCard(d[0]);
            });
        

        let label = svg.append("g")
            .attr("font-size", 10)
            .selectAll("text");

        label.data(this.companyData)
            .join("text")
            .attr("x", d => xScale(d[1].globalTotal) + 20)
            .attr("y", d => yScale(d[0]) + yScale.bandwidth() / 2)
            .text(d => d[0]);

        label.data(this.companyData)
            .join("text")
            .attr("x", d => xScale(d[1].globalTotal) + 20)
            .attr("y", d => yScale(d[0]) + yScale.bandwidth() / 2 + 10)
            .text(d => d[1].globalTotal.toFixed(2));

    }

    drawSalesChart(company) {
        let c_this = this;
        let tooltip = d3.select("body")
              .append("div")
              .attr("class", "sales-tooltip")
              .style("position", "absolute")
              .style("text-align", "middle")
              .style("background", "#333")
              .style("margin", "8px")
              .style("color","white")
              .style("padding","3px")
              .style("border","0px")
              .style("border-radius","3px") // 3px rule
              .style("opacity",0)
              .style("cursor", "default");
        // console.log(company);
        let salesData = d3.group(this.data, d => d.Publisher).get(company);
        // console.log(salesData);
        
        let salesDataByYear = d3.group(salesData, d => d.Year);
        // salesDataByYear = d3.filter(salesDataByYear, d => d[0] != "N/A");
        salesDataByYear.forEach((value, key) => {
            let Global_Sales = 0;
            let NA_Sales = 0;
            let EU_Sales = 0;
            let JP_Sales = 0;
            let Other_Sales = 0;
            let year = key;
            value.forEach(d => {
                Global_Sales += d.Global_Sales;
                NA_Sales += d.NA_Sales;
                EU_Sales += d.EU_Sales;
                JP_Sales += d.JP_Sales;
                Other_Sales += d.Other_Sales;
            })
            salesDataByYear.set(key, {
                "Global_Sales": Global_Sales,
                "NA_Sales": NA_Sales,
                "EU_Sales": EU_Sales,
                "JP_Sales": JP_Sales,
                "Other_Sales": Other_Sales,
                year : year
        })
        });
    
        let margin = {top: 20, right: 20, bottom: 20, left: 20};
        let innerWidth = 800 - margin.left - margin.right;
        let innerHeight = 300 - margin.top - margin.bottom;

        salesDataByYear = new Map([...salesDataByYear.entries()].sort((a, b) => a[0] - b[0]));
        let xScale = d3.scaleBand()
            .domain(salesDataByYear.keys())
            .range([0, innerWidth])
            .padding(0.4);

        let yScale = d3.scaleLinear()
            .domain([0, d3.max(salesDataByYear.values(), d => d.Global_Sales)])
            .range([innerHeight, 0]);

        let xAxis = d3.axisBottom(xScale);
        let yAxis = d3.axisLeft(yScale);
        


        d3.select("#achievement_info_sales_chart_x_axis").transition().duration(1000).call(xAxis);
        d3.select("#achievement_info_sales_chart_y_axis").transition().duration(1000).call(yAxis);
        d3.select("#achievement_info_sales_chart").append("text")
            .attr("transform", `translate(${innerWidth / 2}, ${innerHeight + margin.top + 30})`)
            .style("text-anchor", "middle")
            .text("Year");
        // d3.select("#achievement_info_sales_chart").exit().remove();

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

        // change salesDataByYear to array
        let salesDataByYearArray = [];
        salesDataByYear.forEach((value, key) => {
            // put key and value into an array
            salesDataByYearArray.push(value);

            
        })
        // console.log(salesDataByYearArray);
        // stack the salesDataByYear by region
        // console.log(salesDataByYear);
        let stack = d3.stack()
            .keys(["NA_Sales", "EU_Sales", "JP_Sales", "Other_Sales"])
        // console.log(stack(salesDataByYearArray));

        
        let stackBar = d3.select("#achievement_info_sales_chart")
        let groups = stackBar.append("g")
        
            .attr("id", "achievement_info_sales_chart_stack_bar")
            .selectAll("g")
            .data(stack(salesDataByYearArray))
            .join("g")
            .attr("fill", d => {
                if (d.key == "NA_Sales") {
                    return "steelblue";
                } else if (d.key == "EU_Sales") {
                    return "orange";
                } else if (d.key == "JP_Sales") {
                    return "green";
                } else if (d.key == "Other_Sales") {
                    return "red";
                }
            })
        
        // add zoom feature
        let zoom = d3.zoom()
            .scaleExtent([1, 100])
            .translateExtent([[0, 0], [innerWidth, innerHeight]])
            .extent([[0, 0], [innerWidth, innerHeight]])
            .on("zoom", zoomed);

        
        let focus = d3.select("#achievement_info_sales_chart").append("rect")
        .attr("class", "zoom")
        .style("fill", "none")
        .style("pointer-events", "all")
            .attr("width", 800)
            .attr("height", 250)
            .attr("transform", `translate(${0}, ${0})`)
            .lower();
        focus.call(zoom);
        
        d3.select("#achievement_info_sales_chart").append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", innerWidth)
            .attr("height", innerHeight);

        
        groups.selectAll("rect")
            .data(d => d)
            .join("rect")
            .attr("x", d => xScale(d.data.year))
            .attr("y", d => yScale(d[1]))
            .attr("height", d => yScale(d[0]) - yScale(d[1]))
            .attr("width", xScale.bandwidth())
            .attr("clip-path", "url(#clip)")
            // .attr("transform", `translate(${xScale.bandwidth() / 2}, 0)`)
            .on("mouseover", function(e, d) {
                // console.log(d);
                const subGroupName = d3.select(this.parentNode).datum().key;
                // console.log(subGroupName);
                d3.select(".sales-tooltip")
                    .style("left", (e.pageX + 10) + "px")
                    .style("top", (e.pageY - 10) + "px")
                    .html((d.data.year) + "<br>" + (d[1] - d[0]).toFixed(2) + " million" + "<br>" + subGroupName)
                    .transition()
                    .duration(200)
                    .style("opacity", 0.9);
                d3.select(this).attr("opacity", 0.5);

            })
            .on("mouseout", function(d) {
                d3.select(this).attr("opacity", 1);
                d3.select("#achievement_info_sales_chart_tooltip").style("display", "none");
            })
            .on("click", function(e, d) {
                console.log(c_this);
                const subGroupName = d3.select(this.parentNode).datum().key;
                c_this.drawDistributionWaffle(company, "Genres", d.data.year, subGroupName);
                c_this.updateInfoCard(company, d.data.year, subGroupName);
            });

            

            function zoomed(e) {
                console.log(e.transform);
                // console.log(xScale);
                xScale.range([0, innerWidth].map(d => e.transform.applyX(d)));
                let new_yScale = e.transform.rescaleY(yScale);
                d3.select("#achievement_info_sales_chart_x_axis").call(xAxis.scale(xScale));
                d3.select("#achievement_info_sales_chart_y_axis").call(yAxis.scale(new_yScale));
                groups.selectAll("rect")
                    .attr("x", d => xScale(d.data.year))
                    .attr("y", d => new_yScale(d[1]))
                    .attr("height", d => new_yScale(d[0]) - new_yScale(d[1]))
                    .attr("width", xScale.bandwidth());
            }

    }

    updateSalesChart(company) {
        let c_this = this;
        let tooltip = d3.select("body")
              .append("div")
              .attr("class", "sales-tooltip")
              .style("position", "absolute")
              .style("text-align", "middle")
              .style("background", "#333")
              .style("margin", "8px")
              .style("color","white")
              .style("padding","3px")
              .style("border","0px")
              .style("border-radius","3px") // 3px rule
              .style("opacity",0)
              .style("cursor", "default");
        let salesData = d3.group(this.data, d => d.Publisher).get(company);

        let salesDataByYear = d3.group(salesData, d => d.Year);
        salesDataByYear.forEach((value, key) => {
            let Global_Sales = 0;
            let NA_Sales = 0;
            let EU_Sales = 0;
            let JP_Sales = 0;
            let Other_Sales = 0;
            let year = key;
            value.forEach(d => {
                Global_Sales += d.Global_Sales;
                NA_Sales += d.NA_Sales;
                EU_Sales += d.EU_Sales;
                JP_Sales += d.JP_Sales;
                Other_Sales += d.Other_Sales;
            })
            salesDataByYear.set(key, {
                "Global_Sales": Global_Sales,
                "NA_Sales": NA_Sales,
                "EU_Sales": EU_Sales,
                "JP_Sales": JP_Sales,
                "Other_Sales": Other_Sales,
                year : year
        })
        });
    
        let margin = {top: 20, right: 20, bottom: 20, left: 20};
        let innerWidth = 800 - margin.left - margin.right;
        let innerHeight = 300 - margin.top - margin.bottom;

        salesDataByYear = new Map([...salesDataByYear.entries()].sort((a, b) => a[0] - b[0]));
        let xScale = d3.scaleBand()
            .domain(salesDataByYear.keys())
            .range([0, innerWidth])
            .padding(0.4);

        let yScale = d3.scaleLinear()
            .domain([0, d3.max(salesDataByYear.values(), d => d.Global_Sales)])
            .range([innerHeight, 0]);

        let xAxis = d3.axisBottom(xScale);
        let yAxis = d3.axisLeft(yScale);
        

        d3.select("#achievement_info_sales_chart_x_axis").transition().duration(1000).call(xAxis);
        d3.select("#achievement_info_sales_chart_y_axis").transition().duration(1000).call(yAxis);

        d3.select("#achievement_info_sales_chart_x_axis").selectAll("text")
            .attr("transform", "rotate(-45)")
            .attr("y", 0)
            .attr("x", 0)
            .attr("dy", "1em")
            .style("text-anchor", "end");
        let salesDataByYearArray = [];
        salesDataByYear.forEach((value, key) => {
            // put key and value into an array
            salesDataByYearArray.push(value);

            
        })
        console.log(salesDataByYearArray);
        let stack = d3.stack()
            .keys(["NA_Sales", "EU_Sales", "JP_Sales", "Other_Sales"])

        let stackBar = d3.select("#achievement_info_sales_chart_stack_bar")
        let groups = stackBar.selectAll("g")
            .data(stack(salesDataByYearArray))
            .join("g")
            .attr("id", "achievement_info_sales_chart_stack_bar")
            .attr("fill", d => {
                if (d.key == "NA_Sales") {
                    return "steelblue";
                } else if (d.key == "EU_Sales") {
                    return "orange";
                }
                else if (d.key == "JP_Sales") {
                    return "green";
                }
                else if (d.key == "Other_Sales") {
                    return "red";
                }
            })


        let rects = groups.selectAll("rect")
            .data(d => d)
            .join("rect")
            .on("mouseover", function(e, d) {
                const subGroupName = d3.select(this.parentNode).datum().key;
                d3.select(".sales-tooltip")
                    .style("left", (e.pageX + 10) + "px")
                    .style("top", (e.pageY - 10) + "px")
                    .html((d.data.year) + "<br>" + (d[1] - d[0]).toFixed(2) + " million" + "<br>" + subGroupName)
                    .transition()
                    .duration(200)
                    .style("opacity", 0.9);
                d3.select(this).attr("opacity", 0.5);
    
            })
            .on("mouseout", function(d) {
                d3.select(this).attr("opacity", 1);
                d3.select("#achievement_info_sales_chart_tooltip").style("display", "none");
            })
            .on("click", function(e, d) {
                const subGroupName = d3.select(this.parentNode).datum().key;
                c_this.drawDistributionWaffle(company, "Genres", d.data.year, subGroupName);
                c_this.updateInfoCard(company, d.data.year, subGroupName);
            })
            .transition()
            .duration(1000)
            .attr("x", d => xScale(d.data.year))
            .attr("y", d => yScale(d[1]))
            .attr("height", d => yScale(d[0]) - yScale(d[1]))
            .attr("width", xScale.bandwidth());

            
    }
    

    drawDistributionWaffle(company, selection,year, region) {
        let data = this.data;
        let margin = {top: 20, right: 20, bottom: 20, left: 20};
        let innerWidth = 800 - margin.left - margin.right;
        let innerHeight = 300 - margin.top - margin.bottom;
        if (year != undefined) {
            data = data.filter(d => d.Year == year);
            console.log(data);
        }
        if (selection === "Sales") {
            let salesData = d3.group(data, d => d.Publisher).get(company);
            // console.log(salesData);
            let totalSales = d3.sum(salesData, d => d.Global_Sales);
            let naSales = d3.sum(salesData, d => d.NA_Sales);
            let euSales = d3.sum(salesData, d => d.EU_Sales);
            let jpSales = d3.sum(salesData, d => d.JP_Sales);
            let otherSales = d3.sum(salesData, d => d.Other_Sales);
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
                .attr("transform", `translate(${innerWidth-200}, ${margin.top - 20})`)
                .datum(saleDistribution)
                .call(waffleChart);
        } else if (selection === "Genres") {
            
            let salesDataByGenre = d3.group(data, d => d.Publisher).get(company);
            let totalSales = d3.sum(salesDataByGenre, d => d.Global_Sales);
            console.log(salesDataByGenre);
            salesDataByGenre = d3.group(salesDataByGenre, d => d.Genre);
            salesDataByGenre.forEach((value, key) => {
                if (region != undefined) {
                    salesDataByGenre.set(key, d3.sum(value, d => d[region]/totalSales));
                } else {
                salesDataByGenre.set(key, d3.sum(value, d => d.Global_Sales / totalSales));
                }
            });
            salesDataByGenre = Array.from(salesDataByGenre);

            let waffleChart = d3waffle();

            d3.select("#achievement_info_waffle_chart")
                .attr("transform", `translate(${innerWidth-200}, ${margin.top - 20})`)
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
                .attr("transform", `translate(${innerWidth-200}, ${margin.top - 20})`)
                .datum(salesDataByPlatform)
                .call(waffleChart);
        }
    }

    
    drawInfoCard(company,year,region) {
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
            .text("Average Sales Per Game: " + (d3.sum(this.data, d => d.Publisher == company ? d.Global_Sales : 0) / d3.sum(this.data, d => d.Publisher == company ? 1 : 0)).toFixed(2))
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
            
        this.infoCard.append("text")
            .attr("x", 30)
            .attr("y", 170)
            .text("Year: " + (year == undefined ? "All" : year))
            .attr("font-size", "14px")
            .attr("fill", "black");



    }

    updateInfoCard(company,year,region) {
        this.infoCard.selectAll("*").remove();
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
            
            // change NA_Sales to NA
            let regionName = region;
            if (region == "NA_Sales") {
                regionName = "NA";
            }
            if (region == "EU_Sales") {
                regionName = "EU";
            }
            if (region == "JP_Sales") {
                regionName = "JP";
            }
            if (region == "Other_Sales") {
                regionName = "Other Region";
            }
            this.infoCard.append("text")
            .attr("x", 30)
            .attr("y", 110)
            .text("Region: " + regionName)
            .attr("font-size", "15px")
            .attr("fill", "black");
            this.infoCard.append("text")
            .attr("x", 30)
            .attr("y", 90)
            .text("Year: " + (year == undefined ? "All" : year))
            .attr("font-size", "14px")
            .attr("fill", "black");
            

        // the best sales game in this region this year
        let bestSalesGame = d3.max(this.data, d => d.Publisher == company && d.Year == year ? d[region] : 0);
        let bestSalesGameName = this.data.filter(d => d.Publisher == company && d.Year == year && d[region] == bestSalesGame)[0].Name;
        this.infoCard.append("text")
            .attr("x", 30)
            .attr("y", 130)
            .text("Best Sales Game: " + bestSalesGameName)
            .attr("font-size", "15px")
            .attr("fill", "black");



        // the best sales genre in this region this year
        let bestSalesGenre = d3.max(this.data, d => d.Publisher == company && d.Year == year ? d[region] : 0);
        let bestSalesGenreName = this.data.filter(d => d.Publisher == company && d.Year == year && d[region] == bestSalesGenre)[0].Genre;
        this.infoCard.append("text")
            .attr("x", 30)
            .attr("y", 150)
            .text("Best Sales Genre: " + bestSalesGenreName)
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
        
            
        

    }
}

/**
 * Returns html that can be used to render the tooltip.
 * @param tooltipDataInput
 * @returns {string}
 */
 function tooltipRender (tooltipDataInput) {
    //ADD FORMATTING TO THE PERCENTAGES TO AVOID LARGE DECIMAL VALUES
    const formatter = d3.format(".3f");
  
    const position =
      +tooltipDataInput.position < 0
        ? `D+ ${formatter(Math.abs(+tooltipDataInput.position))}`
        : `R+ ${formatter(+tooltipDataInput.position)}`;
  
    const phrase = tooltipDataInput.phrase.charAt(0).toUpperCase() + tooltipDataInput.phrase.slice(1);
    const text = `<h3>${phrase}</h3> <h5>${position}%</h5> 
      <h5> In ${Math.round((tooltipDataInput.total / 50) * 100)}% of speeches</h5>`;
    return text;
  }