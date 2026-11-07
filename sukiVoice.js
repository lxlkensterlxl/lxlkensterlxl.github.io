const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isListening = false;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const inputEl = document.getElementById('chat-input');
        if (inputEl) inputEl.value = transcript;
        handleUserCommand(transcript);
    };

    recognition.onerror = (event) => {
        console.warn('ASR error:', event.error);
        isListening = false;
        document.getElementById('mic-btn')?.classList.remove('mic-listening');
        addLog('ASR', `Microphone status: ${event.error}`);
    };

    recognition.onend = () => {
        isListening = false;
        document.getElementById('mic-btn')?.classList.remove('mic-listening');
    };
}

document.getElementById('mic-btn')?.addEventListener('click', () => {
    if (!recognition) {
        alert('Speech Recognition is not supported in this browser.');
        return;
    }
    if (isListening) {
        recognition.stop();
        isListening = false;
        document.getElementById('mic-btn')?.classList.remove('mic-listening');
    } else {
        recognition.start();
        isListening = true;
        document.getElementById('mic-btn')?.classList.add('mic-listening');
        addLog('ASR', 'Listening for voice command...');
    }
});

// WebLLM Engine Initialization & Chat Handling
let mlcEngine = null;
const selectedModel = "Llama-3.2-1B-Instruct-q4f32_1-MLC";

window.addEventListener('mlc-loaded', async () => {
    try {
        const loaderLabel = document.getElementById('llm-load-label');
        const loaderPercent = document.getElementById('llm-load-percent');
        const progressBar = document.getElementById('llm-progress-bar');

        mlcEngine = await window.CreateMLCEngine(selectedModel, {
            initProgressCallback: (progress) => {
                const pct = Math.round(progress.progress * 100);
                if (loaderPercent) loaderPercent.textContent = `${pct}%`;
                if (progressBar) progressBar.style.width = `${pct}%`;
                if (loaderLabel) loaderLabel.innerHTML = `<i class="fa-solid fa-brain text-pink-400 mr-1"></i>${progress.text}`;
            }
        });

        const loaderContainer = document.getElementById('llm-loader-container');
        if (loaderContainer) loaderContainer.style.display = 'none';
        const statusText = document.getElementById('model-status-text');
        if (statusText) statusText.textContent = '[WebGPU AI Online]';
        addLog('SUKI://AI', 'WebLLM Llama-3.2 model initialized successfully!');
    } catch (err) {
        console.error(err);
        const loaderLabel = document.getElementById('llm-load-label');
        if (loaderLabel) loaderLabel.textContent = 'WebLLM fallback mode active (CPU/Simulator).';
        const statusText = document.getElementById('model-status-text');
        if (statusText) statusText.textContent = '[Fallback Mode]';
    }
});

async function handleUserCommand(text) {
    if (!text.trim()) return;
    addLog('USER', text);
    const inputEl = document.getElementById('chat-input');
    if (inputEl) inputEl.value = '';

    let responseText = "";
    if (mlcEngine) {
        try {
            const reply = await mlcEngine.chat.completions.create({
                messages: [
                    { role: "system", content: "You are SukiBot, an advanced cyber-hud anime kitsune companion AI. Keep answers concise, futuristic, tech-savvy, and helpful." },
                    { role: "user", content: text }
                ]
            });
            responseText = reply.choices[0].message.content;
        } catch (e) {
            responseText = "Neural inference error encountered. Systems nominal.";
        }
    } else {
        const lower = text.toLowerCase();
        if (lower.includes('greet')) {
            responseText = "Kon'nichiwa, Commander! SukiBot online and fully synchronized with your cyber HUD.";
            setSukiExpression('happy');
        } else if (lower.includes('asr') || lower.includes('mic')) {
            responseText = "ASR microphone status: Active and responsive to vocal commands.";
            setSukiExpression('surprised');
        } else if (lower.includes('orb')) {
            responseText = "Energy Orb diagnostics: 100% mana capacity. Kitsune shields holding steady.";
            setSukiExpression('blush');
        } else {
            responseText = `Command acknowledged: "${text}". All tactical subroutines operating at peak efficiency!`;
            setSukiExpression('happy');
        }
    }

    addLog('SUKI', responseText);
    speakText(responseText);
}

document.getElementById('send-btn')?.addEventListener('click', () => {
    const val = document.getElementById('chat-input')?.value || '';
    handleUserCommand(val);
});

document.getElementById('chat-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        handleUserCommand(e.target.value);
    }
});

document.querySelectorAll('.chip').forEach(btn => {
    btn.addEventListener('click', () => {
        const cmd = btn.getAttribute('data-cmd');
        if (cmd) handleUserCommand(cmd);
    });
});
