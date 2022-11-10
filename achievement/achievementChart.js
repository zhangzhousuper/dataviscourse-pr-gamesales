class achievementChart {
    constructor(data) {
        this.data = data;
        this.companyData = d3.group(this.data, d => d.Publisher);
        this.companyNumbers = this.companyData.size;
        console.log(this.companyNumbers);
        this.companyData.forEach((value, key) => {
            let total = 0;
            let count = 0;
            value.forEach(d => {
                total += d.Global_Sales;
                count++;
            });
            this.companyData.set(key, {total: total, count: count});
        });
        this.companyData = d3.filter(this.companyData, d => d[1].total > 100);
        console.log(this.companyData);
        this.draw();
    }
    
    draw() {
        let svg = d3.select(".achievement_chart_svg");
        let width = 540;
        let height = 500;
        let margin = {top: 20, right: 20, bottom: 20, left: 20};
        let innerWidth = 500 - margin.left - margin.right;
        let innerHeight = height - margin.top - margin.bottom;
        
        svg.attr("width", width)
            .attr("height", height);

        let xScale = d3.scaleLinear()
            .domain([0, d3.max(this.companyData, d => d[1].total)])
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
        
        let achievement_bar_chart = svg.append("g")
            .attr("id", "achievement_bar_chart");
        
        // console.log(this.companyData.get
        achievement_bar_chart.selectAll("rect")
            .data(this.companyData)
            .join("rect")
            .attr("x", d => xScale(0))
            .attr("y", d => yScale(d[0]))
            .attr("width", d => xScale(d[1].total))
            .attr("height", yScale.bandwidth())
            .attr("fill", "steelblue");

        let label = svg.append("g")
            .attr("font", "sans-serif")
            .attr("font-size", 10)
            .style("font-variant-numeric", "tabular-nums")
            .selectAll("text");

        label.data(this.companyData)
            .join("text")
            .attr("font-weight", "bold")
            .attr("x", d => xScale(d[1].total) + 20)
            .attr("y", d => yScale(d[0]) + yScale.bandwidth() / 2)
            .text(d => d[0]);

        label.data(this.companyData)
            .join("text")
            .attr("font-size", 9)
            .attr("x", d => xScale(d[1].total) + 20)
            .attr("y", d => yScale(d[0]) + yScale.bandwidth() / 2 + 10)
            .text(d => d[1].total.toFixed(2));

        let infoSvg = d3.select(".achievement_info_svg");
        infoSize = {
            width: 600,
            height: 400
        }
        const info_g = infoSvg.append("g")
            .datum(this.companyData)
    }
}