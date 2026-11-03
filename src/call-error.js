function errorDetail(error) {
  return [typeof error === 'string' ? error : '', error?.name, error?.message, error?.errorMsg, error?.type, error?.stage,
    error?.error?.name, error?.error?.message, error?.error?.errorMsg, error?.error?.errorDetail].filter(Boolean).join(' ');
}

export function isRoomClosedError(error) {
  return /meeting (?:has )?ended|room (?:was )?(?:closed|deleted)|meeting.*ejected/i.test(errorDetail(error));
}

export function callEndMessage(reason) {
  if (reason === 'silence-timed-out') return 'The call ended after a period of silence. Start another conversation when you’re ready.';
  if (reason === 'exceeded-max-duration') return 'The five-minute demo limit was reached. You can start another conversation.';
  return 'The call has ended. You can download the transcript or start another conversation.';
}

export function isNormalEndReason(reason) {
  return reason === 'silence-timed-out' || reason === 'exceeded-max-duration' || /^assistant-ended-call(?:$|-)/.test(reason ?? '');
}

export function callErrorMessage(error, {connected = false} = {}) {
  const detail = errorDetail(error);
  if (/notallowed|permission|notfound|microphone|device.*not.*found/i.test(detail)) {
    return 'Microphone access is blocked or no microphone is available. Allow microphone access in this browser’s site settings, then try again.';
  }
  if (/payment|credit|balance|402/i.test(detail)) {
    return 'Vapi reports a billing or credit limit. Check the Vapi account balance before retrying.';
  }
  if (/websocket|network|timed?\s*out|timeout|daily|meeting.*ended|connection/i.test(detail)) {
    return (connected ? 'The live audio connection was interrupted. ' : 'The live audio connection failed. ') + 'Try again. If it repeats, open this page in Chrome, Edge or Safari outside the in-app browser, or try another network. You can also use “Open Vapi demo” above.';
  }
  return (connected ? 'The voice call ended unexpectedly. ' : 'The voice call could not connect. ') + 'Try again, or use “Open Vapi demo” above.';
}
