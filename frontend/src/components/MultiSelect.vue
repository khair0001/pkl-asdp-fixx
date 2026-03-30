<template>
  <div class="relative" ref="containerRef">
    <div
      @click="toggleDropdown"
      class="w-full px-3 py-2 border border-gray-300 rounded-lg cursor-pointer bg-white hover:border-gray-400 transition-colors min-h-[42px] flex items-center flex-wrap gap-2"
    >
      <template v-if="selectedItems.length === 0">
        <span class="text-gray-500">Semua {{ label }}</span>
      </template>
      <template v-else-if="selectedItems.length <= 2">
        <span
          v-for="item in selectedItems"
          :key="item[valueKey]"
          class="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
        >
          {{ item[labelKey] }}
          <button
            @click.stop="removeItem(item[valueKey])"
            class="ml-1 hover:text-blue-900"
          >
            ×
          </button>
        </span>
      </template>
      <template v-else>
        <span class="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
          {{ selectedItems[0][labelKey] }}
          <button
            @click.stop="removeItem(selectedItems[0][valueKey])"
            class="ml-1 hover:text-blue-900"
          >
            ×
          </button>
        </span>
        <span class="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
          +{{ selectedItems.length - 1 }} lainnya
        </span>
      </template>
    </div>

    <div
      v-if="isOpen"
      class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
    >
      <div class="sticky top-0 bg-white border-b border-gray-200 p-2">
        <button
          @click="clearAll"
          class="w-full px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
        >
          Hapus Semua
        </button>
      </div>
      <div class="p-2">
        <label
          v-for="option in options"
          :key="option[valueKey]"
          class="flex items-center px-3 py-2 hover:bg-gray-50 rounded cursor-pointer"
        >
          <input
            type="checkbox"
            :checked="isSelected(option[valueKey])"
            @change="toggleItem(option[valueKey])"
            class="mr-3 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <span class="text-sm">{{ option[labelKey] }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  options: {
    type: Array,
    required: true
  },
  label: {
    type: String,
    default: 'Item'
  },
  valueKey: {
    type: String,
    default: 'id'
  },
  labelKey: {
    type: String,
    default: 'name'
  }
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const containerRef = ref(null);

const selectedItems = computed(() => {
  return props.options.filter(option => 
    props.modelValue.includes(option[props.valueKey])
  );
});

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const isSelected = (value) => {
  return props.modelValue.includes(value);
};

const toggleItem = (value) => {
  const newValue = [...props.modelValue];
  const index = newValue.indexOf(value);
  
  if (index > -1) {
    newValue.splice(index, 1);
  } else {
    newValue.push(value);
  }
  
  emit('update:modelValue', newValue);
};

const removeItem = (value) => {
  const newValue = props.modelValue.filter(v => v !== value);
  emit('update:modelValue', newValue);
};

const clearAll = () => {
  emit('update:modelValue', []);
};

const handleClickOutside = (event) => {
  if (containerRef.value && !containerRef.value.contains(event.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
