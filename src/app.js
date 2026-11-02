import Vapi from './vapi-client.js';
import config from './config.json';

const byId = (id) => document.getElementById(id);
const ui = Object.fromEntries(['start','start-label','end','mute','state','voice-status','visual','transcript','empty','timer','error','download','suggestion','transcript-note','share','toast'].map(id => [id, byId(id)]));
const vapi = new Vapi(config.publicKey);
let state = 'idle';
let startedAt = 0;
let timer;
let interim;
let callId;
let transcript = [];
let lastTranscript = '';

function setState(next) {
  state = next;
  const connected = next === 'connected';
  ui.start.hidden = connected;
  ui.start.disabled = next === 'connecting' || next === 'ending';
  ui['start-label'].textContent = next === 'connecting' ? 'Connecting…' : next === 'ending' ? 'Ending call…' : transcript.length ? 'Start another conversation' : 'Talk to Aanya';
  ui.end.hidden = !connected;
  ui.mute.hidden = !connected;
  ui.visual.classList.toggle('connected', connected);
  ui.state.replaceChildren();
  ui.state.append(document.createElement('i'), document.createTextNode({idle:'Ready to connect',connecting:'Connecting',connected:'Live conversation',ending:'Ending call',ended:'Conversation ended'}[next]));
  if (!connected) ui.visual.classList.remove('speaking');
}

function showError(message) {
  ui.error.textContent = message;
  ui.error.hidden = false;
}

function endLocally() {
  clearInterval(timer);
  interim?.remove();
  interim = null;
  setState(transcript.length ? 'ended' : 'idle');
  ui.mute.setAttribute('aria-pressed', 'false');
  ui.mute.textContent = 'Mute mic';
  ui['voice-status'].textContent = transcript.length ? 'Thanks for trying Aanya. Download the transcript or start another conversation.' : 'You play the company recruiter. Aanya starts the conversation.';
  ui['transcript-note'].textContent = transcript.length ? 'Demo complete · Next steps need human confirmation' : 'Live captions appear here when you connect';
  ui.download.disabled = transcript.length === 0;
}

ui.start.addEventListener('click', async () => {
  if (state === 'connecting' || state === 'connected' || state === 'ending') return;
  ui.error.hidden = true;
  if (!navigator.mediaDevices?.getUserMedia) {
    showError('Microphone access is unavailable. Open this demo in a current browser using its HTTPS link.');
    return;
  }
  setState('connecting');
  ui['voice-status'].textContent = 'Allow microphone access when your browser asks. Headphones help keep the conversation clear.';
  try {
    const call = await vapi.start(config.assistantId);
    if (call === null) {
      endLocally();
      if (ui.error.hidden) showError('The call could not connect. Check microphone permission and the Vapi account balance, then try again.');
      return;
    }
    callId = call?.id;
  } catch (error) {
    endLocally();
    showError(error?.name === 'NotAllowedError' ? 'Microphone permission was denied. Allow microphone access for this site in your browser, then try again.' : 'The voice call could not connect. Check microphone permission, your internet connection and Vapi credits, then try again.');
  }
});

vapi.on('call-start', () => {
  transcript = [];
  lastTranscript = '';
  interim = null;
  ui.transcript.replaceChildren();
  ui.suggestion.hidden = true;
  ui.timer.textContent = '00:00';
  ui.download.disabled = true;
  startedAt = Date.now();
  setState('connected');
  ui['voice-status'].textContent = 'Aanya is here. Speak naturally, just as you would on a phone call.';
  ui['transcript-note'].textContent = 'Live transcript · You are the company recruiter';
  clearInterval(timer);
  timer = setInterval(() => {
    const seconds = Math.floor((Date.now() - startedAt) / 1000);
    ui.timer.textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    if (seconds >= 300 && state === 'connected') {
      setState('ending');
      vapi.stop();
    }
  }, 1000);
});

vapi.on('speech-start', () => {
  ui.visual.classList.add('speaking');
  ui['voice-status'].textContent = 'Aanya is speaking. You can interrupt naturally.';
});
vapi.on('speech-end', () => {
  ui.visual.classList.remove('speaking');
  if (state === 'connected') ui['voice-status'].textContent = 'Your turn. Aanya is listening.';
});
vapi.on('call-end', endLocally);
vapi.on('error', (error) => {
  if (state === 'ending') { endLocally(); return; }
  endLocally();
  const denied = /permission|notallowed|microphone/i.test(String(error?.errorMsg || error?.message || ''));
  showError(denied ? 'Microphone access is blocked. Allow it in your browser’s site settings, then try again.' : 'Vapi could not complete the call. Check your connection and Vapi credits, then try again.');
});
vapi.on('message', message => {
  if (message.type !== 'transcript' || !message.transcript?.trim()) return;
  interim?.remove();
  interim = null;
  const text = message.transcript.trim();
  const role = message.role === 'assistant' ? 'assistant' : 'user';
  const final = message.transcriptType === 'final';
  if (final && lastTranscript === `${role}:${text}`) return;
  const bubble = document.createElement('div');
  bubble.className = `message ${role}${final ? '' : ' interim'}`;
  const label = document.createElement('span');
  label.className = 'message-label';
  label.textContent = role === 'assistant' ? 'AANYA · AI ASSISTANT' : 'YOU · COMPANY RECRUITER';
  bubble.append(label, document.createTextNode(text));
  ui.transcript.append(bubble);
  if (final) {
    transcript.push({ role, text });
    lastTranscript = `${role}:${text}`;
  } else interim = bubble;
  ui.transcript.scrollTop = ui.transcript.scrollHeight;
});

ui.end.addEventListener('click', () => {
  if (state !== 'connected') return;
  setState('ending');
  ui['voice-status'].textContent = 'Ending your conversation…';
  vapi.stop();
});
ui.mute.addEventListener('click', () => {
  const muted = !vapi.isMuted();
  vapi.setMuted(muted);
  ui.mute.setAttribute('aria-pressed', String(muted));
  ui.mute.textContent = muted ? 'Unmute mic' : 'Mute mic';
});
document.querySelectorAll('.scenario').forEach(button => button.addEventListener('click', () => {
  ui.suggestion.textContent = `Say this when Aanya asks: “${button.dataset.prompt}”`;
  ui.suggestion.hidden = false;
  if (state === 'idle' || state === 'ended') ui.start.focus();
}));

ui.download.addEventListener('click', () => {
  if (!transcript.length) return;
  const text = ['CAMPUS CONNECT · WELINGKAR, MUMBAI', 'Voice assistant demonstration', new Date().toISOString(), callId ? `Vapi call: ${callId}` : '', '', ...transcript.map(m => `${m.role === 'assistant' ? 'Aanya (AI)' : 'Recruiter'}: ${m.text}`), '', 'Demo only. No email was sent or meeting booked. Batch timelines remain unconfirmed. Sample placement contacts are placeholders.'].filter(Boolean).join('\n\n');
  const url = URL.createObjectURL(new Blob([text], {type:'text/plain;charset=utf-8'}));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'welingkar-campus-connect-transcript.txt';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
ui.share.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(window.location.origin);
    ui.toast.textContent = 'Demo link copied. Share it with your placement team.';
    ui.toast.hidden = false;
    setTimeout(() => { ui.toast.hidden = true; }, 4000);
  } catch {
    ui.toast.textContent = 'Copy the demo URL from your browser’s address bar to share.';
    ui.toast.hidden = false;
    setTimeout(() => { ui.toast.hidden = true; }, 6000);
  }
});
window.addEventListener('pagehide', () => { clearInterval(timer); if (state === 'connected' || state === 'connecting') vapi.stop(); });
