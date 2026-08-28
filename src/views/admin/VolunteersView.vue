<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { subscribeVolunteers, addVolunteer, removeVolunteer } from '@/services/volunteerService'
import type { Volunteer } from '@/types'
import {
  Users,
  UserPlus,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-vue-next'

const volunteers = ref<Volunteer[]>([])
const newVolunteerName = ref('')
const isLoading = ref(true)
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

let unsubscribe: (() => void) | null = null

onMounted(() => {
  unsubscribe = subscribeVolunteers((list) => {
    volunteers.value = list
    isLoading.value = false
  })
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

async function handleAdd() {
  const name = newVolunteerName.value.trim()
  if (!name) return

  errorMessage.value = ''
  successMessage.value = ''
  isSubmitting.value = true

  try {
    await addVolunteer(name)
    newVolunteerName.value = ''
    successMessage.value = `'${name}' 봉사자가 등록되었습니다.`
    setTimeout(() => {
      successMessage.value = ''
    }, 2500)
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : '봉사자 추가 중 오류가 발생했습니다.'
  } finally {
    isSubmitting.value = false
  }
}

async function handleRemove(v: Volunteer) {
  if (!confirm(`'${v.name}' 봉사자를 명단에서 삭제하시겠습니까?`)) {
    return
  }

  try {
    await removeVolunteer(v.id)
  } catch (err) {
    alert(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.')
  }
}
</script>

<template>
  <div class="p-4 space-y-4 pb-20 animate-in fade-in duration-200">
    
    <!-- Title Header -->
    <div class="flex items-center justify-between px-1">
      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
          <Users class="w-5 h-5" />
        </div>
        <div>
          <h2 class="text-base font-black text-slate-900 tracking-tight">자원봉사자 명단 관리</h2>
          <p class="text-xs text-slate-400">총 {{ volunteers.length }}명 등록됨</p>
        </div>
      </div>
    </div>

    <!-- Feedback Alerts -->
    <div
      v-if="errorMessage"
      class="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-semibold flex items-center gap-2"
    >
      <AlertCircle class="w-4 h-4 text-rose-500 shrink-0" />
      <span>{{ errorMessage }}</span>
    </div>

    <div
      v-if="successMessage"
      class="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold flex items-center gap-2"
    >
      <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
      <span>{{ successMessage }}</span>
    </div>

    <!-- Add Volunteer Card Form -->
    <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
      <h3 class="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
        <UserPlus class="w-3.5 h-3.5 text-emerald-600" />
        <span>새 봉사자 추가</span>
      </h3>

      <form @submit.prevent="handleAdd" class="flex gap-2">
        <input
          v-model="newVolunteerName"
          type="text"
          required
          placeholder="봉사자 실명 입력 (예: 홍길동)"
          class="flex-1 px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
        />
        <button
          type="submit"
          :disabled="isSubmitting || !newVolunteerName.trim()"
          class="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-2xl text-xs font-extrabold shadow-sm flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
        >
          <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
          <span v-else>추가</span>
        </button>
      </form>
    </div>

    <!-- Volunteers List Card -->
    <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
      <h3 class="text-xs font-extrabold text-slate-800 flex items-center justify-between">
        <span>등록된 봉사자 목록</span>
        <span class="text-slate-400 font-normal">{{ volunteers.length }}명</span>
      </h3>

      <div v-if="isLoading" class="py-8 text-center text-slate-400 text-xs">
        <Loader2 class="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
        <span>봉사자 명단을 불러오는 중...</span>
      </div>

      <div v-else-if="volunteers.length === 0" class="py-8 text-center text-xs text-slate-400">
        등록된 자원봉사자가 없습니다.
      </div>

      <div v-else class="space-y-1.5">
        <div
          v-for="v in volunteers"
          :key="v.id"
          class="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-800 transition"
        >
          <span>{{ v.name }}</span>
          <button
            type="button"
            @click="handleRemove(v)"
            class="w-7 h-7 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-400 hover:text-rose-600 flex items-center justify-center transition active:scale-95 cursor-pointer"
            title="봉사자 삭제"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
