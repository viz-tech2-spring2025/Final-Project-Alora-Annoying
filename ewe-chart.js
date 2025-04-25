// ewe-chart.js
// This script creates a visualization of EWE studies from 2001-2017 using circles to represent each study

document.addEventListener('DOMContentLoaded', function() {
    // Set the dimensions for the chart
    const width = 1000;
    const height = 500;
    const circleRadius = 10; // 20px diameter means 10px radius
    
    // Create the SVG container
    const svg = d3.select("#ewe-chart")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    
    // Create a gradient definition
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "circleGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");
    
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#77B3F3");
    
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#99A0FF");
    
    // Load and process the CSV data
    d3.csv("public/Dataset-filtered-studies.csv").then(function(data) {
      // Filter out duplicate titles and count by year
      const uniqueTitles = {};
      data.forEach(d => {
        if (d.Title && d.Year) {
          uniqueTitles[d.Title] = +d.Year;
        }
      });
      
      // Count occurrences by year
      const yearCounts = {};
      Object.values(uniqueTitles).forEach(year => {
        if (year >= 2001 && year <= 2017) {
          yearCounts[year] = (yearCounts[year] || 0) + 1;
        }
      });
      
      // Create dataset with years from 2001 to 2017
      const yearData = [];
      for (let year = 2001; year <= 2017; year++) {
        yearData.push({
          year: year,
          count: yearCounts[year] || 0
        });
      }
      
      // Calculate x positions for each year column
      const xScale = d3.scaleBand()
        .domain(yearData.map(d => d.year))
        .range([50, width - 50])
        .padding(0.3);
      
      // Create a tooltip div
      const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "rgba(0, 0, 0, 0.8)")
        .style("color", "white")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("font-size", "14px")
        .style("z-index", "100");
        
      // Create a group for each year
      const yearGroups = svg.selectAll(".year-group")
        .data(yearData)
        .enter()
        .append("g")
        .attr("class", "year-group")
        .attr("transform", d => `translate(${xScale(d.year)}, 0)`);
      
      // Add the year labels at the bottom with more spacing from the circles
      yearGroups.append("text")
        .attr("y", height - 20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("fill", "white")
        .text(d => d.year);
      
      // Add circles for each count in each year
      yearGroups.each(function(d) {
        const group = d3.select(this);
        
        // Calculate the bottom position for the stack of circles
        // Added more spacing above the year labels
        const bottomY = height - 70;
        
        // Create a hover area for the entire stack
        if (d.count > 0) {
          // Calculate the height of the entire stack plus extra padding for better hover detection
          const stackHeight = d.count * (circleRadius * 2 + 2);
          
          // Create a hover area for the entire column (made wider and taller for easier interaction)
          group.append("rect")
            .attr("x", -circleRadius * 3) // Wider detection area
            .attr("y", bottomY - stackHeight - 20) // Higher detection area
            .attr("width", circleRadius * 6) // Much wider for better hover detection
            .attr("height", stackHeight + 40) // Taller for better detection
            .style("fill", "transparent")
            .style("pointer-events", "all") // Ensure this receives all pointer events
            .on("mouseenter", function(event) { // Use mouseenter instead of mouseover
              tooltip.transition()
                .duration(100) // Faster appearance
                .style("opacity", 0.9);
              tooltip.html(`${d.year}: ${d.count} studies`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
            })
            .on("mousemove", function(event) { // Add mousemove handler to update position
              tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseleave", function() { // Use mouseleave instead of mouseout
              tooltip.transition()
                .duration(300)
                .style("opacity", 0);
            });
        }
        
        // Create circles for each count
        for (let i = 0; i < d.count; i++) {
          group.append("circle")
            .attr("cx", 0)
            .attr("cy", bottomY - (i * (circleRadius * 2 + 2)))
            .attr("r", circleRadius)
            .style("fill", "url(#circleGradient)")
            .style("opacity", 0.9);
        }
      });
    }).catch(function(error) {
      console.log("Error loading or processing data:", error);
    });
  });