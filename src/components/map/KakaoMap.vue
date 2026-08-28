<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { MapPin, ExternalLink, Navigation } from '@lucide/vue'

const props = defineProps<{
  schoolName: string
  address: string
  latitude?: number
  longitude?: number
}>()

const mapContainer = ref<HTMLDivElement | null>(null)
const kakaoApiKey = import.meta.env.VITE_KAKAO_MAP_API_KEY

// 창원시 기본 중심 좌표
const defaultLat = 35.2281
const defaultLng = 128.6811

const effectiveLat = () => props.latitude || defaultLat
const effectiveLng = () => props.longitude || defaultLng

function loadKakaoMapScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && (window as unknown as { kakao?: { maps: { load: (cb: () => void) => void } } }).kakao?.maps) {
      (window as unknown as { kakao: { maps: { load: (cb: () => void) => void } } }).kakao.maps.load(() => resolve())
      return
    }

    if (!kakaoApiKey || kakaoApiKey === 'your_kakao_javascript_api_key' || kakaoApiKey === 'mock-kakao-map-key') {
      reject(new Error('카카오맵 키 없음'))
      return
    }

    const script = document.createElement('script')
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoApiKey}&autoload=false`
    script.async = true
    script.onload = () => {
      if ((window as unknown as { kakao?: { maps: { load: (cb: () => void) => void } } }).kakao?.maps) {
        (window as unknown as { kakao: { maps: { load: (cb: () => void) => void } } }).kakao.maps.load(() => resolve())
      } else {
        reject(new Error('Kakao maps SDK 로드 실패'))
      }
    }
    script.onerror = (e) => reject(e)
    document.head.appendChild(script)
  })
}

interface KakaoMapInstance {
  setCenter: (latlng: unknown) => void
}

function initKakaoMap(): boolean {
  if (!mapContainer.value || !props.latitude || !props.longitude) return false

  try {
    const kakao = (window as unknown as {
      kakao: {
        maps: {
          LatLng: new (lat: number, lng: number) => unknown
          Map: new (container: HTMLElement, options: unknown) => KakaoMapInstance
          Marker: new (options: unknown) => { setMap: (map: KakaoMapInstance) => void }
          InfoWindow: new (options: unknown) => { open: (map: KakaoMapInstance, marker: unknown) => void }
        }
      }
    }).kakao

    if (!kakao?.maps?.Map) return false

    const centerPos = new kakao.maps.LatLng(props.latitude, props.longitude)
    const map = new kakao.maps.Map(mapContainer.value, {
      center: centerPos,
      level: 3,
    })

    const marker = new kakao.maps.Marker({ position: centerPos })
    marker.setMap(map)

    const infoWindow = new kakao.maps.InfoWindow({
      content: `<div style="padding:4px 8px;font-size:11px;font-weight:bold;color:#0f172a;white-space:nowrap;">${props.schoolName}</div>`,
    })
    infoWindow.open(map, marker)
    return true
  } catch {
    return false
  }
}

// 별도 API 키 없이도 전세계/한국 실제 지도를 바로 렌더링하는 Leaflet / OpenStreetMap 엔진
function initOpenStreetMap() {
  if (!mapContainer.value) return

  const lat = effectiveLat()
  const lng = effectiveLng()

  // Leaflet CSS 주입
  if (!document.getElementById('leaflet-css')) {
    const link = document.createElement('link')
    link.id = 'leaflet-css'
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
  }

  // Leaflet JS 주입
  const loadLeaflet = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as unknown as { L?: any }).L) {
        resolve((window as unknown as { L: any }).L)
        return
      }
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.async = true
      script.onload = () => resolve((window as unknown as { L: any }).L)
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  loadLeaflet()
    .then((L) => {
      if (!mapContainer.value) return
      mapContainer.value.innerHTML = ''

      const map = L.map(mapContainer.value, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
      }).addTo(map)

      const marker = L.marker([lat, lng]).addTo(map)
      marker.bindPopup(`<b>${props.schoolName}</b><br><span style="font-size:11px;color:#64748b;">${props.address}</span>`).openPopup()
    })
    .catch((err) => {
      console.warn('[Map] OSM 로드 실패:', err)
    })
}

onMounted(async () => {
  try {
    await loadKakaoMapScript()
    const ok = initKakaoMap()
    if (!ok) initOpenStreetMap()
  } catch {
    // 카카오맵 키가 없어도 실제 지도를 바로 표시!
    initOpenStreetMap()
  }
})

watch(
  () => [props.latitude, props.longitude],
  () => {
    initOpenStreetMap()
  }
)
</script>

<template>
  <div class="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <MapPin class="w-4 h-4" />
        </div>
        <h3 class="text-xs font-extrabold text-slate-800">봉사 장소 및 위치 지도</h3>
      </div>

      <!-- Kakao Map External Link Button -->
      <a
        :href="`https://map.kakao.com/link/search/${encodeURIComponent(address || schoolName)}`"
        target="_blank"
        rel="noopener noreferrer"
        class="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1 transition active:scale-95 cursor-pointer"
      >
        <Navigation class="w-3 h-3" />
        <span>카카오맵 길찾기</span>
        <ExternalLink class="w-2.5 h-2.5 ml-0.5 opacity-70" />
      </a>
    </div>

    <!-- Address Text -->
    <div class="bg-slate-50 p-3 rounded-2xl text-xs text-slate-700 font-semibold leading-relaxed border border-slate-200/60 flex items-start gap-2">
      <span class="text-slate-400 font-bold shrink-0">주소</span>
      <span class="text-slate-900">{{ address || '주소 정보가 등록되지 않았습니다.' }}</span>
    </div>

    <!-- Interactive Map Container (별도 키 없이도 실제 지도가 바로 뜸) -->
    <div class="relative w-full h-52 rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-100 z-0">
      <div
        ref="mapContainer"
        class="w-full h-full"
      ></div>
    </div>
  </div>
</template>

<style scoped>
:deep(.leaflet-popup-content-wrapper) {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-family: inherit;
}
:deep(.leaflet-popup-content) {
  margin: 8px 12px;
  line-height: 1.4;
}
</style>
