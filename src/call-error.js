export function callErrorMessage(error) {
  const detail = [error?.name, error?.message, error?.errorMsg, error?.type, error?.stage,
    error?.error?.name, error?.error?.message, error?.error?.errorMsg, error?.error?.errorDetail].filter(Boolean).join(' ');
  if (/notallowed|permission|notfound|microphone|device.*not.*found/i.test(detail)) {
    return 'Microphone access is blocked or no microphone is available. Allow microphone access in this browser’s site settings, then try again.';
  }
  if (/payment|credit|balance|402/i.test(detail)) {
    return 'Vapi reports a billing or credit limit. Check the Vapi account balance before retrying.';
  }
  if (/websocket|network|timed?\s*out|timeout|daily|meeting.*ended|connection/i.test(detail)) {
    return 'The live audio connection failed. Try again. If it repeats, open this page in Chrome, Edge or Safari outside the in-app browser, or try another network. You can also use “Open Vapi demo” above.';
  }
  return 'The voice call could not connect. Try again, or use “Open Vapi demo” above.';
}
