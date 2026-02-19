<template>
  <div>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div className="space-y-5 sm:space-y-6">
      <ComponentCard title="Responsive Image">
        <ResponsiveImage />
      </ComponentCard>
      <ComponentCard title="Image in 2 Grid">
        <TwoColumnImageGrid />
      </ComponentCard>
      <ComponentCard title="Image in 3 Grid">
        <ThreeColumnImageGrid />
      </ComponentCard>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import ComponentCard from '@/components/common/ComponentCard.vue'
import ResponsiveImage from '@/components/ui/images/ResponsiveImage.vue'
import TwoColumnImageGrid from '@/components/ui/images/TwoColumnImageGrid.vue'
import ThreeColumnImageGrid from '@/components/ui/images/ThreeColumnImageGrid.vue'
const currentPageTitle = ref('Images')
</script>

<style></style>
