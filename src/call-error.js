export function callErrorMessage(error) {
  const detail = [error?.name, error?.message, error?.errorMsg, error?.type, error?.stage,
    error?.error?.name, error?.error?.message, error?.error?.errorMsg, error?.error?.errorDetail].filter(Boolean).join(' ');
  if (/notallowed|permission|notfound|microphone|device.*not.*found/i.test(detail)) {
    return 'Microphone access is blocked or no microphone is available. Allow microphone access in this browser’s site settings, then try again.';
  }
  if (/websocket|network|timed?\s*out|timeout|daily|meeting.*ended|connection/i.test(detail)) {
    return 'The live audio connection failed. Try connecting again, or use “Open Vapi demo” below. The assistant is available; this attempt could not join its audio room.';
  }
  if (/payment|credit|balance|402/i.test(detail)) {
    return 'Vapi reports a billing or credit limit. Check the Vapi account balance before retrying.';
  }
  return 'The voice call could not connect. Try again, or use “Open Vapi demo” below.';
}
