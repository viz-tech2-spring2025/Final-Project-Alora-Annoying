// Modified square-interaction.js
const squareBoxes = document.querySelectorAll('.square-box');
const infoDisplay = document.getElementById('info-display');
const infoImage = document.querySelector('.info-image');
const infoText = document.querySelector('.info-text');

// Example Box Content
const boxContents = {
  box1: {
    image: '/pic/image 27.png',
    text: 'Animal loss refers to the decline in animal populations due to human activities. This includes extinction of species and reduction in population numbers, which can disrupt ecosystems and food chains.'
  },
  box2: {
    image: '/pic/image 27.png',
    text: 'Habitat loss occurs when natural environments are destroyed or altered, making them unsuitable for the species that depend on them. This is primarily caused by deforestation, urbanization, and agriculture expansion.'
  },
  box3: {
    image: '/pic/image 27.png',
    text: 'Biodiversity loss refers to the reduction in variety of living species in an ecosystem. This decreases ecosystem resilience and impacts ecosystem services that humans rely on, including clean air, water, and food security.'
  }
}

// Function to clear active state from all boxes
function clearActiveBoxes() {
  squareBoxes.forEach(box => {
    box.classList.remove('active-box');
  });
}

// For each square box, add click event
squareBoxes.forEach(box => {
  box.addEventListener('click', function() {
    const boxId = this.getAttribute('data-id');
    const content = boxContents[boxId];
    const infoHint = document.querySelector('.info-hint');
    
    // Hide the hint text
    infoHint.style.display = 'none';
    
    // Update content
    infoImage.innerHTML = `<img src="${content.image}" alt="${boxId} example">`;
    infoText.innerHTML = `<p style="font-size:12px;">${content.text}</p>`;
    
    // Clear all active states and set active state only on clicked box
    clearActiveBoxes();
    this.classList.add('active-box');
    
    // Add active state to the info display
    infoDisplay.classList.add('active');
  });
});