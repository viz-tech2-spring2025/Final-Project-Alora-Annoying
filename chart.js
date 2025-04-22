// chart.js
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const circleRadius = 10;
const circleMargin = 4;
const circlesPerColumn = 3;
const labelToCircleGap = 150;

const compColorMap = {
  Behaviour: "#64F7FF",
  Demographic: "#E3F639",
  Physiological: "#EE5EBE"
};

// 😀
// window.finalPositions = {};

d3.csv("./public/dataset.csv").then(rawData => {
  const filtered = rawData.filter(d => ["Behaviour", "Demographic", "Physiological"].includes(d.CompMech));
  const typeCompGroups = d3.groups(filtered, d => d.Type, d => d.CompMech);

  const layoutData = [];
  typeCompGroups.forEach(([type, compArr]) => {
    let circleIndex = 0;
    compArr.forEach(([comp, entries]) => {
      entries.forEach((entry, i) => {
        const col = Math.floor(circleIndex / circlesPerColumn);
        const row = circleIndex % circlesPerColumn;
        layoutData.push({
          type,
          comp,
          binomial: entry.SpeciesBinomial,
          x: col,
          y: row,
          color: compColorMap[comp]
        });
        circleIndex++;
      });
    });
  });

  const types = Array.from(new Set(layoutData.map(d => d.type)));

  const width = 1200;
  const height = types.length * (circlesPerColumn * (circleRadius * 2 + circleMargin) + 40);

  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const typeScale = d3.scaleBand()
    .domain(types)
    .range([0, height])
    .padding(0.2);

  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("padding", "6px 10px")
    .style("background", "rgba(0,0,0,0.7)")
    .style("color", "white")
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("font-size", "14px")
    .style("visibility", "hidden");

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
    .attr("alignment-baseline", "hanging");

  svg.selectAll(".circle")
    .data(layoutData)
    .enter()
    .append("circle")
    .attr("class", "circle")
    .attr("cx", d => labelToCircleGap + d.x * (circleRadius * 2 + circleMargin))
    // .attr("cx", d => {
    //   const x = labelToCircleGap + d.x * (circleRadius * 2 + circleMargin);
    //   const y = typeScale(d.type) + d.y * (circleRadius * 2 + circleMargin);
    //   window.finalPositions[d.binomial] = { x, y };
    //   return x;
    // })😀
    .attr("cy", d => typeScale(d.type) + d.y * (circleRadius * 2 + circleMargin))
    .attr("r", circleRadius)
    .attr("fill", d => d.color)
    .style("fill-opacity", 1)
    .style("stroke", "none")
    .style("stroke-width", 0.5)
    .on("mouseover", function (event, d) {
      tooltip.style("visibility", "visible")
              .text(d.binomial);
      d3.select(this).attr("stroke", "yellow").attr("stroke-width", 2);
    })
    .on("mousemove", function (event) {
      tooltip.style("top", (event.pageY - 10) + "px")
              .style("left", (event.pageX + 10) + "px");
    })
    .on("mouseout", function () {
      tooltip.style("visibility", "hidden");
      d3.select(this).attr("stroke", "white").attr("stroke-width", 0.5);
    });  

});
