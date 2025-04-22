// 这个函数会绑定 scroll 事件
function bindTransitionScroll() {
    console.log("📌 bindTransitionScroll 被执行！");
  
    const section7 = document.getElementById("section7");
  
    window.addEventListener("scroll", () => {
      const rect = section7.getBoundingClientRect();
  
      if (
        rect.top < window.innerHeight * 0.5 &&
        !window.transitionTriggered
      ) {
        window.transitionTriggered = true;
  
        console.log("🚀 触发动画条件，开始执行小圆移动...");
  
        const circles = d3.selectAll("circle.circle")
          .filter(function () {
            return this.hasAttribute("data-name");
          });
  
        console.log("🎯 找到 circle 数量：", circles.size());
  
        circles
          .transition()
          .duration(1200)
          .ease(d3.easeCubicOut)
          .attr("cx", function () {
            const name = this.getAttribute("data-name");
            const pos = window.finalPositions[name];
            console.log("🔍 正在移动：", name, "→", pos);
            return pos ? pos.x : +this.getAttribute("cx");
          })
          .attr("cy", function () {
            const name = this.getAttribute("data-name");
            const pos = window.finalPositions[name];
            return pos ? pos.y : +this.getAttribute("cy");
          });
      }
    });
  }
  
  // 等待小圆 + finalPositions 都准备好后再绑定动画
  const waitForReady = setInterval(() => {
    const readyCircles = d3.selectAll("circle.circle")
      .filter(function () {
        return this.hasAttribute("data-name");
      });
  
    if (readyCircles.size() > 0 && window.finalPositions) {
      console.log("✅ 所有数据已加载，启动动画绑定函数！");
      clearInterval(waitForReady);
      bindTransitionScroll();
    } else {
      console.log("⌛ 等待小圆和 finalPositions...", readyCircles.size(), window.finalPositions ? "✅" : "❌");
    }
  }, 300);
  