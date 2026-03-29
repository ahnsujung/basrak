const KAKAO_REST_KEY = import.meta.env.VITE_KAKAO_REST_KEY

/**
 * 카카오 로컬 API로 좌표 → 시군구 주소 변환
 * @returns {string|null} "서울특별시 강남구" 형태, 실패 시 null
 */
export async function reverseGeocode(lat, lng) {
  if (!KAKAO_REST_KEY) return null

  try {
    const res = await fetch(
      `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${lng}&y=${lat}`,
      { headers: { Authorization: `KakaoAK ${KAKAO_REST_KEY}` } }
    )
    if (!res.ok) return null

    const { documents } = await res.json()
    const region = documents?.find((d) => d.region_type === 'H')
    if (!region) return null

    // "시도 시군구" 형태로 반환
    return [region.region_1depth_name, region.region_2depth_name]
      .filter(Boolean)
      .join(' ')
  } catch {
    return null
  }
}
