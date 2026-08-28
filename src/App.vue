<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppBottomNav from '@/components/layout/AppBottomNav.vue'
import VolunteerChangeModal from '@/components/modals/VolunteerChangeModal.vue'
import AdminLoginModal from '@/components/modals/AdminLoginModal.vue'

const route = useRoute()
const isEntryView = computed(() => route.path === '/')
</script>

<template>
  <div class="min-h-screen max-w-md mx-auto bg-slate-50 shadow-sm border-x border-slate-100 flex flex-col relative text-slate-800 antialiased">
    <!-- Top Fixed Header -->
    <AppHeader />

    <!-- Main Content Body -->
    <main :class="['flex-1 flex flex-col', !isEntryView ? 'pb-20' : '']">
      <RouterView />
    </main>

    <!-- Bottom Navigation Bar (홈, 일정, 관리자) -->
    <AppBottomNav />

    <!-- Global Volunteer Change Modal -->
    <VolunteerChangeModal />

    <!-- Global Admin Login Modal -->
    <AdminLoginModal />
  </div>
</template>

<style scoped>
/* Mobile app frame styling */
</style>
