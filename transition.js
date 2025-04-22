// transition.js
export function bindTransitionScroll() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.target.id === 'section7') {
          runCircleTransition();
        }
      });
    }, { threshold: 0.5 });
  
    const section7 = document.getElementById('section7');
    if (section7) observer.observe(section7);
  }
  
  function runCircleTransition() {
    if (!window.initialPositions || !window.finalPositions) return;
  
    const svg = d3.select("body").append("svg")
      .attr("class", "transition-overlay")
      .attr("width", window.innerWidth)
      .attr("height", window.innerHeight)
      .style("position", "absolute")
      .style("top", 0)
      .style("left", 0)
      .style("pointer-events", "none")
      .style("z-index", 9999);
  
    const sharedKeys = Object.keys(window.initialPositions).filter(
      k => window.finalPositions[k]
    );
  
    sharedKeys.forEach(key => {
      const start = window.initialPositions[key];
      const end = window.finalPositions[key];
  
      svg.append("circle")
        .attr("cx", start.x)
        .attr("cy", start.y)
        .attr("r", 10)
        .attr("fill", "yellow") // 你可以改为实际颜色
        .attr("opacity", 1)
        .transition()
        .duration(1000)
        .attr("cx", end.x + window.innerWidth * 0.4) // 加偏移修正
        .attr("cy", end.y + document.getElementById('section7').offsetTop)
        .attr("opacity", 0)
        .remove();
    });
  
    // 渐隐 section6 文字，渐显 section7 内容
    d3.select("#section6").transition().duration(800).style("opacity", 0);
    d3.select("#section7").transition().delay(800).duration(800).style("opacity", 1);
  }
  