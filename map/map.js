/** Class representing the map view. */
class MapVis {
    /**
     * Creates a Map Visuzation
     * @param globalApplicationState The shared global application state (has the data and the line chart instance in it)
     */
  
    constructor(globalApplicationState) {
        const mapData = globalApplicationState

        let json = topojson.feature(mapData, mapData.objects.countries);

        // Set up the map projection
        const projection = d3.geoWinkel3()
        .scale(150) // This set the size of the map
        .translate([200, 300]); // This moves the map to the center of the SVG

        let svg = d3.select(".world_map");
        let path = d3.geoPath().projection(projection);

        svg.selectAll("path").data(json.features)
            .join("path")
            .attr("d", (path))
            .attr("fill", "#F9F7F0")
    }
    
  }
  