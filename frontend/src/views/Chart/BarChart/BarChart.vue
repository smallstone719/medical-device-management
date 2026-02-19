<template>
  <div>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div class="space-y-5 sm:space-y-6">
      <ComponentCard title="Bar Chart 1"> <BarChartOne /> </ComponentCard>
    </div>
  </div>
</template>

<script setup>
import BarChartOne from "@/components/charts/BarChart/BarChartOne.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import { ref } from "vue";
const currentPageTitle = ref("Bar Chart");
</script>
