document.addEventListener('DOMContentLoaded', function () {
  const sections = document.querySelectorAll('section')
  const dots = document.querySelectorAll('.dot')
  let currentSection = 0
  let isScrolling = false

  function scrollToSection(index) {
    currentSection = index
    sections[index].scrollIntoView({ behavior: 'smooth' })
    updateDots(index)
    if (activationFunctions[index]) {
      activationFunctions[index]() // 调用对应 draw 函数
    }
  }

  function updateDots(index) {
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index)
    })
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => scrollToSection(index))
  })

  window.addEventListener('wheel', e => {
    if (isScrolling) return
    isScrolling = true
    setTimeout(() => { isScrolling = false }, 800)

    if (e.deltaY > 0 && currentSection < sections.length - 1) {
      scrollToSection(currentSection + 1)
    } else if (e.deltaY < 0 && currentSection > 0) {
      scrollToSection(currentSection - 1)
    }
  })

  // touch 支持
  let touchStartY = 0
  window.addEventListener('touchstart', e => {
    touchStartY = e.touches[0].clientY
  })

  window.addEventListener('touchend', e => {
    const touchEndY = e.changedTouches[0].clientY
    const diff = touchStartY - touchEndY
    if (Math.abs(diff) < 50 || isScrolling) return

    isScrolling = true
    setTimeout(() => { isScrolling = false }, 800)

    if (diff > 0 && currentSection < sections.length - 1) {
      scrollToSection(currentSection + 1)
    } else if (diff < 0 && currentSection > 0) {
      scrollToSection(currentSection - 1)
    }
  })
})
