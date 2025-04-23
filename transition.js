// transition.js - 实现 viz.js 和 chart.js 可视化之间的平滑过渡
// 增加双向偏移控制和无缝过渡改进

// 全局跟踪变量，用于过渡逻辑
let transitionInitialized = false;
let transitionInProgress = false;
let transitionTimeout = null;
window.originalViz1State = null; // 存储原始状态

// 可调整的偏移量 - 分别控制正向和反向过渡
const POSITION_ADJUSTMENTS = {
  // 从 viz1 到 viz2 的正向过渡偏移
  forward: {
    // viz1 (八号部分) 的位置调整
    viz1: {
      x: 0,   // 水平偏移量，正值向右移动
      y: 0    // 垂直偏移量，正值向下移动
    },
    // viz2 (九号部分) 的位置调整
    viz2: {
      x: 0,   // 水平偏移量，正值向右移动
      y: -960    // 垂直偏移量，正值向下移动
    }
  },
  // 从 viz2 到 viz1 的反向过渡偏移
  reverse: {
    // viz1 (八号部分) 的位置调整
    viz1: {
      x: 0,   // 水平偏移量，正值向右移动
      y: 945    // 垂直偏移量，正值向下移动
    },
    // viz2 (九号部分) 的位置调整
    viz2: {
      x: 0,   // 水平偏移量，正值向右移动
      y: 0    // 垂直偏移量，正值向下移动
    }
  }
};

// 初始化过渡系统 - 当 section8 变为活动状态时调用
window.initializeTransition = function() {
  console.log("初始化过渡系统");
  if (transitionInitialized) return;
  
  // 仅运行一次 - 设置过渡
  transitionInitialized = true;
  
  // 确保在尝试过渡之前两个可视化都已加载
  const checkVisualizations = setInterval(() => {
    if (window.viz1CirclesMap && window.viz1CirclesMap.size > 0 && 
        window.viz2CirclesMap && window.viz2CirclesMap.size > 0) {
      clearInterval(checkVisualizations);
      console.log("两个可视化已加载完成，可以进行过渡");
      
      // 预先计算可视化之间的匹配圆
      preComputeCircleMatches();
    }
  }, 100);
};

// 预先计算 viz1 和 viz2 圆之间的匹配
function preComputeCircleMatches() {
  // 收集两个可视化中都存在的所有匹配物种
  const matchingSpecies = [];
  
  window.viz1CirclesMap.forEach((circle1, binomial) => {
    if (window.viz2CirclesMap.has(binomial)) {
      matchingSpecies.push(binomial);
    }
  });
  
  console.log(`在两个可视化之间找到 ${matchingSpecies.length} 个匹配圆`);
}

// 主要过渡动画函数
window.animateCircleTransition = function(reverse = false, callback) {
  console.log(`开始 ${reverse ? '反向' : '正向'} 过渡动画`);
  
  if (transitionInProgress) {
    console.log("过渡已在进行中，忽略请求");
    return;
  }
  
  transitionInProgress = true;
  
  // 获取所有部分
  const section8 = document.getElementById('section8');
  const section9 = document.getElementById('section9');
  
  // 确保过渡前两个部分都已预加载并准备好
  section8.style.visibility = 'visible';
  section9.style.visibility = 'visible';
  
  // 创建过渡容器
  const transitionContainer = createTransitionContainer();
  
  if (reverse) {
    // 反向过渡（从 chart 到 viz）
    
    // 保持两个部分可见，但准备视觉过渡
    section8.style.opacity = '0';
    section9.style.opacity = '1';
    
    // 先恢复 viz1 的所有元素
    const viz1Svg = d3.select(".viz1-svg");
    
    // 确保 viz1 的大圆和标签是可见的但开始时透明
    viz1Svg.selectAll(".group-circle")
      .style("opacity", 0)
      .style("visibility", "visible");
      
    viz1Svg.selectAll(".group-label-path, .group-label-text")
      .style("opacity", 0)
      .style("visibility", "visible");
      
    // 立即开始创建过渡圆 - 避免延迟
    prepareViz1ForReverseTransition(viz1Svg);
    animateMatchingCircles(reverse, transitionContainer);
    
    // 同步调整不透明度，避免闪烁
    section8.style.opacity = '1';
    
    // 在动画进行一段时间后淡出 section9
    setTimeout(() => {
        // 确保 viz1 中的所有大圆和标签完全恢复
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
    // 正向过渡（从 viz 到 chart）
    
    // 准备 viz2 元素并使其淡入
    const viz2Svg = d3.select(".viz2-svg");
    prepareViz2ForTransition(viz2Svg);
    
    // 隐藏 viz1 中不匹配的元素
    hideNonMatchingElements();
    
    // 立即开始过渡动画 - 避免延迟
    animateMatchingCircles(reverse, transitionContainer);
    
    // 在动画进行一段时间后淡出 section8
    setTimeout(() => {
      section8.style.opacity = '0';
    }, 600);
    
    // 确保目标部分在动画结束前变得可见
    setTimeout(() => {
      section9.style.opacity = '1';
    }, 1000);
  }
  
  // 设置超时以确保即使有问题，过渡也能完成
  clearTimeout(transitionTimeout);
  transitionTimeout = setTimeout(() => {
    if (transitionContainer) {
      transitionContainer.remove();
    }
    transitionInProgress = false;
    if (callback) callback();
  }, 1500); // 允许 1.5 秒用于过渡
};

// 创建过渡容器
function createTransitionContainer() {
  // 为过渡创建一个新的"浮动"圆层
  // 这避免了与 SVG 结构相关的问题，并允许平滑动画
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

// 准备 viz2 元素在过渡开始时可见
function prepareViz2ForTransition(viz2Svg) {
  // 淡入类型标签
  viz2Svg.selectAll(".type-label")
    .transition()
    .duration(1000)
    .style("opacity", 1);
}

// 为反向过渡准备 viz1
function prepareViz1ForReverseTransition(viz1Svg) {
    // 确保所有的组元素都是可见的
    viz1Svg.selectAll(".group-circle")
      .style("opacity", 0)  // 设置初始透明度
      .style("visibility", "visible") // 确保可见性
      .transition()
      .duration(800)
      .style("opacity", 0.1)
      .style("stroke-opacity", 0.3)
      .style("stroke", "#aaa")
      .style("fill-opacity", 0.1)
      .style("fill", "white");
      
    viz1Svg.selectAll(".group-label-path")
      .style("opacity", 0)  // 设置初始透明度
      .style("visibility", "visible") // 确保可见性
      .style("fill", "none") // 确保路径样式正确
      .transition()
      .duration(800)
      .style("opacity", 1);
    
    viz1Svg.selectAll(".group-label-text")
      .style("opacity", 0)  // 设置初始透明度
      .style("visibility", "visible") // 确保可见性
      .style("fill", "white") // 确保文本颜色正确
      .transition()
      .duration(800)
      .style("opacity", 1);
      
    // 确保非匹配的圆点也是可见的
    viz1Svg.selectAll(".species-circle")
      .filter(function() {
        const binomial = d3.select(this).attr("data-binomial");
        const comp = d3.select(this).attr("data-comp");
        
        // 如果是没有匹配的圆点，设置透明度
        return !window.viz2CirclesMap.has(binomial) || 
               !["Behaviour", "Demographic", "Physiological"].includes(comp);
      })
      .style("opacity", 0)  // 设置初始透明度
      .style("visibility", "visible") // 确保可见性
      .transition()
      .duration(800)
      .style("opacity", 1);
}

// 隐藏 viz1 中不是过渡一部分的元素
function hideNonMatchingElements() {
  // 存储原始状态，以便稍后恢复
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
  
  // 淡出组圆和标签
  d3.select(".viz1-svg").selectAll(".group-circle")
    .transition()
    .duration(500)
    .style("opacity", 0);
    
  d3.select(".viz1-svg").selectAll(".group-label-path, .group-label-text")
    .transition()
    .duration(500)
    .style("opacity", 0);
    
  // 淡出非匹配的物种圆点
  d3.select(".viz1-svg").selectAll(".species-circle")
    .filter(function() {
      const binomial = d3.select(this).attr("data-binomial");
      const comp = d3.select(this).attr("data-comp");
      
      // 只保留有匹配圆点的圆
      return !window.viz2CirclesMap.has(binomial) || 
             !["Behaviour", "Demographic", "Physiological"].includes(comp);
    })
    .transition()
    .duration(500)
    .style("opacity", 0);
}

// 计算调整后的位置 - 带有可配置的正向和反向偏移量
function calculateAdjustedPositions(circle1, circle2, reverse) {
  // 获取两个 SVG 容器的位置信息
  const viz1Container = document.querySelector(".viz1-svg");
  const viz2Container = document.querySelector(".viz2-svg");
  
  if (!viz1Container || !viz2Container) {
    console.error("无法找到 SVG 容器元素");
    return { startX: circle1.x, startY: circle1.y, endX: circle2.x, endY: circle2.y };
  }
  
  // 获取容器的位置和尺寸
  const viz1Rect = viz1Container.getBoundingClientRect();
  const viz2Rect = viz2Container.getBoundingClientRect();
  
  // 获取当前滚动位置
  const scrollY = window.scrollY;
  
  // 根据方向选择正确的偏移集
  const offsets = reverse ? POSITION_ADJUSTMENTS.reverse : POSITION_ADJUSTMENTS.forward;
  const viz1Offset = offsets.viz1;
  const viz2Offset = offsets.viz2;
  
  // 计算相对于视口的绝对位置
  let startX, startY, endX, endY;
  
  if (reverse) {
    // 从 chart 到 viz
    startX = circle2.x + viz2Rect.left + viz2Offset.x;
    startY = circle2.y + viz2Rect.top + viz2Offset.y;
    endX = circle1.x + viz1Rect.left + viz1Offset.x;
    endY = circle1.y + viz1Rect.top + viz1Offset.y;
  } else {
    // 从 viz 到 chart
    startX = circle1.x + viz1Rect.left + viz1Offset.x;
    startY = circle1.y + viz1Rect.top + viz1Offset.y;
    endX = circle2.x + viz2Rect.left + viz2Offset.x;
    endY = circle2.y + viz2Rect.top + viz2Offset.y;
  }
  
  return { startX, startY, endX, endY };
}

// 主要动画函数，用于在位置之间移动圆
function animateMatchingCircles(reverse, transitionContainer) {
  // 获取两个可视化中的所有匹配圆
  const viz1Circles = [];
  const viz2Positions = [];
  
  window.viz1CirclesMap.forEach((circle1, binomial) => {
    if (window.viz2CirclesMap.has(binomial)) {
      const circle2 = window.viz2CirclesMap.get(binomial);
      
      // 存储匹配的圆和位置
      viz1Circles.push(circle1);
      viz2Positions.push(circle2);
    }
  });
  
  console.log(`正在为 ${viz1Circles.length} 个圆添加动画`);
  
  const transitionSvg = transitionContainer.select(".transition-svg");
  
  // 提前隐藏源图和目标图中的圆，避免闪烁
  if (reverse) {
    // 从 chart 到 viz - 隐藏 viz1 中的匹配圆
    viz1Circles.forEach(circle1 => {
      d3.select(circle1.element).style("opacity", 0);
    });
    // 从 chart 到 viz - 显示 viz2 中的所有圆以便开始动画
    d3.selectAll(".viz2-svg .circle").style("opacity", 1);
  } else {
    // 从 viz 到 chart - 隐藏 viz2 中的匹配圆
    viz2Positions.forEach(circle2 => {
      d3.select(circle2.element).style("opacity", 0);
    });
  }
  
  // 为每个匹配的圆创建一个过渡圆
  viz1Circles.forEach((circle1, i) => {
    const circle2 = viz2Positions[i];
    
    // 使用修正后的位置计算，包括可调整的偏移量
    const { startX, startY, endX, endY } = calculateAdjustedPositions(circle1, circle2, reverse);
    
    // 创建过渡圆
    transitionSvg.append("circle")
      .attr("class", "transition-circle")
      .attr("cx", startX)
      .attr("cy", startY)
      .attr("r", 10) // 与原始圆相同
      .attr("fill", circle1.color)
      .attr("stroke", "none")
      .attr("stroke-width", 0.5)
      .attr("data-binomial", circle1.binomial)
      .transition()
      .duration(1200)
      .ease(d3.easeCubicInOut) // 平滑缓动
      .attr("cx", endX)
      .attr("cy", endY)
      .on("end", function() {
        // 当过渡完成时，使目标圆可见
        if (reverse) {
          d3.select(circle1.element).style("opacity", 1);
        } else {
          d3.select(circle2.element).style("opacity", 1);
        }
        
        // 移除此过渡圆
        d3.select(this).remove();
      });
  });
}

// 在过渡期间更新工具提示位置的辅助函数
function updateTooltipPosition(tooltip, binomial, x, y) {
  if (tooltip.style("visibility") === "visible" && 
      tooltip.text() === binomial) {
    tooltip
      .style("left", (x + 15) + "px")
      .style("top", (y - 10) + "px");
  }
}

// 添加滚动事件监听器，在滚动期间调整过渡圆
window.addEventListener('scroll', function() {
  // 仅在过渡进行中时调整
  if (transitionInProgress) {
    d3.selectAll(".transition-circle").each(function() {
      const circle = d3.select(this);
      const cy = parseFloat(circle.attr("cy"));
      // 根据滚动变化调整
      circle.attr("cy", cy - window.scrollY);
    });
  }
});

// 确保两个可视化的工具提示正常工作
document.addEventListener('DOMContentLoaded', function() {
  // 等待可视化加载
  const checkTooltips = setInterval(() => {
    if (document.querySelector(".viz1-svg") && document.querySelector(".viz2-svg")) {
      clearInterval(checkTooltips);
      
      // 为两个可视化添加工具提示功能
      setupTooltips();
    }
  }, 100);
});

// 为两个可视化设置工具提示
function setupTooltips() {
  // 通用工具提示设置
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
  
  // 为 viz1 圆添加工具提示事件
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
  
  // 为 viz2 圆添加工具提示事件
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

// 添加辅助函数，用于调试和调整偏移量
window.debugTransitionPositions = function() {
  if (!window.viz1CirclesMap || !window.viz2CirclesMap) {
    console.log("可视化映射尚未初始化");
    return;
  }
  
  // 获取一个示例圆
  const sampleCircle1 = window.viz1CirclesMap.values().next().value;
  if (!sampleCircle1) {
    console.log("没有找到示例圆");
    return;
  }
  
  const sampleCircle2 = window.viz2CirclesMap.get(sampleCircle1.binomial);
  if (!sampleCircle2) {
    console.log("没有找到匹配的示例圆");
    return;
  }
  
  // 获取 SVG 容器
  const viz1Container = document.querySelector(".viz1-svg");
  const viz2Container = document.querySelector(".viz2-svg");
  
  if (!viz1Container || !viz2Container) {
    console.log("找不到 SVG 容器");
    return;
  }
  
  // 获取容器位置
  const viz1Rect = viz1Container.getBoundingClientRect();
  const viz2Rect = viz2Container.getBoundingClientRect();
  
  // 记录位置信息
  console.log("容器位置:", {
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
  
  // 计算当前位置 - 正向偏移
  const forwardViz1X = sampleCircle1.x + viz1Rect.left + POSITION_ADJUSTMENTS.forward.viz1.x;
  const forwardViz1Y = sampleCircle1.y + viz1Rect.top + POSITION_ADJUSTMENTS.forward.viz1.y;
  const forwardViz2X = sampleCircle2.x + viz2Rect.left + POSITION_ADJUSTMENTS.forward.viz2.x;
  const forwardViz2Y = sampleCircle2.y + viz2Rect.top + POSITION_ADJUSTMENTS.forward.viz2.y;
  
  // 计算当前位置 - 反向偏移
  const reverseViz1X = sampleCircle1.x + viz1Rect.left + POSITION_ADJUSTMENTS.reverse.viz1.x;
  const reverseViz1Y = sampleCircle1.y + viz1Rect.top + POSITION_ADJUSTMENTS.reverse.viz1.y;
  const reverseViz2X = sampleCircle2.x + viz2Rect.left + POSITION_ADJUSTMENTS.reverse.viz2.x;
  const reverseViz2Y = sampleCircle2.y + viz2Rect.top + POSITION_ADJUSTMENTS.reverse.viz2.y;
  
  console.log("示例圆位置（正向偏移 - viz到chart）:", {
    viz1: { x: forwardViz1X, y: forwardViz1Y },
    viz2: { x: forwardViz2X, y: forwardViz2Y }
  });
  
  console.log("示例圆位置（反向偏移 - chart到viz）:", {
    viz1: { x: reverseViz1X, y: reverseViz1Y },
    viz2: { x: reverseViz2X, y: reverseViz2Y }
  });
  
  // 显示当前偏移量
  console.log("当前偏移量设置:", POSITION_ADJUSTMENTS);
  
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

// 设置正向偏移量（从 viz 到 chart）的辅助函数
window.setForwardOffsets = function(viz1X = 0, viz1Y = 0, viz2X = 0, viz2Y = 0) {
  POSITION_ADJUSTMENTS.forward.viz1.x = viz1X;
  POSITION_ADJUSTMENTS.forward.viz1.y = viz1Y;
  POSITION_ADJUSTMENTS.forward.viz2.x = viz2X;
  POSITION_ADJUSTMENTS.forward.viz2.y = viz2Y;
  
  console.log("已更新正向偏移量:", POSITION_ADJUSTMENTS.forward);
  
  return window.debugTransitionPositions();
};

// 设置反向偏移量（从 chart 到 viz）的辅助函数
window.setReverseOffsets = function(viz1X = 0, viz1Y = 0, viz2X = 0, viz2Y = 0) {
  POSITION_ADJUSTMENTS.reverse.viz1.x = viz1X;
  POSITION_ADJUSTMENTS.reverse.viz1.y = viz1Y;
  POSITION_ADJUSTMENTS.reverse.viz2.x = viz2X;
  POSITION_ADJUSTMENTS.reverse.viz2.y = viz2Y;
  
  console.log("已更新反向偏移量:", POSITION_ADJUSTMENTS.reverse);
  
  return window.debugTransitionPositions();
};

// 一次性设置所有偏移量的辅助函数
window.setAllOffsets = function(
  forwardViz1X = 0, forwardViz1Y = 0, forwardViz2X = 0, forwardViz2Y = 0,
  reverseViz1X = 0, reverseViz1Y = 0, reverseViz2X = 0, reverseViz2Y = 0
) {
  // 设置正向偏移量
  POSITION_ADJUSTMENTS.forward.viz1.x = forwardViz1X;
  POSITION_ADJUSTMENTS.forward.viz1.y = forwardViz1Y;
  POSITION_ADJUSTMENTS.forward.viz2.x = forwardViz2X;
  POSITION_ADJUSTMENTS.forward.viz2.y = forwardViz2Y;
  
  // 设置反向偏移量
  POSITION_ADJUSTMENTS.reverse.viz1.x = reverseViz1X;
  POSITION_ADJUSTMENTS.reverse.viz1.y = reverseViz1Y;
  POSITION_ADJUSTMENTS.reverse.viz2.x = reverseViz2X;
  POSITION_ADJUSTMENTS.reverse.viz2.y = reverseViz2Y;
  
  console.log("已更新所有偏移量:", POSITION_ADJUSTMENTS);
  
  return window.debugTransitionPositions();
};