// chart.js - 改进后的版本，改进悬停效果并处理重复的 SpeciesBinomial
console.log("chart.js 正在加载...");

// 使用最新的 D3.js 版本
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const circleRadius = 10;
const circleMargin = 4;
const circlesPerColumn = 3;
const labelToCircleGap = 150;

// 用于过渡的全局圆点位置映射
window.viz2CirclesMap = new Map();

// 物种机制对应的颜色映射
const compColorMap = {
  "Behaviour": "#58CDFF",
  "Demographic": "#F4C735",
  "Physiological": "#EE84CB"
};

// 获取 viz2 圆点位置的函数
window.getViz2CirclePositions = function() {
  return Array.from(window.viz2CirclesMap.values());
};

d3.csv("./public/dataset.csv").then(rawData => {
  console.log("Viz2 数据已加载");
  
  // 过滤出我们需要的 CompMech 类型数据
  const filtered = rawData.filter(d => ["Behaviour", "Demographic", "Physiological"].includes(d.CompMech));
  
  // 创建一个 Map 来处理重复的 SpeciesBinomial
  const speciesMap = new Map();
  
  // 对每个 SpeciesBinomial 记录其 CompMech 和 Type
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
  
  // 按 Type 和 CompMech 分组，但确保每个 SpeciesBinomial 只出现一次
  const typeCompGroups = d3.groups(
    Array.from(speciesMap.values()),
    d => d.type,
    d => d.comp
  );

  // 创建带有每个圆点位置的布局数据
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

  // 记录出现的物种，用于调试
  console.log(`处理后共有 ${layoutData.length} 个唯一物种`);

  // 获取所有唯一类型用于垂直间距
  const types = Array.from(new Set(layoutData.map(d => d.type)));

  // 设置 SVG 尺寸
  const width = 1200;
  const height = types.length * (circlesPerColumn * (circleRadius * 2 + circleMargin) + 40);

  // 创建 SVG 容器
  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "viz2-svg"); // 添加类以便于选择

  // 创建垂直尺度用于定位类型
  const typeScale = d3.scaleBand()
    .domain(types)
    .range([0, height])
    .padding(0.2);

  // 类型标签（天气类型分类）
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
    .style("opacity", 0) // 开始时隐藏，用于过渡
    .attr("alignment-baseline", "hanging");
    
  // 创建带有数据属性的圆，用于过渡期间标识
  svg.selectAll(".circle")
    .data(layoutData)
    .enter()
    .append("circle")
    .attr("class", "circle")
    .attr("data-binomial", d => d.binomial) // 添加用于匹配的数据属性
    .attr("data-comp", d => d.comp) // 添加组件机制
    .attr("cx", d => labelToCircleGap + d.x * (circleRadius * 2 + circleMargin))
    .attr("cy", d => typeScale(d.type) + d.y * (circleRadius * 2 + circleMargin))
    .attr("r", circleRadius)
    .attr("fill", d => d.color)
    .style("fill-opacity", 1) // 填充颜色完全不透明
    .style("opacity", 0) // 开始时透明度为 0（不可见）
    .style("stroke", "none") // 初始无描边
    .style("stroke-width", 0.5) // 设置初始描边宽度
    .style("pointer-events", "all") // 确保鼠标事件能够被捕获
    .each(function(d) {
      // 在全局映射中存储位置信息，用于过渡
      const cx = labelToCircleGap + d.x * (circleRadius * 2 + circleMargin);
      const cy = typeScale(d.type) + d.y * (circleRadius * 2 + circleMargin);
      
      // 将圆信息存储在全局映射中
      window.viz2CirclesMap.set(d.binomial, {
        element: this,
        binomial: d.binomial,
        comp: d.comp,
        x: cx,
        y: cy,
        color: d.color
      });
    });
  
  // 为 viz2 圆使用全局工具提示
  const globalTooltip = d3.select("body").select(".global-tooltip");
  
  // 如果全局工具提示尚不存在，则创建它
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
  
  // 为 viz2 圆添加工具提示行为 - 修改为白色描边
  svg.selectAll(".circle")
    .on("mouseover", function(event, d) {
      const tooltip = d3.select("body").select(".global-tooltip");
      tooltip.style("display", "block")
        .text(d.binomial);
      
      // 修改：将描边颜色从黄色改为白色，确保描边清晰可见
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
      
      // 移除描边或恢复默认描边
      d3.select(this)
        .attr("stroke", "none")
        .attr("stroke-width", 0)
        .attr("stroke-opacity", 0);
    });
    
  // 记录映射用于过渡的圆点数量
  console.log(`Viz2 创建完成，为过渡映射了 ${window.viz2CirclesMap.size} 个圆点`);
});