// log.js — the live event log shown at the bottom of the screen.
// One job: remember what just happened, newest first, capped at six.
export function pushLog(state, msg) {
  state.log.unshift({ t: state.time, msg });
  if (state.log.length > 6) state.log.length = 6;
}

export function flashMessage(state, msg, seconds = 2.2) {
  state.message = msg;
  state.messageTimer = seconds;
}
