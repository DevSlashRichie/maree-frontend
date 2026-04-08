// Global session event system
class SessionEventEmitter extends EventTarget {
  emitSessionExpired() {
    this.dispatchEvent(new CustomEvent("sessionExpired"));
  }

  onSessionExpired(callback: () => void) {
    this.addEventListener("sessionExpired", callback);
    return () => this.removeEventListener("sessionExpired", callback);
  }
}

export const sessionEvents = new SessionEventEmitter();
