import { ref } from 'vue'
import categoryService, { type Category } from '@/services/category.service'
import departmentService, { type Department } from '@/services/department.service'

// Shared state across all components
const categories = ref<Category[]>([])
const departments = ref<Department[]>([])
const categoriesLoaded = ref(false)
const departmentsLoaded = ref(false)

export function useReferenceData() {
  const loadCategories = async (force = false) => {
    if (categoriesLoaded.value && !force) {
      return categories.value
    }

    try {
      const response = await categoryService.getAll()
      categories.value = response.data || response
      categoriesLoaded.value = true
      return categories.value
    } catch (err) {
      console.error('Failed to load categories:', err)
      return []
    }
  }

  const loadDepartments = async (force = false) => {
    if (departmentsLoaded.value && !force) {
      return departments.value
    }

    try {
      const response = await departmentService.getAll()
      departments.value = response.data || response
      departmentsLoaded.value = true
      return departments.value
    } catch (err) {
      console.error('Failed to load departments:', err)
      return []
    }
  }

  const refreshCategories = () => loadCategories(true)
  const refreshDepartments = () => loadDepartments(true)

  return {
    categories,
    departments,
    loadCategories,
    loadDepartments,
    refreshCategories,
    refreshDepartments,
  }
}
