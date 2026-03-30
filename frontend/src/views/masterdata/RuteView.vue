<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Master Rute</h1>
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
        Tambah Rute
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
              Nama Rute
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
            >
              Pelabuhan Asal
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
            >
              Pelabuhan Tujuan
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
            >
              Jarak (Mil)
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
            >
              Aksi
            </th>
          </tr>
        </thead>

        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(item, index) in rute" :key="item.rute_id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ index + 1 }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ item.nama_rute }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ item.pelabuhan_asal?.nama_pelabuhan }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ item.pelabuhan_tujuan?.nama_pelabuhan }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ item.jarak || "-" }}
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
          {{ isEdit ? "Edit" : "Tambah" }} Rute
        </h2>

        <form @submit.prevent="saveItem">
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-medium mb-2">
              Pelabuhan Asal <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.pelabuhan_asal_id"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Pilih Pelabuhan Asal</option>
              <option
                v-for="p in pelabuhan"
                :key="p.pelabuhan_id"
                :value="p.pelabuhan_id"
              >
                {{ p.nama_pelabuhan }}
              </option>
            </select>
          </div>

          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-medium mb-2">
              Pelabuhan Tujuan <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.pelabuhan_tujuan_id"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Pilih Pelabuhan Tujuan</option>
              <option
                v-for="p in pelabuhan"
                :key="p.pelabuhan_id"
                :value="p.pelabuhan_id"
                :disabled="p.pelabuhan_id === form.pelabuhan_asal_id"
              >
                {{ p.nama_pelabuhan }}
              </option>
            </select>
          </div>

          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-medium mb-2">
              Nama Rute <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.nama_rute"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contoh: Mataram - Lembar"
              required
            />
          </div>

          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-medium mb-2">
              Jarak (Mil) <span class="text-gray-400 text-xs">(opsional)</span>
            </label>
            <input
              v-model="form.jarak"
              type="number"
              step="0.01"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contoh: 25.5 (boleh dikosongkan)"
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

const rute = ref([]);
const pelabuhan = ref([]);
const showModal = ref(false);
const isEdit = ref(false);
const form = ref({
  rute_id: null,
  pelabuhan_asal_id: "",
  pelabuhan_tujuan_id: "",
  nama_rute: "",
  jarak: "",
});

const loadData = async () => {
  try {
    const [ruteRes, pelabuhanRes] = await Promise.all([
      api.get("/master/rute"),
      api.get("/master/pelabuhan"),
    ]);
    rute.value = ruteRes.data.data;
    pelabuhan.value = pelabuhanRes.data.data;
  } catch (error) {
    alert("Gagal memuat data");
  }
};

const openModal = (item = null) => {
  if (item) {
    isEdit.value = true;
    form.value = {
      rute_id: item.rute_id,
      pelabuhan_asal_id: item.pelabuhan_asal_id,
      pelabuhan_tujuan_id: item.pelabuhan_tujuan_id,
      nama_rute: item.nama_rute,
      jarak: item.jarak,
    };
  } else {
    isEdit.value = false;
    form.value = {
      rute_id: null,
      pelabuhan_asal_id: "",
      pelabuhan_tujuan_id: "",
      nama_rute: "",
      jarak: "",
    };
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const saveItem = async () => {
  try {
    if (form.value.pelabuhan_asal_id === form.value.pelabuhan_tujuan_id) {
      alert("Pelabuhan asal dan tujuan tidak boleh sama!");
      return;
    }

    // Prepare data - jarak boleh kosong
    const payload = {
      pelabuhan_asal_id: form.value.pelabuhan_asal_id,
      pelabuhan_tujuan_id: form.value.pelabuhan_tujuan_id,
      nama_rute: form.value.nama_rute,
      jarak:
        form.value.jarak && form.value.jarak !== ""
          ? parseFloat(form.value.jarak)
          : null,
    };

    if (isEdit.value) {
      await api.put(`/master/rute/${form.value.rute_id}`, payload);
      alert("Rute berhasil diupdate");
    } else {
      await api.post("/master/rute", payload);
      alert("Rute berhasil ditambahkan");
    }
    closeModal();
    loadData();
  } catch (error) {
    alert(error.response?.data?.error || "Gagal menyimpan data");
  }
};

const deleteItem = async (item) => {
  if (confirm(`Hapus rute ${item.nama_rute}?`)) {
    try {
      await api.delete(`/master/rute/${item.rute_id}`);
      alert("Rute berhasil dihapus");
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
