<template>
  <div>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div class="space-y-5 sm:space-y-6">
      <ComponentCard title="Line Chart 1">
        <LineChartOne />
      </ComponentCard>
    </div>
  </div>
</template>

<script setup>
import LineChartOne from "@/components/charts/LineChart/LineChartOne.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import { ref } from "vue";
const currentPageTitle = ref("Line Chart");
</script>
