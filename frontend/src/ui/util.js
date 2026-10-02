// Escapa HTML: los datos vienen de la base de datos y nunca deben insertarse sin escapar (previene XSS)
export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const dinero = (n) =>
  new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(n);

// Solo se aceptan colores hexadecimales válidos
export const colorSeguro = (c) => (/^#[0-9a-f]{6}$/i.test(c) ? c : '#D9CFF2');

export const ANIMOS = {
  calma: { etiqueta: 'Calma', fondo: '#E8E0F8' },
  foco: { etiqueta: 'Foco', fondo: '#D8EEE3' },
  nostalgia: { etiqueta: 'Nostalgia', fondo: '#F5E8D8' },
  energia: { etiqueta: 'Energía', fondo: '#FFE6D0' },
  romance: { etiqueta: 'Romance', fondo: '#FADCE8' },
};

// Vela dibujada en SVG con el color del producto (no se necesitan imágenes)
export function velaSvg(color) {
  const c = colorSeguro(color);
  return `<svg viewBox="0 0 80 110" class="h-full w-full" aria-hidden="true">
    <ellipse cx="40" cy="104" rx="26" ry="5" fill="#4a3f5c" opacity=".08"/>
    <rect x="16" y="40" width="48" height="62" rx="12" fill="${c}"/>
    <rect x="16" y="40" width="48" height="14" rx="7" fill="#fff" opacity=".4"/>
    <line x1="40" y1="40" x2="40" y2="31" stroke="#4a3f5c" stroke-width="2" stroke-linecap="round"/>
    <g class="llama">
      <path d="M40 8C47 17 48 25 40 31C32 25 33 17 40 8Z" fill="#ffc9a8"/>
      <path d="M40 17C43 21 43 25 40 28C37 25 37 21 40 17Z" fill="#fff1c9"/>
    </g>
  </svg>`;
}