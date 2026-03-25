export const VWORLD_KEY = import.meta.env.VITE_VWORLD_KEY

export function getVWorldTileUrl() {
  return `https://api.vworld.kr/req/wmts/1.0.0/${VWORLD_KEY}/Base/{z}/{y}/{x}.png`
}
