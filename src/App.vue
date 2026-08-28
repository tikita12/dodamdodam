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
  <div class="min-h-screen min-h-[100dvh] w-full max-w-xl mx-auto bg-slate-50 shadow-sm sm:border-x sm:border-slate-100 flex flex-col relative text-slate-800 antialiased">
    <!-- Top Fixed Header -->
    <AppHeader />

    <!-- Main Content Body -->
    <main :class="['flex-1 flex flex-col w-full', !isEntryView ? 'pb-20' : '']">
      <RouterView />
    </main>

    <!-- Bottom Navigation Bar -->
    <AppBottomNav />

    <!-- Global Volunteer Change Modal -->
    <VolunteerChangeModal />

    <!-- Global Admin Login Modal -->
    <AdminLoginModal />
  </div>
</template>

<style scoped>
/* App layout styling */
</style>
