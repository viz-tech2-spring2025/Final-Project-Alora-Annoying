// bar-chart.js
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const circleRadius = 10;
const circleMargin = 4;
const circlesPerColumn = 3; // You can change this to set how many rows vertically
const compColorMap = {
  Behaviour: "#64F7FF",
  Demographic: "#E3F639",
  Physiological: "#EE5EBE"
};

d3.csv("./public/dataset.csv").then(rawData => {
  // Filter data
  const filtered = rawData.filter(d => ["Behaviour", "Demographic", "Physiological"].includes(d.CompMech));

  // Deduplicate SpeciesBinomial within each Type
  const uniqueMap = new Map();
  filtered.forEach(d => {
    const key = d.Type + "|" + d.SpeciesBinomial;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, d);
    }
  });
  const uniqueData = Array.from(uniqueMap.values());

  // Group by Type, then by CompMech
  const grouped = d3.group(uniqueData, d => d.Type);

  // Prepare layout data
  const layoutData = [];
  grouped.forEach((items, type) => {
    const compGroup = d3.group(items, d => d.CompMech);
    compGroup.forEach((entries, comp) => {
      entries.forEach((entry, i) => {
        const col = Math.floor(i / circlesPerColumn);
        const row = i % circlesPerColumn;
        layoutData.push({
          type,
          comp,
          x: col,
          y: row,
          color: compColorMap[comp]
        });
      });
    });
  });

  const types = Array.from(new Set(layoutData.map(d => d.type)));

  // SVG size
  const width = 1000;
  const height = types.length * (circlesPerColumn * (circleRadius * 2 + circleMargin) + 40);

  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const typeScale = d3.scaleBand()
    .domain(types)
    .range([0, height])
    .padding(0.2);

  // Draw labels
  svg.selectAll(".type-label")
    .data(types)
    .enter()
    .append("text")
    .attr("class", "type-label")
    .attr("x", 20)
    .attr("y", d => typeScale(d) + 20)
    .text(d => d)
    .attr("fill", "white")
    .style("font-size", "16px")
    .attr("alignment-baseline", "hanging");

  // Draw circles
  svg.selectAll(".dot")
    .data(layoutData)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", d => 120 + d.x * (circleRadius * 2 + circleMargin))
    .attr("cy", d => typeScale(d.type) + d.y * (circleRadius * 2 + circleMargin))
    .attr("r", circleRadius)
    .attr("fill", d => d.color);
});
