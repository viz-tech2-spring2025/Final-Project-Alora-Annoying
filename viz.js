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


d3.csv("./public/dataset.csv").then(data => {

    const groupsData = d3.group(data, d => d.SpeciesGrouped);
    
    const compColorMap = {
      "Behaviour": "#64F7FF",
      "Demographic": "#E3F639",
      "Physiological": "#EE5EBE"
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
      .attr("height", window.innerHeight);
  
    // Temporary position for better sight: right half of screen
    const offsetX = window.innerWidth * 0.6;
    let currentOffsetY = 30;  // top padding by default
    const verticalMargin = 10;
  
    // SpeciesBinomial circles R
    const desiredLeafR = 10;  


    const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("padding", "6px 10px")
    .style("background", "rgba(0, 0, 0, 0.7)")
    .style("color", "white")
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("font-size", "12px")
    .style("display", "none");

  
    // Pack Layout for every SpeciesGrouped 
    groupsData.forEach((records, groupName) => {
        console.log("groupName:", groupName);
      
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
  
      // 此时，root.r 是包围所有小圆的“大圆”的半径
      // 将 pack 布局结果平移，使得大圆中心位于 (offsetX, currentOffsetY + root.r)
      const position = groupPositionMap[groupName] || { x: offsetX, y: currentOffsetY + root.r };
      const translateX = position.x - root.x;
      const translateY = position.y - root.y;

  
      // 为当前组创建一个 <g> 容器，便于整体平移
      const groupG = svg.append("g")
        .attr("transform", `translate(${translateX}, ${translateY})`);
  
      // Big Circles Drawing
      groupG.append("circle")
        .attr("cx", root.x)
        .attr("cy", root.y)
        .attr("r", root.r)
        .attr("fill", "white")
        .attr("fill-opacity", 0.1)
        .attr("stroke", "#aaa")
        .attr("stroke-opacity", 0.3);
  
      
      // unique ID
      const arcId = `arc-${groupName.replace(/\s+/g, "-")}`;
      
      leaves.forEach(leaf => {
        // get color based on CompMech
        const comp = leaf.data.comp;
        const fillColor = compColorMap[comp] || "#90908E";
        
      groupG.append("circle")
        .attr("cx", leaf.x)
        .attr("cy", leaf.y)
        .attr("r", desiredLeafR)
        .attr("fill", fillColor)
        .attr("class", "circle")
        .attr("fill-opacity",  1)
        .attr("stroke", "#fff")
        .attr("stroke-opacity", 0.3)
        .on("mouseover", function () {
          tooltip.style("display", "block")
            .text(leaf.data.name);
        })
        .on("mousemove", function (event) {
          tooltip.style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function () {
          tooltip.style("display", "none");
        });

      });

      const pathId = `arc-${groupName.replace(/\s+/g, '-')}`;

      // 使用手动 describeArc 生成路径，角度单位是度
      const arcRadius = root.r + 10;
      const arcPathD = describeArc(root.x, root.y, arcRadius, 20, -135);

      groupG.append("path")
        .attr("id", pathId)
        .attr("d", arcPathD)
        .attr("fill", "none");

      const fontSize = groupName === "Algae & Cyanobacteria" ? "9px" : "16px";

      groupG.append("text")
        .append("textPath")
        .attr("href", `#${pathId}`)
        .attr("startOffset", "50%")
        .style("text-anchor", "middle")
        .style("fill", "white")
        .style("font-size", fontSize)
        .text(groupName)
        ;
    });
  });
  