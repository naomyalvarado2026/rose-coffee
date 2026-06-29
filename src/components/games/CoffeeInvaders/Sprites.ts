export const PLAYER_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges">
  <path fill="%2394a3b8" d="M3 13h10v3H3z M6 1h4v2H6z"/>
  <path fill="%23475569" d="M4 3h8v10H4z"/>
  <path fill="%2338bdf8" d="M6 5h4v3H6z"/>
  <path fill="%230f172a" d="M7 13h2v2H7z"/>
</svg>`;

export const ENEMY1_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11 8" shape-rendering="crispEdges">
  <path fill="%23ef4444" d="M2 0h7v1H2zm-1 1h9v1H1zm-1 1h11v1H0zm0 1h3v1H0zm8 0h3v1H8zm-8 1h11v1H0zm2 1h7v1H2zm1 1h5v1H3z"/>
  <path fill="%23ffffff" d="M2 2h2v1H2zm5 0h2v1H7z"/>
</svg>`;

export const ENEMY2_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11 8" shape-rendering="crispEdges">
  <path fill="%23f59e0b" d="M3 0h5v1H3zm-1 1h7v1H2zm-1 1h9v1H1zm-1 1h11v1H0zm0 1h11v1H0zm1 1h9v1H1zm1 1h2v1H2zm5 0h2v1H7z"/>
  <path fill="%23ffffff" d="M3 3h1v1H3zm4 0h1v1H7z"/>
</svg>`;

export const BOSS_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" shape-rendering="crispEdges">
  <path fill="%23be185d" d="M12 2h8v2h-8z M10 4h12v4H10z M6 8h20v14H6z M4 12h2v6H4z M26 12h2v6h-2z M8 22h16v4H8z M12 26h8v2h-8z"/>
  <path fill="%23fbcfe8" d="M10 12h4v4h-4z M18 12h4v4h-4z"/>
  <path fill="%239d174d" d="M14 18h4v2h-4z"/>
</svg>`;

export const PROJECTILE_PLAYER_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 6" shape-rendering="crispEdges">
  <path fill="%23d4af37" d="M1 0h2v1H1z M0 1h4v4H0z M1 5h2v1H1z"/>
</svg>`;

export const PROJECTILE_ENEMY_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 6" shape-rendering="crispEdges">
  <path fill="%234ade80" d="M1 0h2v1H1z M0 1h4v4H0z M1 5h2v1H1z"/>
</svg>`;

export const POWERUP_DOUBLE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges">
  <path fill="%23facc15" d="M4 2h8v12H4z"/>
  <path fill="%23ffffff" d="M6 4h1v8H6z M9 4h1v8H9z"/>
</svg>`;

export const POWERUP_LASER_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges">
  <path fill="%23a855f7" d="M4 2h8v12H4z"/>
  <path fill="%23ffffff" d="M7 4h2v8H7z"/>
</svg>`;

export const POWERUP_SHIELD_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges">
  <path fill="%2338bdf8" d="M4 2h8v12H4z"/>
  <path fill="%23ffffff" d="M6 4h4v8H6z"/>
  <path fill="%2338bdf8" d="M7 5h2v6H7z"/>
</svg>`;

export const loadSprite = (svg: string): Promise<HTMLImageElement> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = svg;
  });
};
