<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useSessionStore } from '@/stores/session'
import { subscribeVolunteers } from '@/services/volunteerService'
import type { Volunteer } from '@/types'
import { UserCheck, Search, X } from '@lucide/vue'

const sessionStore = useSessionStore()
const volunteers = ref<Volunteer[]>([])
const searchQuery = ref('')
const selectedVolunteerId = ref(sessionStore.volunteerId || '')

let unsubscribe: (() => void) | null = null

onMounted(() => {
  unsubscribe = subscribeVolunteers((list) => {
    volunteers.value = list
    if (!selectedVolunteerId.value && sessionStore.volunteerId) {
      selectedVolunteerId.value = sessionStore.volunteerId
    }
  })
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

const filteredVolunteers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return volunteers.value
  return volunteers.value.filter((v) => v.name.toLowerCase().includes(q))
})

function handleConfirm() {
  const target = volunteers.value.find((v) => v.id === selectedVolunteerId.value)
  if (target) {
    sessionStore.setVolunteer(target.id, target.name)
    sessionStore.closeVolunteerModal()
  }
}

function handleSelect(volunteer: Volunteer) {
  selectedVolunteerId.value = volunteer.id
}
</script>

<template>
  <div
    v-if="sessionStore.isVolunteerModalOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity"
  >
    <div class="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 flex flex-col max-h-[85vh]">
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck class="w-4 h-4" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-900 leading-tight">자원봉사자 이름 변경</h3>
            <p class="text-[11px] text-slate-400">목록에서 본인의 이름을 선택하세요</p>
          </div>
        </div>
        <button
          type="button"
          @click="sessionStore.closeVolunteerModal"
          class="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Search Input -->
      <div class="relative mt-3">
        <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="이름 검색..."
          class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
        />
      </div>

      <!-- Volunteer List -->
      <div class="flex-1 overflow-y-auto my-3 space-y-1.5 min-h-[140px] max-h-[260px] pr-1">
        <div v-if="volunteers.length === 0" class="text-center py-8 text-xs text-slate-400">
          등록된 자원봉사자가 없습니다.
        </div>
        <div v-else-if="filteredVolunteers.length === 0" class="text-center py-8 text-xs text-slate-400">
          검색 결과가 없습니다.
        </div>
        <button
          v-for="v in filteredVolunteers"
          :key="v.id"
          type="button"
          @click="handleSelect(v)"
          :class="[
            'w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition text-left',
            selectedVolunteerId === v.id
              ? 'bg-emerald-500 text-white shadow-xs'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
          ]"
        >
          <span>{{ v.name }}</span>
          <span v-if="selectedVolunteerId === v.id" class="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">선택됨</span>
        </button>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-2 pt-2 border-t border-slate-100">
        <button
          type="button"
          @click="sessionStore.closeVolunteerModal"
          class="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs transition"
        >
          취소
        </button>
        <button
          type="button"
          @click="handleConfirm"
          :disabled="!selectedVolunteerId"
          class="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-sm transition"
        >
          변경 완료
        </button>
      </div>
    </div>
  </div>
</template>
