/**
 * AgriSaathi - AI Agricultural Assistant Frontend Interface
 * Complete Multilingual Support for English, Hindi, Punjabi, and Telugu.
 * Supports auto-detection, manual selection, persistence, and mixed-language conversations.
 */

(function () {
    "use strict";

    // Storage keys for language preference and persistent conversation history
    const STORAGE_LANG_KEY = "agri_saathi_lang_pref";
    const STORAGE_HISTORY_KEY = "agri_saathi_chat_history_v1";
    const STORAGE_ACTIVE_ID_KEY = "agri_saathi_active_conv_id";

    // Comprehensive Multilingual Dictionary
    const chatTranslations = {
        auto: {
            title: "AgriSaathi",
            subtitle: "Multilingual AI Agricultural Assistant",
            welcome: "Hello! I am <strong>AgriSaathi</strong> (एग्री साथी / ਐਗਰੀ ਸਾਥੀ / అగ్రి సాథి). Ask me any farming question in English, हिन्दी, ਪੰਜਾਬੀ, or తెలుగు!",
            suggestionsTitle: "Suggested questions / सुझाए गए प्रश्न / ਸੁਝਾਏ ਸਵਾਲ / సూచించిన ప్రశ్నలు:",
            questions: [
                "💧 How can I save irrigation water?",
                "🪴 मिट्टी की नमी (Soil Moisture) की जांच कैसे करें?",
                "🌾 ਝੋਨੇ ਵਿੱਚ ਪਾਣੀ ਦੀ ਬੱਚਤ ਕਿਵੇਂ ਕਰੀਏ?",
                "🌱 వరి పంటలో నీటి యాజమాన్యం ఎలా చేయాలి?"
            ],
            placeholder: "Ask in English, हिन्दी, ਪੰਜਾਬੀ, or తెలుగు...",
            typing: "AgriSaathi is thinking...",
            networkError: "Unable to reach AgriSaathi right now. Please check your connection and try again.",
            openAria: "Open AgriSaathi Multilingual Agricultural Chatbot",
            closeAria: "Close AgriSaathi Chat",
            clearAria: "Clear chat session / चैट साफ़ करें",
            historyBtn: "Chat History / बातचीत इतिहास",
            newChatBtn: "New Chat / नई बातचीत",
            historyTitle: "Conversation History / बातचीत इतिहास",
            noHistory: "No previous conversations yet. Start chatting to save your history!",
            clearAllHistory: "Clear All History / पूरा इतिहास साफ़ करें",
            clearAllConfirm: "Are you sure you want to delete all saved conversations? This cannot be undone.",
            clearConvBtn: "Clear conversation / बातचीत साफ़ करें",
            clearConvConfirm: "Clear all messages in the current conversation? / क्या आप वर्तमान बातचीत साफ़ करना चाहते हैं?",
            deleteChat: "Delete conversation",
            backToChat: "Back to Chat",
            today: "Today",
            yesterday: "Yesterday",
            messagesCount: "msgs"
        },
        en: {
            title: "AgriSaathi",
            subtitle: "AI Agricultural Assistant",
            welcome: "Hello! I am <strong>AgriSaathi</strong>, your AI farming companion. How can I assist you with your irrigation schedules, soil moisture, and crop health today?",
            suggestionsTitle: "Suggested questions:",
            questions: [
                "💧 How can I save irrigation water?",
                "🪴 Why is soil moisture critical for crops?",
                "🌾 What are the best irrigation practices for paddy?",
                "📊 Help me understand my irrigation prediction result."
            ],
            placeholder: "Ask AgriSaathi about crops or irrigation...",
            typing: "AgriSaathi is thinking...",
            networkError: "Unable to reach AgriSaathi right now. Please check your connection and try again.",
            openAria: "Open AgriSaathi AI Agricultural Chatbot",
            closeAria: "Close AgriSaathi Chat",
            clearAria: "Clear chat session",
            historyBtn: "Chat History",
            newChatBtn: "New Chat",
            historyTitle: "Conversation History",
            noHistory: "No previous conversations yet. Start chatting to save your history!",
            clearAllHistory: "Clear All History",
            clearAllConfirm: "Are you sure you want to delete all saved conversations? This cannot be undone.",
            clearConvBtn: "Clear conversation",
            clearConvConfirm: "Clear all messages in the current conversation?",
            deleteChat: "Delete conversation",
            backToChat: "Back to Chat",
            today: "Today",
            yesterday: "Yesterday",
            messagesCount: "msgs"
        },
        hi: {
            title: "एग्री साथी (AgriSaathi)",
            subtitle: "एआई कृषि सलाहकार",
            welcome: "नमस्ते किसान भाई! मैं हूँ <strong>एग्री साथी (AgriSaathi)</strong>, आपका डिजिटल कृषि सलाहकार। आज मैं सिंचाई, मिट्टी की नमी, या फसल स्वास्थ्य संबंधी किस कार्य में आपकी मदद कर सकता हूँ?",
            suggestionsTitle: "सुझाए गए प्रश्न:",
            questions: [
                "💧 धान में पानी की बचत कैसे करें?",
                "🪴 मिट्टी की नमी (Soil Moisture) क्यों महत्वपूर्ण है?",
                "🌾 धान की फसल में सिंचाई का सही समय क्या है?",
                "📊 मेरे सिंचाई परिणाम को समझने में सहायता करें।"
            ],
            placeholder: "फसल, सिंचाई या मिट्टी के बारे में पूछें...",
            typing: "एग्री साथी सोच रहा है...",
            networkError: "इस समय एग्री साथी से संपर्क नहीं हो पा रहा है। कृपया कुछ देर बाद प्रयास करें।",
            openAria: "एग्री साथी चैटबॉट खोलें",
            closeAria: "एग्री साथी चैट बंद करें",
            clearAria: "चैट सत्र साफ़ करें",
            historyBtn: "बातचीत इतिहास",
            newChatBtn: "नई चैट शुरू करें",
            historyTitle: "बातचीत इतिहास",
            noHistory: "अभी कोई पिछली बातचीत नहीं है। सहेजने के लिए बातचीत शुरू करें!",
            clearAllHistory: "पूरा इतिहास साफ़ करें",
            clearAllConfirm: "क्या आप वाकई सभी सहेजी गई बातचीत हटाना चाहते हैं? यह वापस नहीं लाया जा सकता।",
            clearConvBtn: "बातचीत साफ़ करें",
            clearConvConfirm: "क्या आप वर्तमान बातचीत के सभी संदेश साफ़ करना चाहते हैं?",
            deleteChat: "बातचीत हटाएं",
            backToChat: "चैट पर वापस जाएं",
            today: "आज",
            yesterday: "कल",
            messagesCount: "संदेश"
        },
        pa: {
            title: "ਐਗਰੀ ਸਾਥੀ (AgriSaathi)",
            subtitle: "ਏਆਈ ਖੇਤੀਬਾੜੀ ਸਹਾਇਕ",
            welcome: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰੋ! ਮੈਂ ਹਾਂ <strong>ਐਗਰੀ ਸਾਥੀ (AgriSaathi)</strong>, ਤੁਹਾਡਾ ਸਮਾਰਟ ਖੇਤੀਬਾੜੀ ਸਹਾਇਕ। ਸਿੰਚਾਈ, ਮਿੱਟੀ ਦੀ ਸਿਹਤ ਜਾਂ ਫ਼ਸਲਾਂ ਸੰਬੰਧੀ ਮੈਂ ਤੁਹਾਡੀ ਕੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
            suggestionsTitle: "ਸੁਝਾਏ ਗਏ ਸਵਾਲ:",
            questions: [
                "💧 ਝੋਨੇ ਵਿੱਚ ਸਿੰਚਾਈ ਪਾਣੀ ਦੀ ਬੱਚਤ ਕਿਵੇਂ ਕਰੀਏ?",
                "🪴 ਮਿੱਟੀ ਦੀ ਨਮੀ (Soil Moisture) ਫ਼ਸਲ ਲਈ ਕਿਉਂ ਜ਼ਰੂਰੀ ਹੈ?",
                "🌾 ਝੋਨੇ ਨੂੰ ਪਾਣੀ ਕਦੋਂ ਅਤੇ ਕਿੰਨਾ ਦੇਣਾ ਚਾਹੀਦਾ ਹੈ?",
                "📊 ਮੇਰੇ ਸਿੰਚਾਈ ਨਤੀਜੇ ਨੂੰ ਸਮਝਣ ਵਿੱਚ ਮਦਦ ਕਰੋ।"
            ],
            placeholder: "ਫ਼ਸਲ ਜਾਂ ਸਿੰਚਾਈ ਬਾਰੇ ਪੁੱਛੋ...",
            typing: "ਐਗਰੀ ਸਾਥੀ ਸੋਚ ਰਿਹਾ ਹੈ...",
            networkError: "ਇਸ ਵੇਲੇ ਐਗਰੀ ਸਾਥੀ ਨਾਲ ਸੰਪਰਕ ਨਹੀਂ ਹੋ ਰਿਹਾ। ਕਿਰਪਾ ਕਰਕੇ ਥੋੜ੍ਹੀ ਦੇਰ ਬਾਅਦ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
            openAria: "ਐਗਰੀ ਸਾਥੀ ਚੈਟ ਖੋਲ੍ਹੋ",
            closeAria: "ਐਗਰੀ ਸਾਥੀ ਚੈਟ ਬੰਦ ਕਰੋ",
            clearAria: "ਚੈਟ ਸੈਸ਼ਨ ਸਾਫ਼ ਕਰੋ",
            historyBtn: "ਗੱਲਬਾਤ ਇਤਿਹਾਸ",
            newChatBtn: "ਨਵੀਂ ਚੈਟ ਸ਼ੁਰੂ ਕਰੋ",
            historyTitle: "ਗੱਲਬਾਤ ਇਤਿਹਾਸ",
            noHistory: "ਅਜੇ ਕੋਈ ਪਿਛਲੀ ਚੈਟ ਨਹੀਂ ਹੈ। ਗੱਲਬਾਤ ਸ਼ੁਰੂ ਕਰਕੇ ਇਤਿਹਾਸ ਬਣਾਓ!",
            clearAllHistory: "ਸਾਰਾ ਇਤਿਹਾਸ ਸਾਫ਼ ਕਰੋ",
            clearAllConfirm: "ਕੀ ਤੁਸੀਂ ਸੱਚਮੁੱਚ ਸਾਰੀ ਸੁਰੱਖਿਅਤ ਕੀਤੀ ਚੈਟ ਹਟਾਉਣਾ ਚਾਹੁੰਦੇ ਹੋ? ਇਹ ਵਾਪਸ ਨਹੀਂ ਲਿਆਂਦਾ ਜਾ ਸਕਦਾ।",
            clearConvBtn: "ਗੱਲਬਾਤ ਸਾਫ਼ ਕਰੋ",
            clearConvConfirm: "ਕੀ ਤੁਸੀਂ ਮੌਜੂਦਾ ਗੱਲਬਾਤ ਦੇ ਸਾਰੇ ਸੁਨੇਹੇ ਸਾਫ਼ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ?",
            deleteChat: "ਚੈਟ ਹਟਾਓ",
            backToChat: "ਚੈਟ 'ਤੇ ਵਾਪਸ ਜਾਓ",
            today: "ਅੱਜ",
            yesterday: "ਕੱਲ੍ਹ",
            messagesCount: "ਸੁਨੇਹੇ"
        },
        te: {
            title: "అగ్రి సాథి (AgriSaathi)",
            subtitle: "AI వ్యవసాయ సహాయకుడు",
            welcome: "నమస్కారం రైతు సోదరులారా! నేను <strong>అగ్రి సాథి (AgriSaathi)</strong>, మీ స్మార్ట్ వ్యవసాయ సలహాదారుని. సాగునీటి నిర్వహణ, నేల తేమ లేదా పంటల రక్షణ గురించి మీకు ఎలా సహాయపడగలను?",
            suggestionsTitle: "సూచించబడిన ప్రశ్నలు:",
            questions: [
                "💧 వరి పంటలో సాగునీటిని ఎలా ఆదా చేయవచ్చు?",
                "🪴 నేలలో తేమ శాతం (Soil Moisture) ఎందుకు ముఖ్యం?",
                "🌾 వరి లేదా వేరుశనగకు నీరు ఎప్పుడు పెట్టాలి?",
                "📊 నా నీటి పారుదల ఫలితాన్ని అర్థం చేసుకోవడానికి సహాయం చేయండి."
            ],
            placeholder: "పంటలు లేదా నీటి పారుదల గురించి అడగండి...",
            typing: "అగ్రి సాథి ఆలోచిస్తోంది...",
            networkError: "ప్రస్తుతం అగ్రి సాథిని సంప్రదించలేకపోతున్నాము. దయచేసి కాసేపటి తర్వాత ప్రయత్నించండి.",
            openAria: "అగ్రి సాథి చాట్ తెరవండి",
            closeAria: "అగ్రి సాథి చాట్ మూసివేయండి",
            clearAria: "చాట్ సెషన్‌ను క్లియర్ చేయండి",
            historyBtn: "చాట్ చరిత్ర",
            newChatBtn: "కొత్త చాట్ ప్రారంభించండి",
            historyTitle: "సంభాషణల చరిత్ర",
            noHistory: "ఇంకా మునుపటి సంభాషణలు లేవు. చరిత్రను సేవ్ చేయడానికి చాట్ ప్రారంభించండి!",
            clearAllHistory: "మొత్తం చరిత్రను క్లియర్ చేయండి",
            clearAllConfirm: "మీరు నిజంగా భద్రపరిచిన అన్ని సంభాషణలను తొలగించాలనుకుంటున్నారా? దీన్ని రద్దు చేయలేము.",
            clearConvBtn: "సంభాషణను క్లియర్ చేయండి",
            clearConvConfirm: "ప్రస్తుత సంభాషణలోని అన్ని సందేశాలను క్లియర్ చేయాలా?",
            deleteChat: "సంభాషణను తొలగించండి",
            backToChat: "చాట్‌కి తిరిగి వెళ్లండి",
            today: "ఈ రోజు",
            yesterday: "నిన్న",
            messagesCount: "సందేశాలు"
        }
    };

    // Session History & Context Configuration
    const MAX_SESSION_HISTORY = 10;
    let sessionMessages = [];
    let sessionSensors = {};
    let activeConversationId = null;
    let historyPanelOpen = false;

    // DOM Elements Cache
    let toggleBtn;
    let chatWindow;
    let closeBtn;
    let newChatBtn;
    let historyBtn;
    let clearConvBtn;
    let historyPanel;
    let historyList;
    let historyCloseBtn;
    let newChatFromHistoryBtn;
    let clearAllHistoryBtn;
    let historyTitleEl;
    let newChatBtnTextEl;
    let clearAllBtnTextEl;
    let clearBtn;
    let messagesContainer;
    let chatForm;
    let chatInput;
    let sendBtn;
    let langSelect;
    let typingIndicator;
    let suggestionsContainer;
    let welcomeTextEl;

    let currentLanguage = "auto";
    let isTyping = false;
    let userHasSentMessages = false;

    function formatTime(date) {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    function scrollToBottom() {
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    // Convert Markdown (bold, italic, bullet lists) into clean, safe Unicode HTML
    function formatMarkdown(rawText) {
        if (!rawText) return "";

        let safe = rawText
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

        safe = safe.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        safe = safe.replace(/(^|[^*])\*(?!\*)([^*]+)\*(?!\*)/g, "$1<em>$2</em>");

        const lines = safe.split("\n");
        let inList = false;
        const formattedLines = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith("* ") || line.startsWith("- ")) {
                if (!inList) {
                    formattedLines.push("<ul class='agri-chat-list'>");
                    inList = true;
                }
                formattedLines.push(`<li>${line.substring(2)}</li>`);
            } else {
                if (inList) {
                    formattedLines.push("</ul>");
                    inList = false;
                }
                if (line.length > 0) {
                    formattedLines.push(`<p>${line}</p>`);
                }
            }
        }
        if (inList) {
            formattedLines.push("</ul>");
        }

        return formattedLines.length > 0 ? formattedLines.join("") : safe.replace(/\n/g, "<br>");
    }

    function getCombinedContext() {
        const getVal = id => {
            const el = document.getElementById(id);
            return el && el.value !== "" ? el.value : null;
        };

        const cropType = getVal("crop_type");
        const cropDays = getVal("crop_days");
        const moisture = getVal("soil_moisture");
        const soilTemp = getVal("soil_temperature");
        const airTemp = getVal("temperature");
        const humidity = getVal("humidity");

        // Merge live dashboard values into session sensor memory
        if (cropType !== null) {
            if (!isNaN(Number(cropType))) {
                sessionSensors.crop_type = Number(cropType);
                delete sessionSensors.crop_name;
            } else {
                sessionSensors.crop_name = String(cropType);
                delete sessionSensors.crop_type;
            }
        }
        if (cropDays !== null && !isNaN(Number(cropDays))) sessionSensors.crop_days = Number(cropDays);
        if (moisture !== null && !isNaN(Number(moisture))) sessionSensors.soil_moisture = Number(moisture);
        if (soilTemp !== null && !isNaN(Number(soilTemp))) sessionSensors.soil_temperature = Number(soilTemp);
        if (airTemp !== null && !isNaN(Number(airTemp))) sessionSensors.temperature = Number(airTemp);
        if (humidity !== null && !isNaN(Number(humidity))) sessionSensors.humidity = Number(humidity);

        // Security: strictly forward only valid raw sensor fields (never client-supplied prediction results)
        const safe = {};
        ["crop_days", "soil_moisture", "soil_temperature", "temperature", "humidity"].forEach(field => {
            if (sessionSensors[field] !== undefined && sessionSensors[field] !== null && !isNaN(sessionSensors[field])) {
                safe[field] = sessionSensors[field];
            }
        });
        if (sessionSensors.crop_type !== undefined) safe.crop_type = sessionSensors.crop_type;
        if (sessionSensors.crop_name !== undefined) safe.crop_name = sessionSensors.crop_name;

        return Object.keys(safe).length > 0 ? safe : null;
    }

    // -------------------------------------------------------------------------
    // Persistent Conversation History Management (localStorage)
    // -------------------------------------------------------------------------

    function loadAllHistory() {
        try {
            const raw = localStorage.getItem(STORAGE_HISTORY_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                return parsed.sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
            }
            return [];
        } catch (e) {
            console.warn("AgriSaathi: Unable to read history from localStorage", e);
            return [];
        }
    }

    function saveAllHistory(historyList) {
        try {
            localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(historyList));
        } catch (e) {
            console.warn("AgriSaathi: Unable to save history to localStorage", e);
        }
    }

    function getActiveConversationId() {
        try {
            return localStorage.getItem(STORAGE_ACTIVE_ID_KEY) || null;
        } catch (e) {
            return null;
        }
    }

    function setActiveConversationId(id) {
        activeConversationId = id;
        try {
            if (id) {
                localStorage.setItem(STORAGE_ACTIVE_ID_KEY, id);
            } else {
                localStorage.removeItem(STORAGE_ACTIVE_ID_KEY);
            }
        } catch (e) {
            // ignore private browsing exceptions
        }
    }

    function escapeHtml(text) {
        if (!text) return "";
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatConversationDate(timestamp) {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        const isYesterday = date.toDateString() === yesterday.toDateString();

        const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const dict = chatTranslations[currentLanguage] || chatTranslations.auto;

        if (isToday) {
            return `${dict.today || "Today"}, ${timeStr}`;
        } else if (isYesterday) {
            return `${dict.yesterday || "Yesterday"}, ${timeStr}`;
        } else {
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} ${timeStr}`;
        }
    }

    function renderHistoryList() {
        if (!historyList) return;
        historyList.innerHTML = "";

        const history = loadAllHistory();
        const dict = chatTranslations[currentLanguage] || chatTranslations.auto;

        if (history.length === 0) {
            const emptyDiv = document.createElement("div");
            emptyDiv.className = "agri-history-empty";
            emptyDiv.innerHTML = `
                <span class="agri-history-empty-icon" aria-hidden="true">🌱</span>
                <p>${dict.noHistory}</p>
            `;
            historyList.appendChild(emptyDiv);
            if (clearAllHistoryBtn) {
                clearAllHistoryBtn.style.display = "none";
            }
            return;
        }

        if (clearAllHistoryBtn) {
            clearAllHistoryBtn.style.display = "flex";
        }

        history.forEach(conv => {
            const item = document.createElement("div");
            item.className = "agri-history-item" + (conv.id === activeConversationId ? " agri-history-item-active" : "");
            item.setAttribute("role", "button");
            item.setAttribute("tabindex", "0");
            item.setAttribute("data-id", conv.id);

            const msgCount = Array.isArray(conv.messages) ? conv.messages.length : 0;
            const dateStr = formatConversationDate(conv.updatedAt || conv.createdAt);

            item.innerHTML = `
                <div class="agri-history-item-content">
                    <h5 class="agri-history-item-title" title="${escapeHtml(conv.title || 'Untitled Conversation')}">
                        ${escapeHtml(conv.title || 'Untitled Conversation')}
                    </h5>
                    <div class="agri-history-item-meta">
                        <span class="agri-history-date">${dateStr}</span>
                        <span class="agri-history-msg-count">${msgCount} ${dict.messagesCount || 'msgs'}</span>
                    </div>
                </div>
                <button type="button" class="agri-history-item-delete" aria-label="${dict.deleteChat || 'Delete conversation'}" title="${dict.deleteChat || 'Delete conversation'}">
                    <span aria-hidden="true">🗑️</span>
                </button>
            `;

            // Click to reload old conversation
            item.addEventListener("click", (e) => {
                if (e.target.closest(".agri-history-item-delete")) return;
                loadConversation(conv.id);
            });

            // Keyboard accessibility
            item.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    if (!e.target.closest(".agri-history-item-delete")) {
                        e.preventDefault();
                        loadConversation(conv.id);
                    }
                }
            });

            // Delete individual conversation
            const delBtn = item.querySelector(".agri-history-item-delete");
            if (delBtn) {
                delBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    deleteConversation(conv.id);
                });
            }

            historyList.appendChild(item);
        });
    }

    function openHistoryPanel() {
        if (!historyPanel) return;
        historyPanel.hidden = false;
        historyPanel.classList.add("agri-history-open");
        historyPanel.style.display = "flex";
        historyPanelOpen = true;
        if (historyBtn) {
            historyBtn.classList.add("agri-btn-active");
            historyBtn.setAttribute("aria-expanded", "true");
        }
        renderHistoryList();
    }

    function closeHistoryPanel() {
        if (!historyPanel) return;
        historyPanel.hidden = true;
        historyPanel.classList.remove("agri-history-open");
        historyPanel.style.display = "none";
        historyPanelOpen = false;
        if (historyBtn) {
            historyBtn.classList.remove("agri-btn-active");
            historyBtn.setAttribute("aria-expanded", "false");
        }
    }

    function toggleHistoryPanel() {
        if (historyPanelOpen) {
            closeHistoryPanel();
        } else {
            openHistoryPanel();
        }
    }

    function loadConversation(convId) {
        const history = loadAllHistory();
        const conv = history.find(c => c.id === convId);
        if (!conv) return;

        setActiveConversationId(conv.id);
        userHasSentMessages = true;

        // Restore context memory for multi-turn follow-up questions
        sessionMessages = (conv.messages || []).map(m => ({
            role: m.role,
            content: m.content
        }));

        if (messagesContainer) {
            messagesContainer.innerHTML = "";

            if (conv.messages && conv.messages.length > 0) {
                conv.messages.forEach(msg => {
                    const isUser = msg.role === "user";
                    const formatted = !isUser && !msg.isError ? formatMarkdown(msg.content) : msg.content;
                    appendMessage(formatted, isUser ? "user" : "assistant", !isUser && !msg.isError, !!msg.isError, msg.timeStr);
                });
            } else {
                renderDefaultWelcome();
            }
        }

        closeHistoryPanel();
        scrollToBottom();

        if (chatInput) {
            chatInput.focus();
        }
    }

    function startNewChat() {
        setActiveConversationId(null);
        sessionMessages = [];
        sessionSensors = {};
        userHasSentMessages = false;

        renderDefaultWelcome();
        closeHistoryPanel();

        if (chatInput) {
            chatInput.value = "";
            chatInput.focus();
        }
    }

    function deleteConversation(convId) {
        let history = loadAllHistory();
        history = history.filter(c => c.id !== convId);
        saveAllHistory(history);

        if (activeConversationId === convId) {
            startNewChat();
        } else {
            renderHistoryList();
        }
    }

    function clearActiveConversation() {
        if (!messagesContainer) return;
        const dict = chatTranslations[currentLanguage] || chatTranslations.auto;
        const confirmed = window.confirm(dict.clearConvConfirm || "Clear all messages in the current conversation?");
        if (!confirmed) return;

        sessionMessages = [];
        sessionSensors = {};
        userHasSentMessages = false;

        if (activeConversationId) {
            let history = loadAllHistory();
            const conv = history.find(c => c.id === activeConversationId);
            if (conv) {
                conv.messages = [];
                conv.updatedAt = Date.now();
                saveAllHistory(history);
            }
        }

        renderDefaultWelcome();
        if (chatInput) {
            chatInput.value = "";
            chatInput.focus();
        }
    }

    function clearAllHistory() {
        const dict = chatTranslations[currentLanguage] || chatTranslations.auto;
        const confirmed = window.confirm(dict.clearAllConfirm || "Are you sure you want to delete all saved conversations? This cannot be undone.");
        if (!confirmed) return;

        try {
            localStorage.removeItem(STORAGE_HISTORY_KEY);
            localStorage.removeItem(STORAGE_ACTIVE_ID_KEY);
        } catch (e) {
            // ignore
        }

        startNewChat();
        renderHistoryList();
    }

    function renderDefaultWelcome() {
        if (!messagesContainer) return;
        messagesContainer.innerHTML = "";

        const dict = chatTranslations[currentLanguage] || chatTranslations.auto;

        // Welcome Message Bubble
        const welcomeRow = document.createElement("div");
        welcomeRow.className = "agri-msg-row agri-msg-assistant";
        welcomeRow.innerHTML = `
            <div class="agri-msg-avatar" aria-hidden="true">🌱</div>
            <div class="agri-msg-bubble">
                <div class="agri-msg-text" id="agriWelcomeText">${dict.welcome}</div>
                <span class="agri-msg-time">Just now</span>
            </div>
        `;
        messagesContainer.appendChild(welcomeRow);

        // Suggested Questions Section
        const suggSection = document.createElement("div");
        suggSection.className = "agri-suggestions";
        suggSection.id = "agriSuggestions";

        let chipsHtml = "";
        dict.questions.forEach((q) => {
            const cleanQ = q.replace(/^[^\w\s\u0900-\u0D7F]+\s*/, "");
            chipsHtml += `<button type="button" class="agri-chip" data-question="${cleanQ}">${q}</button>`;
        });

        suggSection.innerHTML = `
            <p class="agri-suggestions-title" id="agriSuggestionsTitle">${dict.suggestionsTitle}</p>
            <div class="agri-chips">${chipsHtml}</div>
        `;
        messagesContainer.appendChild(suggSection);

        welcomeTextEl = document.getElementById("agriWelcomeText");
        suggestionsContainer = suggSection;
    }

    function setChatLanguage(lang, persist = true) {
        if (!chatTranslations[lang]) lang = "auto";
        currentLanguage = lang;

        if (persist) {
            try {
                localStorage.setItem(STORAGE_LANG_KEY, lang);
            } catch (e) {
                // Ignore storage failure in private mode
            }
        }

        const dict = chatTranslations[lang];

        const titleEl = document.getElementById("agriChatHeaderTitle");
        const subEl = document.getElementById("agriChatSubtitle");
        const suggestionsTitleEl = document.getElementById("agriSuggestionsTitle");
        const typingLabelEl = document.getElementById("agriTypingLabel");

        if (titleEl) titleEl.textContent = dict.title;
        if (subEl) subEl.innerHTML = `<span class="agri-online-dot"></span> ${dict.subtitle}`;
        if (chatInput) chatInput.placeholder = dict.placeholder;
        if (suggestionsTitleEl) suggestionsTitleEl.textContent = dict.suggestionsTitle;
        if (typingLabelEl) typingLabelEl.textContent = dict.typing;

        // If user hasn't started chatting yet, update the welcome bubble to match the selected language
        if (!userHasSentMessages && welcomeTextEl) {
            welcomeTextEl.innerHTML = dict.welcome;
        }

        // Update suggested question chips
        const chipButtons = document.querySelectorAll(".agri-chip");
        chipButtons.forEach((btn, index) => {
            if (dict.questions[index]) {
                btn.textContent = dict.questions[index];
                btn.setAttribute("data-question", dict.questions[index].replace(/^[^\w\s\u0900-\u0D7F]+\s*/, ""));
            }
        });

        if (toggleBtn) {
            const isOpen = chatWindow && !chatWindow.hidden;
            toggleBtn.setAttribute("aria-label", isOpen ? dict.closeAria : dict.openAria);
        }
        if (closeBtn) {
            closeBtn.setAttribute("aria-label", dict.closeAria);
        }
        if (newChatBtn) {
            newChatBtn.setAttribute("aria-label", dict.newChatBtn);
            newChatBtn.setAttribute("title", dict.newChatBtn);
        }
        if (historyBtn) {
            historyBtn.setAttribute("aria-label", dict.historyBtn);
            historyBtn.setAttribute("title", dict.historyBtn);
        }
        if (clearConvBtn) {
            clearConvBtn.setAttribute("aria-label", dict.clearConvBtn);
            clearConvBtn.setAttribute("title", dict.clearConvBtn);
        }
        if (historyTitleEl) historyTitleEl.textContent = dict.historyTitle;
        if (newChatBtnTextEl) newChatBtnTextEl.textContent = dict.newChatBtn;
        if (clearAllBtnTextEl) clearAllBtnTextEl.textContent = dict.clearAllHistory;
        if (historyCloseBtn) {
            historyCloseBtn.setAttribute("aria-label", dict.backToChat);
            historyCloseBtn.setAttribute("title", dict.backToChat);
        }
        if (clearAllHistoryBtn) {
            clearAllHistoryBtn.setAttribute("aria-label", dict.clearAllHistory);
            clearAllHistoryBtn.setAttribute("title", dict.clearAllHistory);
        }

        if (langSelect && langSelect.value !== lang) {
            langSelect.value = lang;
        }

        if (historyPanelOpen) {
            renderHistoryList();
        }
    }

    function clearChat() {
        startNewChat();
    }

    function openChat() {
        if (!chatWindow) return;
        chatWindow.hidden = false;
        chatWindow.classList.add("agri-open");
        toggleBtn.classList.add("agri-active");
        toggleBtn.setAttribute("aria-expanded", "true");

        // Ensure history panel is closed so message area and input form are visible
        closeHistoryPanel();

        setTimeout(() => {
            if (chatInput && !isTyping) chatInput.focus();
        }, 150);

        scrollToBottom();
    }

    function closeChat() {
        if (!chatWindow) return;
        chatWindow.classList.remove("agri-open");
        toggleBtn.classList.remove("agri-active");
        toggleBtn.setAttribute("aria-expanded", "false");

        setTimeout(() => {
            chatWindow.hidden = true;
        }, 220);

        if (toggleBtn) toggleBtn.focus();
    }

    function toggleChat() {
        const isOpen = chatWindow && !chatWindow.hidden;
        if (isOpen) {
            closeChat();
        } else {
            openChat();
        }
    }

    function appendMessage(text, sender = "user", isHTML = false, isError = false, customTime = null) {
        if (!messagesContainer) return;

        const row = document.createElement("div");
        row.className = `agri-msg-row agri-msg-${sender}${isError ? " agri-msg-error" : ""}`;

        const avatar = document.createElement("div");
        avatar.className = "agri-msg-avatar";
        avatar.setAttribute("aria-hidden", "true");
        avatar.textContent = sender === "user" ? "👨‍🌾" : (isError ? "⚠️" : "🌱");

        const bubble = document.createElement("div");
        bubble.className = "agri-msg-bubble";

        const textEl = document.createElement("div");
        textEl.className = "agri-msg-text";
        if (isHTML) {
            textEl.innerHTML = text;
        } else {
            textEl.textContent = text;
        }

        const timeEl = document.createElement("span");
        timeEl.className = "agri-msg-time";
        timeEl.textContent = customTime || formatTime(new Date());

        bubble.appendChild(textEl);
        bubble.appendChild(timeEl);

        row.appendChild(avatar);
        row.appendChild(bubble);

        messagesContainer.appendChild(row);
        scrollToBottom();
    }

    function showTypingIndicator() {
        if (typingIndicator) {
            typingIndicator.style.display = "flex";
            scrollToBottom();
        }
    }

    function hideTypingIndicator() {
        if (typingIndicator) {
            typingIndicator.style.display = "none";
        }
    }

    function setSubmissionState(disabled) {
        isTyping = disabled;
        if (sendBtn) sendBtn.disabled = disabled;
        if (chatInput) chatInput.disabled = disabled;
        const chips = document.querySelectorAll(".agri-chip");
        chips.forEach(c => { c.disabled = disabled; });
    }

    async function handleSendMessage(text) {
        const messageText = (text || (chatInput ? chatInput.value : "")).trim();
        
        if (!messageText || isTyping) return;

        // Command shortcut for clearing chat / starting new chat
        if (messageText.toLowerCase() === "/clear" || messageText.toLowerCase() === "clear") {
            startNewChat();
            return;
        }

        if (messageText.length > 1000) {
            appendMessage("Please limit your question to 1000 characters.", "assistant", false, true);
            return;
        }

        userHasSentMessages = true;
        setSubmissionState(true);

        const now = Date.now();
        const timeFormatted = formatTime(new Date(now));

        // Display user message in UI
        appendMessage(messageText, "user", false, false, timeFormatted);

        // Persistent History: create new conversation entry or append to active one
        let history = loadAllHistory();
        let currentConv = activeConversationId ? history.find(c => c.id === activeConversationId) : null;

        if (!currentConv) {
            const cleanTitle = messageText.length > 45 ? messageText.substring(0, 45).trim() + "..." : messageText;
            const newId = "conv_" + now + "_" + Math.random().toString(36).substring(2, 7);
            currentConv = {
                id: newId,
                title: cleanTitle,
                createdAt: now,
                updatedAt: now,
                language: currentLanguage,
                messages: []
            };
            history.unshift(currentConv);
            setActiveConversationId(newId);
        }

        // Add user message to persistent conversation
        currentConv.messages.push({
            role: "user",
            content: messageText,
            timestamp: now,
            timeStr: timeFormatted
        });
        currentConv.updatedAt = now;
        saveAllHistory(history);

        // Format recent in-memory session messages before pushing the current one
        const historyToSend = sessionMessages.slice(-MAX_SESSION_HISTORY).map(m => ({
            role: m.role,
            content: m.content
        }));

        // Record user message into in-memory session history for Gemini tool grounding
        sessionMessages.push({ role: "user", content: messageText });

        if (chatInput) {
            chatInput.value = "";
        }

        showTypingIndicator();

        const payload = {
            message: messageText,
            language: currentLanguage,
            context: getCombinedContext(),
            history: historyToSend
        };

        const dict = chatTranslations[currentLanguage] || chatTranslations.auto;

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            const replyNow = Date.now();
            const replyTime = formatTime(new Date(replyNow));

            if (!response.ok) {
                const errMsg = data.error || dict.networkError;
                appendMessage(errMsg, "assistant", false, true, replyTime);

                // Save error to conversation history
                const allH = loadAllHistory();
                const activeC = allH.find(c => c.id === activeConversationId);
                if (activeC) {
                    activeC.messages.push({
                        role: "assistant",
                        content: errMsg,
                        isError: true,
                        timestamp: replyNow,
                        timeStr: replyTime
                    });
                    activeC.updatedAt = replyNow;
                    saveAllHistory(allH);
                }
            } else if (data.reply) {
                // Record assistant reply into session history
                sessionMessages.push({ role: "assistant", content: data.reply });
                const formattedHtml = formatMarkdown(data.reply);
                appendMessage(formattedHtml, "assistant", true, false, replyTime);

                // Save assistant reply to active persistent conversation
                const allH = loadAllHistory();
                const activeC = allH.find(c => c.id === activeConversationId);
                if (activeC) {
                    activeC.messages.push({
                        role: "assistant",
                        content: data.reply,
                        timestamp: replyNow,
                        timeStr: replyTime
                    });
                    activeC.updatedAt = replyNow;
                    saveAllHistory(allH);
                }
            } else {
                appendMessage(dict.networkError, "assistant", false, true, replyTime);
            }

        } catch (error) {
            const replyNow = Date.now();
            const replyTime = formatTime(new Date(replyNow));
            appendMessage(dict.networkError, "assistant", false, true, replyTime);
        } finally {
            hideTypingIndicator();
            setSubmissionState(false);
            if (chatInput) chatInput.focus();
        }
    }

    function init() {
        toggleBtn = document.getElementById("agriChatToggle");
        chatWindow = document.getElementById("agriChatWindow");
        closeBtn = document.getElementById("agriChatClose");
        clearBtn = document.getElementById("agriChatClear");
        newChatBtn = document.getElementById("agriNewChatBtn");
        historyBtn = document.getElementById("agriHistoryBtn");
        historyPanel = document.getElementById("agriHistoryPanel");
        historyList = document.getElementById("agriHistoryList");
        historyCloseBtn = document.getElementById("agriHistoryCloseBtn");
        newChatFromHistoryBtn = document.getElementById("agriNewChatFromHistoryBtn");
        clearAllHistoryBtn = document.getElementById("agriClearAllHistoryBtn");
        historyTitleEl = document.getElementById("agriHistoryTitle");
        newChatBtnTextEl = document.getElementById("agriNewChatBtnText");
        clearAllBtnTextEl = document.getElementById("agriClearAllBtnText");
        messagesContainer = document.getElementById("agriChatMessages");
        chatForm = document.getElementById("agriChatForm");
        chatInput = document.getElementById("agriChatInput");
        sendBtn = document.getElementById("agriSendBtn");
        langSelect = document.getElementById("agriChatLang");
        typingIndicator = document.getElementById("agriTypingIndicator");
        suggestionsContainer = document.getElementById("agriSuggestions");
        welcomeTextEl = document.getElementById("agriWelcomeText");

        if (!toggleBtn || !chatWindow) return;

        toggleBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleChat();
        });

        if (closeBtn) {
            closeBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                closeChat();
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                startNewChat();
            });
        }

        if (newChatBtn) {
            newChatBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                startNewChat();
            });
        }

        if (historyBtn) {
            historyBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                toggleHistoryPanel();
            });
        }

        if (clearConvBtn) {
            clearConvBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                clearActiveConversation();
            });
        }

        if (historyCloseBtn) {
            historyCloseBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                closeHistoryPanel();
            });
        }

        if (newChatFromHistoryBtn) {
            newChatFromHistoryBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                startNewChat();
            });
        }

        if (clearAllHistoryBtn) {
            clearAllHistoryBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                clearAllHistory();
            });
        }

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && chatWindow && !chatWindow.hidden) {
                if (historyPanelOpen) {
                    closeHistoryPanel();
                } else {
                    closeChat();
                }
            }
        });

        // Ensure history panel starts in closed state
        closeHistoryPanel();

        // Initialize language with stored preference or default to 'auto'
        let savedLang = "auto";
        try {
            savedLang = localStorage.getItem(STORAGE_LANG_KEY) || "auto";
        } catch (e) {
            savedLang = "auto";
        }

        if (langSelect) {
            langSelect.addEventListener("change", () => {
                setChatLanguage(langSelect.value, true);
            });
            setChatLanguage(savedLang, false);
        }

        if (chatForm) {
            chatForm.addEventListener("submit", (e) => {
                e.preventDefault();
                handleSendMessage();
            });
        }

        if (suggestionsContainer) {
            suggestionsContainer.addEventListener("click", (e) => {
                const chip = e.target.closest(".agri-chip");
                if (!chip || isTyping) return;
                const question = chip.getAttribute("data-question");
                if (question) {
                    handleSendMessage(question);
                }
            });
        }

        // Restore active conversation from localStorage if present
        const savedActiveId = getActiveConversationId();
        if (savedActiveId) {
            const allH = loadAllHistory();
            const existing = allH.find(c => c.id === savedActiveId);
            if (existing && existing.messages && existing.messages.length > 0) {
                loadConversation(savedActiveId);
            }
        }

        // Keep session sensor memory synchronized with dashboard form interactions
        const sensorInputIds = ["crop_type", "crop_days", "soil_moisture", "soil_temperature", "temperature", "humidity"];
        sensorInputIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                const updateSensor = () => {
                    if (el.value !== "" && !isNaN(Number(el.value))) {
                        sessionSensors[id] = Number(el.value);
                    }
                };
                el.addEventListener("change", updateSensor);
                el.addEventListener("input", updateSensor);
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
