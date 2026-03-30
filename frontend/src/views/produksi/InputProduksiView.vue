<template>
  <div>
    <!-- Success Notification Toast -->
    <div
      v-if="showSuccessNotification"
      class="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 animate-fade-in"
    >
      <svg
        class="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span class="font-medium">{{ successMessage }}</span>
    </div>

    <h1 class="text-3xl font-bold text-gray-800 mb-6">Input Produksi</h1>

    <form @submit.prevent="submitProduksi">
      <!-- Header Produksi -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">
          Filter & Input Data
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Perusahaan <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.perusahaan_id"
              @change="onPerusahaanChange"
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

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Kapal <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.kapal_id"
              @change="onKapalChange"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Pilih Kapal</option>
              <option
                v-for="k in filteredKapal"
                :key="k.kapal_id"
                :value="k.kapal_id"
              >
                {{ k.nama_kapal }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Pelabuhan Asal <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.pelabuhan_asal_id"
              @change="onPelabuhanAsalChange"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Pilih Pelabuhan</option>
              <option
                v-for="p in pelabuhan"
                :key="p.pelabuhan_id"
                :value="p.pelabuhan_id"
              >
                {{ p.nama_pelabuhan }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Rute <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.rute_id"
              @change="onRuteChange"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Pilih Rute</option>
              <option
                v-for="r in filteredRute"
                :key="r.rute_id"
                :value="r.rute_id"
              >
                {{ r.nama_rute }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Shift <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.shift"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Pilih Shift</option>
              <option value="pagi">Pagi</option>
              <option value="malam">Malam</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Regu <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.regu"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Pilih Regu</option>
              <option value="regu 1">Regu 1</option>
              <option value="regu 2">Regu 2</option>
              <option value="regu 3">Regu 3</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Tanggal <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.tanggal_produksi"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
      </div>

      <!-- Info Card Kapal (Pindah ke sini) -->
      <div
        v-if="selectedKapalInfo"
        class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
      >
        <div class="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span class="font-medium text-gray-700">Nama Perusahaan:</span>
            <span class="text-gray-900 ml-2">{{
              selectedKapalInfo.nama_perusahaan
            }}</span>
          </div>
          <div>
            <span class="font-medium text-gray-700">Nama Kapal:</span>
            <span class="text-gray-900 ml-2">{{
              selectedKapalInfo.nama_kapal
            }}</span>
          </div>
          <div>
            <span class="font-medium text-gray-700">GT:</span>
            <span class="text-gray-900 ml-2">{{
              selectedKapalInfo.berat_kapal
                ? `${selectedKapalInfo.berat_kapal}`
                : "-"
            }}</span>
          </div>
        </div>
      </div>

      <!-- Input Data Section -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-6">Input Data</h2>

        <!-- Section Penumpang -->
        <div class="mb-8">
          <h3 class="text-lg font-semibold text-teal-600 mb-4">Ekonomi</h3>

          <!-- Grid 2 Kolom Penumpang -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div
              v-for="p in penumpangList"
              :key="p.kategori_penumpang_id"
              class="border border-gray-200 rounded-lg p-4"
            >
              <h4 class="font-semibold text-gray-800 mb-3">
                {{ p.nama_kategori }}
              </h4>
              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Jumlah</label>
                  <input
                    v-model.number="p.jumlah"
                    type="number"
                    min="0"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1"
                    >Tarif (Rp)</label
                  >
                  <input
                    v-model.number="p.tarif"
                    type="number"
                    min="0"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-sm"
                    readonly
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1"
                    >Subtotal</label
                  >
                  <div
                    class="px-3 py-2 bg-gray-50 rounded-lg text-sm font-semibold"
                  >
                    Rp {{ formatNumber(p.jumlah * p.tarif) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Penumpang Tambahan -->
          <div v-if="penumpangTambahan.length > 0" class="mb-4">
            <div
              v-for="(p, index) in penumpangTambahan"
              :key="'tambahan-' + index"
              class="border border-orange-200 bg-orange-50 rounded-lg p-4 mb-3"
            >
              <div class="flex justify-between items-start mb-3">
                <h4 class="font-semibold text-gray-800">
                  Ekonomi tambahan
                </h4>
                <button
                  type="button"
                  @click="removePenumpangRow(index)"
                  class="text-red-600 hover:text-red-800"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div class="grid grid-cols-4 gap-3">
                <select
                  v-model="p.kategori_penumpang_id"
                  @change="onPenumpangTambahanKategoriChange(index)"
                  class="px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
                <input
                  v-model.number="p.jumlah"
                  type="number"
                  min="0"
                  placeholder="Jumlah"
                  class="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  v-model.number="p.tarif"
                  @input="p.is_tarif_custom = true"
                  type="number"
                  min="0"
                  placeholder="Tarif"
                  class="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <div
                  class="px-3 py-2 bg-white rounded-lg text-sm font-semibold"
                >
                  Rp {{ formatNumber(p.jumlah * p.tarif) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Summary Penumpang -->
          <div class="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-4">
            <div class="flex justify-between items-center">
              <div>
                <p class="text-sm text-gray-700">Total Jumlah Penumpang</p>
                <p class="text-2xl font-bold text-blue-600">
                  {{ totalPenumpang }} Orang
                </p>
              </div>
              <div class="text-right">
                <p class="text-sm text-gray-700">Total Pendapatan Penumpang</p>
                <p class="text-2xl font-bold text-blue-600">
                  Rp {{ formatNumber(totalPendapatanPenumpang) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Tombol Tambah Penumpang -->
          <button
            type="button"
            @click="addPenumpangRow"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm"
          >
            <svg
              class="w-4 h-4 mr-2"
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
            Penumpang
          </button>
        </div>

        <!-- Section Kendaraan -->
        <div class="mb-8">
          <h3 class="text-lg font-semibold text-teal-600 mb-4">Kendaraan</h3>

          <!-- Grid 3 Kolom Kendaraan -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div
              v-for="k in kendaraanList"
              :key="k.golongan_id"
              class="border border-gray-200 rounded-lg p-4"
            >
              <h4 class="font-semibold text-gray-800 mb-2">
                Golongan {{ k.nomor_golongan }}
              </h4>
              <p class="text-xs text-gray-600 mb-3">
                {{ k.tipe_muatan || "-" }}
              </p>
              <div class="grid grid-cols-3 gap-2">
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Jumlah</label>
                  <input
                    v-model.number="k.jumlah"
                    type="number"
                    min="0"
                    class="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1"
                    >Tarif (Rp)</label
                  >
                  <input
                    v-model.number="k.tarif"
                    type="number"
                    min="0"
                    class="w-full px-2 py-2 border border-gray-300 rounded-lg bg-gray-100 text-sm"
                    readonly
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1"
                    >Subtotal</label
                  >
                  <div
                    class="px-2 py-2 bg-gray-50 rounded-lg text-xs font-semibold"
                  >
                    Rp {{ formatNumber(k.jumlah * k.tarif) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Kendaraan Tambahan -->
          <div v-if="kendaraanTambahan.length > 0" class="mb-4">
            <div
              v-for="(k, index) in kendaraanTambahan"
              :key="'tambahan-' + index"
              class="border border-orange-200 bg-orange-50 rounded-lg p-4 mb-3"
            >
              <div class="flex justify-between items-start mb-3">
                <h4 class="font-semibold text-gray-800">
                  Kendaraan Tambahan
                </h4>
                <button
                  type="button"
                  @click="removeKendaraanRow(index)"
                  class="text-red-600 hover:text-red-800"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div class="grid grid-cols-5 gap-3">
                <select
                  v-model="k.golongan_id"
                  @change="onKendaraanTambahanGolonganChange(index)"
                  class="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Pilih Golongan</option>
                  <option
                    v-for="g in golonganKendaraan"
                    :key="g.golongan_id"
                    :value="g.golongan_id"
                  >
                    Gol {{ g.nomor_golongan }}
                    {{ g.tipe_muatan ? `- ${g.tipe_muatan}` : "" }}
                  </option>
                </select>
                <div class="text-sm text-gray-600 flex items-center">
                  {{ k.tipe_muatan || "-" }}
                </div>
                <input
                  v-model.number="k.jumlah"
                  type="number"
                  min="0"
                  placeholder="Jumlah"
                  class="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  v-model.number="k.tarif"
                  @input="k.is_tarif_custom = true"
                  type="number"
                  min="0"
                  placeholder="Tarif"
                  class="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <div
                  class="px-3 py-2 bg-white rounded-lg text-sm font-semibold"
                >
                  Rp {{ formatNumber(k.jumlah * k.tarif) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Summary Kendaraan -->
          <div
            class="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-4 shadow-sm"
          >
            <div class="flex justify-between items-center">
              <div>
                <p class="text-sm text-gray-700">Total Jumlah Kendaraan</p>
                <p class="text-2xl font-bold text-blue-600">
                  {{ totalKendaraan }} Unit
                </p>
              </div>
              <div class="text-right">
                <p class="text-sm text-gray-700">Total Pendapatan Kendaraan</p>
                <p class="text-2xl font-bold text-blue-600">
                  Rp {{ formatNumber(totalPendapatanKendaraan) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Tombol Tambah Golongan -->
          <button
            type="button"
            @click="addKendaraanRow"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm"
          >
            <svg
              class="w-4 h-4 mr-2"
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
            Golongan
          </button>
        </div>
      </div>

      <!-- Section Pendapatan -->
      <div
        class="bg-gradient-to-r from-green-700 to-green-600 rounded-lg shadow-lg p-6 mb-6"
      >
        <h3 class="text-xl font-semibold text-white mb-4">Pendapatan</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Pendapatan Penumpang -->
          <div class="bg-green-600 bg-opacity-70 rounded-lg p-4">
            <p class="text-sm text-green-100 mb-2">Pendapatan Penumpang</p>
            <p class="text-3xl font-bold text-white mb-1">
              Rp {{ formatNumber(totalPendapatanPenumpang) }}
            </p>
            <p class="text-xs text-green-100">{{ totalPenumpang }} orang</p>
          </div>

          <!-- Pendapatan Kendaraan -->
          <div class="bg-green-600 bg-opacity-70 rounded-lg p-4">
            <p class="text-sm text-green-100 mb-2">Pendapatan Kendaraan</p>
            <p class="text-3xl font-bold text-white mb-1">
              Rp {{ formatNumber(totalPendapatanKendaraan) }}
            </p>
            <p class="text-xs text-green-100">{{ totalKendaraan }} unit</p>
          </div>

          <!-- Total Pendapatan -->
          <div
            class="bg-white bg-opacity-20 rounded-lg p-4 border-2 border-white"
          >
            <p class="text-sm text-white font-semibold mb-2">
              TOTAL PENDAPATAN
            </p>
            <p class="text-4xl font-bold text-white">
              Rp {{ formatNumber(totalPendapatan) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Tombol Simpan Data -->
      <div class="flex space-x-4">
        <button
          type="button"
          @click="resetForm"
          class="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
        >
          Reset
        </button>
        <button
          type="submit"
          class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
        >
          {{ isEditMode ? "UPDATE DATA" : "SIMPAN DATA" }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import api from "../../services/api";

const router = useRouter();
const route = useRoute();

const isEditMode = ref(false);
const editProduksiId = ref(null);
const showSuccessNotification = ref(false);
const successMessage = ref("");

const form = ref({
  perusahaan_id: "",
  kapal_id: "",
  pelabuhan_asal_id: "",
  rute_id: "",
  shift: "",
  regu: "",
  tanggal_produksi: new Date().toISOString().split("T")[0],
});

const perusahaan = ref([]);
const kapal = ref([]);
const pelabuhan = ref([]);
const rute = ref([]);
const kategoriPenumpang = ref([]);
const golonganKendaraan = ref([]);

const penumpangList = ref([]);
const kendaraanList = ref([]);
const penumpangTambahan = ref([]);
const kendaraanTambahan = ref([]);

const filteredKapal = computed(() => {
  if (form.value.perusahaan_id) {
    return kapal.value.filter(
      (k) => k.perusahaan_id === parseInt(form.value.perusahaan_id),
    );
  }
  return kapal.value;
});

const selectedKapalInfo = computed(() => {
  if (!form.value.kapal_id) return null;

  const selectedKapal = kapal.value.find(
    (k) => k.kapal_id === parseInt(form.value.kapal_id),
  );
  if (!selectedKapal) return null;

  const selectedPerusahaan = perusahaan.value.find(
    (p) => p.perusahaan_id === selectedKapal.perusahaan_id,
  );

  return {
    nama_kapal: selectedKapal.nama_kapal,
    nama_perusahaan: selectedPerusahaan?.nama_perusahaan || "-",
    berat_kapal: selectedKapal.berat_kapal,
  };
});

const filteredRute = computed(() => {
  if (form.value.pelabuhan_asal_id) {
    return rute.value.filter(
      (r) => r.pelabuhan_asal_id === parseInt(form.value.pelabuhan_asal_id),
    );
  }
  return rute.value;
});

const totalPenumpang = computed(() => {
  const reguler = penumpangList.value.reduce(
    (sum, p) => sum + (p.jumlah || 0),
    0,
  );
  const tambahan = penumpangTambahan.value.reduce(
    (sum, p) => sum + (p.jumlah || 0),
    0,
  );
  return reguler + tambahan;
});

const totalPendapatanPenumpang = computed(() => {
  const reguler = penumpangList.value.reduce(
    (sum, p) => sum + (p.jumlah || 0) * (p.tarif || 0),
    0,
  );
  const tambahan = penumpangTambahan.value.reduce(
    (sum, p) => sum + (p.jumlah || 0) * (p.tarif || 0),
    0,
  );
  return reguler + tambahan;
});

const totalKendaraan = computed(() => {
  const reguler = kendaraanList.value.reduce(
    (sum, k) => sum + (k.jumlah || 0),
    0,
  );
  const tambahan = kendaraanTambahan.value.reduce(
    (sum, k) => sum + (k.jumlah || 0),
    0,
  );
  return reguler + tambahan;
});

const totalPendapatanKendaraan = computed(() => {
  const reguler = kendaraanList.value.reduce(
    (sum, k) => sum + (k.jumlah || 0) * (k.tarif || 0),
    0,
  );
  const tambahan = kendaraanTambahan.value.reduce(
    (sum, k) => sum + (k.jumlah || 0) * (k.tarif || 0),
    0,
  );
  return reguler + tambahan;
});

const totalPendapatan = computed(() => {
  return totalPendapatanPenumpang.value + totalPendapatanKendaraan.value;
});

const formatNumber = (num) => {
  return new Intl.NumberFormat("id-ID").format(num || 0);
};

const loadMasterData = async () => {
  try {
    const [pRes, kRes, pelRes, rRes, katRes, golRes] = await Promise.all([
      api.get("/master/perusahaan"),
      api.get("/master/kapal"),
      api.get("/master/pelabuhan"),
      api.get("/master/rute"),
      api.get("/master/kategori-penumpang"),
      api.get("/master/golongan-kendaraan"),
    ]);

    perusahaan.value = pRes.data.data;
    kapal.value = kRes.data.data;
    pelabuhan.value = pelRes.data.data;
    rute.value = rRes.data.data;
    kategoriPenumpang.value = katRes.data.data;
    golonganKendaraan.value = golRes.data.data;

    initPenumpangList();
    initKendaraanList();
  } catch (error) {
    alert("Gagal memuat data master");
  }
};

const initPenumpangList = () => {
  penumpangList.value = kategoriPenumpang.value.map((k) => ({
    kategori_penumpang_id: k.kategori_penumpang_id,
    nama_kategori: k.nama_kategori,
    jumlah: 0,
    tarif: 0,
  }));
};

const initKendaraanList = () => {
  kendaraanList.value = golonganKendaraan.value.map((g) => ({
    golongan_id: g.golongan_id,
    nomor_golongan: g.nomor_golongan,
    tipe_muatan: g.tipe_muatan,
    jumlah: 0,
    tarif: 0,
  }));
};

const onPerusahaanChange = () => {
  if (form.value.kapal_id) {
    const selectedKapal = kapal.value.find(
      (k) => k.kapal_id === parseInt(form.value.kapal_id),
    );
    if (
      selectedKapal &&
      selectedKapal.perusahaan_id !== parseInt(form.value.perusahaan_id)
    ) {
      form.value.kapal_id = "";
    }
  }
};

const onKapalChange = () => {
  const selectedKapal = kapal.value.find(
    (k) => k.kapal_id === parseInt(form.value.kapal_id),
  );
  if (selectedKapal) {
    form.value.perusahaan_id = selectedKapal.perusahaan_id;
  }
};

const onPelabuhanAsalChange = () => {
  if (form.value.rute_id) {
    const selectedRute = rute.value.find(
      (r) => r.rute_id === parseInt(form.value.rute_id),
    );
    if (
      selectedRute &&
      selectedRute.pelabuhan_asal_id !== parseInt(form.value.pelabuhan_asal_id)
    ) {
      form.value.rute_id = "";
    }
  }
};

const onRuteChange = async () => {
  if (!form.value.rute_id) return;

  const selectedRute = rute.value.find(
    (r) => r.rute_id === parseInt(form.value.rute_id),
  );
  if (selectedRute) {
    form.value.pelabuhan_asal_id = selectedRute.pelabuhan_asal_id;
  }

  try {
    const [tarifPRes, tarifKRes] = await Promise.all([
      api.get(`/master/tarif-penumpang/rute/${form.value.rute_id}`),
      api.get(`/master/tarif-kendaraan/rute/${form.value.rute_id}`),
    ]);

    tarifPRes.data.data.forEach((tp) => {
      const p = penumpangList.value.find(
        (x) => x.kategori_penumpang_id === tp.kategori_penumpang_id,
      );
      if (p) p.tarif = tp.tarif;
    });

    tarifKRes.data.data.forEach((tk) => {
      const k = kendaraanList.value.find(
        (x) => x.golongan_id === tk.golongan_id,
      );
      if (k) k.tarif = tk.tarif;
    });
  } catch (error) {
    console.error("Error loading tarif:", error);
  }
};

const addPenumpangRow = () => {
  penumpangTambahan.value.push({
    kategori_penumpang_id: "",
    nama_kategori: "",
    jumlah: 0,
    tarif: 0,
    is_tarif_custom: false,
  });
};

const removePenumpangRow = (index) => {
  penumpangTambahan.value.splice(index, 1);
};

const onPenumpangTambahanKategoriChange = async (index) => {
  const p = penumpangTambahan.value[index];
  const kategori = kategoriPenumpang.value.find(
    (k) => k.kategori_penumpang_id === p.kategori_penumpang_id,
  );

  if (kategori) {
    p.nama_kategori = kategori.nama_kategori;

    if (form.value.rute_id) {
      try {
        const response = await api.get(
          `/master/tarif-penumpang/rute/${form.value.rute_id}`,
        );
        const tarif = response.data.data.find(
          (t) => t.kategori_penumpang_id === p.kategori_penumpang_id,
        );
        if (tarif) {
          p.tarif = tarif.tarif;
          p.is_tarif_custom = false;
        }
      } catch (error) {
        console.error("Error loading tarif:", error);
      }
    }
  }
};

const addKendaraanRow = () => {
  kendaraanTambahan.value.push({
    golongan_id: "",
    nomor_golongan: "",
    tipe_muatan: "",
    jumlah: 0,
    tarif: 0,
    is_tarif_custom: false,
  });
};

const removeKendaraanRow = (index) => {
  kendaraanTambahan.value.splice(index, 1);
};

const onKendaraanTambahanGolonganChange = async (index) => {
  const k = kendaraanTambahan.value[index];
  const golongan = golonganKendaraan.value.find(
    (g) => g.golongan_id === k.golongan_id,
  );

  if (golongan) {
    k.nomor_golongan = golongan.nomor_golongan;
    k.tipe_muatan = golongan.tipe_muatan;

    if (form.value.rute_id) {
      try {
        const response = await api.get(
          `/master/tarif-kendaraan/rute/${form.value.rute_id}`,
        );
        const tarif = response.data.data.find(
          (t) => t.golongan_id === k.golongan_id,
        );
        if (tarif) {
          k.tarif = tarif.tarif;
          k.is_tarif_custom = false;
        }
      } catch (error) {
        console.error("Error loading tarif:", error);
      }
    }
  }
};

const showNotification = (message) => {
  successMessage.value = message;
  showSuccessNotification.value = true;

  setTimeout(() => {
    showSuccessNotification.value = false;
  }, 3000);
};

const submitProduksi = async () => {
  try {
    const confirmMsg = isEditMode.value
      ? "Update data produksi ini?"
      : "Simpan data produksi ini?";

    if (!confirm(confirmMsg)) return;

    const allPenumpang = [
      ...penumpangList.value
        .filter((p) => p.jumlah > 0)
        .map((p) => ({
          kategori_penumpang_id: p.kategori_penumpang_id,
          nama_kategori: p.nama_kategori,
          jumlah: p.jumlah,
          tarif: p.tarif,
          subtotal: p.jumlah * p.tarif,
          is_tarif_custom: false,
        })),
      ...penumpangTambahan.value
        .filter((p) => p.jumlah > 0 && p.kategori_penumpang_id)
        .map((p) => ({
          kategori_penumpang_id: p.kategori_penumpang_id,
          nama_kategori: p.nama_kategori,
          jumlah: p.jumlah,
          tarif: p.tarif,
          subtotal: p.jumlah * p.tarif,
          is_tarif_custom: p.is_tarif_custom,
        })),
    ];

    const allKendaraan = [
      ...kendaraanList.value
        .filter((k) => k.jumlah > 0)
        .map((k) => ({
          golongan_id: k.golongan_id,
          nomor_golongan: k.nomor_golongan,
          tipe_muatan: k.tipe_muatan,
          jumlah: k.jumlah,
          tarif: k.tarif,
          subtotal: k.jumlah * k.tarif,
          is_tarif_custom: false,
        })),
      ...kendaraanTambahan.value
        .filter((k) => k.jumlah > 0 && k.golongan_id)
        .map((k) => ({
          golongan_id: k.golongan_id,
          nomor_golongan: k.nomor_golongan,
          tipe_muatan: k.tipe_muatan,
          jumlah: k.jumlah,
          tarif: k.tarif,
          subtotal: k.jumlah * k.tarif,
          is_tarif_custom: k.is_tarif_custom,
        })),
    ];

    const payload = {
      ...form.value,
      penumpang: allPenumpang,
      kendaraan: allKendaraan,
    };

    // DEBUG LOGGING
    console.log('=== SUBMIT PRODUKSI DEBUG ===');
    console.log('Mode:', isEditMode.value ? 'UPDATE' : 'CREATE');
    console.log('Total Penumpang:', allPenumpang.length);
    console.log('Total Kendaraan:', allKendaraan.length);
    console.log('Kendaraan Reguler:', kendaraanList.value.filter(k => k.jumlah > 0).length);
    console.log('Kendaraan Tambahan:', kendaraanTambahan.value.filter(k => k.jumlah > 0 && k.golongan_id).length);
    console.log('Payload Kendaraan:', JSON.stringify(allKendaraan, null, 2));
    console.log('============================');

    if (isEditMode.value) {
      await api.put(`/produksi/${editProduksiId.value}`, payload);
      showNotification("Data produksi berhasil diupdate");

      setTimeout(() => {
        router.push("/produksi/data");
      }, 1000);
    } else {
      await api.post("/produksi", payload);
      showNotification("Data produksi berhasil disimpan");

      resetForm(true);
    }
  } catch (error) {
    console.error("Error:", error);
    console.error("Error response:", error.response?.data);

    if (
      error.response?.data?.error?.includes("duplicate key") ||
      error.response?.data?.error?.includes("unique_produksi")
    ) {
      alert(
        "❌ Data Produksi Sudah Ada!\n\n" +
          "Kombinasi Kapal, Rute, Tanggal, Shift, dan Regu yang Anda input sudah ada di database.\n\n" +
          "Solusi:\n" +
          "1. Ubah Shift (Pagi/Malam)\n" +
          "2. Ubah Regu (1/2/3)\n" +
          "3. Ubah Tanggal\n" +
          "4. Pilih Kapal atau Rute lain\n" +
          "5. Atau edit data yang sudah ada di menu Data Produksi Harian",
      );
    } else {
      alert(error.response?.data?.error || "Gagal menyimpan data");
    }
  }
};

const resetForm = (skipConfirm = false) => {
  if (!skipConfirm && !confirm("Reset semua data?")) return;

  form.value = {
    perusahaan_id: "",
    kapal_id: "",
    pelabuhan_asal_id: "",
    rute_id: "",
    shift: "",
    regu: "",
    tanggal_produksi: new Date().toISOString().split("T")[0],
  };

  penumpangTambahan.value = [];
  kendaraanTambahan.value = [];

  initPenumpangList();
  initKendaraanList();
};

const loadEditData = async () => {
  if (!route.query.edit) return;

  try {
    isEditMode.value = true;
    editProduksiId.value = route.query.edit;

    const response = await api.get(`/produksi/${editProduksiId.value}`);
    const data = response.data.data;

    form.value = {
      perusahaan_id: data.perusahaan_id,
      kapal_id: data.kapal_id,
      pelabuhan_asal_id: data.pelabuhan_asal_id,
      rute_id: data.rute_id,
      shift: data.shift,
      regu: data.regu,
      tanggal_produksi: data.tanggal_produksi.split("T")[0],
    };

    await onRuteChange();

    if (data.penumpang && data.penumpang.length > 0) {
      // Track which kategori has been used in regular list
      const usedKategori = new Set();

      data.penumpang.forEach((p) => {
        const regularItem = penumpangList.value.find(
          (item) => item.kategori_penumpang_id === p.kategori_penumpang_id,
        );

        // Put in regular list if: exists in regular list, not custom tarif, and not yet used
        if (regularItem && !p.is_tarif_custom && !usedKategori.has(p.kategori_penumpang_id)) {
          regularItem.jumlah = p.jumlah;
          usedKategori.add(p.kategori_penumpang_id);
        } else {
          // Put in tambahan list if: custom tarif OR duplicate kategori OR not in regular list
          penumpangTambahan.value.push({
            kategori_penumpang_id: p.kategori_penumpang_id,
            nama_kategori: p.nama_kategori,
            jumlah: p.jumlah,
            tarif: p.tarif,
            is_tarif_custom: p.is_tarif_custom || false,
          });
        }
      });
    }

    if (data.kendaraan && data.kendaraan.length > 0) {
      // Track which golongan has been used in regular list
      const usedGolongan = new Set();

      data.kendaraan.forEach((k) => {
        const regularItem = kendaraanList.value.find(
          (item) => item.golongan_id === k.golongan_id,
        );

        // Put in regular list if: exists in regular list, not custom tarif, and not yet used
        if (regularItem && !k.is_tarif_custom && !usedGolongan.has(k.golongan_id)) {
          regularItem.jumlah = k.jumlah;
          usedGolongan.add(k.golongan_id);
        } else {
          // Put in tambahan list if: custom tarif OR duplicate golongan OR not in regular list
          kendaraanTambahan.value.push({
            golongan_id: k.golongan_id,
            nomor_golongan: k.nomor_golongan,
            tipe_muatan: k.tipe_muatan,
            jumlah: k.jumlah,
            tarif: k.tarif,
            is_tarif_custom: k.is_tarif_custom || false,
          });
        }
      });
    }
  } catch (error) {
    console.error("Error loading edit data:", error);
    alert("Gagal memuat data untuk edit");
    router.push("/produksi/data");
  }
};

onMounted(async () => {
  await loadMasterData();
  await loadEditData();
});
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
</style>
