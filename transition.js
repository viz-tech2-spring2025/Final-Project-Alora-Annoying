// transition.js - realize smooth transition between viz.js & chart.js

let transitionInitialized = false;
let transitionInProgress = false;
let transitionTimeout = null;
window.originalViz1State = null;

// Adjustable Offsets
const POSITION_ADJUSTMENTS = {
  forward: {
    viz1: {
      x: 0,
      y: 0 
    },
    viz2: {
      x: 0,
      y: -960
    }
  },
  reverse: {
    viz1: {
      x: 0,
      y: 945
    },
    viz2: {
      x: 0,
      y: 0
    }
  }
};

// Initialize Transition System - called when section8 becomes active
window.initializeTransition = function() {
  console.log("初始化过渡系统");
  if (transitionInitialized) return;
  
  transitionInitialized = true;
  
  // Make sure both vizs are loaded before attempting the transition
  const checkVisualizations = setInterval(() => {
    if (window.viz1CirclesMap && window.viz1CirclesMap.size > 0 && 
        window.viz2CirclesMap && window.viz2CirclesMap.size > 0) {
      clearInterval(checkVisualizations);
      console.log("两个可视化已加载完成，可以进行过渡");
      
      preComputeCircleMatches();
    }
  }, 100);
};

// Pre-calculated matches between 2 vizs' circles
function preComputeCircleMatches() {
  const matchingSpecies = [];
  
  window.viz1CirclesMap.forEach((circle1, binomial) => {
    if (window.viz2CirclesMap.has(binomial)) {
      matchingSpecies.push(binomial);
    }
  });
}

// Transition Animation Function
window.animateCircleTransition = function(reverse = false, callback) {
  if (transitionInProgress) {
    console.log("Transition in Progress");
    return;
  }
  
  transitionInProgress = true;
  
  const section8 = document.getElementById('section8');
  const section9 = document.getElementById('section9');
  
  section8.style.visibility = 'visible';
  section9.style.visibility = 'visible';
  
  const transitionContainer = createTransitionContainer();
  
  if (reverse) {
    // reverse transition (from chart.js to viz.js)
    section8.style.opacity = '0';
    section9.style.opacity = '1';
    
    // restore elements in viz1
    const viz1Svg = d3.select(".viz1-svg");
    
    viz1Svg.selectAll(".group-circle")
      .style("opacity", 0)
      .style("visibility", "visible");
      
    viz1Svg.selectAll(".group-label-path, .group-label-text")
      .style("opacity", 0)
      .style("visibility", "visible");
      
    // avoid delay
    prepareViz1ForReverseTransition(viz1Svg);
    animateMatchingCircles(reverse, transitionContainer);
    
    section8.style.opacity = '1';
    
    // section9 fade away after delay
    setTimeout(() => {
        const viz1Svg = d3.select(".viz1-svg");
        viz1Svg.selectAll(".group-circle")
          .style("opacity", 0.4)
          .style("stroke-opacity", 0.3)
          .style("stroke", "#aaa")
          .style("fill", "white")
          .style("fill-opacity", 0.1)
          .style("visibility", "visible");
          
        viz1Svg.selectAll(".group-label-path")
          .style("opacity", 1)
          .style("fill", "none") 
          .style("visibility", "visible");
          
        viz1Svg.selectAll(".group-label-text")
          .style("opacity", 1)
          .style("fill", "white")
          .style("visibility", "visible");
      }, 1200);
  } else {
    // transition from viz.js to chart.js
    const viz2Svg = d3.select(".viz2-svg");
    prepareViz2ForTransition(viz2Svg);
    hideNonMatchingElements();
    animateMatchingCircles(reverse, transitionContainer);
    setTimeout(() => {
      section8.style.opacity = '0';
    }, 600);
    setTimeout(() => {
      section9.style.opacity = '1';
    }, 1000);
  }
  
  // Set a timeout to ensure that the transition completes even if there are issues
  clearTimeout(transitionTimeout);
  transitionTimeout = setTimeout(() => {
    if (transitionContainer) {
      transitionContainer.remove();
    }
    transitionInProgress = false;
    if (callback) callback();
  }, 1500);
};

// transition contanier
function createTransitionContainer() {
  // Create a new “floating” circle layer for transitions, which avoids the problems associated with SVG structures and allows smooth animation.
  const transitionContainer = d3.select("body")
    .append("div")
    .attr("id", "transition-circles-container")
    .style("position", "fixed")
    .style("top", 0)
    .style("left", 0)
    .style("width", "100%")
    .style("height", "100%")
    .style("pointer-events", "none")
    .style("z-index", 9999);
  
  transitionContainer.append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("class", "transition-svg");
    
  return transitionContainer;
}

function prepareViz2ForTransition(viz2Svg) {
  viz2Svg.selectAll(".type-label")
    .transition()
    .duration(1000)
    .style("opacity", 1);
}

function prepareViz1ForReverseTransition(viz1Svg) {
    viz1Svg.selectAll(".group-circle")
      .style("opacity", 0)
      .style("visibility", "visible")
      .transition()
      .duration(800)
      .style("opacity", 0.1)
      .style("stroke-opacity", 0.3)
      .style("stroke", "#aaa")
      .style("fill-opacity", 0.1)
      .style("fill", "white");
      
    viz1Svg.selectAll(".group-label-path")
      .style("opacity", 0)
      .style("visibility", "visible")
      .style("fill", "none")
      .transition()
      .duration(800)
      .style("opacity", 1);
    
    viz1Svg.selectAll(".group-label-text")
      .style("opacity", 0)
      .style("visibility", "visible")
      .style("fill", "white")
      .transition()
      .duration(800)
      .style("opacity", 1);
      
    viz1Svg.selectAll(".species-circle")
      .filter(function() {
        const binomial = d3.select(this).attr("data-binomial");
        const comp = d3.select(this).attr("data-comp");
        
        return !window.viz2CirclesMap.has(binomial) || 
               !["Behaviour", "Demographic", "Physiological"].includes(comp);
      })
      .style("opacity", 0)
      .style("visibility", "visible")
      .transition()
      .duration(800)
      .style("opacity", 1);
}

// Hide elements need to be hidden
function hideNonMatchingElements() {
  if (!window.originalViz1State) {
    window.originalViz1State = {
      groupCircles: d3.select(".viz1-svg").selectAll(".group-circle").nodes().map(node => ({
        element: node,
        opacity: d3.select(node).style("opacity"),
        strokeOpacity: d3.select(node).style("stroke-opacity"),
        stroke: d3.select(node).style("stroke")
      }))
    };
  }
  
  d3.select(".viz1-svg").selectAll(".group-circle")
    .transition()
    .duration(500)
    .style("opacity", 0);
    
  d3.select(".viz1-svg").selectAll(".group-label-path, .group-label-text")
    .transition()
    .duration(500)
    .style("opacity", 0);
    
  d3.select(".viz1-svg").selectAll(".species-circle")
    .filter(function() {
      const binomial = d3.select(this).attr("data-binomial");
      const comp = d3.select(this).attr("data-comp");
      
      return !window.viz2CirclesMap.has(binomial) || 
             !["Behaviour", "Demographic", "Physiological"].includes(comp);
    })
    .transition()
    .duration(500)
    .style("opacity", 0);
}

// Calculation of the adjusted position - with configurable forward and reverse offsets
function calculateAdjustedPositions(circle1, circle2, reverse) {
  const viz1Container = document.querySelector(".viz1-svg");
  const viz2Container = document.querySelector(".viz2-svg");
  
  if (!viz1Container || !viz2Container) {
    console.error("CANNOT FIND SVG ELEMENTS");
    return { startX: circle1.x, startY: circle1.y, endX: circle2.x, endY: circle2.y };
  }
  
  const viz1Rect = viz1Container.getBoundingClientRect();
  const viz2Rect = viz2Container.getBoundingClientRect();
  
  const scrollY = window.scrollY;
  
  const offsets = reverse ? POSITION_ADJUSTMENTS.reverse : POSITION_ADJUSTMENTS.forward;
  const viz1Offset = offsets.viz1;
  const viz2Offset = offsets.viz2;
  
  // Calculate the absolute position relative to the viewport
  let startX, startY, endX, endY;
  
  if (reverse) {
    // from chart.js to viz.js
    startX = circle2.x + viz2Rect.left + viz2Offset.x;
    startY = circle2.y + viz2Rect.top + viz2Offset.y;
    endX = circle1.x + viz1Rect.left + viz1Offset.x;
    endY = circle1.y + viz1Rect.top + viz1Offset.y;
  } else {
    // from viz.js to chart.js
    startX = circle1.x + viz1Rect.left + viz1Offset.x;
    startY = circle1.y + viz1Rect.top + viz1Offset.y;
    endX = circle2.x + viz2Rect.left + viz2Offset.x;
    endY = circle2.y + viz2Rect.top + viz2Offset.y;
  }
  
  return { startX, startY, endX, endY };
}

// Main animation function for moving circles between positions
function animateMatchingCircles(reverse, transitionContainer) {
  const viz1Circles = [];
  const viz2Positions = [];
  
  window.viz1CirclesMap.forEach((circle1, binomial) => {
    if (window.viz2CirclesMap.has(binomial)) {
      const circle2 = window.viz2CirclesMap.get(binomial);
      
      viz1Circles.push(circle1);
      viz2Positions.push(circle2);
    }
  });
  
  const transitionSvg = transitionContainer.select(".transition-svg");
  
  // Hide the circles in the source and target maps in advance to avoid flickering
  if (reverse) {
    viz1Circles.forEach(circle1 => {
      d3.select(circle1.element).style("opacity", 0);
    });
    d3.selectAll(".viz2-svg .circle").style("opacity", 1);
  } else {
    viz2Positions.forEach(circle2 => {
      d3.select(circle2.element).style("opacity", 0);
    });
  }
  
  // Create a transition circle for each matching circle
  viz1Circles.forEach((circle1, i) => {
    const circle2 = viz2Positions[i];
    const { startX, startY, endX, endY } = calculateAdjustedPositions(circle1, circle2, reverse);
    
    transitionSvg.append("circle")
      .attr("class", "transition-circle")
      .attr("cx", startX)
      .attr("cy", startY)
      .attr("r", 10) // same with original circles
      .attr("fill", circle1.color)
      .attr("stroke", "none")
      .attr("stroke-width", 0.5)
      .attr("data-binomial", circle1.binomial)
      .transition()
      .duration(1200)
      .ease(d3.easeCubicInOut)
      .attr("cx", endX)
      .attr("cy", endY)
      .on("end", function() {
        if (reverse) {
          d3.select(circle1.element).style("opacity", 1);
        } else {
          d3.select(circle2.element).style("opacity", 1);
        }
        d3.select(this).remove();
      });
  });
}

// Helper functions for updating tooltip locations during transitions
function updateTooltipPosition(tooltip, binomial, x, y) {
  if (tooltip.style("visibility") === "visible" && 
      tooltip.text() === binomial) {
    tooltip
      .style("left", (x + 15) + "px")
      .style("top", (y - 10) + "px");
  }
}

// Add a scroll event listener to adjust the transition circle during scrolling
window.addEventListener('scroll', function() {
  if (transitionInProgress) {
    d3.selectAll(".transition-circle").each(function() {
      const circle = d3.select(this);
      const cy = parseFloat(circle.attr("cy"));
      circle.attr("cy", cy - window.scrollY);
    });
  }
});

// Ensure that the tooltips are working properly
document.addEventListener('DOMContentLoaded', function() {
  const checkTooltips = setInterval(() => {
    if (document.querySelector(".viz1-svg") && document.querySelector(".viz2-svg")) {
      clearInterval(checkTooltips);
      setupTooltips();
    }
  }, 100);
});

// Set up tooltips
function setupTooltips() {
  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "global-tooltip")
    .style("position", "absolute")
    .style("padding", "6px 10px")
    .style("background", "rgba(0, 0, 0, 0.7)")
    .style("color", "white")
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("font-size", "12px")
    .style("visibility", "hidden")
    .style("z-index", 10000);
  
  d3.selectAll(".viz1-svg .species-circle")
    .on("mouseover", function() {
      const binomial = d3.select(this).attr("data-binomial");
      tooltip
        .style("visibility", "visible")
        .text(binomial);
    })
    .on("mousemove", function(event) {
      tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px");
    })
    .on("mouseout", function() {
      tooltip.style("visibility", "hidden");
    });
  
  d3.selectAll(".viz2-svg .circle")
    .on("mouseover", function() {
      const binomial = d3.select(this).attr("data-binomial");
      tooltip
        .style("visibility", "visible")
        .text(binomial);
    })
    .on("mousemove", function(event) {
      tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px");
    })
    .on("mouseout", function() {
      tooltip.style("visibility", "hidden");
    });
}

window.debugTransitionPositions = function() {
  if (!window.viz1CirclesMap || !window.viz2CirclesMap) {
    console.log("可视化映射尚未初始化");
    return;
  }
  
  // Get a sample circle
  const sampleCircle1 = window.viz1CirclesMap.values().next().value;
  if (!sampleCircle1) {
    console.log("No sample circles found");
    return;
  }
  
  const sampleCircle2 = window.viz2CirclesMap.get(sampleCircle1.binomial);
  if (!sampleCircle2) {
    console.log("No matched sample circles found");
    return;
  }
  
  // Get SVG container
  const viz1Container = document.querySelector(".viz1-svg");
  const viz2Container = document.querySelector(".viz2-svg");
  
  if (!viz1Container || !viz2Container) {
    console.log("Cannot find SVG container");
    return;
  }
  
  // Get container position
  const viz1Rect = viz1Container.getBoundingClientRect();
  const viz2Rect = viz2Container.getBoundingClientRect();
  
  console.log("Container position:", {
    viz1: {
      left: viz1Rect.left,
      top: viz1Rect.top,
      width: viz1Rect.width,
      height: viz1Rect.height
    },
    viz2: {
      left: viz2Rect.left,
      top: viz2Rect.top,
      width: viz2Rect.width,
      height: viz2Rect.height
    }
  });
  
  // Calculate current position - positive offset
  const forwardViz1X = sampleCircle1.x + viz1Rect.left + POSITION_ADJUSTMENTS.forward.viz1.x;
  const forwardViz1Y = sampleCircle1.y + viz1Rect.top + POSITION_ADJUSTMENTS.forward.viz1.y;
  const forwardViz2X = sampleCircle2.x + viz2Rect.left + POSITION_ADJUSTMENTS.forward.viz2.x;
  const forwardViz2Y = sampleCircle2.y + viz2Rect.top + POSITION_ADJUSTMENTS.forward.viz2.y;
  
  // Calculate current position - negative offset
  const reverseViz1X = sampleCircle1.x + viz1Rect.left + POSITION_ADJUSTMENTS.reverse.viz1.x;
  const reverseViz1Y = sampleCircle1.y + viz1Rect.top + POSITION_ADJUSTMENTS.reverse.viz1.y;
  const reverseViz2X = sampleCircle2.x + viz2Rect.left + POSITION_ADJUSTMENTS.reverse.viz2.x;
  const reverseViz2Y = sampleCircle2.y + viz2Rect.top + POSITION_ADJUSTMENTS.reverse.viz2.y;
  
  return {
    viz1Container: viz1Rect,
    viz2Container: viz2Rect,
    forward: {
      viz1Circle: { x: forwardViz1X, y: forwardViz1Y, original: { x: sampleCircle1.x, y: sampleCircle1.y } },
      viz2Circle: { x: forwardViz2X, y: forwardViz2Y, original: { x: sampleCircle2.x, y: sampleCircle2.y } }
    },
    reverse: {
      viz1Circle: { x: reverseViz1X, y: reverseViz1Y, original: { x: sampleCircle1.x, y: sampleCircle1.y } },
      viz2Circle: { x: reverseViz2X, y: reverseViz2Y, original: { x: sampleCircle2.x, y: sampleCircle2.y } }
    },
    offsets: POSITION_ADJUSTMENTS
  };
};

window.setForwardOffsets = function(viz1X = 0, viz1Y = 0, viz2X = 0, viz2Y = 0) {
  POSITION_ADJUSTMENTS.forward.viz1.x = viz1X;
  POSITION_ADJUSTMENTS.forward.viz1.y = viz1Y;
  POSITION_ADJUSTMENTS.forward.viz2.x = viz2X;
  POSITION_ADJUSTMENTS.forward.viz2.y = viz2Y;
  
  console.log("Updated positive offsets:", POSITION_ADJUSTMENTS.forward);
  
  return window.debugTransitionPositions();
};

window.setReverseOffsets = function(viz1X = 0, viz1Y = 0, viz2X = 0, viz2Y = 0) {
  POSITION_ADJUSTMENTS.reverse.viz1.x = viz1X;
  POSITION_ADJUSTMENTS.reverse.viz1.y = viz1Y;
  POSITION_ADJUSTMENTS.reverse.viz2.x = viz2X;
  POSITION_ADJUSTMENTS.reverse.viz2.y = viz2Y;
  
  console.log("Updated negative offsets:", POSITION_ADJUSTMENTS.reverse);
  
  return window.debugTransitionPositions();
};

window.setAllOffsets = function(
  forwardViz1X = 0, forwardViz1Y = 0, forwardViz2X = 0, forwardViz2Y = 0,
  reverseViz1X = 0, reverseViz1Y = 0, reverseViz2X = 0, reverseViz2Y = 0
) {
  // Positive Offsets
  POSITION_ADJUSTMENTS.forward.viz1.x = forwardViz1X;
  POSITION_ADJUSTMENTS.forward.viz1.y = forwardViz1Y;
  POSITION_ADJUSTMENTS.forward.viz2.x = forwardViz2X;
  POSITION_ADJUSTMENTS.forward.viz2.y = forwardViz2Y;
  
  // Negative Offsets
  POSITION_ADJUSTMENTS.reverse.viz1.x = reverseViz1X;
  POSITION_ADJUSTMENTS.reverse.viz1.y = reverseViz1Y;
  POSITION_ADJUSTMENTS.reverse.viz2.x = reverseViz2X;
  POSITION_ADJUSTMENTS.reverse.viz2.y = reverseViz2Y;
  
  console.log("Updated all offsets:", POSITION_ADJUSTMENTS);
  
  return window.debugTransitionPositions();
};