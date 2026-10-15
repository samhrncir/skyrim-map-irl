const STORAGE_KEY = 'skyrim-map:favorites';

/** Favorited place records, persisted to localStorage. Emits 'change'. */
export class FavoritesStore extends EventTarget {
  #items = new Map();

  constructor() {
    super();
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      for (const p of saved?.items ?? []) this.#items.set(p.id, p);
    } catch {
      /* corrupt or unavailable storage: start empty */
    }
  }

  #save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, items: this.all() }));
    } catch {
      /* storage full or blocked: favorites live for this session only */
    }
    this.dispatchEvent(new Event('change'));
  }

  has(id) { return this.#items.has(id); }
  get(id) { return this.#items.get(id); }
  get size() { return this.#items.size; }

  /** All favorites, A→Z. */
  all() {
    return [...this.#items.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  add(record) {
    this.#items.set(record.id, { ...record, addedAt: Date.now() });
    this.#save();
  }

  remove(id) {
    if (this.#items.delete(id)) this.#save();
  }

  /** Returns true if the place is a favorite after toggling. */
  toggle(record) {
    if (this.has(record.id)) {
      this.remove(record.id);
      return false;
    }
    this.add(record);
    return true;
  }
}
