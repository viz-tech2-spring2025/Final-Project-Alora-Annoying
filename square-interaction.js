// Modified square-interaction.js
const squareBoxes = document.querySelectorAll('.square-box');
const infoDisplay = document.getElementById('info-display');
const infoImage = document.querySelector('.info-image');
const infoText = document.querySelector('.info-text');

// Example Box Content
const boxContents = {
  box1: {
    image: '/pic/image 27.png',
    text: 'Pied babblers increase cooperative breeding efforts post-drought, with groups ≥6 members achieving 2.3× higher fledgling success through load-lightening and sentinel behavior. '
  },
  box2: {
    image: '/pic/florida scrub-jay.png',
    text: 'After a drought that reduced juvenile survival rates, the population showed increased adult survival and delayed dispersal of young. This adjustment helped stabilize population numbers despite fewer young birds surviving the initial stages'
  },
  box3: {
    image: '/pic/Amargosa River Pupfish.png',
    text: '​The Amargosa River pupfish (Cyprinodon nevadensis amargosae) exhibits physiological compensation to survive in extreme desert conditions. In habitats like Tecopa Bore, where water temperatures can exceed 36°C, these fish have developed adaptations such as reduced body size and altered morphology, including the loss of pelvic fins, to cope with thermal stress . Additionally, they display phenotypic plasticity, allowing developmental changes in response to environmental conditions, which helps maintain homeostasis and reproductive success in fluctuating habitats.​'
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
    infoText.innerHTML = `<p style="font-size:16px;text-align:left">${content.text}</p>`;
    
    // Clear all active states and set active state only on clicked box
    clearActiveBoxes();
    this.classList.add('active-box');
    
    // Add active state to the info display
    infoDisplay.classList.add('active');
  });
});