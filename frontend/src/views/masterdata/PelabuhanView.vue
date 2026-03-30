<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Master Pelabuhan</h1>
      <button
        @click="openModal()"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
      >
        <svg
          class="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        Tambah Pelabuhan
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-blue-600">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
            >
              No
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
            >
              Nama Pelabuhan
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
            >
              Lokasi
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
            >
              Aksi
            </th>
          </tr>
        </thead>

        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(item, index) in pelabuhan" :key="item.pelabuhan_id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ index + 1 }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ item.nama_pelabuhan }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ item.lokasi || "-" }}
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2"
            >
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
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-semibold mb-4">
          {{ isEdit ? "Edit" : "Tambah" }} Pelabuhan
        </h2>

        <form @submit.prevent="saveItem">
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-medium mb-2">
              Nama Pelabuhan <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.nama_pelabuhan"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-medium mb-2">
              Lokasi
            </label>
            <input
              v-model="form.lokasi"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
import { ref, onMounted } from "vue";
import api from "../../services/api";

const pelabuhan = ref([]);
const showModal = ref(false);
const isEdit = ref(false);
const form = ref({
  pelabuhan_id: null,
  nama_pelabuhan: "",
  lokasi: "",
});

const loadData = async () => {
  try {
    const response = await api.get("/master/pelabuhan");
    pelabuhan.value = response.data.data;
  } catch (error) {
    alert("Gagal memuat data");
  }
};

const openModal = (item = null) => {
  if (item) {
    isEdit.value = true;
    form.value = { ...item };
  } else {
    isEdit.value = false;
    form.value = { pelabuhan_id: null, nama_pelabuhan: "", lokasi: "" };
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const saveItem = async () => {
  try {
    if (isEdit.value) {
      await api.put(`/master/pelabuhan/${form.value.pelabuhan_id}`, form.value);
      alert("Pelabuhan berhasil diupdate");
    } else {
      await api.post("/master/pelabuhan", form.value);
      alert("Pelabuhan berhasil ditambahkan");
    }
    closeModal();
    loadData();
  } catch (error) {
    alert(error.response?.data?.error || "Gagal menyimpan data");
  }
};

const deleteItem = async (item) => {
  if (confirm(`Hapus pelabuhan ${item.nama_pelabuhan}?`)) {
    try {
      await api.delete(`/master/pelabuhan/${item.pelabuhan_id}`);
      alert("Pelabuhan berhasil dihapus");
      loadData();
    } catch (error) {
      alert("Gagal menghapus data");
    }
  }
};

onMounted(() => {
  loadData();
});
</script>
