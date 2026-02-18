import { ref } from 'vue';

export function useTable() {
  const page = ref(1);
  const limit = ref(10);
  const total = ref(0);

  const nextPage = () => {
    if (page.value * limit.value < total.value) {
      page.value++;
    }
  };

  const prevPage = () => {
    if (page.value > 1) {
      page.value--;
    }
  };

  return {
    page,
    limit,
    total,
    nextPage,
    prevPage
  };
}
