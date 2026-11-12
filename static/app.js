/**
 * Smart Irrigation Planner - Frontend Application
 * Handles State & Crop selection, Decision Zone Visualization,
 * Multi-unit sensor inputs, Rainfall evaluation, and ML predictions.
 */

const translations = {
    en: {
        title: "Smart Irrigation Planner",
        subtitle: "Simple support for smarter farming",
        languageLabel: "Choose Language",
        welcome: "Let's check your field",
        intro: "Enter your crop and sensor readings.",
        formTitle: "Crop and Soil Details",
        stateLabel: "Step 1: Select State or Union Territory",
        cropLabel: "Step 2: Select Crop",
        btnLocation: "Detect",
        daysLabel: "Crop age (days)",
        moistureLabel: "Soil moisture (% of field capacity)",
        moistureHelp: "Enter the sensor reading (0 - 100%).",
        moistureRiceLabel: "Water level (cm relative to soil surface)",
        moistureRiceHelp: "Enter water level relative to soil surface (-25 to +5 cm).",
        soilTempLabel: "Soil temperature",
        airTempLabel: "Air temperature",
        humidityLabel: "Relative humidity",
        rainfall7dLabel: "Rainfall in last 7 days (mm) *",
        rainfall7dHelp: "Required. If 10 mm or more, irrigation is paused automatically.",
        forecast24hLabel: "Forecast rainfall next 24 hours (mm)",
        forecast24hHelp: "Optional (default is 0 mm).",
        unitWarning: "Temperatures are converted to Celsius for ML prediction. Ranges CSV is the single source of truth.",
        predict: "Check Irrigation",
        resultTitle: "Your result",
        resultPlaceholder: "Your prediction will appear here.",
        disclaimer: "This prediction combines genuine state-wise crop rules with Machine Learning. Always verify field conditions before irrigating.",
        irrigate: "IRRIGATE — Water Needed",
        monitor: "MONITOR — Do Not Irrigate Yet",
        noIrrigate: "DO NOT IRRIGATE — Soil Wet Enough",
        probability: "Probability of irrigation needed",
        loading: "Evaluating state rules & ML prediction...",
        error: "Could not get a prediction. Please check your inputs.",
        modelInfoTitle: "Model & Dataset Specifications",
        infoCrop: "Active Crop",
        infoAlgorithm: "Algorithm",
        infoDataset: "Dataset Source",
        infoRecords: "Total Samples",
        infoAccuracy: "Accuracy",
        infoPrecision: "Decision Source",
        infoDate: "Status"
    },

    hi: {
        title: "स्मार्ट सिंचाई योजनाकार",
        subtitle: "बेहतर खेती के लिए आसान सहायता",
        languageLabel: "भाषा चुनें",
        welcome: "अपने खेत की स्थिति देखें",
        intro: "अपनी फसल और सेंसर की रीडिंग भरें।",
        formTitle: "फसल और मिट्टी का विवरण",
        stateLabel: "चरण 1: राज्य या केंद्र शासित प्रदेश चुनें",
        cropLabel: "चरण 2: फसल चुनें",
        btnLocation: "पहचानें",
        daysLabel: "फसल की उम्र (दिन)",
        moistureLabel: "मिट्टी की नमी (% फ़ील्ड क्षमता)",
        moistureHelp: "सेंसर की रीडिंग भरें (0 - 100%)।",
        moistureRiceLabel: "पानी का स्तर (सेमी, मिट्टी की सतह के सापेक्ष)",
        moistureRiceHelp: "धान में पानी का स्तर (-25 से +5 सेमी)।",
        soilTempLabel: "मिट्टी का तापमान",
        airTempLabel: "हवा का तापमान",
        humidityLabel: "सापेक्ष आर्द्रता",
        rainfall7dLabel: "पिछले 7 दिनों में वर्षा (मिमी) *",
        rainfall7dHelp: "अनिवार्य। 10 मिमी या अधिक होने पर सिंचाई रोक दी जाती है।",
        forecast24hLabel: "अगले 24 घंटों में अनुमानित वर्षा (मिमी)",
        forecast24hHelp: "वैकल्पिक (डिफ़ॉल्ट 0 मिमी)।",
        unitWarning: "एमएल भविष्यवाणी के लिए तापमान को सेल्सियस में बदला जाता है।",
        predict: "सिंचाई की जाँच करें",
        resultTitle: "आपका परिणाम",
        resultPlaceholder: "आपकी भविष्यवाणी यहाँ दिखाई देगी।",
        disclaimer: "यह राज्य-वार कृषि नियमों और मशीन लर्निंग पर आधारित परिणाम है।",
        irrigate: "सिंचाई करें — पानी की आवश्यकता है",
        monitor: "निगरानी रखें — अभी सिंचाई न करें",
        noIrrigate: "सिंचाई न करें — मिट्टी में पर्याप्त नमी है",
        probability: "सिंचाई की आवश्यकता की संभावना",
        loading: "राज्य के नियमों और मॉडल द्वारा जाँच की जा रही है...",
        error: "अनुमान नहीं मिल सका। कृपया जानकारी जाँचें।",
        modelInfoTitle: "मॉडल एवं डेटासेट विनिर्देश",
        infoCrop: "चयनित फसल",
        infoAlgorithm: "एल्गोरिथम",
        infoDataset: "डेटासेट स्रोत",
        infoRecords: "कुल नमूने",
        infoAccuracy: "सटीकता (Accuracy)",
        infoPrecision: "निर्णय का आधार",
        infoDate: "स्थिति"
    },

    pa: {
        title: "ਸਮਾਰਟ ਸਿੰਚਾਈ ਯੋਜਨਾਕਾਰ",
        subtitle: "ਬਿਹਤਰ ਖੇਤੀ ਲਈ ਆਸਾਨ ਮਦਦ",
        languageLabel: "ਭਾਸ਼ਾ ਚੁਣੋ",
        welcome: "ਆਪਣੇ ਖੇਤ ਦੀ ਸਥਿਤੀ ਵੇਖੋ",
        intro: "ਆਪਣੀ ਫ਼ਸਲ ਅਤੇ ਸੈਂਸਰ ਦੀਆਂ ਰੀਡਿੰਗਾਂ ਭਰੋ।",
        formTitle: "ਫ਼ਸਲ ਅਤੇ ਮਿੱਟੀ ਦਾ ਵੇਰਵਾ",
        stateLabel: "ਕਦਮ 1: ਰਾਜ ਜਾਂ ਕੇਂਦਰ ਸ਼ਾਸਿਤ ਪ੍ਰਦੇਸ਼ ਚੁਣੋ",
        cropLabel: "ਕਦਮ 2: ਫ਼ਸਲ ਚੁਣੋ",
        btnLocation: "ਖੋਜੋ",
        daysLabel: "ਫ਼ਸਲ ਦੀ ਉਮਰ (ਦਿਨ)",
        moistureLabel: "ਮਿੱਟੀ ਦੀ ਨਮੀ (% ਫੀਲਡ ਸਮਰੱਥਾ)",
        moistureHelp: "ਸੈਂਸਰ ਦੀ ਰੀਡਿੰਗ ਭਰੋ (0 - 100%)।",
        moistureRiceLabel: "ਪਾਣੀ ਦਾ ਪੱਧਰ (ਸੈਂਟੀਮੀਟਰ)",
        moistureRiceHelp: "ਮਿੱਟੀ ਦੀ ਸਤ੍ਹਾ ਅਨੁਸਾਰ ਪਾਣੀ ਦਾ ਪੱਧਰ (-25 ਤੋਂ +5 ਸੈਂਟੀਮੀਟਰ)।",
        soilTempLabel: "ਮਿੱਟੀ ਦਾ ਤਾਪਮਾਨ",
        airTempLabel: "ਹਵਾ ਦਾ ਤਾਪਮਾਨ",
        humidityLabel: "ਸਾਪੇਖ ਨਮੀ",
        rainfall7dLabel: "ਪਿਛਲੇ 7 ਦਿਨਾਂ ਵਿੱਚ ਮੀਂਹ (ਮਿਲੀਮੀਟਰ) *",
        rainfall7dHelp: "ਲਾਜ਼ਮੀ। ਜੇਕਰ 10 ਮਿਲੀਮੀਟਰ ਜਾਂ ਵੱਧ ਹੈ, ਤਾਂ ਸਿੰਚਾਈ ਰੋਕੀ ਜਾਂਦੀ ਹੈ।",
        forecast24hLabel: "ਅਗਲੇ 24 ਘੰਟਿਆਂ ਵਿੱਚ ਮੀਂਹ ਦਾ ਅਨੁਮਾਨ (ਮਿਲੀਮੀਟਰ)",
        forecast24hHelp: "ਵਿਕਲਪਿਕ (ਮੂਲ 0 ਮਿਲੀਮੀਟਰ)।",
        unitWarning: "ਅਨੁਮਾਨ ਲਈ ਤਾਪਮਾਨ ਸੈਲਸੀਅਸ ਵਿੱਚ ਬਦਲਿਆ ਜਾਂਦਾ ਹੈ।",
        predict: "ਸਿੰਚਾਈ ਦੀ ਜਾਂਚ ਕਰੋ",
        resultTitle: "ਤੁਹਾਡਾ ਨਤੀਜਾ",
        resultPlaceholder: "ਤੁਹਾਡਾ ਅਨੁਮਾਨ ਇੱਥੇ ਦਿਖਾਈ ਦੇਵੇਗਾ।",
        disclaimer: "ਇਹ ਫ਼ੈਸਲਾ ਰਾਜ-ਵਾਰ ਨਿਯਮਾਂ ਅਤੇ ਮਸ਼ੀਨ ਲਰਨਿੰਗ 'ਤੇ ਆਧਾਰਿਤ ਹੈ।",
        irrigate: "ਸਿੰਚਾਈ ਕਰੋ — ਪਾਣੀ ਦੀ ਲੋੜ ਹੈ",
        monitor: "ਨਿਗਰਾਨੀ ਰੱਖੋ — ਹਾਲੇ ਪਾਣੀ ਨਾ ਦਿਓ",
        noIrrigate: "ਸਿੰਚਾਈ ਨਾ ਕਰੋ — ਪਾਣੀ ਕਾਫ਼ੀ ਹੈ",
        probability: "ਸਿੰਚਾਈ ਦੀ ਲੋੜ ਦੀ ਸੰਭਾਵਨਾ",
        loading: "ਨਿਯਮਾਂ ਅਤੇ ਮਾਡਲ ਅਨੁਸਾਰ ਜਾਂਚ ਹੋ ਰਹੀ ਹੈ...",
        error: "ਅਨੁਮਾਨ ਨਹੀਂ ਮਿਲਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਜਾਣਕਾਰੀ ਜਾਂਚੋ।",
        modelInfoTitle: "ਮਾਡਲ ਅਤੇ ਡਾਟਾਸੈੱਟ ਵੇਰਵੇ",
        infoCrop: "ਫ਼ਸਲ",
        infoAlgorithm: "ਐਲਗੋਰਿਦਮ",
        infoDataset: "ਡਾਟਾਸੈੱਟ ਸਰੋਤ",
        infoRecords: "ਕੁੱਲ ਰਿਕਾਰਡ",
        infoAccuracy: "ਸ਼ੁੱਧਤਾ",
        infoPrecision: "ਫ਼ੈਸਲੇ ਦਾ ਆਧਾਰ",
        infoDate: "ਸਥਿਤੀ"
    },

    te: {
        title: "స్మార్ట్ సాగునీటి ప్రణాళిక",
        subtitle: "మెరుగైన వ్యవసాయం కోసం సులభమైన సహాయం",
        languageLabel: "భాషను ఎంచుకోండి",
        welcome: "మీ పొలం పరిస్థితిని తనిఖీ చేద్దాం",
        intro: "మీ పంట మరియు సెన్సార్ రీడింగులను నమోదు చేయండి.",
        formTitle: "పంట మరియు నేల వివరాలు",
        stateLabel: "దశ 1: రాష్ట్రం లేదా కేంద్రపాలిత ప్రాంతాన్ని ఎంచుకోండి",
        cropLabel: "దశ 2: పంటను ఎంచుకోండి",
        btnLocation: "గుర్తించు",
        daysLabel: "పంట వయస్సు (రోజులు)",
        moistureLabel: "నేల తేమ శాతం (ఫీల్డ్ కెపాసిటీ %)",
        moistureHelp: "సెన్సార్ రీడింగ్‌ను నమోదు చేయండి (0 - 100%).",
        moistureRiceLabel: "వరి నీటి మట్టం (సెం.మీ)",
        moistureRiceHelp: "నేల ఉపరితలం ప్రకారం నీటి మట్టం (-25 నుండి +5 సెం.మీ).",
        soilTempLabel: "నేల ఉష్ణోగ్రత",
        airTempLabel: "గాలి ఉష్ణోగ్రత",
        humidityLabel: "సాపేక్ష ఆర్ద్రత",
        rainfall7dLabel: "గడచిన 7 రోజులలో వర్షపాతం (మి.మీ) *",
        rainfall7dHelp: "తప్పనిసరి. 10 మి.మీ లేదా అంతకంటే ఎక్కువ ఉంటే నీరు పెట్టరాదు.",
        forecast24hLabel: "రాబోయే 24 గంటల్లో వర్ష సూచన (మి.మీ)",
        forecast24hHelp: "ఐచ్ఛికం (డిఫాల్ట్ 0 మి.మీ).",
        unitWarning: "మోడల్ అంచనా కోసం ఉష్ణోగ్రత సెల్సియస్‌లోకి మార్చబడుతుంది.",
        predict: "సాగునీటి అవసరాన్ని తనిఖీ చేయండి",
        resultTitle: "మీ ఫలితం",
        resultPlaceholder: "మీ అంచనా ఇక్కడ కనిపిస్తుంది.",
        disclaimer: "ఇది రాష్ట్ర వారీ పంట నియమాలు మరియు మెషిన్ లెర్నింగ్ ఆధారిత ఫలితం.",
        irrigate: "నీరు పెట్టండి — సాగునీరు అవసరం",
        monitor: "పర్యవేక్షించండి — ప్రస్తుతం నీరు అవసరం లేదు",
        noIrrigate: "నీరు పెట్టవద్దు — నేలలో తగినంత తేమ ఉంది",
        probability: "సాగునీటి అవసర సంభావ్యత",
        loading: "నియమాలు మరియు మోడల్ ద్వారా పరిశీలించబడుతోంది...",
        error: "అంచనా పొందలేకపోయాము. దయచేసి వివరాలను సరిచూడండి.",
        modelInfoTitle: "మోడల్ మరియు డేటాసెట్ వివరాలు",
        infoCrop: "ఎంచుకున్న పంట",
        infoAlgorithm: "అల్గారిథమ్",
        infoDataset: "డేటా మూలం",
        infoRecords: "మొత్తం రికార్డులు",
        infoAccuracy: "ఖచ్చితత్వం",
        infoPrecision: "నిర్ణయ మూలం",
        infoDate: "స్థితి"
    }
};

const cropIcons = {
    "rice": "🌾",
    "paddy": "🌾",
    "wheat": "🌾",
    "maize": "🌽",
    "corn": "🌽",
    "cotton": "⚪",
    "sugarcane": "🎋",
    "groundnut": "🥜",
    "groundnuts": "🥜",
    "peanut": "🥜",
    "soybean": "🌱",
    "mustard": "🌼",
    "millets": "🌾",
    "bajra": "🌾",
    "jowar": "🌾",
    "tomato": "🍅",
    "chilli": "🌶️",
    "chili": "🌶️",
    "potato": "🥔",
    "onion": "🧅",
    "banana": "🍌",
    "mango": "🥭",
    "apple": "🍎",
    "tea": "🍵",
    "coffee": "☕",
    "coconut": "🥥",
    "rubber": "🌳",
    "spices": "🌿",
    "vegetables": "🥬",
    "pulses": "🫘",
    "barley": "🌾"
};

// Global state variables
let availableStates = [];
let currentCrops = [];
let selectedCropData = null;

// DOM Elements
const languageSelect = document.getElementById("language");
const stateSelect = document.getElementById("state_select");
const cropSelect = document.getElementById("crop_type");
const btnLocation = document.getElementById("btnDetectLocation");
const cropRangeCard = document.getElementById("cropRangeCard");
const irrigationForm = document.getElementById("irrigationForm");
const predictButton = document.getElementById("predictButton");
const resultBox = document.getElementById("result");
const cropIcon = document.getElementById("cropIcon");

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function getCropIcon(cropName) {
    if (!cropName) return "🌱";
    const lower = cropName.toLowerCase();
    for (const [k, icon] of Object.entries(cropIcons)) {
        if (lower.includes(k)) return icon;
    }
    return "🌱";
}

// ----------------------------------------------------
// Step 1: Load and populate states
// ----------------------------------------------------
async function loadStates() {
    try {
        const response = await fetch("/api/states");
        const data = await response.json();
        availableStates = data.states || [];

        stateSelect.innerHTML = '<option value="">-- Choose your State or UT --</option>';
        availableStates.forEach(state => {
            const opt = document.createElement("option");
            opt.value = state;
            opt.textContent = state;
            stateSelect.appendChild(opt);
        });

        // Default to Punjab for convenience or first state
        if (availableStates.includes("Punjab")) {
            stateSelect.value = "Punjab";
            loadCropsForState("Punjab");
        }
    } catch (err) {
        console.error("Error loading states:", err);
    }
}

// ----------------------------------------------------
// Step 2: Load crops for chosen state
// ----------------------------------------------------
async function loadCropsForState(stateName) {
    if (!stateName) {
        cropSelect.innerHTML = '<option value="">-- Select a state first --</option>';
        cropSelect.disabled = true;
        cropRangeCard.style.display = "none";
        selectedCropData = null;
        return;
    }

    cropSelect.disabled = true;
    cropSelect.innerHTML = '<option value="">Loading crops...</option>';

    try {
        const response = await fetch(`/api/crops?state=${encodeURIComponent(stateName)}`);
        const data = await response.json();
        currentCrops = data.crops || [];

        cropSelect.innerHTML = "";
        currentCrops.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.crop;
            opt.textContent = `${getCropIcon(c.crop)} ${c.label}`;
            cropSelect.appendChild(opt);
        });

        cropSelect.disabled = false;

        // Select first crop by default
        if (currentCrops.length > 0) {
            cropSelect.value = currentCrops[0].crop;
            onCropSelected(currentCrops[0]);
        }
    } catch (err) {
        console.error("Error loading crops:", err);
        cropSelect.innerHTML = '<option value="">Failed to load crops</option>';
    }
}

// ----------------------------------------------------
// Step 3: Display Decision Zones for selected crop
// ----------------------------------------------------
function onCropSelected(cropData) {
    if (!cropData) return;
    selectedCropData = cropData;

    const cropName = cropData.crop;
    const isRice = (cropName === "Rice");
    const stateName = stateSelect.value;
    const trigger = cropData.irrigation_trigger;
    const wetLimit = cropData.no_irrigation_from;
    const unit = cropData.reading_unit;

    if (cropIcon) {
        cropIcon.textContent = getCropIcon(cropName);
    }

    // Step 3 Range Card Update
    cropRangeCard.style.display = "block";
    cropRangeCard.classList.add("has-data");
    setText("rangeCropTitle", `${getCropIcon(cropName)} ${cropData.label} in ${stateName}`);

    const segIrr = document.getElementById("segIrrigate");
    const segMon = document.getElementById("segMonitor");
    const segNoIrr = document.getElementById("segNoIrrigate");

    if (isRice) {
        // Rice: water level -25 to +5 cm (total span 30 cm)
        // Irrigate: -25 to -15 cm (10 cm = 33.3% or 50% visual balance)
        // Do Not Irrigate: -15 to +5 cm (20 cm = 66.7%)
        setText(
            "rangeSummaryText",
            `Irrigate: water level -25 to -15 cm | No need: above -15 to +5 cm (${unit})`
        );
        segIrr.style.width = "40%";
        segIrr.textContent = "IRRIGATE (≤ -15 cm)";
        segMon.style.display = "none";
        segNoIrr.style.width = "60%";
        segNoIrr.textContent = "DO NOT IRRIGATE (> -15 cm)";

        setText("lblMin", "-25 cm");
        setText("lblTrigger", "-15 cm (Trigger)");
        setText("lblWetLimit", "");
        setText("lblMax", "+5 cm");
    } else {
        // Normal crops: 0 to 100% of field capacity
        const irrPct = Math.max(10, Math.min(80, trigger));
        const monPct = Math.max(10, Math.min(80, wetLimit - trigger));
        const noIrrPct = Math.max(10, 100 - wetLimit);

        setText(
            "rangeSummaryText",
            `Irrigate: 0–${trigger}% | Monitor: ${trigger}–${wetLimit}% | No need: ${wetLimit}–100% (${unit})`
        );
        segIrr.style.width = `${irrPct}%`;
        segIrr.textContent = `IRRIGATE (≤ ${trigger}%)`;
        segMon.style.display = "flex";
        segMon.style.width = `${monPct}%`;
        segMon.textContent = `MONITOR (${trigger}–${wetLimit}%)`;
        segNoIrr.style.width = `${noIrrPct}%`;
        segNoIrr.textContent = `DO NOT IRRIGATE (≥ ${wetLimit}%)`;

        setText("lblMin", "0%");
        setText("lblTrigger", `${trigger}% (Trigger)`);
        setText("lblWetLimit", `${wetLimit}% (Wet)`);
        setText("lblMax", "100%");
    }

    // Step 4: Adapt sensor reading input label and range
    const readingLabel = document.getElementById("sensorReadingLabel");
    const readingInput = document.getElementById("soil_moisture");
    const readingHelp = document.getElementById("sensorReadingHelp");
    const readingSuffix = document.getElementById("sensorReadingSuffix");
    const readingIcon = document.getElementById("sensorReadingIcon");

    const lang = languageSelect ? languageSelect.value : "en";
    const dict = translations[lang] || translations.en;

    if (isRice) {
        if (readingLabel) readingLabel.textContent = dict.moistureRiceLabel || "Water level (cm relative to soil surface, -25 to +5)";
        if (readingInput) {
            readingInput.min = "-25";
            readingInput.max = "5";
            readingInput.placeholder = "e.g. -12.0";
        }
        if (readingHelp) readingHelp.textContent = dict.moistureRiceHelp || "Enter water level relative to soil surface (-25 to +5 cm).";
        if (readingSuffix) readingSuffix.textContent = "cm";
        if (readingIcon) readingIcon.textContent = "📏";
    } else {
        if (readingLabel) readingLabel.textContent = dict.moistureLabel || "Soil moisture (% of field capacity, 0-100)";
        if (readingInput) {
            readingInput.min = "0";
            readingInput.max = "100";
            readingInput.placeholder = "e.g. 35.0";
        }
        if (readingHelp) readingHelp.textContent = dict.moistureHelp || "Enter sensor reading (0 - 100% of field capacity).";
        if (readingSuffix) readingSuffix.textContent = "%";
        if (readingIcon) readingIcon.textContent = "🪴";
    }

    // Update Model info card specifications
    setText("infoCropName", `${cropData.label} (${stateName})`);
    setText("infoDataset", `India Ranges (${cropData.source || "Official"})`);
}

// ----------------------------------------------------
// Event Listeners for State & Crop
// ----------------------------------------------------
if (stateSelect) {
    stateSelect.addEventListener("change", () => {
        loadCropsForState(stateSelect.value);
    });
}

if (cropSelect) {
    cropSelect.addEventListener("change", () => {
        const found = currentCrops.find(c => c.crop === cropSelect.value);
        if (found) onCropSelected(found);
    });
}

// Geolocation guess
if (btnLocation) {
    btnLocation.addEventListener("click", () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }
        btnLocation.textContent = "Locating...";
        navigator.geolocation.getCurrentPosition(
            () => {
                // If location permitted, default to Punjab or keep current
                if (!stateSelect.value && availableStates.includes("Punjab")) {
                    stateSelect.value = "Punjab";
                    loadCropsForState("Punjab");
                }
                btnLocation.innerHTML = '<span>📍</span> <span>Detected</span>';
            },
            () => {
                btnLocation.innerHTML = '<span>📍</span> <span>Detect</span>';
                alert("Could not detect exact location. Please select your State from the dropdown.");
            },
            { timeout: 6000 }
        );
    });
}

// ----------------------------------------------------
// Multi-Unit Conversion Helper
// ----------------------------------------------------
function toCelsius(value, unit) {
    if (unit === "F") return (value - 32) * 5 / 9;
    if (unit === "K") return value - 273.15;
    return value;
}

function updateSensorCards() {
    const moisture = document.getElementById("soil_moisture") ? document.getElementById("soil_moisture").value : "";
    const airTemperature = document.getElementById("temperature") ? document.getElementById("temperature").value : "";
    const airUnit = document.getElementById("air_temp_unit") ? document.getElementById("air_temp_unit").value : "C";
    const humidity = document.getElementById("humidity") ? document.getElementById("humidity").value : "";

    const isRice = selectedCropData && selectedCropData.crop === "Rice";
    const unitSuffix = isRice ? " cm" : "%";

    setText("heroMoisture", moisture !== "" ? `${moisture}${unitSuffix}` : "--");

    if (airTemperature !== "") {
        const celsius = toCelsius(Number(airTemperature), airUnit);
        setText("heroTemperature", `${celsius.toFixed(1)} °C`);
    } else {
        setText("heroTemperature", "-- °C");
    }

    setText("heroHumidity", humidity !== "" ? `${humidity}%` : "--%");
}

["soil_moisture", "temperature", "air_temp_unit", "humidity"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener("input", updateSensorCards);
        el.addEventListener("change", updateSensorCards);
    }
});

// ----------------------------------------------------
// Form Submission: Execute Prediction & Rule Decision
// ----------------------------------------------------
if (irrigationForm) {
    irrigationForm.addEventListener("submit", async event => {
        event.preventDefault();

        const language = languageSelect ? languageSelect.value : "en";
        const text = translations[language] || translations.en;

        const stateVal = stateSelect ? stateSelect.value : "";
        const cropVal = cropSelect ? cropSelect.value : "";

        if (!stateVal) {
            alert("Please select a State or Union Territory first.");
            return;
        }
        if (!cropVal) {
            alert("Please select a Crop first.");
            return;
        }

        const value = id => Number(document.getElementById(id).value);

        const payload = {
            state: stateVal,
            crop: cropVal,
            crop_age_days: value("crop_days"),
            sensor_reading: value("soil_moisture"),
            soil_temp: value("soil_temperature"),
            soil_temp_unit: document.getElementById("soil_temp_unit").value,
            air_temp: value("temperature"),
            air_temp_unit: document.getElementById("air_temp_unit").value,
            humidity: value("humidity"),
            rainfall_7d: value("rainfall_7d"),
            forecast_24h: document.getElementById("forecast_24h").value !== "" ? value("forecast_24h") : 0.0,
        };

        predictButton.disabled = true;
        resultBox.textContent = text.loading;
        setText("predictionTitle", text.loading);
        setText("predictionDescription", "Evaluating field sensor telemetry against decision zones...");
        setText("statusIcon", "⏳");

        const banner = document.getElementById("predictionBanner");
        if (banner) {
            banner.classList.remove("status-irrigate", "status-monitor", "status-no-irrigate");
        }

        const bar = document.getElementById("probabilityBar");
        const probabilityValue = document.getElementById("probabilityValue");
        const track = document.getElementById("probabilityTrack");
        const ruleAlert = document.getElementById("ruleOverrideAlert");
        const gaugeCard = document.getElementById("resultGaugeCard");

        if (bar) bar.style.width = "0%";
        if (probabilityValue) probabilityValue.textContent = "--%";
        if (track) track.setAttribute("aria-valuenow", "0");
        if (ruleAlert) ruleAlert.style.display = "none";
        if (gaugeCard) gaugeCard.style.display = "none";

        try {
            const response = await fetch("/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || text.error);
            }

            const status = data.status; // "IRRIGATE", "MONITOR", or "DO NOT IRRIGATE"
            const needsIrrigation = (status === "IRRIGATE");
            const isMonitor = (status === "MONITOR");

            // Probability from ML
            const probability = Math.max(0, Math.min(100, Number(data.confidence_pct || 0)));

            // 1. Status Banner Update
            let statusTitle = text.noIrrigate;
            let statusIconEmoji = "🌿";

            if (needsIrrigation) {
                statusTitle = text.irrigate;
                statusIconEmoji = "💧";
            } else if (isMonitor) {
                statusTitle = text.monitor;
                statusIconEmoji = "🔍";
            }

            setText("predictionTitle", statusTitle);
            setText("predictionDescription", data.reason || text.noDescription);
            setText("statusIcon", statusIconEmoji);

            if (banner) {
                banner.classList.remove("status-irrigate", "status-monitor", "status-no-irrigate");
                if (needsIrrigation) {
                    banner.classList.add("status-irrigate");
                } else if (isMonitor) {
                    banner.classList.add("status-monitor");
                } else {
                    banner.classList.add("status-no-irrigate");
                }
            }

            // 2. Rule Override Alert
            if (data.rule_override && ruleAlert) {
                ruleAlert.style.display = "flex";
                setText(
                    "ruleOverrideText",
                    `Range rule priority applied: Ranges CSV dictates "${status}", overriding raw ML classification.`
                );
            }

            // 3. Zone Gauge / Marker Update
            if (gaugeCard && selectedCropData) {
                gaugeCard.style.display = "block";
                const isRice = (selectedCropData.crop === "Rice");
                const reading = Number(data.sensor_reading);
                const trigger = Number(selectedCropData.irrigation_trigger);
                const wetLimit = Number(selectedCropData.no_irrigation_from);

                const gSegIrr = document.getElementById("gaugeSegIrrigate");
                const gSegMon = document.getElementById("gaugeSegMonitor");
                const gSegNoIrr = document.getElementById("gaugeSegNoIrrigate");
                const pointer = document.getElementById("gaugePointer");
                const pointerLabel = document.getElementById("gaugePointerLabel");

                let pointerPct = 0;

                if (isRice) {
                    // -25 to +5 cm
                    setText("gaugeReadingText", `Paddy Water Level: ${reading.toFixed(1)} cm`);
                    gSegIrr.style.width = "40%";
                    gSegIrr.textContent = "IRRIGATE (≤ -15 cm)";
                    gSegMon.style.display = "none";
                    gSegNoIrr.style.width = "60%";
                    gSegNoIrr.textContent = "DO NOT IRRIGATE (> -15 cm)";

                    setText("gaugeLblMin", "-25 cm");
                    setText("gaugeLblTrigger", "-15 cm");
                    setText("gaugeLblWetLimit", "");
                    setText("gaugeLblMax", "+5 cm");

                    pointerPct = Math.max(0, Math.min(100, ((reading - (-25)) / (5 - (-25))) * 100));
                    if (pointerLabel) pointerLabel.textContent = `${reading.toFixed(1)} cm`;
                } else {
                    setText("gaugeReadingText", `Soil Moisture: ${reading.toFixed(1)}%`);
                    const irrW = Math.max(10, Math.min(80, trigger));
                    const monW = Math.max(10, Math.min(80, wetLimit - trigger));
                    const noIrrW = Math.max(10, 100 - wetLimit);

                    gSegIrr.style.width = `${irrW}%`;
                    gSegIrr.textContent = `IRRIGATE (≤ ${trigger}%)`;
                    gSegMon.style.display = "flex";
                    gSegMon.style.width = `${monW}%`;
                    gSegMon.textContent = `MONITOR (${trigger}–${wetLimit}%)`;
                    gSegNoIrr.style.width = `${noIrrW}%`;
                    gSegNoIrr.textContent = `DO NOT IRRIGATE (≥ ${wetLimit}%)`;

                    setText("gaugeLblMin", "0%");
                    setText("gaugeLblTrigger", `${trigger}%`);
                    setText("gaugeLblWetLimit", `${wetLimit}%`);
                    setText("gaugeLblMax", "100%");

                    pointerPct = Math.max(0, Math.min(100, reading));
                    if (pointerLabel) pointerLabel.textContent = `${reading.toFixed(1)}%`;
                }

                if (pointer) {
                    requestAnimationFrame(() => {
                        pointer.style.left = `${pointerPct}%`;
                    });
                }
            }

            // 4. Progress Bar
            if (probabilityValue) probabilityValue.textContent = `${probability.toFixed(1)}%`;
            if (bar) {
                requestAnimationFrame(() => {
                    bar.style.width = `${probability}%`;
                });
            }
            if (track) track.setAttribute("aria-valuenow", probability.toFixed(1));

            // 5. Result box disclaimer
            resultBox.textContent = data.disclaimer || text.disclaimer;

            // 6. Update Model specifications card
            if (data.model_info) {
                const info = data.model_info;
                setText("infoAlgorithm", info.algorithm || "--");
                setText("infoDataset", info.dataset_source || "--");
                setText("infoBadgeText", info.badge_text || "Trained on state-wise crop irrigation dataset (synthetic rule-based)");
                if (info.records_count) setText("infoRecords", `${info.records_count.toLocaleString()} records`);
            }

            updateSensorCards();

        } catch (error) {
            setText("predictionTitle", text.error);
            setText("predictionDescription", error.message || text.error);
            setText("statusIcon", "⚠️");
            resultBox.textContent = error.message || text.error;
        } finally {
            predictButton.disabled = false;
        }
    });
}

// ----------------------------------------------------
// Language Switcher
// ----------------------------------------------------
function setLanguage(lang) {
    const dictionary = translations[lang] || translations.en;
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.dataset.i18n;
        if (dictionary[key]) {
            el.textContent = dictionary[key];
        }
    });

    if (selectedCropData) {
        onCropSelected(selectedCropData);
    }
}

if (languageSelect) {
    languageSelect.addEventListener("change", () => {
        setLanguage(languageSelect.value);
    });
}

// Initial bootstrap
loadStates();
