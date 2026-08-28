<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { subscribeSubjects, addSubject, removeSubject } from '@/services/subjectService'
import type { Subject } from '@/types'
import {
  BookOpen,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-vue-next'

const subjects = ref<Subject[]>([])
const newSubjectName = ref('')
const isLoading = ref(true)
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

let unsubscribe: (() => void) | null = null

onMounted(() => {
  unsubscribe = subscribeSubjects((list) => {
    subjects.value = list
    isLoading.value = false
  })
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

async function handleAdd() {
  const name = newSubjectName.value.trim()
  if (!name) return

  errorMessage.value = ''
  successMessage.value = ''
  isSubmitting.value = true

  try {
    await addSubject(name)
    newSubjectName.value = ''
    successMessage.value = `'${name}' 교육과목이 등록되었습니다.`
    setTimeout(() => {
      successMessage.value = ''
    }, 2500)
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : '과목 추가 중 오류가 발생했습니다.'
  } finally {
    isSubmitting.value = false
  }
}

async function handleRemove(sub: Subject) {
  if (!confirm(`'${sub.name}' 과목을 삭제하시겠습니까?`)) {
    return
  }

  try {
    await removeSubject(sub.id)
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
        <div class="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
          <BookOpen class="w-5 h-5" />
        </div>
        <div>
          <h2 class="text-base font-black text-slate-900 tracking-tight">교육과목 관리</h2>
          <p class="text-xs text-slate-400">총 {{ subjects.length }}개 등록됨</p>
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

    <!-- Add Subject Form Card -->
    <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
      <h3 class="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
        <Plus class="w-3.5 h-3.5 text-blue-600" />
        <span>새 교육과목 추가</span>
      </h3>

      <form @submit.prevent="handleAdd" class="flex gap-2">
        <input
          v-model="newSubjectName"
          type="text"
          required
          placeholder="과목명 입력 (예: 청소년 도박예방 교육)"
          class="flex-1 px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
        />
        <button
          type="submit"
          :disabled="isSubmitting || !newSubjectName.trim()"
          class="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-2xl text-xs font-extrabold shadow-sm flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
        >
          <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
          <span v-else>추가</span>
        </button>
      </form>
    </div>

    <!-- Subjects List Card -->
    <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
      <h3 class="text-xs font-extrabold text-slate-800 flex items-center justify-between">
        <span>등록된 교육과목 목록</span>
        <span class="text-slate-400 font-normal">{{ subjects.length }}개</span>
      </h3>

      <div v-if="isLoading" class="py-8 text-center text-slate-400 text-xs">
        <Loader2 class="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
        <span>과목 목록을 불러오는 중...</span>
      </div>

      <div v-else-if="subjects.length === 0" class="py-8 text-center text-xs text-slate-400">
        등록된 교육과목이 없습니다.
      </div>

      <div v-else class="space-y-1.5">
        <div
          v-for="sub in subjects"
          :key="sub.id"
          class="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-800 transition"
        >
          <span>{{ sub.name }}</span>
          <button
            type="button"
            @click="handleRemove(sub)"
            class="w-7 h-7 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-400 hover:text-rose-600 flex items-center justify-center transition active:scale-95 cursor-pointer"
            title="과목 삭제"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
