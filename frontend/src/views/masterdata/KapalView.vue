<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Master Kapal</h1>
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
        Tambah Kapal
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
              @click="toggleSort('nama_kapal')"
              class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-blue-700"
            >
              <div class="flex items-center">
                Nama Kapal
                <span class="ml-2">
                  <span
                    v-if="
                      sortColumn === 'nama_kapal' && sortDirection === 'asc'
                    "
                    >↑</span
                  >
                  <span
                    v-else-if="
                      sortColumn === 'nama_kapal' && sortDirection === 'desc'
                    "
                    >↓</span
                  >
                  <span v-else class="text-blue-200">↕</span>
                </span>
              </div>
            </th>

            <th
              @click="toggleSort('nama_perusahaan')"
              class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-blue-700"
            >
              <div class="flex items-center">
                Perusahaan
                <span class="ml-2">
                  <span
                    v-if="
                      sortColumn === 'nama_perusahaan' &&
                      sortDirection === 'asc'
                    "
                    >↑</span
                  >
                  <span
                    v-else-if="
                      sortColumn === 'nama_perusahaan' &&
                      sortDirection === 'desc'
                    "
                    >↓</span
                  >
                  <span v-else class="text-blue-200">↕</span>
                </span>
              </div>
            </th>

            <th
              @click="toggleSort('berat_kapal')"
              class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-blue-700"
            >
              <div class="flex items-center">
                GT
                <span class="ml-2">
                  <span
                    v-if="
                      sortColumn === 'berat_kapal' && sortDirection === 'asc'
                    "
                    >↑</span
                  >
                  <span
                    v-else-if="
                      sortColumn === 'berat_kapal' && sortDirection === 'desc'
                    "
                    >↓</span
                  >
                  <span v-else class="text-blue-200">↕</span>
                </span>
              </div>
            </th>

            <th
              @click="toggleSort('kapasitas_penumpang')"
              class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-blue-700"
            >
              <div class="flex items-center">
                Kapasitas Penumpang
                <span class="ml-2">
                  <span
                    v-if="
                      sortColumn === 'kapasitas_penumpang' && sortDirection === 'asc'
                    "
                    >↑</span
                  >
                  <span
                    v-else-if="
                      sortColumn === 'kapasitas_penumpang' && sortDirection === 'desc'
                    "
                    >↓</span
                  >
                  <span v-else class="text-blue-200">↕</span>
                </span>
              </div>
            </th>

            <th
              @click="toggleSort('kapasitas_kendaraan')"
              class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-blue-700"
            >
              <div class="flex items-center">
                Kapasitas Kendaraan
                <span class="ml-2">
                  <span
                    v-if="
                      sortColumn === 'kapasitas_kendaraan' && sortDirection === 'asc'
                    "
                    >↑</span
                  >
                  <span
                    v-else-if="
                      sortColumn === 'kapasitas_kendaraan' && sortDirection === 'desc'
                    "
                    >↓</span
                  >
                  <span v-else class="text-blue-200">↕</span>
                </span>
              </div>
            </th>

            <th
              class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
            >
              Aksi
            </th>
          </tr>
        </thead>

        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(item, index) in sortedKapal" :key="item.kapal_id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ index + 1 }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ item.nama_kapal }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ item.perusahaan?.nama_perusahaan }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ item.berat_kapal || "-" }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ item.kapasitas_penumpang || "-" }} orang
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ item.kapasitas_kendaraan || "-" }} unit
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
          {{ isEdit ? "Edit" : "Tambah" }} Kapal
        </h2>

        <form @submit.prevent="saveItem">
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-medium mb-2">
              Perusahaan <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.perusahaan_id"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Pilih Perusahaan</option>
              <option
                v-for="p in perusahaan"
                :key="p.perusahaan_id"
                :value="p.perusahaan_id"
              >
                {{ p.nama_perusahaan }}
              </option>
            </select>
          </div>

          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-medium mb-2">
              Nama Kapal <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.nama_kapal"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-medium mb-2">
              GT
            </label>
            <input
              v-model="form.berat_kapal"
              type="number"
              step="0.01"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan GT (Gross Tonnage)"
            />
          </div>

          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-medium mb-2">
              Kapasitas Penumpang
            </label>
            <input
              v-model="form.kapasitas_penumpang"
              type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan kapasitas penumpang (orang)"
            />
          </div>

          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-medium mb-2">
              Kapasitas Kendaraan
            </label>
            <input
              v-model="form.kapasitas_kendaraan"
              type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan kapasitas kendaraan (unit)"
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
import { ref, computed, onMounted } from "vue";
import api from "../../services/api";

const kapal = ref([]);
const perusahaan = ref([]);
const showModal = ref(false);
const isEdit = ref(false);
const sortColumn = ref(null);
const sortDirection = ref(null);

const form = ref({
  kapal_id: null,
  perusahaan_id: "",
  nama_kapal: "",
  berat_kapal: "",
  kapasitas_penumpang: "",
  kapasitas_kendaraan: "",
});

const sortedKapal = computed(() => {
  if (!sortColumn.value) return kapal.value;

  return [...kapal.value].sort((a, b) => {
    let aVal, bVal;

    if (sortColumn.value === "nama_perusahaan") {
      aVal = a.perusahaan?.nama_perusahaan || "";
      bVal = b.perusahaan?.nama_perusahaan || "";
    } else {
      aVal = a[sortColumn.value] || "";
      bVal = b[sortColumn.value] || "";
    }

    if (typeof aVal === "string") {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (sortDirection.value === "asc") {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });
});

const toggleSort = (column) => {
  if (sortColumn.value === column) {
    if (sortDirection.value === "asc") {
      sortDirection.value = "desc";
    } else if (sortDirection.value === "desc") {
      sortColumn.value = null;
      sortDirection.value = null;
    }
  } else {
    sortColumn.value = column;
    sortDirection.value = "asc";
  }
};

const loadData = async () => {
  try {
    const [kapalRes, perusahaanRes] = await Promise.all([
      api.get("/master/kapal"),
      api.get("/master/perusahaan"),
    ]);
    kapal.value = kapalRes.data.data;
    perusahaan.value = perusahaanRes.data.data;
  } catch (error) {
    alert("Gagal memuat data");
  }
};

const openModal = (item = null) => {
  if (item) {
    isEdit.value = true;
    form.value = {
      kapal_id: item.kapal_id,
      perusahaan_id: item.perusahaan_id,
      nama_kapal: item.nama_kapal,
      berat_kapal: item.berat_kapal,
      kapasitas_penumpang: item.kapasitas_penumpang,
      kapasitas_kendaraan: item.kapasitas_kendaraan,
    };
  } else {
    isEdit.value = false;
    form.value = {
      kapal_id: null,
      perusahaan_id: "",
      nama_kapal: "",
      berat_kapal: "",
      kapasitas_penumpang: "",
      kapasitas_kendaraan: "",
    };
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const saveItem = async () => {
  try {
    if (isEdit.value) {
      await api.put(`/master/kapal/${form.value.kapal_id}`, form.value);
      alert("Kapal berhasil diupdate");
    } else {
      await api.post("/master/kapal", form.value);
      alert("Kapal berhasil ditambahkan");
    }
    closeModal();
    loadData();
  } catch (error) {
    alert(error.response?.data?.error || "Gagal menyimpan data");
  }
};

const deleteItem = async (item) => {
  if (confirm(`Hapus kapal ${item.nama_kapal}?`)) {
    try {
      await api.delete(`/master/kapal/${item.kapal_id}`);
      alert("Kapal berhasil dihapus");
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
