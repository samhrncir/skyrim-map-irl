import { svgIcon } from './icons.js';

/**
 * Marker classes extend google.maps.OverlayView, which only exists once the maps
 * library has loaded — so they are built by this factory rather than at import time.
 * Plain OverlayView markers need no Map ID, which keeps JSON map styling working.
 */
export function createMarkerClasses() {
  const { OverlayView } = google.maps;

  function place(overlay) {
    const point = overlay.getProjection()?.fromLatLngToDivPixel(overlay.position);
    if (!point) return;
    overlay.el.style.left = `${point.x}px`;
    overlay.el.style.top = `${point.y}px`;
  }

  /** A location marker: a Skyrim-style glyph with a hover label. */
  class SkyrimMarker extends OverlayView {
    constructor({ position, icon, name, sub = '', fav = false, onClick, onHover }) {
      super();
      this.position = position;
      this.el = document.createElement('div');
      this.el.className = 'sk-marker';
      this.el.innerHTML =
        `<div class="sk-marker__icon">${svgIcon(icon)}</div>` +
        '<div class="sk-marker__label"><div class="name"></div><div class="sub"></div></div>';
      this.nameEl = this.el.querySelector('.name');
      this.subEl = this.el.querySelector('.sub');
      this.setName(name);
      this.setSub(sub);
      this.setFav(fav);
      this.el.addEventListener('click', () => onClick?.(this));
      this.el.addEventListener('mouseenter', () => onHover?.(this, true));
      this.el.addEventListener('mouseleave', () => onHover?.(this, false));
    }

    onAdd() {
      this.getPanes().overlayMouseTarget.appendChild(this.el);
      // Clicks and drags on the glyph must not fall through to the map.
      OverlayView.preventMapHitsAndGesturesFrom(this.el);
    }

    draw() { place(this); }
    onRemove() { this.el.remove(); }

    setName(text) { this.nameEl.textContent = text; }
    setSub(text) { this.subEl.textContent = text; }
    setFav(on) { this.el.classList.toggle('is-fav', !!on); }
    setSelected(on) { this.el.classList.toggle('is-selected', !!on); }
    setHovered(on) { this.el.classList.toggle('is-hovered', !!on); }
  }

  /** The player's arrow, turned to the device heading when one is known. */
  class PlayerMarker extends OverlayView {
    constructor(position) {
      super();
      this.position = position;
      this.el = document.createElement('div');
      this.el.className = 'sk-player';
      this.el.innerHTML = `<div class="sk-player__arrow">${svgIcon('player')}</div>`;
      this.arrow = this.el.firstElementChild;
    }

    // floatPane sits above the place markers; the element ignores pointer events anyway.
    onAdd() { this.getPanes().floatPane.appendChild(this.el); }
    draw() { place(this); }
    onRemove() { this.el.remove(); }

    setPosition(position) {
      this.position = position;
      this.draw();
    }

    setHeading(degrees) {
      this.arrow.style.transform = Number.isFinite(degrees) ? `rotate(${degrees}deg)` : '';
    }
  }

  return { SkyrimMarker, PlayerMarker };
}
