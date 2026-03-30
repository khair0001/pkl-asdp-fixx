<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Master Tarif</h1>

    <!-- Tabs -->
    <div class="mb-6">
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <button
            @click="activeTab = 'penumpang'"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm',
              activeTab === 'penumpang'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            ]"
          >
            Tarif Penumpang
          </button>
          <button
            @click="activeTab = 'kendaraan'"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm',
              activeTab === 'kendaraan'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            ]"
          >
            Tarif Kendaraan
          </button>
        </nav>
      </div>
    </div>

    <!-- Tarif Penumpang -->
    <div v-if="activeTab === 'penumpang'">
      <div class="flex justify-between items-center mb-4">
        <div class="flex items-center space-x-4">
          <h2 class="text-xl font-semibold text-gray-800">Tarif Penumpang</h2>
          <select
            v-model="filterRuteId"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Rute</option>
            <option v-for="r in rute" :key="r.rute_id" :value="r.rute_id">
              {{ r.nama_rute }}
            </option>
          </select>
        </div>
        <button
          @click="openModalPenumpang()"
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
          Tambah Tarif
        </button>
      </div>

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
                Rute
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                Kategori
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                Tarif
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                Aksi
              </th>
            </tr>
          </thead>

          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="(item, index) in filteredTarifPenumpang"
              :key="item.tarif_penumpang_id"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ index + 1 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ item.rute?.nama_rute }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ item.kategori?.nama_kategori }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                Rp {{ formatNumber(item.tarif) }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2"
              >
                <button
                  @click="openModalPenumpang(item)"
                  class="text-blue-600 hover:text-blue-900"
                >
                  Edit
                </button>
                <button
                  @click="deleteItemPenumpang(item)"
                  class="text-red-600 hover:text-red-900"
                >
                  Hapus
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tarif Kendaraan -->
    <div v-if="activeTab === 'kendaraan'">
      <div class="flex justify-between items-center mb-4">
        <div class="flex items-center space-x-4">
          <h2 class="text-xl font-semibold text-gray-800">Tarif Kendaraan</h2>
          <select
            v-model="filterRuteId"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Rute</option>
            <option v-for="r in rute" :key="r.rute_id" :value="r.rute_id">
              {{ r.nama_rute }}
            </option>
          </select>
        </div>
        <button
          @click="openModalKendaraan()"
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
          Tambah Tarif
        </button>
      </div>

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
                Rute
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                Golongan
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                Tipe Muatan
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                Tarif
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                Aksi
              </th>
            </tr>
          </thead>

          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="(item, index) in filteredTarifKendaraan"
              :key="item.tarif_kendaraan_id"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ index + 1 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ item.rute?.nama_rute }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ item.golongan?.nomor_golongan }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ item.golongan?.tipe_muatan || "-" }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                Rp {{ formatNumber(item.tarif) }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2"
              >
                <button
                  @click="openModalKendaraan(item)"
                  class="text-blue-600 hover:text-blue-900"
                >
                  Edit
                </button>
                <button
                  @click="deleteItemKendaraan(item)"
                  class="text-red-600 hover:text-red-900"
                >
                  Hapus
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Penumpang -->
    <div
      v-if="showModalPenumpang"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-semibold mb-4">
          {{ isEditPenumpang ? "Edit" : "Tambah" }} Tarif Penumpang
        </h2>

        <form @submit.prevent="saveItemPenumpang">
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-medium mb-2"
              >Rute <span class="text-red-500">*</span></label
            >
            <select
              v-model="formPenumpang.rute_id"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Pilih Rute</option>
              <option v-for="r in rute" :key="r.rute_id" :value="r.rute_id">
                {{ r.nama_rute }}
              </option>
            </select>
          </div>

          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-medium mb-2"
              >Kategori <span class="text-red-500">*</span></label
            >
            <select
              v-model="formPenumpang.kategori_penumpang_id"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Pilih Kategori</option>
              <option
                v-for="k in kategoriPenumpang"
                :key="k.kategori_penumpang_id"
                :value="k.kategori_penumpang_id"
              >
                {{ k.nama_kategori }}
              </option>
            </select>
          </div>

          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-medium mb-2"
              >Tarif (Rp) <span class="text-red-500">*</span></label
            >
            <input
              v-model="formPenumpang.tarif"
              type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div class="flex justify-end space-x-2">
            <button
              type="button"
              @click="closeModalPenumpang"
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

    <!-- Modal Kendaraan -->
    <div
      v-if="showModalKendaraan"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-semibold mb-4">
          {{ isEditKendaraan ? "Edit" : "Tambah" }} Tarif Kendaraan
        </h2>

        <form @submit.prevent="saveItemKendaraan">
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-medium mb-2"
              >Rute <span class="text-red-500">*</span></label
            >
            <select
              v-model="formKendaraan.rute_id"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Pilih Rute</option>
              <option v-for="r in rute" :key="r.rute_id" :value="r.rute_id">
                {{ r.nama_rute }}
              </option>
            </select>
          </div>

          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-medium mb-2"
              >Golongan <span class="text-red-500">*</span></label
            >
            <select
              v-model="formKendaraan.golongan_id"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Pilih Golongan</option>
              <option
                v-for="g in golonganKendaraan"
                :key="g.golongan_id"
                :value="g.golongan_id"
              >
                Golongan {{ g.nomor_golongan }}
                {{ g.tipe_muatan ? `- ${g.tipe_muatan}` : "" }}
              </option>
            </select>
          </div>

          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-medium mb-2"
              >Tarif (Rp) <span class="text-red-500">*</span></label
            >
            <input
              v-model="formKendaraan.tarif"
              type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div class="flex justify-end space-x-2">
            <button
              type="button"
              @click="closeModalKendaraan"
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

const activeTab = ref("penumpang");
const tarifPenumpang = ref([]);
const tarifKendaraan = ref([]);
const rute = ref([]);
const kategoriPenumpang = ref([]);
const golonganKendaraan = ref([]);
const filterRuteId = ref("");

const showModalPenumpang = ref(false);
const isEditPenumpang = ref(false);
const formPenumpang = ref({
  tarif_penumpang_id: null,
  rute_id: "",
  kategori_penumpang_id: "",
  tarif: "",
});

const showModalKendaraan = ref(false);
const isEditKendaraan = ref(false);
const formKendaraan = ref({
  tarif_kendaraan_id: null,
  rute_id: "",
  golongan_id: "",
  tarif: "",
});

const filteredTarifPenumpang = computed(() => {
  if (!filterRuteId.value) return tarifPenumpang.value;
  return tarifPenumpang.value.filter(
    (t) => t.rute_id === parseInt(filterRuteId.value),
  );
});

const filteredTarifKendaraan = computed(() => {
  if (!filterRuteId.value) return tarifKendaraan.value;
  return tarifKendaraan.value.filter(
    (t) => t.rute_id === parseInt(filterRuteId.value),
  );
});

const formatNumber = (num) => {
  return new Intl.NumberFormat("id-ID").format(num);
};

const loadData = async () => {
  try {
    const [tarifPRes, tarifKRes, ruteRes, kategoriRes, golonganRes] =
      await Promise.all([
        api.get("/master/tarif-penumpang"),
        api.get("/master/tarif-kendaraan"),
        api.get("/master/rute"),
        api.get("/master/kategori-penumpang"),
        api.get("/master/golongan-kendaraan"),
      ]);
    tarifPenumpang.value = tarifPRes.data.data;
    tarifKendaraan.value = tarifKRes.data.data;
    rute.value = ruteRes.data.data;
    kategoriPenumpang.value = kategoriRes.data.data;
    golonganKendaraan.value = golonganRes.data.data;
  } catch (error) {
    alert("Gagal memuat data");
  }
};

const openModalPenumpang = (item = null) => {
  if (item) {
    isEditPenumpang.value = true;
    formPenumpang.value = { ...item };
  } else {
    isEditPenumpang.value = false;
    formPenumpang.value = {
      tarif_penumpang_id: null,
      rute_id: "",
      kategori_penumpang_id: "",
      tarif: "",
    };
  }
  showModalPenumpang.value = true;
};

const closeModalPenumpang = () => {
  showModalPenumpang.value = false;
};

const saveItemPenumpang = async () => {
  try {
    if (isEditPenumpang.value) {
      await api.put(
        `/master/tarif-penumpang/${formPenumpang.value.tarif_penumpang_id}`,
        formPenumpang.value,
      );
      alert("Tarif berhasil diupdate");
    } else {
      await api.post("/master/tarif-penumpang", formPenumpang.value);
      alert("Tarif berhasil ditambahkan");
    }
    closeModalPenumpang();
    loadData();
  } catch (error) {
    alert(error.response?.data?.error || "Gagal menyimpan data");
  }
};

const deleteItemPenumpang = async (item) => {
  if (confirm("Hapus tarif ini?")) {
    try {
      await api.delete(`/master/tarif-penumpang/${item.tarif_penumpang_id}`);
      alert("Tarif berhasil dihapus");
      loadData();
    } catch (error) {
      alert("Gagal menghapus data");
    }
  }
};

const openModalKendaraan = (item = null) => {
  if (item) {
    isEditKendaraan.value = true;
    formKendaraan.value = { ...item };
  } else {
    isEditKendaraan.value = false;
    formKendaraan.value = {
      tarif_kendaraan_id: null,
      rute_id: "",
      golongan_id: "",
      tarif: "",
    };
  }
  showModalKendaraan.value = true;
};

const closeModalKendaraan = () => {
  showModalKendaraan.value = false;
};

const saveItemKendaraan = async () => {
  try {
    if (isEditKendaraan.value) {
      await api.put(
        `/master/tarif-kendaraan/${formKendaraan.value.tarif_kendaraan_id}`,
        formKendaraan.value,
      );
      alert("Tarif berhasil diupdate");
    } else {
      await api.post("/master/tarif-kendaraan", formKendaraan.value);
      alert("Tarif berhasil ditambahkan");
    }
    closeModalKendaraan();
    loadData();
  } catch (error) {
    alert(error.response?.data?.error || "Gagal menyimpan data");
  }
};

const deleteItemKendaraan = async (item) => {
  if (confirm("Hapus tarif ini?")) {
    try {
      await api.delete(`/master/tarif-kendaraan/${item.tarif_kendaraan_id}`);
      alert("Tarif berhasil dihapus");
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
