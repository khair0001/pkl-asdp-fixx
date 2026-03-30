<template>
  <div class="relative" ref="containerRef">
    <div class="relative">
      <input
        v-model="searchQuery"
        @focus="isOpen = true"
        @input="isOpen = true"
        type="text"
        :placeholder="placeholder"
        :required="required"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>

    <div
      v-if="isOpen && filteredOptions.length > 0"
      class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
    >
      <div
        v-for="option in filteredOptions"
        :key="option[valueKey]"
        @click="selectOption(option)"
        class="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm"
        :class="{ 'bg-blue-100': option[valueKey] === modelValue }"
      >
        {{ option[labelKey] }}
      </div>
    </div>

    <div
      v-if="isOpen && filteredOptions.length === 0 && searchQuery"
      class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500 text-sm"
    >
      Tidak ada hasil
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  options: {
    type: Array,
    required: true
  },
  placeholder: {
    type: String,
    default: '-- Pilih --'
  },
  valueKey: {
    type: String,
    default: 'id'
  },
  labelKey: {
    type: String,
    default: 'name'
  },
  required: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const searchQuery = ref('');
const containerRef = ref(null);

const filteredOptions = computed(() => {
  if (!searchQuery.value) {
    return props.options;
  }
  
  const query = searchQuery.value.toLowerCase();
  return props.options.filter(option => 
    option[props.labelKey].toLowerCase().includes(query)
  );
});

const selectOption = (option) => {
  emit('update:modelValue', option[props.valueKey]);
  searchQuery.value = option[props.labelKey];
  isOpen.value = false;
};

const handleClickOutside = (event) => {
  if (containerRef.value && !containerRef.value.contains(event.target)) {
    isOpen.value = false;
    updateSearchQuery();
  }
};

const updateSearchQuery = () => {
  const selectedOption = props.options.find(
    option => option[props.valueKey] === props.modelValue
  );
  searchQuery.value = selectedOption ? selectedOption[props.labelKey] : '';
};

watch(() => props.modelValue, () => {
  updateSearchQuery();
}, { immediate: true });

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
