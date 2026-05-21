/* ==========================================================================
   APP STATE & INITIALIZATION
   ========================================================================== */
const STATE = {
  prompt: '',
  activePreset: 'none',
  aspectRatio: { ratio: '16:9', width: 1280, height: 720 },
  seed: '',
  activeSeed: null,
  refImages: [], // Holds reference images uploaded { id, file, dataUrl, dominantColors: [] }
  activeRefColors: [], // Colors currently selected for prompt inclusion
  bgImage: null, // HTMLImageElement of generated thumbnail
  isLoading: false,
  activeToolbarTab: 'tab-text-overlay',
  
  // Text layers config
  textLines: [
    {
      enabled: true,
      text: 'CRAZY AI TECH',
      font: 'Impact',
      size: 90,
      color: '#ffff00',
      strokeColor: '#000000',
      strokeWidth: 10,
      shadow: true,
      uppercase: true,
      x: 640, // absolute px position
      y: 280,
      isDragging: false,
      width: 0, // calculated during draw
      height: 0
    },
    {
      enabled: true,
      text: 'IN 5 MINUTES!',
      font: 'Outfit',
      size: 55,
      color: '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 6,
      shadow: true,
      uppercase: true,
      x: 640,
      y: 440,
      isDragging: false,
      width: 0,
      height: 0
    }
  ],
  
  // Image Filters
  adjustments: {
    brightness: 100,
    contrast: 100,
    saturation: 100
  },
  
  // Graphical Overlays
  overlays: {
    vignette: false,
    glow: false,
    scanlines: false
  },

  // Reference Image Overlay settings
  refOverlay: {
    enabled: false,
    imgElement: null,
    x: 950,
    y: 430,
    width: 250,
    height: 250,
    isDragging: false,
    position: 'bottom-right'
  },
  
  history: [],
  draggedItem: null // 'text0', 'text1', or 'refOverlay'
};

// Preset Prompts mapping (Option A: Optimized for High-Quality Thumbnails)
const PRESETS = {
  none: '',
  gaming: 'esports gaming concept background, intense action key art, glowing neon violet and crimson highlights, high contrast dark atmosphere, dramatic cinematic studio lighting, sharp focus',
  tech: 'futuristic high-tech workspace background, glowing blue holographic interface grids, abstract digital circuitry, clean dark metallic surface, sci-fi cyber glow, octane render 3d',
  business: 'clean business wealth growth background, modern financial corporate dashboard theme, energetic green and blue gradient lines, professional presentation scene, high contrast corporate lighting',
  cyberpunk: 'cyberpunk street aesthetic, rainy alley, glowing neon billboard displays, violet and cyan light reflections on wet surfaces, moody high contrast cyberpunk city background',
  '3d-render': 'playful 3D clay model concept, smooth plastic toy materials, clean simple geometric shapes, vibrant warm pastel gradient backdrop, studio lighting, octane render style',
  vector: 'flat minimalist vector graphic illustration, clean geometric shapes, bold high-contrast dual-color palette, solid vectors, premium minimalist design',
  cinematic: 'dramatic atmospheric scene backdrop, cinematic composition, volumetric side lighting, moody movie set haze, 35mm film grain details, ultra-realistic photography'
};

// DOM Cache
const DOM = {
  themeToggleBtn: document.getElementById('themeToggleBtn'),
  statusBadge: document.getElementById('statusBadge'),
  statusText: document.querySelector('#statusBadge .status-text'),
  mobileTabs: document.getElementById('mobileTabs'),
  tabBtns: document.querySelectorAll('#mobileTabs .tab-btn'),
  panels: document.querySelectorAll('.dashboard .panel'),
  
  // Inputs
  promptInput: document.getElementById('promptInput'),
  clearPromptBtn: document.getElementById('clearPromptBtn'),
  presetBtns: document.querySelectorAll('.presets-grid .preset-btn'),
  dropzone: document.getElementById('dropzone'),
  fileInput: document.getElementById('fileInput'),
  referencesContainer: document.getElementById('referencesContainer'),
  referencesGallery: document.getElementById('referencesGallery'),
  clearRefsBtn: document.getElementById('clearRefsBtn'),
  paletteContainer: document.getElementById('paletteContainer'),
  swatchesGrid: document.getElementById('swatchesGrid'),
  refCount: document.getElementById('refCount'),
  aspectBtns: document.querySelectorAll('.aspect-grid .aspect-btn'),
  advancedToggleBtn: document.getElementById('advancedToggleBtn'),
  advancedContent: document.getElementById('advancedContent'),
  seedInput: document.getElementById('seedInput'),
  randomSeedBtn: document.getElementById('randomSeedBtn'),
  generateBtn: document.getElementById('generateBtn'),
  regenerateBtn: document.getElementById('regenerateBtn'),
  downloadBtn: document.getElementById('downloadBtn'),
  
  // Canvas
  canvasContainer: document.getElementById('canvasContainer'),
  canvas: document.getElementById('thumbnailCanvas'),
  loadingOverlay: document.getElementById('loadingOverlay'),
  loadingMsg: document.getElementById('loadingMsg'),
  loadingSubMsg: document.getElementById('loadingSubMsg'),
  canvasPlaceholder: document.getElementById('canvasPlaceholder'),
  placeholderGenBtn: document.getElementById('placeholderGenBtn'),
  dragHint: document.getElementById('dragHint'),
  
  // Toolbar Tabs
  toolbarTabBtns: document.querySelectorAll('.toolbar-tab-btn'),
  toolbarPanels: document.querySelectorAll('.toolbar-panel'),
  
  // Text Line 1 Controls
  line1Enable: document.getElementById('line1Enable'),
  line1Controls: document.getElementById('line1Controls'),
  line1Text: document.getElementById('line1Text'),
  line1Font: document.getElementById('line1Font'),
  line1Size: document.getElementById('line1Size'),
  line1SizeVal: document.getElementById('line1SizeVal'),
  line1Color: document.getElementById('line1Color'),
  line1ColorHex: document.getElementById('line1ColorHex'),
  line1StrokeColor: document.getElementById('line1StrokeColor'),
  line1StrokeHex: document.getElementById('line1StrokeHex'),
  line1StrokeWidth: document.getElementById('line1StrokeWidth'),
  line1StrokeVal: document.getElementById('line1StrokeVal'),
  line1Shadow: document.getElementById('line1Shadow'),
  line1Uppercase: document.getElementById('line1Uppercase'),

  // Text Line 2 Controls
  line2Enable: document.getElementById('line2Enable'),
  line2Controls: document.getElementById('line2Controls'),
  line2Text: document.getElementById('line2Text'),
  line2Font: document.getElementById('line2Font'),
  line2Size: document.getElementById('line2Size'),
  line2SizeVal: document.getElementById('line2SizeVal'),
  line2Color: document.getElementById('line2Color'),
  line2ColorHex: document.getElementById('line2ColorHex'),
  line2StrokeColor: document.getElementById('line2StrokeColor'),
  line2StrokeHex: document.getElementById('line2StrokeHex'),
  line2StrokeWidth: document.getElementById('line2StrokeWidth'),
  line2StrokeVal: document.getElementById('line2StrokeVal'),
  line2Shadow: document.getElementById('line2Shadow'),
  line2Uppercase: document.getElementById('line2Uppercase'),
  
  // Filter controls
  filterBrightness: document.getElementById('filterBrightness'),
  filterBrightnessVal: document.getElementById('filterBrightnessVal'),
  filterContrast: document.getElementById('filterContrast'),
  filterContrastVal: document.getElementById('filterContrastVal'),
  filterSaturation: document.getElementById('filterSaturation'),
  filterSaturationVal: document.getElementById('filterSaturationVal'),
  resetFiltersBtn: document.getElementById('resetFiltersBtn'),
  
  // Overlay checkboxes
  overlayVignette: document.getElementById('overlayVignette'),
  overlayGlow: document.getElementById('overlayGlow'),
  overlayScanlines: document.getElementById('overlayScanlines'),
  
  // Reference Overlay controls
  refBlendOptions: document.getElementById('refBlendOptions'),
  enableRefOverlay: document.getElementById('enableRefOverlay'),
  refOpacityGroup: document.getElementById('refOpacityGroup'),
  refPosBtns: document.querySelectorAll('.ref-pos-btn'),
  
  // History
  historyEmpty: document.getElementById('historyEmpty'),
  historyList: document.getElementById('historyList'),
  clearHistoryBtn: document.getElementById('clearHistoryBtn')
};

// Canvas context
const CTX = DOM.canvas.getContext('2d');

/* ==========================================================================
   EVENT INITIALIZATION
   ========================================================================== */
window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initHistory();
  bindEvents();
  lucide.createIcons();
  
  // Trigger initial draw
  drawCanvas();
});

// Setup Initial Theme
function initTheme() {
  const savedTheme = localStorage.getItem('thumbnail-maker-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

// Bind all interactive event listeners
function bindEvents() {
  // Theme toggle
  DOM.themeToggleBtn.addEventListener('click', toggleTheme);
  
  // Clear Prompt
  DOM.clearPromptBtn.addEventListener('click', () => {
    DOM.promptInput.value = '';
    STATE.prompt = '';
  });
  DOM.promptInput.addEventListener('input', (e) => {
    STATE.prompt = e.target.value;
  });
  
  // Style presets
  DOM.presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      DOM.presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      STATE.activePreset = btn.dataset.style;
    });
  });
  
  // Mobile Tabs
  DOM.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      DOM.tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const target = btn.dataset.target;
      DOM.panels.forEach(p => {
        if (p.id === target) {
          p.classList.add('active');
        } else {
          p.classList.remove('active');
        }
      });
    });
  });
  
  // Reference uploads
  DOM.dropzone.addEventListener('click', () => DOM.fileInput.click());
  DOM.fileInput.addEventListener('change', handleFilesSelect);
  
  DOM.dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    DOM.dropzone.classList.add('dragover');
  });
  DOM.dropzone.addEventListener('dragleave', () => {
    DOM.dropzone.classList.remove('dragover');
  });
  DOM.dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    DOM.dropzone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  });
  
  DOM.clearRefsBtn.addEventListener('click', clearReferences);
  
  // Aspect ratios
  DOM.aspectBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      DOM.aspectBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      STATE.aspectRatio = {
        ratio: btn.dataset.ratio,
        width: parseInt(btn.dataset.width),
        height: parseInt(btn.dataset.height)
      };
      
      // Update canvas logical resolution
      DOM.canvas.width = STATE.aspectRatio.width;
      DOM.canvas.height = STATE.aspectRatio.height;
      
      // Adjust text default coordinate relative to new resolution if we haven't generated yet
      recenterTextLayers();
      repositionRefOverlay();
      drawCanvas();
    });
  });
  
  // Advanced panel toggle
  DOM.advancedToggleBtn.addEventListener('click', () => {
    DOM.advancedToggleBtn.classList.toggle('open');
    DOM.advancedContent.classList.toggle('hidden');
  });
  
  // Random Seed
  DOM.randomSeedBtn.addEventListener('click', () => {
    const rand = Math.floor(Math.random() * 999999999);
    DOM.seedInput.value = rand;
    STATE.seed = rand;
  });
  DOM.seedInput.addEventListener('input', (e) => {
    STATE.seed = e.target.value;
  });
  
  // Toolbar tab switcher
  DOM.toolbarTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      DOM.toolbarTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      STATE.activeToolbarTab = btn.dataset.toolbar;
      DOM.toolbarPanels.forEach(p => {
        if (p.id === STATE.activeToolbarTab) {
          p.classList.add('active');
        } else {
          p.classList.remove('active');
        }
      });
    });
  });
  
  // Text Overlay controls binding
  bindTextLayerControls(1, DOM.line1Enable, DOM.line1Controls, DOM.line1Text, DOM.line1Font, DOM.line1Size, DOM.line1SizeVal, DOM.line1Color, DOM.line1ColorHex, DOM.line1StrokeColor, DOM.line1StrokeHex, DOM.line1StrokeWidth, DOM.line1StrokeVal, DOM.line1Shadow, DOM.line1Uppercase);
  bindTextLayerControls(2, DOM.line2Enable, DOM.line2Controls, DOM.line2Text, DOM.line2Font, DOM.line2Size, DOM.line2SizeVal, DOM.line2Color, DOM.line2ColorHex, DOM.line2StrokeColor, DOM.line2StrokeHex, DOM.line2StrokeWidth, DOM.line2StrokeVal, DOM.line2Shadow, DOM.line2Uppercase);
  
  // Filters sliders
  DOM.filterBrightness.addEventListener('input', (e) => {
    STATE.adjustments.brightness = e.target.value;
    DOM.filterBrightnessVal.textContent = e.target.value + '%';
    drawCanvas();
  });
  DOM.filterContrast.addEventListener('input', (e) => {
    STATE.adjustments.contrast = e.target.value;
    DOM.filterContrastVal.textContent = e.target.value + '%';
    drawCanvas();
  });
  DOM.filterSaturation.addEventListener('input', (e) => {
    STATE.adjustments.saturation = e.target.value;
    DOM.filterSaturationVal.textContent = e.target.value + '%';
    drawCanvas();
  });
  DOM.resetFiltersBtn.addEventListener('click', () => {
    STATE.adjustments = { brightness: 100, contrast: 100, saturation: 100 };
    DOM.filterBrightness.value = 100;
    DOM.filterBrightnessVal.textContent = '100%';
    DOM.filterContrast.value = 100;
    DOM.filterContrastVal.textContent = '100%';
    DOM.filterSaturation.value = 100;
    DOM.filterSaturationVal.textContent = '100%';
    drawCanvas();
  });
  
  // Overlay checkboxes
  DOM.overlayVignette.addEventListener('change', (e) => {
    STATE.overlays.vignette = e.target.checked;
    drawCanvas();
  });
  DOM.overlayGlow.addEventListener('change', (e) => {
    STATE.overlays.glow = e.target.checked;
    drawCanvas();
  });
  DOM.overlayScanlines.addEventListener('change', (e) => {
    STATE.overlays.scanlines = e.target.checked;
    drawCanvas();
  });
  
  // Reference overlay blend toggle
  DOM.enableRefOverlay.addEventListener('change', (e) => {
    STATE.refOverlay.enabled = e.target.checked;
    if (e.target.checked) {
      DOM.refOpacityGroup.classList.remove('disabled');
      if (STATE.refImages.length > 0 && !STATE.refOverlay.imgElement) {
        // Load first image as overlay element
        const img = new Image();
        img.onload = () => {
          STATE.refOverlay.imgElement = img;
          repositionRefOverlay();
          drawCanvas();
        };
        img.src = STATE.refImages[0].dataUrl;
      }
    } else {
      DOM.refOpacityGroup.classList.add('disabled');
    }
    drawCanvas();
  });
  
  DOM.refPosBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      DOM.refPosBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      STATE.refOverlay.position = btn.dataset.pos;
      repositionRefOverlay();
      drawCanvas();
    });
  });
  
  // Generate triggers
  DOM.generateBtn.addEventListener('click', generateThumbnail);
  DOM.regenerateBtn.addEventListener('click', regenerateThumbnail);
  DOM.placeholderGenBtn.addEventListener('click', () => {
    DOM.promptInput.value = 'Minimalist workspace with glowing mechanical keyboard, floating ambient spheres';
    STATE.prompt = DOM.promptInput.value;
    // Set Tech preset
    DOM.presetBtns.forEach(b => b.classList.remove('active'));
    document.querySelector('.preset-btn[data-style="tech"]').classList.add('active');
    STATE.activePreset = 'tech';
    generateThumbnail();
  });
  
  // Download Action
  DOM.downloadBtn.addEventListener('click', downloadCanvas);
  
  // History clear
  DOM.clearHistoryBtn.addEventListener('click', clearHistory);
  
  // Canvas Mouse Interactions (Drag & Drop layers)
  DOM.canvas.addEventListener('mousedown', handleCanvasMouseDown);
  window.addEventListener('mousemove', handleCanvasMouseMove);
  window.addEventListener('mouseup', handleCanvasMouseUp);
  
  DOM.canvas.addEventListener('touchstart', handleCanvasTouchStart, { passive: false });
  window.addEventListener('touchmove', handleCanvasTouchMove, { passive: false });
  window.addEventListener('touchend', handleCanvasTouchEnd);
}

// Binds inputs for L1 and L2 text overlays
function bindTextLayerControls(lineIdx, enableChk, controlsDiv, textInp, fontSel, sizeSld, sizeLbl, colorPkr, colorHexLbl, strokePkr, strokeHexLbl, strokeSld, strokeLbl, shadowChk, capChk) {
  const lineState = STATE.textLines[lineIdx - 1];
  
  enableChk.addEventListener('change', (e) => {
    lineState.enabled = e.target.checked;
    if (e.target.checked) {
      controlsDiv.classList.remove('disabled');
    } else {
      controlsDiv.classList.add('disabled');
    }
    drawCanvas();
  });
  
  textInp.addEventListener('input', (e) => {
    lineState.text = e.target.value;
    drawCanvas();
  });
  
  fontSel.addEventListener('change', (e) => {
    lineState.font = e.target.value;
    drawCanvas();
  });
  
  sizeSld.addEventListener('input', (e) => {
    lineState.size = parseInt(e.target.value);
    sizeLbl.textContent = e.target.value + 'px';
    drawCanvas();
  });
  
  colorPkr.addEventListener('input', (e) => {
    lineState.color = e.target.value;
    colorHexLbl.textContent = e.target.value.toUpperCase();
    drawCanvas();
  });
  
  strokePkr.addEventListener('input', (e) => {
    lineState.strokeColor = e.target.value;
    strokeHexLbl.textContent = e.target.value.toUpperCase();
    drawCanvas();
  });
  
  strokeSld.addEventListener('input', (e) => {
    lineState.strokeWidth = parseInt(e.target.value);
    strokeLbl.textContent = e.target.value + 'px';
    drawCanvas();
  });
  
  shadowChk.addEventListener('change', (e) => {
    lineState.shadow = e.target.checked;
    drawCanvas();
  });
  
  capChk.addEventListener('change', (e) => {
    lineState.uppercase = e.target.checked;
    drawCanvas();
  });
}

// Recenter text overlays to match canvas center width
function recenterTextLayers() {
  const cx = STATE.aspectRatio.width / 2;
  STATE.textLines[0].x = cx;
  STATE.textLines[0].y = STATE.aspectRatio.height * 0.38;
  STATE.textLines[1].x = cx;
  STATE.textLines[1].y = STATE.aspectRatio.height * 0.62;
}

// Adjust reference overlay layout coordinates inside canvas bounds
function repositionRefOverlay() {
  if (!STATE.refOverlay.imgElement) return;
  
  const canvasW = STATE.aspectRatio.width;
  const canvasH = STATE.aspectRatio.height;
  
  // Calculate overlay dimensions (keep original aspect ratio, limit width to 22%)
  const aspect = STATE.refOverlay.imgElement.naturalHeight / STATE.refOverlay.imgElement.naturalWidth;
  const width = canvasW * 0.22;
  const height = width * aspect;
  
  STATE.refOverlay.width = width;
  STATE.refOverlay.height = height;
  
  const gap = 24; // safety gap from edge
  
  switch(STATE.refOverlay.position) {
    case 'bottom-right':
      STATE.refOverlay.x = canvasW - width - gap;
      STATE.refOverlay.y = canvasH - height - gap;
      break;
    case 'bottom-left':
      STATE.refOverlay.x = gap;
      STATE.refOverlay.y = canvasH - height - gap;
      break;
    case 'top-right':
      STATE.refOverlay.x = canvasW - width - gap;
      STATE.refOverlay.y = gap;
      break;
    case 'top-left':
      STATE.refOverlay.x = gap;
      STATE.refOverlay.y = gap;
      break;
    case 'center':
      STATE.refOverlay.x = (canvasW - width) / 2;
      STATE.refOverlay.y = (canvasH - height) / 2;
      break;
  }
}

/* ==========================================================================
   THEME TOGGLE
   ========================================================================== */
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', nextTheme);
  localStorage.setItem('thumbnail-maker-theme', nextTheme);
}

/* ==========================================================================
   REFERENCE IMAGES HANDLING & PALETTE EXTRACTION
   ========================================================================== */
function handleFilesSelect(e) {
  if (e.target.files.length > 0) {
    handleFiles(e.target.files);
  }
}

function handleFiles(files) {
  Array.from(files).forEach(file => {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const img = new Image();
      img.onload = () => {
        extractDominantColors(img, (palette) => {
          const newRef = {
            id: 'ref_' + Date.now() + '_' + Math.floor(Math.random()*1000),
            fileName: file.name,
            dataUrl: dataUrl,
            dominantColors: palette
          };
          
          STATE.refImages.push(newRef);
          
          // Set as active reference overlay element if first one
          if (STATE.refImages.length === 1) {
            STATE.refOverlay.imgElement = img;
            DOM.refBlendOptions.classList.remove('hidden');
            repositionRefOverlay();
          }
          
          renderReferencesList();
          updateActiveReferenceColors();
          drawCanvas();
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

// Extractor using downscaled rendering loop
function extractDominantColors(imgElement, callback) {
  const tempCanvas = document.createElement('canvas');
  // Scale down to aggregate colors
  tempCanvas.width = 12;
  tempCanvas.height = 12;
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.drawImage(imgElement, 0, 0, 12, 12);
  
  const imgData = tempCtx.getImageData(0, 0, 12, 12).data;
  const colorCounts = {};
  
  // Iterate colors, rounding components to cluster groups
  for (let i = 0; i < imgData.length; i += 4) {
    const alpha = imgData[i + 3];
    if (alpha < 128) continue; // skip transparent pixels
    
    // Grid quantization (rounds components to nearest 32 to cluster values)
    const r = Math.round(imgData[i] / 32) * 32;
    const g = Math.round(imgData[i + 1] / 32) * 32;
    const b = Math.round(imgData[i + 2] / 32) * 32;
    
    const hex = rgbToHex(
      Math.min(255, Math.max(0, r)),
      Math.min(255, Math.max(0, g)),
      Math.min(255, Math.max(0, b))
    );
    colorCounts[hex] = (colorCounts[hex] || 0) + 1;
  }
  
  // Sort and isolate top colors
  const sorted = Object.keys(colorCounts).sort((a, b) => colorCounts[b] - colorCounts[a]);
  const palette = sorted.slice(0, 5); // top 5 colors
  
  callback(palette);
}

function rgbToHex(r, g, b) {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

function renderReferencesList() {
  DOM.refCount.textContent = STATE.refImages.length;
  
  if (STATE.refImages.length === 0) {
    DOM.referencesContainer.classList.add('hidden');
    DOM.paletteContainer.classList.add('hidden');
    DOM.refBlendOptions.classList.add('hidden');
    STATE.refOverlay.enabled = false;
    DOM.enableRefOverlay.checked = false;
    DOM.refOpacityGroup.classList.add('disabled');
    STATE.refOverlay.imgElement = null;
    return;
  }
  
  DOM.referencesContainer.classList.remove('hidden');
  DOM.referencesGallery.innerHTML = '';
  
  STATE.refImages.forEach(ref => {
    const wrap = document.createElement('div');
    wrap.className = 'ref-thumb-wrapper';
    
    const img = document.createElement('img');
    img.src = ref.dataUrl;
    img.alt = ref.fileName;
    wrap.appendChild(img);
    
    DOM.referencesGallery.appendChild(wrap);
  });
  
  // Render consolidated swatches
  renderSwatchesGrid();
}

function renderSwatchesGrid() {
  DOM.paletteContainer.classList.remove('hidden');
  DOM.swatchesGrid.innerHTML = '';
  
  // Aggregate distinct dominant colors from all references
  const allColorsSet = new Set();
  STATE.refImages.forEach(ref => {
    ref.dominantColors.forEach(c => allColorsSet.add(c));
  });
  
  const allColors = Array.from(allColorsSet).slice(0, 8); // limit to 8 colors total in UI
  
  allColors.forEach(color => {
    const swatch = document.createElement('button');
    swatch.className = 'swatch';
    swatch.style.backgroundColor = color;
    swatch.title = `Click to toggle prompt inclusion (${color})`;
    
    // Check if currently excluded
    const isDisabled = !STATE.activeRefColors.includes(color);
    if (isDisabled) {
      swatch.classList.add('disabled');
    }
    
    swatch.addEventListener('click', (e) => {
      e.preventDefault();
      const idx = STATE.activeRefColors.indexOf(color);
      if (idx > -1) {
        STATE.activeRefColors.splice(idx, 1);
        swatch.classList.add('disabled');
      } else {
        STATE.activeRefColors.push(color);
        swatch.classList.remove('disabled');
      }
    });
    
    DOM.swatchesGrid.appendChild(swatch);
  });
}

function updateActiveReferenceColors() {
  // Clear and rebuild default
  STATE.activeRefColors = [];
  STATE.refImages.forEach(ref => {
    ref.dominantColors.forEach(c => {
      if (STATE.activeRefColors.length < 5 && !STATE.activeRefColors.includes(c)) {
        STATE.activeRefColors.push(c);
      }
    });
  });
}

function clearReferences() {
  STATE.refImages = [];
  STATE.activeRefColors = [];
  STATE.refOverlay.imgElement = null;
  renderReferencesList();
  drawCanvas();
}

/* ==========================================================================
   AI GENERATION ENGINE (Pollinations AI)
   ========================================================================== */
function generateThumbnail() {
  const basePrompt = STATE.prompt.trim();
  if (!basePrompt) {
    alert('Please enter a description prompt before generating.');
    return;
  }
  
  // Build dynamic prompt matching presets and reference colors (Option A: Optimized Compiler)
  let cleanPrompt = basePrompt.trim().replace(/[.,;!]+$/, ''); // strip trailing punctuation
  let fullPrompt = `${cleanPrompt}`;
  
  // Add preset styling
  if (STATE.activePreset !== 'none' && PRESETS[STATE.activePreset]) {
    fullPrompt += `, ${PRESETS[STATE.activePreset]}`;
  }
  
  // Add composition helpers to keep background clear for overlay text
  const textEnabled = STATE.textLines.some(l => l.enabled);
  if (textEnabled) {
    fullPrompt += `, clear composition layout, copy space for text placement, uncluttered composition background`;
  }
  
  // Add reference colors with strict color grade instructions if selected
  if (STATE.activeRefColors.length > 0) {
    const colorList = STATE.activeRefColors.join(' and ');
    fullPrompt += `, dominant aesthetic color scheme: ${colorList}, professional color grading, highly saturated accents`;
  }
  
  // Add general high-fidelity thumbnail modifiers and negative tags (no text background)
  fullPrompt += `, high-contrast youtube thumbnail background, cinematic lighting, sharp focus, 8k resolution, photorealistic, no text, no letters, no logos, no watermark, no signatures, no blurry shapes`;
  
  // Get dimension settings
  const width = STATE.aspectRatio.width;
  const height = STATE.aspectRatio.height;
  
  // Handle seed
  let seed = STATE.seed.trim();
  if (!seed) {
    seed = Math.floor(Math.random() * 999999999);
  }
  STATE.activeSeed = seed;
  DOM.seedInput.value = seed;
  
  // Update state UI loaders
  STATE.isLoading = true;
  updateStatus(true, 'AI Engine generating...');
  toggleLoaderOverlay(true, 'Dreaming Up Canvas...', 'Generating AI components from prompt parameters...');
  
  // Build URL with CORS headers in mind. Pollinations API natively returns CORS support.
  // Add random seed to avoid browser caching.
  const encodedPrompt = encodeURIComponent(fullPrompt);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&enhance=true`;
  
  // Load image with anonymous crossOrigin setting to prevent canvas staining
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    STATE.bgImage = img;
    STATE.isLoading = false;
    updateStatus(false, 'AI Engine Ready');
    toggleLoaderOverlay(false);
    DOM.canvasPlaceholder.classList.add('hidden');
    DOM.regenerateBtn.disabled = false;
    DOM.downloadBtn.disabled = false;
    
    // Save to prompt history
    saveToHistory(basePrompt, STATE.activePreset, seed, imageUrl);
    
    drawCanvas();
  };
  img.onerror = () => {
    STATE.isLoading = false;
    updateStatus(false, 'AI Engine Error', true);
    toggleLoaderOverlay(false);
    alert('Failed to generate thumbnail image. Please check your connection or refine the prompt description.');
  };
  img.src = imageUrl;
}

function regenerateThumbnail() {
  // Clear custom seed and generate a new random background thumbnail
  DOM.seedInput.value = '';
  STATE.seed = '';
  generateThumbnail();
}

function updateStatus(loading, text, isError = false) {
  DOM.statusText.textContent = text;
  
  if (loading) {
    DOM.statusBadge.className = 'status-badge loading';
  } else if (isError) {
    DOM.statusBadge.className = 'status-badge error';
  } else {
    DOM.statusBadge.className = 'status-badge';
  }
}

function toggleLoaderOverlay(show, msg = '', subMsg = '') {
  if (show) {
    DOM.loadingMsg.textContent = msg;
    DOM.loadingSubMsg.textContent = subMsg;
    DOM.loadingOverlay.classList.remove('hidden');
  } else {
    DOM.loadingOverlay.classList.add('hidden');
  }
}

/* ==========================================================================
   CANVAS RENDERING LOOP
   ========================================================================== */
function drawCanvas() {
  const canvasW = STATE.aspectRatio.width;
  const canvasH = STATE.aspectRatio.height;
  
  // Clear previous frame
  CTX.clearRect(0, 0, canvasW, canvasH);
  
  // 1. Draw Background Image (or gradient if not generated yet)
  if (STATE.bgImage) {
    CTX.save();
    // Apply image adjustments/filters
    const filters = `brightness(${STATE.adjustments.brightness}%) contrast(${STATE.adjustments.contrast}%) saturate(${STATE.adjustments.saturation}%)`;
    CTX.filter = filters;
    CTX.drawImage(STATE.bgImage, 0, 0, canvasW, canvasH);
    CTX.restore();
  } else {
    // Draw modern dark gradient placeholder background
    const grad = CTX.createLinearGradient(0, 0, canvasW, canvasH);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.5, '#1e1b4b');
    grad.addColorStop(1, '#020617');
    CTX.fillStyle = grad;
    CTX.fillRect(0, 0, canvasW, canvasH);
    
    // Draw decorative grid
    CTX.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    CTX.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < canvasW; x += gridSize) {
      CTX.beginPath();
      CTX.moveTo(x, 0);
      CTX.lineTo(x, canvasH);
      CTX.stroke();
    }
    for (let y = 0; y < canvasH; y += gridSize) {
      CTX.beginPath();
      CTX.moveTo(0, y);
      CTX.lineTo(canvasW, y);
      CTX.stroke();
    }
  }
  
  // 2. Draw Vignette (Dramatic edges)
  if (STATE.overlays.vignette) {
    const vignetteGrad = CTX.createRadialGradient(
      canvasW / 2, canvasH / 2, canvasH * 0.4,
      canvasW / 2, canvasH / 2, canvasW * 0.7
    );
    vignetteGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignetteGrad.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
    CTX.fillStyle = vignetteGrad;
    CTX.fillRect(0, 0, canvasW, canvasH);
  }
  
  // 3. Draw Cyberpunk Neon border glows
  if (STATE.overlays.glow) {
    CTX.save();
    const borderThickness = 12;
    const borderGrad = CTX.createLinearGradient(0, 0, canvasW, canvasH);
    borderGrad.addColorStop(0, '#8b5cf6'); // Violet
    borderGrad.addColorStop(0.5, '#ec4899'); // Pink
    borderGrad.addColorStop(1, '#06b6d4'); // Cyan
    
    CTX.strokeStyle = borderGrad;
    CTX.lineWidth = borderThickness;
    CTX.shadowColor = '#8b5cf6';
    CTX.shadowBlur = 18;
    CTX.strokeRect(borderThickness/2, borderThickness/2, canvasW - borderThickness, canvasH - borderThickness);
    CTX.restore();
  }
  
  // 4. Draw Retro Scanlines
  if (STATE.overlays.scanlines) {
    CTX.save();
    CTX.fillStyle = 'rgba(0, 0, 0, 0.15)';
    for (let y = 0; y < canvasH; y += 4) {
      CTX.fillRect(0, y, canvasW, 1.5);
    }
    CTX.restore();
  }
  
  // 5. Draw Reference Image Overlay (as sticker/badge)
  if (STATE.refOverlay.enabled && STATE.refOverlay.imgElement) {
    CTX.save();
    
    // Draw subtle drop shadow/glow for the badge
    CTX.shadowColor = 'rgba(0, 0, 0, 0.5)';
    CTX.shadowBlur = 15;
    CTX.shadowOffsetX = 4;
    CTX.shadowOffsetY = 4;
    
    // Render image
    CTX.drawImage(
      STATE.refOverlay.imgElement,
      STATE.refOverlay.x,
      STATE.refOverlay.y,
      STATE.refOverlay.width,
      STATE.refOverlay.height
    );
    
    // Draw border
    CTX.shadowBlur = 0; // disable shadow for border drawing
    CTX.shadowOffsetX = 0;
    CTX.shadowOffsetY = 0;
    CTX.strokeStyle = '#ffffff';
    CTX.lineWidth = 4;
    CTX.strokeRect(
      STATE.refOverlay.x,
      STATE.refOverlay.y,
      STATE.refOverlay.width,
      STATE.refOverlay.height
    );
    
    CTX.restore();
  }
  
  // 6. Draw Text Overlays
  STATE.textLines.forEach((line, index) => {
    if (!line.enabled) return;
    
    CTX.save();
    
    // Parse uppercase
    const renderedText = line.uppercase ? line.text.toUpperCase() : line.text;
    
    // Setup font parameters
    CTX.font = `bold ${line.size}px ${line.font}`;
    CTX.textAlign = 'center';
    CTX.textBaseline = 'middle';
    
    // Calculate text width/height for drag boundaries
    const metrics = CTX.measureText(renderedText);
    line.width = metrics.width;
    line.height = line.size; // approximate
    
    // Shadow parameters
    if (line.shadow) {
      CTX.shadowColor = 'rgba(0, 0, 0, 0.95)';
      CTX.shadowBlur = 12;
      CTX.shadowOffsetX = 5;
      CTX.shadowOffsetY = 5;
    }
    
    // Draw Stroke Outline
    if (line.strokeWidth > 0) {
      CTX.strokeStyle = line.strokeColor;
      CTX.lineWidth = line.strokeWidth;
      CTX.lineJoin = 'miter';
      CTX.miterLimit = 2;
      CTX.strokeText(renderedText, line.x, line.y);
    }
    
    // Clear shadow configuration to avoid coloring fill text
    CTX.shadowBlur = 0;
    CTX.shadowOffsetX = 0;
    CTX.shadowOffsetY = 0;
    
    // Draw Fill
    CTX.fillStyle = line.color;
    CTX.fillText(renderedText, line.x, line.y);
    
    // Optional border hint during drag hover states
    if (STATE.draggedItem === `text${index}`) {
      CTX.strokeStyle = 'rgba(6, 182, 212, 0.7)';
      CTX.lineWidth = 2;
      CTX.setLineDash([6, 4]);
      CTX.strokeRect(
        line.x - line.width / 2 - 10,
        line.y - line.height / 2 - 6,
        line.width + 20,
        line.height + 12
      );
    }
    
    CTX.restore();
  });
}

/* ==========================================================================
   CANVAS DRAG & DROP INTERACTIVE HIT DETECTION
   ========================================================================== */
function handleCanvasMouseDown(e) {
  const coords = getCanvasCoords(e);
  if (!coords) return;
  
  // Check hit collisions in reverse draw order (layers drawn last are on top)
  
  // Collision Check: Text Overlays
  for (let i = STATE.textLines.length - 1; i >= 0; i--) {
    const line = STATE.textLines[i];
    if (!line.enabled) continue;
    
    const halfW = line.width / 2;
    const halfH = line.height / 2;
    
    if (coords.x >= line.x - halfW && coords.x <= line.x + halfW &&
        coords.y >= line.y - halfH && coords.y <= line.y + halfH) {
      
      STATE.draggedItem = `text${i}`;
      line.dragOffsetX = coords.x - line.x;
      line.dragOffsetY = coords.y - line.y;
      DOM.canvas.style.cursor = 'grabbing';
      drawCanvas();
      return;
    }
  }
  
  // Collision Check: Reference Overlay
  if (STATE.refOverlay.enabled && STATE.refOverlay.imgElement) {
    const ref = STATE.refOverlay;
    if (coords.x >= ref.x && coords.x <= ref.x + ref.width &&
        coords.y >= ref.y && coords.y <= ref.y + ref.height) {
      
      STATE.draggedItem = 'refOverlay';
      ref.dragOffsetX = coords.x - ref.x;
      ref.dragOffsetY = coords.y - ref.y;
      DOM.canvas.style.cursor = 'grabbing';
      drawCanvas();
      return;
    }
  }
}

function handleCanvasMouseMove(e) {
  if (!STATE.draggedItem) {
    // Show cursor grabs on hover colliders
    const coords = getCanvasCoords(e);
    if (!coords) return;
    
    let hoverState = false;
    
    for (let i = 0; i < STATE.textLines.length; i++) {
      const line = STATE.textLines[i];
      if (!line.enabled) continue;
      const halfW = line.width / 2;
      const halfH = line.height / 2;
      if (coords.x >= line.x - halfW && coords.x <= line.x + halfW &&
          coords.y >= line.y - halfH && coords.y <= line.y + halfH) {
        hoverState = true;
      }
    }
    
    if (STATE.refOverlay.enabled && STATE.refOverlay.imgElement) {
      const ref = STATE.refOverlay;
      if (coords.x >= ref.x && coords.x <= ref.x + ref.width &&
          coords.y >= ref.y && coords.y <= ref.y + ref.height) {
        hoverState = true;
      }
    }
    
    DOM.canvas.style.cursor = hoverState ? 'grab' : 'crosshair';
    return;
  }
  
  const coords = getCanvasCoords(e);
  if (!coords) return;
  
  if (STATE.draggedItem.startsWith('text')) {
    const idx = parseInt(STATE.draggedItem.replace('text', ''));
    const line = STATE.textLines[idx];
    
    // Bounds limit clamp inside canvas width/height
    line.x = Math.max(0, Math.min(STATE.aspectRatio.width, coords.x - line.dragOffsetX));
    line.y = Math.max(0, Math.min(STATE.aspectRatio.height, coords.y - line.dragOffsetY));
    
  } else if (STATE.draggedItem === 'refOverlay') {
    const ref = STATE.refOverlay;
    ref.x = Math.max(-ref.width/2, Math.min(STATE.aspectRatio.width - ref.width/2, coords.x - ref.dragOffsetX));
    ref.y = Math.max(-ref.height/2, Math.min(STATE.aspectRatio.height - ref.height/2, coords.y - ref.dragOffsetY));
  }
  
  drawCanvas();
}

function handleCanvasMouseUp() {
  if (STATE.draggedItem) {
    STATE.draggedItem = null;
    DOM.canvas.style.cursor = 'grab';
    drawCanvas();
  }
}

// Touch interfaces for Mobile Devices
function handleCanvasTouchStart(e) {
  if (e.touches.length === 1) {
    const fakeMouse = {
      clientX: e.touches[0].clientX,
      clientY: e.touches[0].clientY,
      target: DOM.canvas
    };
    handleCanvasMouseDown(fakeMouse);
    if (STATE.draggedItem) {
      e.preventDefault(); // prevent scrolling while dragging text
    }
  }
}

function handleCanvasTouchMove(e) {
  if (STATE.draggedItem && e.touches.length === 1) {
    const fakeMouse = {
      clientX: e.touches[0].clientX,
      clientY: e.touches[0].clientY,
      target: DOM.canvas
    };
    handleCanvasMouseMove(fakeMouse);
    e.preventDefault();
  }
}

function handleCanvasTouchEnd() {
  handleCanvasMouseUp();
}

// Map screen space client coordinates to absolute canvas width/height pixel scale
function getCanvasCoords(e) {
  const rect = DOM.canvas.getBoundingClientRect();
  
  // Calculate relative client positioning
  const relativeX = e.clientX - rect.left;
  const relativeY = e.clientY - rect.top;
  
  // Check within bounds
  if (relativeX < 0 || relativeX > rect.width || relativeY < 0 || relativeY > rect.height) {
    return null;
  }
  
  // Interpolate screen coordinates to logical canvas pixels
  return {
    x: (relativeX / rect.width) * DOM.canvas.width,
    y: (relativeY / rect.height) * DOM.canvas.height
  };
}

/* ==========================================================================
   DOWNLOAD EXPORTER
   ========================================================================== */
function downloadCanvas() {
  // Double check if generated background image is loaded
  if (!STATE.bgImage) return;
  
  // Create virtual download element
  const downloadLink = document.createElement('a');
  downloadLink.download = `AI_Thumbnail_${Date.now()}.png`;
  
  try {
    // Generate dataURL with maximum quality
    const dataUrl = DOM.canvas.toDataURL('image/png');
    downloadLink.href = dataUrl;
    
    // Trigger download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  } catch (err) {
    console.error(err);
    alert('Security Error: Canvas contains tainted external cross-origin images. Unable to compile download package.');
  }
}

/* ==========================================================================
   LOCALSTORAGE HISTORY TRACKER
   ========================================================================== */
function initHistory() {
  const data = localStorage.getItem('thumbnail-maker-history');
  if (data) {
    try {
      STATE.history = JSON.parse(data);
    } catch(e) {
      STATE.history = [];
    }
  }
  renderHistoryUI();
}

function saveToHistory(prompt, preset, seed, imgUrl) {
  // Use downscaled version of canvas as tiny cached preview
  let thumbnailBase64 = '';
  try {
    // Render downscaled thumbnail of canvas to save space (120x68px scale)
    const thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = 120;
    thumbCanvas.height = Math.round(120 * (DOM.canvas.height / DOM.canvas.width));
    const thumbCtx = thumbCanvas.getContext('2d');
    thumbCtx.drawImage(DOM.canvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
    thumbnailBase64 = thumbCanvas.toDataURL('image/jpeg', 0.6); // base64 JPEG format with 60% compression
  } catch(e) {
    // Fallback if canvas is stained or missing
    thumbnailBase64 = '';
  }
  
  const newItem = {
    id: 'hist_' + Date.now(),
    prompt: prompt,
    preset: preset,
    seed: seed,
    imgUrl: imgUrl, // full link to reload
    aspectRatio: { ...STATE.aspectRatio },
    thumbnail: thumbnailBase64,
    timestamp: new Date().toLocaleTimeString()
  };
  
  // Remove duplicates with identical prompt/seed parameters
  STATE.history = STATE.history.filter(h => !(h.prompt === prompt && h.seed === seed));
  
  // Push at beginning
  STATE.history.unshift(newItem);
  
  // Cap at 15 items to conserve localStorage memory limits
  if (STATE.history.length > 15) {
    STATE.history.pop();
  }
  
  localStorage.setItem('thumbnail-maker-history', JSON.stringify(STATE.history));
  renderHistoryUI();
}

function renderHistoryUI() {
  if (STATE.history.length === 0) {
    DOM.historyEmpty.classList.remove('hidden');
    DOM.historyList.classList.add('hidden');
    DOM.clearHistoryBtn.classList.add('hidden');
    return;
  }
  
  DOM.historyEmpty.classList.add('hidden');
  DOM.historyList.classList.remove('hidden');
  DOM.clearHistoryBtn.classList.remove('hidden');
  
  DOM.historyList.innerHTML = '';
  
  STATE.history.forEach(item => {
    const card = document.createElement('div');
    card.className = 'history-card';
    
    // Left thumbnail preview
    const thumbWrap = document.createElement('div');
    thumbWrap.className = 'history-thumb-wrapper';
    
    const img = document.createElement('img');
    img.src = item.thumbnail || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="68" viewBox="0 0 120 68"><rect width="100%" height="100%" fill="%231e293b"/></svg>';
    img.alt = item.prompt;
    thumbWrap.appendChild(img);
    card.appendChild(thumbWrap);
    
    // Middle Details
    const details = document.createElement('div');
    details.className = 'history-details';
    
    const promptText = document.createElement('p');
    promptText.className = 'history-prompt';
    promptText.textContent = item.prompt;
    details.appendChild(promptText);
    
    const meta = document.createElement('div');
    meta.className = 'history-meta';
    
    const ratio = document.createElement('span');
    ratio.className = 'history-ratio-badge';
    ratio.textContent = item.aspectRatio.ratio;
    meta.appendChild(ratio);
    
    // Trash delete button
    const delBtn = document.createElement('button');
    delBtn.className = 'history-delete-btn';
    delBtn.title = 'Remove item';
    delBtn.innerHTML = '<i data-lucide="trash-2"></i>';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // stop reload event
      deleteHistoryItem(item.id);
    });
    
    meta.appendChild(delBtn);
    details.appendChild(meta);
    card.appendChild(details);
    
    // Click card to reload configuration
    card.addEventListener('click', () => reloadHistoryItem(item));
    
    DOM.historyList.appendChild(card);
  });
  
  lucide.createIcons();
}

function deleteHistoryItem(id) {
  STATE.history = STATE.history.filter(h => h.id !== id);
  localStorage.setItem('thumbnail-maker-history', JSON.stringify(STATE.history));
  renderHistoryUI();
}

function clearHistory() {
  if (confirm('Are you sure you want to delete all generation history?')) {
    STATE.history = [];
    localStorage.removeItem('thumbnail-maker-history');
    renderHistoryUI();
  }
}

function reloadHistoryItem(item) {
  // Populate form controls
  DOM.promptInput.value = item.prompt;
  STATE.prompt = item.prompt;
  
  DOM.seedInput.value = item.seed;
  STATE.seed = item.seed;
  STATE.activeSeed = item.seed;
  
  // Set preset
  DOM.presetBtns.forEach(b => {
    b.classList.remove('active');
    if (b.dataset.style === item.preset) {
      b.classList.add('active');
    }
  });
  STATE.activePreset = item.preset;
  
  // Set aspect ratio
  DOM.aspectBtns.forEach(b => {
    b.classList.remove('active');
    if (b.dataset.ratio === item.aspectRatio.ratio) {
      b.classList.add('active');
    }
  });
  STATE.aspectRatio = { ...item.aspectRatio };
  DOM.canvas.width = STATE.aspectRatio.width;
  DOM.canvas.height = STATE.aspectRatio.height;
  
  // Load background image
  STATE.isLoading = true;
  updateStatus(true, 'Reloading history state...');
  toggleLoaderOverlay(true, 'Reloading Canvas...', 'Rebuilding thumbnail parameters...');
  
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    STATE.bgImage = img;
    STATE.isLoading = false;
    updateStatus(false, 'AI Engine Ready');
    toggleLoaderOverlay(false);
    DOM.canvasPlaceholder.classList.add('hidden');
    DOM.regenerateBtn.disabled = false;
    DOM.downloadBtn.disabled = false;
    
    recenterTextLayers();
    repositionRefOverlay();
    drawCanvas();
  };
  img.onerror = () => {
    STATE.isLoading = false;
    updateStatus(false, 'AI Reload Failed', true);
    toggleLoaderOverlay(false);
    alert('Failed to load history thumbnail source.');
  };
  img.src = item.imgUrl;
}
