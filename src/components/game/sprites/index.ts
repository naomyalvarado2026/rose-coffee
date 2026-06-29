// SVGs as strings for the canvas rendering

export const kittenFrames = [
  // Frame 1: Running (legs spread)
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
     <!-- Tail -->
     <path d="M 10,60 Q 5,40 20,30" stroke="#021a54" stroke-width="6" fill="none" stroke-linecap="round"/>
     <!-- Body -->
     <rect x="25" y="45" width="50" height="30" rx="15" fill="#021a54" />
     <!-- Head -->
     <circle cx="75" cy="40" r="18" fill="#021a54" />
     <!-- Ears -->
     <polygon points="65,25 70,10 80,25" fill="#021a54" />
     <polygon points="80,25 90,15 90,30" fill="#021a54" />
     <!-- Eye -->
     <circle cx="80" cy="38" r="3" fill="#faf2e7" />
     <!-- Legs Frame 1 -->
     <rect x="30" y="70" width="6" height="20" rx="3" fill="#021a54" transform="rotate(20 33 70)" />
     <rect x="65" y="70" width="6" height="20" rx="3" fill="#021a54" transform="rotate(-20 68 70)" />
  </svg>`,
  // Frame 2: Running (legs together)
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
     <!-- Tail -->
     <path d="M 10,50 Q 5,70 20,80" stroke="#021a54" stroke-width="6" fill="none" stroke-linecap="round"/>
     <!-- Body -->
     <rect x="25" y="45" width="50" height="30" rx="15" fill="#021a54" />
     <!-- Head -->
     <circle cx="75" cy="42" r="18" fill="#021a54" />
     <!-- Ears -->
     <polygon points="65,27 70,12 80,27" fill="#021a54" />
     <polygon points="80,27 90,17 90,32" fill="#021a54" />
     <!-- Eye -->
     <circle cx="80" cy="40" r="3" fill="#faf2e7" />
     <!-- Legs Frame 2 -->
     <rect x="40" y="70" width="6" height="20" rx="3" fill="#021a54" transform="rotate(-10 43 70)" />
     <rect x="55" y="70" width="6" height="20" rx="3" fill="#021a54" transform="rotate(10 58 70)" />
  </svg>`
];

export const breadObstacle = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <path d="M 20,80 C 10,80 10,40 30,30 C 50,10 70,20 80,40 C 90,60 90,80 80,80 Z" fill="#c8922a" />
  <!-- Scoring cuts -->
  <path d="M 35,35 Q 50,25 65,40" stroke="#a0701a" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M 45,45 Q 55,35 70,55" stroke="#a0701a" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>`;

export const coffeeObstacle = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <!-- Cup Body -->
  <path d="M 20,30 L 80,30 L 70,80 C 65,90 35,90 30,80 Z" fill="#6b3a0e" />
  <path d="M 20,30 C 20,20 80,20 80,30" fill="#4d2607" />
  <!-- Handle -->
  <path d="M 75,40 C 95,40 95,65 75,65" stroke="#6b3a0e" stroke-width="8" fill="none" stroke-linecap="round"/>
  <!-- Steam -->
  <path d="M 40,20 Q 30,10 45,0" stroke="#dadde2" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="4 4" />
  <path d="M 60,20 Q 70,10 55,0" stroke="#dadde2" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="4 4" />
</svg>`;

// Helper to convert SVG strings to Image objects
export const createSVGImage = (svgString: string): HTMLImageElement => {
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.src = url;
  return img;
};
