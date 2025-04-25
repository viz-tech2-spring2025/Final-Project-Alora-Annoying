# The Silent Shift: Ecosystem Responses to Extreme Weather

This interactive data visualization project explores how extreme weather events are reshaping ecosystems and how different species react to these environmental challenges. The project presents data about extreme weather events (EWEs) and their impact on various species through a narrative-driven, scrollable interface with dynamic transitions between visualizations.

## Technologies Used

### Core Technologies
- **HTML5/CSS3** - Structure and styling
- **JavaScript (ES6+)** - Interactivity and visualizations
- **D3.js (v7)** - Data visualization library for creating interactive charts
- **GSAP** - Animation library for smooth transitions

### Libraries
- **D3.js** - For creating data-driven visualizations
- **GSAP (GreenSock Animation Platform)** - For advanced animations and transitions

## Project Structure

```
project/
├── index.html              # Main HTML structure
├── style.css               # CSS styling
├── index.js                # Main scrolling interaction and section transitions
├── square-interaction.js   # Interaction for compensation type boxes in section 6
├── viz.js                  # Visualization for species grouped by taxonomy (section 7)
├── chart.js                # Visualization for species grouped by EWE type (section 9)
├── transition.js           # Handles transitions between visualizations
├── ewe-chart.js            # Chart for research articles over time
├── species-images.js       # Species image visualization for section 7
├── public/                 # Data directory
│   ├── dataset.csv         # Main dataset about species and extreme weather events
│   └── Dataset-filtered-studies.csv # Dataset about research studies and literature
└── pic/                    # Directory for images
└── fonts/                  # Directory for fonts
```

## Dataset

The project uses two main datasets:

1. **dataset.csv**
A cleaned dataset about species and extreme weather events. This includes information about:
   - Species (taxonomy, binomial names)
   - Types of extreme weather events
   - Compensation mechanisms employed by species (behavioral, demographic, physiological)
   - Related ecological data

2. **Dataset-filtered-studies.csv**
A filtered dataset containing information about the research studies and literature sources that document these ecological impacts.

## Features

- **Scrollable Narrative**: A guided story through multiple sections explaining the impacts of extreme weather on ecosystems
- **Dynamic Visualizations**: Interactive D3.js visualizations showing species responses to extreme weather
- **Smooth Transitions**: Custom animations between visualizations using GSAP and D3
- **Interactive Elements**: Tooltips, hover states, and clickable information panels
- **Mobile Responsive**: Adapts to different screen sizes

## Installation and Setup

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local development server (if running locally)

### Running the Project

1. **Clone the repository**
   ```
   git clone <repository-url>
   cd silent-shift-visualization
   ```

2. **Set up a local server**
   
   You can use any local development server. For example, with Python:
   
   ```
   # Python 3
   python -m http.server
   
   # Python 2
   python -m SimpleHTTPServer
   ```
   
   Or with Node.js:
   
   ```
   # Install http-server if you haven't already
   npm install -g http-server
   
   # Run the server
   http-server
   ```

3. **Open in browser**
   
   Navigate to the port your server uses

## How It Works

### Scrolling Mechanism

The project uses a custom scrolling mechanism (in `index.js`) that manages transitions between sections. Key features:

- Sections are displayed one at a time with smooth transitions
- Navigation dots indicate current position
- Special transition handling between specific sections

### Visualizations

1. **Species Group Visualization** (`viz.js`)
   - Shows species grouped by taxonomy
   - Circle packing layout using D3's hierarchical clustering
   - Color-coded by compensation mechanism

2. **EWE Type Visualization** (`chart.js`)
   - Groups species by extreme weather event types
   - Shows distribution of compensation mechanisms
   - Custom grid layout

3. **Transition System** (`transition.js`)
   - Manages animated transitions between the two main visualizations
   - Creates intermediate elements to ensure smooth movement
   - Handles complex state management during transitions

### Interaction Components

- **Compensation Type Boxes** (`square-interaction.js`)
   - Interactive information boxes about different compensation mechanisms
   - Shows examples and details on click

- **Research Article Chart** (`ewe-chart.js`)
   - Visualizes the increase in research articles about extreme weather impacts over time

## Customization

To customize the project:

1. **Data**: Replace the CSV files in the `public` directory with your own data, maintaining the same column structure
2. **Styling**: Modify the `style.css` file to change colors, fonts, and layout
3. **Visualizations**: Adjust parameters in `viz.js` and `chart.js` to change visualization layouts
4. **Content**: Update text content in `index.html` to change the narrative