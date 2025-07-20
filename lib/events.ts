// Simple event system for real-time updates
type EventCallback = () => void;

class EventEmitter {
  private events: { [key: string]: EventCallback[] } = {};

  on(event: string, callback: EventCallback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event: string, callback: EventCallback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  emit(event: string) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback());
  }
}

export const eventEmitter = new EventEmitter();

// Event types
export const EVENTS = {
  LINKS_UPDATED: 'links_updated',
  SOCIALS_UPDATED: 'socials_updated'
} as const; 