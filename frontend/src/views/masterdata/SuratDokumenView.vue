<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Data Dokumen</h1>
    </div>

    <!-- Info -->
    <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-blue-700">
            Data ini digunakan untuk header dokumen dan tanda pada laporan Excel. Perubahan akan langsung diterapkan pada laporan yang diexport.
          </p>
        </div>
      </div>
    </div>

    <!-- Form Card -->
    <div class="bg-white rounded-lg shadow p-6">
      <form @submit.prevent="saveData">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- No Dokumen -->
          <div>
            <label class="block text-gray-700 text-sm font-medium mb-2">
              No Dokumen
            </label>
            <input
              v-model="form.no_dokumen"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan nomor dokumen"
            />
            <p class="text-xs text-gray-500 mt-1">Contoh: DOC/001/2024</p>
          </div>

          <!-- Revisi -->
          <div>
            <label class="block text-gray-700 text-sm font-medium mb-2">
              Revisi
            </label>
            <input
              v-model="form.revisi"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan nomor revisi"
            />
            <p class="text-xs text-gray-500 mt-1">Contoh: 00, 01, 02</p>
          </div>
        </div>

        <!-- Halaman -->
        <div class="mt-6">
          <label class="block text-gray-700 text-sm font-medium mb-2">
            Halaman
          </label>
          <input
            v-model="form.halaman"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Contoh: 1 dari 1"
          />
          <p class="text-xs text-gray-500 mt-1">Format: X dari Y</p>
        </div>

        <!-- General Manager -->
        <div class="mt-6">
          <label class="block text-gray-700 text-sm font-medium mb-2">
            General Manager <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.general_manager"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Masukkan nama General Manager"
            required
          />
          <p class="text-xs text-gray-500 mt-1">Nama akan muncul di tanda tangan laporan</p>
        </div>

        <!-- Manager Usaha -->
        <div class="mt-6">
          <label class="block text-gray-700 text-sm font-medium mb-2">
            Manager Usaha <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.manager_usaha"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Masukkan nama Manager Usaha"
            required
          />
          <p class="text-xs text-gray-500 mt-1">Nama akan muncul di tanda tangan laporan</p>
        </div>

        <!-- Submit Button -->
        <div class="mt-8 flex justify-end">
          <button
            type="submit"
            :disabled="loading"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
          >
            <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ loading ? 'Menyimpan...' : 'Simpan Perubahan' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Preview Section -->
    <div class="mt-6 bg-gray-50 rounded-lg shadow p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Preview Data</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-white p-4 rounded border">
          <p class="text-sm text-gray-600">No Dokumen</p>
          <p class="font-medium">{{ form.no_dokumen || '-' }}</p>
        </div>
        <div class="bg-white p-4 rounded border">
          <p class="text-sm text-gray-600">Revisi</p>
          <p class="font-medium">{{ form.revisi || '-' }}</p>
        </div>
        <div class="bg-white p-4 rounded border">
          <p class="text-sm text-gray-600">Halaman</p>
          <p class="font-medium">{{ form.halaman || '-' }}</p>
        </div>
        <div class="bg-white p-4 rounded border">
          <p class="text-sm text-gray-600">General Manager</p>
          <p class="font-medium">{{ form.general_manager || '-' }}</p>
        </div>
        <div class="bg-white p-4 rounded border col-span-1 md:col-span-2">
          <p class="text-sm text-gray-600">Manager Usaha</p>
          <p class="font-medium">{{ form.manager_usaha || '-' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../../services/api";

const loading = ref(false);

const form = ref({
  surat_id: null,
  no_dokumen: "",
  revisi: "",
  halaman: "1 dari 1",
  general_manager: "",
  manager_usaha: "",
});

const loadData = async () => {
  try {
    const response = await api.get("/master/surat-dokumen/active");
    const data = response.data.data;
    
    if (data) {
      form.value = {
        surat_id: data.surat_id,
        no_dokumen: data.no_dokumen || "",
        revisi: data.revisi || "",
        halaman: data.halaman || "1 dari 1",
        general_manager: data.general_manager || "",
        manager_usaha: data.manager_usaha || "",
      };
    }
  } catch (error) {
    console.error("Gagal memuat data:", error);
    alert("Gagal memuat data");
  }
};

const saveData = async () => {
  loading.value = true;
  try {
    if (form.value.surat_id) {
      // Update existing data
      await api.put(`/master/surat-dokumen/${form.value.surat_id}`, form.value);
      alert("Data berhasil diupdate");
    } else {
      // Create new data (jika belum ada)
      const response = await api.post("/master/surat-dokumen", form.value);
      form.value.surat_id = response.data.data.surat_id;
      alert("Data berhasil disimpan");
    }
    loadData();
  } catch (error) {
    console.error("Error:", error);
    alert(error.response?.data?.error || "Gagal menyimpan data");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});
</script>
