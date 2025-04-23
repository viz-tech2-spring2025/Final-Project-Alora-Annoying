// Modified version of viz.js with improved hover effects
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }
  
  function describeArc(x, y, radius, startAngle, endAngle) {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const arcSweep = endAngle - startAngle <= 180 ? "0" : "1";
  
    return [
      "M", start.x, start.y,
      "A", radius, radius, 0, arcSweep, 1, end.x, end.y
    ].join(" ");
  }
  
  // Global map to track circles for transition
  window.viz1CirclesMap = new Map();
  
  // Create a global tooltip that will be used by both visualizations
  const globalTooltip = d3.select("body")
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
    .style("z-index", 10000); // Ensure tooltip is on top
  
  d3.csv("./public/dataset.csv").then(data => {
      console.log("Viz1 data loaded");
      const groupsData = d3.group(data, d => d.SpeciesGrouped);
      
      const compColorMap = {
        "Behaviour": "#58CDFF",
        "Demographic": "#F4C735",
        "Physiological": "#EE84CB"
      };
  
      const groupPositionMap = {
          "Birds": { x: 945, y: 495 },
          "Plantae": { x: 230, y: 665 },
          "Mammalia": { x: 645, y: 370 },
          "Arthropoda": { x: 330, y: 300 },
          "Angiospermae": { x: 530, y: 670 },
          "Amphibia": { x: 545, y: 460 },
          "Algae & Cyanobacteria": { x: 340, y: 790 },
          "Reptilia": { x: 800, y: 760 },
          "arthropoda": { x: 600, y: 190 },
          "Gymnospermae": { x: 135, y: 500 },
          "Mollusca": { x: 610, y: 230 },
          "Worm": { x: 760, y: 230 },
          "Fish": { x: 747, y: 690 },
      };
    
      const svg = d3.select("#viz")
        .append("svg")
        .attr("width", 1200)
        .attr("height", window.innerHeight)
        .attr("class", "viz1-svg"); // Add class for easier selection
    
      // SpeciesBinomial circles R
      const desiredLeafR = 10;  
  
      // Pack Layout for every SpeciesGrouped 
      groupsData.forEach((records, groupName) => {
        console.log(`Processing species group: ${groupName} with ${records.length} records`);
        
        const childrenData = records.map(d => ({
          name: d.SpeciesBinomial,
          value: 100,
          comp: d.CompMech
        }));
    
        const rootData = { children: childrenData };
    
        const root = d3.hierarchy(rootData)
          .sum(d => d.value);
    
        const packLayout = d3.pack()
          .padding(2)
          .size([400, 400]);
    
        packLayout(root);
    
        const leaves = root.leaves();
        if (leaves.length === 0) return;
    
        const computedLeafR = leaves[0].r;
        const scaleRatio = desiredLeafR / computedLeafR;
    
        root.each(node => {
          node.x *= scaleRatio;
          node.y *= scaleRatio;
          node.r *= scaleRatio;
        });
    
        // Use the position from the position map, or fallback to default
        const position = groupPositionMap[groupName] || { x: 600, y: 400 };
        const translateX = position.x - root.x;
        const translateY = position.y - root.y;
  
        // Create a <g> container for the group
        const groupG = svg.append("g")
          .attr("transform", `translate(${translateX}, ${translateY})`)
          .attr("class", "species-group")
          .attr("data-group-name", groupName);
    
        // Draw the group boundary circle
        groupG.append("circle")
          .attr("cx", root.x)
          .attr("cy", root.y)
          .attr("r", root.r)
          .attr("fill", "white")
          .attr("fill-opacity", 0.05)
          .attr("stroke", "#aaa")
          .attr("stroke-opacity", 0.3)
          .attr("class", "group-circle")
          .style("pointer-events", "none"); // 确保大圆不会捕获鼠标事件
        
        // 先绘制所有的小圆
        // Draw each species circle
        leaves.forEach(leaf => {
          // Get color based on CompMech
          const comp = leaf.data.comp;
          const fillColor = compColorMap[comp] || "#3D413F";
          
          // Create circle with additional data attributes for transition
          const circle = groupG.append("circle")
            .attr("cx", leaf.x)
            .attr("cy", leaf.y)
            .attr("r", desiredLeafR)
            .attr("fill", fillColor)
            .attr("class", "species-circle")
            .attr("data-binomial", leaf.data.name)
            .attr("data-comp", comp)
            .attr("fill-opacity", 1)
            .attr("stroke", "#fff")
            .attr("stroke-opacity", 0.3)
            .attr("stroke-width", 0.3) // 确保默认有一个基础描边宽度
            .style("pointer-events", "all") // 确保鼠标事件能够被捕获
            .on("mouseover", function(event) {
              event.stopPropagation(); // 阻止事件冒泡
              // 显示工具提示
              globalTooltip.style("display", "block")
                .text(leaf.data.name);
              
              // 更改描边为白色（原代码为黄色，改为白色）
              d3.select(this)
                .attr("stroke", "#ffffff")
                .attr("stroke-width", 2)
                .attr("stroke-opacity", 1); // 确保描边完全不透明
            })
            .on("mousemove", function(event) {
              event.stopPropagation(); // 阻止事件冒泡
              globalTooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
            })
            .on("mouseout", function(event) {
              event.stopPropagation(); // 阻止事件冒泡
              globalTooltip.style("display", "none");
              d3.select(this)
                .attr("stroke", "#fff")
                .attr("stroke-width", 0.3)
                .attr("stroke-opacity", 0.3); // 恢复低透明度
            });
          
          // Store colored circles in global map for transition
          if (comp && compColorMap[comp]) {
            // Get absolute position by applying the group transform
            const absX = leaf.x + translateX;
            const absY = leaf.y + translateY;
            
            // Store in the global map with species binomial as key
            window.viz1CirclesMap.set(leaf.data.name, {
              element: circle.node(),
              binomial: leaf.data.name,
              comp: comp,
              x: absX,
              y: absY,
              color: fillColor
            });
          }
        });
        
        // 之后再绘制文本元素
        // Create the arc path for the group label
        const pathId = `arc-${groupName.replace(/\s+/g, '-')}`;
        const arcRadius = root.r + 10;
        const arcPathD = describeArc(root.x, root.y, arcRadius, 20, -135);
  
        groupG.append("path")
          .attr("id", pathId)
          .attr("d", arcPathD)
          .attr("fill", "none")
          .attr("class", "group-label-path")
          .style("pointer-events", "none"); // 确保路径不会捕获鼠标事件
  
        // Add the group label text along the arc path
        const fontSize = groupName === "Algae & Cyanobacteria" ? "9px" : "16px";
  
        groupG.append("text")
          .append("textPath")
          .attr("href", `#${pathId}`)
          .attr("startOffset", "50%")
          .style("text-anchor", "middle")
          .style("fill", "white")
          .style("font-size", fontSize)
          .text(groupName)
          .attr("class", "group-label-text")
          .style("pointer-events", "none"); // 确保文本不会捕获鼠标事件
      });
      
      // Log the number of circles mapped for transition
      console.log(`Viz1 created with ${window.viz1CirclesMap.size} circles mapped for transition`);
  });