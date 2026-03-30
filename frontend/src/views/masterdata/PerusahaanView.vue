<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Master Perusahaan</h1>
      <button
        @click="openModal()"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Tambah Perusahaan
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-blue-600">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">No</th>
            <th 
              @click="toggleSort('nama_perusahaan')"
              class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-blue-700"
            >
              <div class="flex items-center">
                Nama Perusahaan
                <span class="ml-2">
                  <span v-if="sortColumn === 'nama_perusahaan' && sortDirection === 'asc'">↑</span>
                  <span v-else-if="sortColumn === 'nama_perusahaan' && sortDirection === 'desc'">↓</span>
                  <span v-else class="text-gray-400">↕</span>
                </span>
              </div>
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(item, index) in sortedPerusahaan" :key="item.perusahaan_id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ index + 1 }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.nama_perusahaan }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                Aktif
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
              <button
                @click="openModal(item)"
                class="text-blue-600 hover:text-blue-900"
              >
                Edit
              </button>
              <button
                @click="deleteItem(item)"
                class="text-red-600 hover:text-red-900"
              >
                Hapus
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-semibold mb-4">{{ isEdit ? 'Edit' : 'Tambah' }} Perusahaan</h2>
        
        <form @submit.prevent="saveItem">
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-medium mb-2">
              Nama Perusahaan <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.nama_perusahaan"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div class="flex justify-end space-x-2">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../../services/api';

const perusahaan = ref([]);
const showModal = ref(false);
const isEdit = ref(false);
const sortColumn = ref(null);
const sortDirection = ref(null);

const form = ref({
  perusahaan_id: null,
  nama_perusahaan: ''
});

const sortedPerusahaan = computed(() => {
  if (!sortColumn.value) return perusahaan.value;
  
  return [...perusahaan.value].sort((a, b) => {
    let aVal = a[sortColumn.value];
    let bVal = b[sortColumn.value];
    
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    
    if (sortDirection.value === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });
});

const toggleSort = (column) => {
  if (sortColumn.value === column) {
    if (sortDirection.value === 'asc') {
      sortDirection.value = 'desc';
    } else if (sortDirection.value === 'desc') {
      sortColumn.value = null;
      sortDirection.value = null;
    }
  } else {
    sortColumn.value = column;
    sortDirection.value = 'asc';
  }
};

const loadData = async () => {
  try {
    const response = await api.get('/master/perusahaan');
    perusahaan.value = response.data.data;
  } catch (error) {
    alert('Gagal memuat data');
  }
};

const openModal = (item = null) => {
  if (item) {
    isEdit.value = true;
    form.value = { ...item };
  } else {
    isEdit.value = false;
    form.value = { perusahaan_id: null, nama_perusahaan: '' };
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  form.value = { perusahaan_id: null, nama_perusahaan: '' };
};

const saveItem = async () => {
  try {
    if (isEdit.value) {
      await api.put(`/master/perusahaan/${form.value.perusahaan_id}`, form.value);
      alert('Perusahaan berhasil diupdate');
    } else {
      await api.post('/master/perusahaan', form.value);
      alert('Perusahaan berhasil ditambahkan');
    }
    closeModal();
    loadData();
  } catch (error) {
    alert(error.response?.data?.error || 'Gagal menyimpan data');
  }
};

const deleteItem = async (item) => {
  if (confirm(`Hapus perusahaan ${item.nama_perusahaan}?`)) {
    try {
      await api.delete(`/master/perusahaan/${item.perusahaan_id}`);
      alert('Perusahaan berhasil dihapus');
      loadData();
    } catch (error) {
      alert('Gagal menghapus data');
    }
  }
};

onMounted(() => {
  loadData();
});
</script>
