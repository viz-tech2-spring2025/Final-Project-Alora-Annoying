// species-images.js - Creates visualization with images in species groups
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

// Global map to track group circles for transition
window.viz0GroupsMap = new Map();

d3.csv("./public/dataset.csv").then(data => {
  console.log("Species images visualization loaded");
  const groupsData = d3.group(data, d => d.SpeciesGrouped);
  
  // Same position map as in viz.js
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

  // Create SVG container with exact same dimensions as viz.js
  const svg = d3.select("#species-images")
    .append("svg")
    .attr("width", 1200)
    .attr("height", window.innerHeight)
    .attr("class", "viz0-svg");

  // Process each species group
  groupsData.forEach((records, groupName) => {
    console.log(`Processing species group for images: ${groupName}`);
    
    // SpeciesBinomial circles radius - same as in viz.js
    const desiredLeafR = 10;
    
    // Create identical childrenData to viz.js
    const childrenData = records.map(d => ({
      name: d.SpeciesBinomial,
      value: 100,
      comp: d.CompMech
    }));
    
    const rootData = { children: childrenData };
    
    const root = d3.hierarchy(rootData)
      .sum(d => d.value);
    
    // CRITICAL: Use the same pack layout settings as viz.js
    const packLayout = d3.pack()
      .padding(2)
      .size([400, 400]);
    
    packLayout(root);
    
    // Calculate scale ratio exactly like viz.js
    const leaves = root.leaves();
    if (leaves.length === 0) return;
    
    const computedLeafR = leaves[0].r;
    const scaleRatio = desiredLeafR / computedLeafR;
    
    // Apply same scaling as viz.js to ensure identical dimensions
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
      .attr("class", "species-group-image")
      .attr("data-group-name", groupName);
      
    // Create a defs section for the clipPath
    const defs = groupG.append("defs");
    
    // Create a unique ID for the clip path
    const clipId = `clip-${groupName.replace(/\s+|&/g, '-').toLowerCase()}`;
    
    // Add the clipPath with exact same dimensions as in viz.js
    defs.append("clipPath")
      .attr("id", clipId)
      .append("circle")
      .attr("cx", root.x)
      .attr("cy", root.y)
      .attr("r", root.r);
    
    // Draw the group boundary circle with same styles as viz.js
    const groupCircle = groupG.append("circle")
      .attr("cx", root.x)
      .attr("cy", root.y)
      .attr("r", root.r)
      .attr("fill", "white")
      .attr("fill-opacity", 0.05)
      .attr("stroke", "#aaa")
      .attr("stroke-opacity", 0.3)
      .attr("class", "group-circle-image");
    
    // Store group circle in global map for transition with exact coordinates
    window.viz0GroupsMap.set(groupName, {
      element: groupCircle.node(),
      x: root.x + translateX,
      y: root.y + translateY,
      r: root.r,
      name: groupName
    });
    
    // Add the image with clip path, sized to exactly match the group circle
    const imageName = groupName.toLowerCase().replace(/\s+|&/g, '-');
    groupG.append("image")
      .attr("x", root.x - root.r)
      .attr("y", root.y - root.r)
      .attr("width", root.r * 2)
      .attr("height", root.r * 2)
      .attr("clip-path", `url(#${clipId})`)
      .attr("xlink:href", `./pic/species-images/${imageName}.png`)
      .attr("preserveAspectRatio", "xMidYMid slice")
      .attr("class", "species-group-image");
    
    // Add centered text
    groupG.append("text")
      .attr("x", root.x)
      .attr("y", root.y)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "white")
      .attr("font-size", "16px")
      .attr("class", "group-label-text-centered")
      .style("pointer-events", "none")
      .text(groupName);
  });
  
  console.log(`Species images visualization created with ${window.viz0GroupsMap.size} groups`);
});

// Function to handle the transition from section7 to section8
window.initializeSection7Transition = function() {
  console.log("Initializing section7 to section8 transition");
  
  // Make sure both visualizations are loaded
  const checkVisualizations = setInterval(() => {
    if (window.viz0GroupsMap && window.viz0GroupsMap.size > 0 &&
        document.querySelector(".viz1-svg")) {
      clearInterval(checkVisualizations);
      console.log("Both section7 and section8 visualizations are loaded");
    }
  }, 100);
};

// Function to animate the transition from section7 to section8
window.animateSection7To8Transition = function(callback) {
  console.log("Starting transition from section7 to section8");
  
  // Get the section elements
  const section7 = document.getElementById('section7');
  const section8 = document.getElementById('section8');
  
  // Make sure both sections are visible during transition
  section7.style.visibility = 'visible';
  section8.style.visibility = 'visible';
  
  // Fade out section7 elements except for group circles
  const svg7 = d3.select(".viz0-svg");
  
  // Fade out images
  svg7.selectAll(".species-group-image")
    .transition()
    .duration(800)
    .style("opacity", 0);
  
  // Fade out centered text labels
  svg7.selectAll(".group-label-text-centered")
    .transition()
    .duration(800)
    .style("opacity", 0);
  
  // Transition to match the viz.js circle styles
  svg7.selectAll(".group-circle-image")
    .transition()
    .duration(1200)
    .style("fill", "white")
    .style("fill-opacity", 0.05)
    .style("stroke", "#aaa")
    .style("stroke-opacity", 0.3);
  
  // Start fading in section8 elements
  setTimeout(() => {
    // Fade in the eighth section
    section8.style.opacity = 1;
    
    // Make viz1 groups visible
    d3.select(".viz1-svg").selectAll(".group-circle")
      .style("opacity", 0.4)
      .style("visibility", "visible");
    
    // Fade in the viz1 arc labels
    d3.select(".viz1-svg").selectAll(".group-label-path, .group-label-text")
      .transition()
      .duration(800)
      .style("opacity", 1);
    
    // Fade in the species circles
    d3.select(".viz1-svg").selectAll(".species-circle")
      .transition()
      .duration(1200)
      .style("opacity", 1);
    
    // Fade out section7 as section8 fades in
    section7.style.opacity = 0;
    
  }, 600);
  
  // Complete the transition
  setTimeout(() => {
    if (callback) callback();
  }, 1500);
};

// Function to animate the transition from section8 to section7
window.animateSection8To7Transition = function(callback) {
  console.log("Starting transition from section8 to section7");
  
  // Get the section elements
  const section7 = document.getElementById('section7');
  const section8 = document.getElementById('section8');
  
  // Make sure both sections are visible during transition
  section7.style.visibility = 'visible';
  section8.style.visibility = 'visible';
  
  // Fade out section8 elements
  // Fade out species circles first
  d3.select(".viz1-svg").selectAll(".species-circle")
    .transition()
    .duration(800)
    .style("opacity", 0);
  
  // Fade out viz1 arc labels
  d3.select(".viz1-svg").selectAll(".group-label-path, .group-label-text")
    .transition()
    .duration(800)
    .style("opacity", 0);
  
  // Start fading in section7 elements
  setTimeout(() => {
    // Fade in the seventh section
    section7.style.opacity = 1;
    
    // Make viz0 groups visible
    d3.select(".viz0-svg").selectAll(".group-circle-image")
      .style("visibility", "visible");
    
    // Fade in the images
    d3.select(".viz0-svg").selectAll(".species-group-image")
      .transition()
      .duration(1000)
      .style("opacity", 1);
    
    // Fade in the centered text labels
    d3.select(".viz0-svg").selectAll(".group-label-text-centered")
      .transition()
      .duration(1000)
      .style("opacity", 1);
    
    // Fade out section8 as section7 fades in
    section8.style.opacity = 0;
    
  }, 600);
  
  // Complete the transition
  setTimeout(() => {
    if (callback) callback();
  }, 1500);
};