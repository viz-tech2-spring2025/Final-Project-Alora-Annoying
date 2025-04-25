import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const circleRadius = 10;
const circleMargin = 4;
const circlesPerColumn = 3;
const labelToCircleGap = 150;

// Global dot position mapping for transition
window.viz2CirclesMap = new Map();

const compColorMap = {
  "Behaviour": "#58CDFF",
  "Demographic": "#F4C735",
  "Physiological": "#EE84CB"
};

// Get Dots Positions
window.getViz2CirclePositions = function() {
  return Array.from(window.viz2CirclesMap.values());
};

d3.csv("./public/dataset.csv").then(rawData => {
  console.log("Viz2 数据已加载");
  
  // Filter data including valid CompMech values (remove NA)
  const filtered = rawData.filter(d => ["Behaviour", "Demographic", "Physiological"].includes(d.CompMech));
  
  // Create a map to deal with repeated values (otherwise data may not be precise)
  const speciesMap = new Map();
  
  // Record CompMech and Type for each SpeciesBinomial
  filtered.forEach(d => {
    const key = d.SpeciesBinomial;
    
    if (!speciesMap.has(key)) {
      speciesMap.set(key, {
        binomial: key,
        comp: d.CompMech,
        type: d.Type,
        color: compColorMap[d.CompMech] || "#CCCCCC"
      });
    }
  });
  
  // Group by Type and CompMech
  const typeCompGroups = d3.groups(
    Array.from(speciesMap.values()),
    d => d.type,
    d => d.comp
  );

  // Layout data for each valid dot
  const layoutData = [];
  typeCompGroups.forEach(([type, compArr]) => {
    let circleIndex = 0;
    compArr.forEach(([comp, entries]) => {
      entries.forEach((entry) => {
        const col = Math.floor(circleIndex / circlesPerColumn);
        const row = circleIndex % circlesPerColumn;
        layoutData.push({
          type,
          comp,
          binomial: entry.binomial,
          x: col,
          y: row,
          color: entry.color
        });
        circleIndex++;
      });
    });
  });


  const types = Array.from(new Set(layoutData.map(d => d.type)));

  // SVG setup
  const width = 1200;
  const height = types.length * (circlesPerColumn * (circleRadius * 2 + circleMargin) + 40);

  // SVG creation
  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "viz2-svg"); // 添加类以便于选择

  // Creating vertical scales for positioning types
  const typeScale = d3.scaleBand()
    .domain(types)
    .range([0, height])
    .padding(0.2);

  // Type label (EWE classification)
  svg.selectAll(".type-label")
    .data(types)
    .enter()
    .append("text")
    .attr("class", "type-label")
    .attr("x", 20)
    .attr("y", d => typeScale(d) + 10)
    .text(d => d)
    .attr("fill", "white")
    .style("font-size", "16px")
    .style("opacity", 0)
    .attr("alignment-baseline", "hanging");
    
  // Create circles with data attributes for marking during transitions
  svg.selectAll(".circle")
    .data(layoutData)
    .enter()
    .append("circle")
    .attr("class", "circle")
    .attr("data-binomial", d => d.binomial)
    .attr("data-comp", d => d.comp)
    .attr("cx", d => labelToCircleGap + d.x * (circleRadius * 2 + circleMargin))
    .attr("cy", d => typeScale(d.type) + d.y * (circleRadius * 2 + circleMargin))
    .attr("r", circleRadius)
    .attr("fill", d => d.color)
    .style("fill-opacity", 1)
    .style("opacity", 0)
    .style("stroke", "none")
    .style("stroke-width", 0.5)
    .style("pointer-events", "all")
    .each(function(d) {

      const cx = labelToCircleGap + d.x * (circleRadius * 2 + circleMargin);
      const cy = typeScale(d.type) + d.y * (circleRadius * 2 + circleMargin);
      
      // Storing circle information in a global map
      window.viz2CirclesMap.set(d.binomial, {
        element: this,
        binomial: d.binomial,
        comp: d.comp,
        x: cx,
        y: cy,
        color: d.color
      });
    });
  
  const globalTooltip = d3.select("body").select(".global-tooltip");
  
  // If the global tooltip does not yet exist, create it
  if (globalTooltip.empty()) {
    d3.select("body")
      .append("div")
      .attr("class", "global-tooltip")
      .style("position", "absolute")
      .style("padding", "6px 10px")
      .style("background", "rgba(0, 0, 0, 0.7)")
      .style("color", "white")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("font-size", "12px")
      .style("display", "none")
      .style("z-index", 10000);
  }
  
  // White strokes for hovering tooltip
  svg.selectAll(".circle")
    .on("mouseover", function(event, d) {
      const tooltip = d3.select("body").select(".global-tooltip");
      tooltip.style("display", "block")
        .text(d.binomial);
      
      d3.select(this)
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 2)
        .attr("stroke-opacity", 1);
    })
    .on("mousemove", function(event, d) {
      const tooltip = d3.select("body").select(".global-tooltip");
      tooltip.style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 20) + "px");
    })
    .on("mouseout", function() {
      const tooltip = d3.select("body").select(".global-tooltip");
      tooltip.style("display", "none");
      
      d3.select(this)
        .attr("stroke", "none")
        .attr("stroke-width", 0)
        .attr("stroke-opacity", 0);
    });
});