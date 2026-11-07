// Clock updater
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const clockEl = document.getElementById('clock-display');
    if (clockEl) clockEl.textContent = `${hours}:${minutes}`;
}
setInterval(updateClock, 1000);
updateClock();

// Audio autoplay unlocker for iOS / Modern Browsers
let audioContextUnlocked = false;
function unlockAudioContext() {
    if (audioContextUnlocked || !window.speechSynthesis) return;
    const silentUtterance = new SpeechSynthesisUtterance('');
    silentUtterance.volume = 0;
    window.speechSynthesis.speak(silentUtterance);
    audioContextUnlocked = true;
    window.removeEventListener('click', unlockAudioContext);
    window.removeEventListener('touchstart', unlockAudioContext);
}
window.addEventListener('click', unlockAudioContext);
window.addEventListener('touchstart', unlockAudioContext);

// Web Speech API TTS & ASR
let synth = window.speechSynthesis;
let voices = [];
let audioEnabled = true;
let currentUtterance = null;
let isSpeaking = false;

function loadVoices() {
    if (!synth) return;
    voices = synth.getVoices();
    const voiceSelect = document.getElementById('voice-select');
    if (!voiceSelect) return;
    
    voiceSelect.innerHTML = '';
    voices.forEach((v, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = `${v.name} (${v.lang})`;
        voiceSelect.appendChild(opt);
    });
    if (voices.length > 0) {
        const tag = document.getElementById('voice-name-tag');
        if (tag) tag.textContent = voices[0].name.substring(0, 16) + '...';
    }
}
if (synth && synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = loadVoices;
}
loadVoices();

function speakText(text) {
    if (!audioEnabled || !synth) return;
    synth.cancel();

    currentUtterance = new SpeechSynthesisUtterance(text);
    const voiceIdx = document.getElementById('voice-select')?.value || 0;
    if (voices[voiceIdx]) currentUtterance.voice = voices[voiceIdx];
    currentUtterance.pitch = 1.2;
    currentUtterance.rate = 1.05;

    currentUtterance.onstart = () => {
        isSpeaking = true;
        const badge = document.getElementById('speech-state-badge');
        if (badge) {
            badge.textContent = 'SPEAKING';
            badge.className = 'text-[8px] font-mono text-cyan-400 font-bold animate-pulse';
        }
        document.getElementById('equalizer')?.classList.add('speaking-active');
    };

    currentUtterance.onend = currentUtterance.onerror = () => {
        isSpeaking = false;
        const badge = document.getElementById('speech-state-badge');
        if (badge) {
            badge.textContent = 'IDLE';
            badge.className = 'text-[8px] font-mono text-pink-400 font-bold';
        }
        document.getElementById('equalizer')?.classList.remove('speaking-active');
        currentUtterance = null;
    };

    synth.speak(currentUtterance);
}

// Audio Mute Toggle
document.getElementById('toggle-audio-btn')?.addEventListener('click', () => {
    audioEnabled = !audioEnabled;
    const icon = document.getElementById('audio-icon');
    if (icon) icon.className = audioEnabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark text-pink-500';
    addLog('System', audioEnabled ? 'Audio output enabled.' : 'Audio muted.');
});
