<script setup lang="ts">
import type { ComputedScheduleStatus } from '@/types'

export type AdminFilterTab = 'all' | ComputedScheduleStatus

defineProps<{
  activeTab: AdminFilterTab
  counts: Record<AdminFilterTab, number>
}>()

const emit = defineEmits<{
  (e: 'update:activeTab', tab: AdminFilterTab): void
}>()

const tabs: { key: AdminFilterTab; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'open', label: '신청가능' },
  { key: 'closed', label: '마감' },
  { key: 'confirmed', label: '확정완료' },
  { key: 'in_progress', label: '진행중' },
  { key: 'ended', label: '종료' },
  { key: 'cancelled', label: '취소됨' },
]
</script>

<template>
  <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
    <button
      v-for="t in tabs"
      :key="t.key"
      type="button"
      @click="emit('update:activeTab', t.key)"
      :class="[
        'px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shrink-0',
        activeTab === t.key
          ? 'bg-slate-900 text-white shadow-xs'
          : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100'
      ]"
    >
      <span>{{ t.label }}</span>
      <span
        :class="[
          'text-[10px] font-extrabold px-1.5 py-0.2 rounded-full',
          activeTab === t.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
        ]"
      >
        {{ counts[t.key] || 0 }}
      </span>
    </button>
  </div>
</template>
