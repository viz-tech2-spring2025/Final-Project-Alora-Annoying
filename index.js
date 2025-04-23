// Modified index.js - Adding transitions between section7 and section8
document.addEventListener('DOMContentLoaded', function () {
  const sections = document.querySelectorAll('section')
  const dots = document.querySelectorAll('.dot')
  let currentSection = 0
  let isScrolling = false
  let isTransitioning = false

  // Define activation functions for special sections
  const activationFunctions = {
    // When section 7 activates (index 6), prepare for transition to section 8
    6: function() {
      console.log("Section 7 activated - preparing for transition");
      
      // Call the section7 initialization function if it exists
      if (typeof window.initializeSection7Transition === 'function') {
        window.initializeSection7Transition();
      } else {
        console.warn("initializeSection7Transition function not found - transition may not work properly");
      }
      
      // Ensure visibility of all sections is correct
      resetSectionVisibility();
    },
    
    // When section 8 activates (index 7), prepare for transition to section 9
    7: function() {
      console.log("Section 8 activated - preparing for transition");
      
      // Call the transition initialization function if it exists
      if (typeof window.initializeTransition === 'function') {
        window.initializeTransition();
      } else {
        console.warn("initializeTransition function not found - transition may not work properly");
      }
      
      // Ensure visibility of all sections is correct
      resetSectionVisibility();
    }
  };

  // Function to reset the visibility of all sections
  function resetSectionVisibility() {
    sections.forEach(section => {
      section.style.visibility = 'visible';
      section.style.opacity = '1';
      section.style.position = '';
      section.style.top = '';
      section.style.left = '';
      section.style.width = '';
      section.style.height = '';
      section.style.zIndex = '';
    });
    
    // Ensure scrolling is enabled
    document.body.style.overflow = '';
  }

  // Handle special transition between sections
  function handleSpecialTransition(fromSectionIndex, toSectionIndex, isReverse, callback) {
    isTransitioning = true;
    
    const fromSection = sections[fromSectionIndex];
    const toSection = sections[toSectionIndex];
    
    // Ensure both sections are visible on the screen
    fromSection.style.visibility = 'visible';
    toSection.style.visibility = 'visible';
    
    // Current scroll position
    const currentScrollY = window.scrollY;
    
    // Handle different section transitions
    if (fromSectionIndex === 6 && toSectionIndex === 7) {
      // Transition from section7 to section8
      if (typeof window.animateSection7To8Transition === 'function') {
        console.log("Starting section7 to section8 transition animation");
        
        // Start section7 to section8 transition animation
        window.animateSection7To8Transition(() => {
          // After animation completes
          
          // Scroll to target section
          sections[toSectionIndex].scrollIntoView({ behavior: 'auto' });
          
          // Update current section and dot indicators
          currentSection = toSectionIndex;
          updateDots(toSectionIndex);
          
          // Complete transition
          setTimeout(() => {
            isScrolling = false;
            isTransitioning = false;
            
            // Ensure section indicators are visible
            document.querySelector('.section-indicator').style.display = 'flex';
            
            if (callback) callback();
          }, 200);
        });
      } else {
        console.error("animateSection7To8Transition function not available - falling back to normal scroll");
        toSection.scrollIntoView({ behavior: 'smooth' });
        
        setTimeout(() => {
          currentSection = toSectionIndex;
          updateDots(toSectionIndex);
          isScrolling = false;
          isTransitioning = false;
          if (callback) callback();
        }, 800);
      }
    } else if (fromSectionIndex === 7 && toSectionIndex === 6) {
      // Transition from section8 to section7
      if (typeof window.animateSection8To7Transition === 'function') {
        console.log("Starting section8 to section7 transition animation");
        
        // Start section8 to section7 transition animation
        window.animateSection8To7Transition(() => {
          // After animation completes
          
          // Scroll to target section
          sections[toSectionIndex].scrollIntoView({ behavior: 'auto' });
          
          // Update current section and dot indicators
          currentSection = toSectionIndex;
          updateDots(toSectionIndex);
          
          // Complete transition
          setTimeout(() => {
            isScrolling = false;
            isTransitioning = false;
            
            // Ensure section indicators are visible
            document.querySelector('.section-indicator').style.display = 'flex';
            
            if (callback) callback();
          }, 200);
        });
      } else {
        console.error("animateSection8To7Transition function not available - falling back to normal scroll");
        toSection.scrollIntoView({ behavior: 'smooth' });
        
        setTimeout(() => {
          currentSection = toSectionIndex;
          updateDots(toSectionIndex);
          isScrolling = false;
          isTransitioning = false;
          if (callback) callback();
        }, 800);
      }
    } else if (fromSectionIndex === 7 && toSectionIndex === 8) {
      // Transition from section8 to section9 - use custom transition
      if (typeof window.animateCircleTransition === 'function') {
        console.log(`Starting ${isReverse ? 'reverse' : 'forward'} transition animation`);
        
        // Start circle transition animation
        window.animateCircleTransition(isReverse, () => {
          // After animation completes
          
          // Scroll to target section
          sections[toSectionIndex].scrollIntoView({ behavior: 'auto' });
          
          // Update current section and dot indicators
          currentSection = toSectionIndex;
          updateDots(toSectionIndex);
          
          // Complete transition
          setTimeout(() => {
            isScrolling = false;
            isTransitioning = false;
            
            // Ensure section indicators are visible
            document.querySelector('.section-indicator').style.display = 'flex';
            
            if (callback) callback();
          }, 200);
        });
        
        // Create smooth visual transition effect
        fromSection.style.transition = 'opacity 0.8s ease';
        toSection.style.transition = 'opacity 0.8s ease';
        
        // Gradually fade out source section as circles start moving
        setTimeout(() => {
          fromSection.style.opacity = '0';
        }, 200);
        
        // Gradually fade in target section as circles approach target position
        setTimeout(() => {
          toSection.style.opacity = '1';
        }, 800);
      } else {
        console.error("Transition function not available - falling back to normal scroll");
        
        // Normal scroll to target section
        toSection.scrollIntoView({ behavior: 'smooth' });
        
        // Delay updating state until scrolling completes
        setTimeout(() => {
          currentSection = toSectionIndex;
          updateDots(toSectionIndex);
          isScrolling = false;
          isTransitioning = false;
          if (callback) callback();
        }, 800);
      }
    } else if (fromSectionIndex === 8 && toSectionIndex === 7) {
      // Transition from section9 back to section8 - use reverse transition
      if (typeof window.animateCircleTransition === 'function') {
        console.log(`Starting reverse transition animation`);
        
        // Start reverse circle transition animation
        window.animateCircleTransition(true, () => {
          // After animation completes
          
          // Scroll to target section
          sections[toSectionIndex].scrollIntoView({ behavior: 'auto' });
          
          // Update current section and dot indicators
          currentSection = toSectionIndex;
          updateDots(toSectionIndex);
          
          // Complete transition
          setTimeout(() => {
            isScrolling = false;
            isTransitioning = false;
            
            // Ensure section indicators are visible
            document.querySelector('.section-indicator').style.display = 'flex';
            
            if (callback) callback();
          }, 200);
        });
        
        // Create smooth visual transition effect
        fromSection.style.transition = 'opacity 0.8s ease';
        toSection.style.transition = 'opacity 0.8s ease';
        
        // Gradually fade out source section as circles start moving
        setTimeout(() => {
          fromSection.style.opacity = '0';
        }, 200);
        
        // Gradually fade in target section as circles approach target position
        setTimeout(() => {
          toSection.style.opacity = '1';
        }, 800);
      } else {
        console.error("Transition function not available - falling back to normal scroll");
        
        // Normal scroll to target section
        toSection.scrollIntoView({ behavior: 'smooth' });
        
        // Delay updating state until scrolling completes
        setTimeout(() => {
          currentSection = toSectionIndex;
          updateDots(toSectionIndex);
          isScrolling = false;
          isTransitioning = false;
          if (callback) callback();
        }, 800);
      }
    } else {
      // For other sections, use normal scroll
      toSection.scrollIntoView({ behavior: 'smooth' });
      
      // Delay updating state until scrolling completes
      setTimeout(() => {
        currentSection = toSectionIndex;
        updateDots(toSectionIndex);
        isScrolling = false;
        isTransitioning = false;
        if (callback) callback();
      }, 800);
    }
  }

  function scrollToSection(index) {
    // If a transition is already in progress, ignore this scroll request
    if (isTransitioning) {
      console.log("Transition in progress, ignoring scroll request");
      return;
    }
    
    // If we're already on the requested section and not scrolling, do nothing
    if (index === currentSection && !isScrolling) {
      return;
    }
    
    // Special handling for transitions between sections
    if (currentSection === 6 && index === 7) {
      // Scrolling from section7 to section8 - use custom transition
      handleSpecialTransition(6, 7, false);
      return;
    } 
    else if (currentSection === 7 && index === 6) {
      // Scrolling from section8 back to section7 - use reverse transition
      handleSpecialTransition(7, 6, true);
      return;
    }
    else if (currentSection === 7 && index === 8) {
      // Scrolling from section8 to section9 - use custom transition
      handleSpecialTransition(7, 8, false);
      return;
    } 
    else if (currentSection === 8 && index === 7) {
      // Scrolling from section9 back to section8 - use reverse transition
      handleSpecialTransition(8, 7, true);
      return;
    }
    else {
      // Normal scrolling behavior for other sections
      resetSectionVisibility();
      currentSection = index
      sections[index].scrollIntoView({ behavior: 'smooth' })
      updateDots(index)
      
      // Call activation function if defined for this section
      if (activationFunctions[index]) {
        activationFunctions[index]()
      }
    }
  }

  function updateDots(index) {
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index)
    })
  }

  // Navigation event listeners
  
  // Dot navigation
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => scrollToSection(index))
  })

  // Mouse wheel navigation
  window.addEventListener('wheel', e => {
    if (isScrolling || isTransitioning) return
    isScrolling = true
    
    // Extended timeout for transitions
    const scrollTimeout = isTransitioning ? 1500 : 800;
    setTimeout(() => { isScrolling = false }, scrollTimeout)

    if (e.deltaY > 0 && currentSection < sections.length - 1) {
      scrollToSection(currentSection + 1)
    } else if (e.deltaY < 0 && currentSection > 0) {
      scrollToSection(currentSection - 1)
    }
  })

  // Touch navigation
  let touchStartY = 0
  window.addEventListener('touchstart', e => {
    touchStartY = e.touches[0].clientY
  })

  window.addEventListener('touchend', e => {
    const touchEndY = e.changedTouches[0].clientY
    const diff = touchStartY - touchEndY
    
    if (Math.abs(diff) < 50 || isScrolling || isTransitioning) return

    isScrolling = true
    const scrollTimeout = isTransitioning ? 1500 : 800;
    setTimeout(() => { isScrolling = false }, scrollTimeout)

    if (diff > 0 && currentSection < sections.length - 1) {
      scrollToSection(currentSection + 1)
    } else if (diff < 0 && currentSection > 0) {
      scrollToSection(currentSection - 1)
    }
  })

  // Keyboard navigation
  window.addEventListener('keydown', e => {
    if (isScrolling || isTransitioning) return
    
    if (e.key === 'ArrowDown' && currentSection < sections.length - 1) {
      e.preventDefault()
      scrollToSection(currentSection + 1)
    } else if (e.key === 'ArrowUp' && currentSection > 0) {
      e.preventDefault()
      scrollToSection(currentSection - 1)
    }
  })
  
  // Initialize page, reset visibility
  resetSectionVisibility();
})