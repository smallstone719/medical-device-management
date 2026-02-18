<template>
  <ThemeProvider>
    <SidebarProvider>
      <RouterView />
      <ToastContainer />
    </SidebarProvider>
  </ThemeProvider>
</template>

<script setup lang="ts">
import ThemeProvider from './components/layout/ThemeProvider.vue'
import SidebarProvider from './components/layout/SidebarProvider.vue'
import ToastContainer from './components/common/ToastContainer.vue'
</script>
