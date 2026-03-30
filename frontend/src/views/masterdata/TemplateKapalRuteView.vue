<template>
  <div class="p-6">
    
    <!-- Judul -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Kapal per Rute</h1>
    </div>

    <!-- Filter Rute -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Pilih Rute
          </label>

          <select
            v-model="selectedRuteId"
            @change="loadTemplates"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Pilih Rute --</option>

            <option
              v-for="rute in ruteList"
              :key="rute.rute_id"
              :value="rute.rute_id"
            >
              {{ rute.nama_rute }}
            </option>

          </select>
        </div>
      </div>
    </div>

    <!-- Tombol Tambah Kapal -->
    <div v-if="selectedRuteId" class="flex justify-end mb-4">
      <button
        @click="openAddModal"
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

    <!-- Template List -->
    <div v-if="selectedRuteId" class="bg-white rounded-lg shadow overflow-hidden">

      <div v-if="loading" class="p-6 text-center">
        <p class="text-gray-500">Memuat data...</p>
      </div>

      <div v-else-if="templates.length === 0" class="p-6 text-center">
        <p class="text-gray-500">Belum ada template kapal untuk rute ini</p>
        <p class="text-sm text-gray-400 mt-2">
          Klik tombol "Tambah Kapal" untuk menambahkan kapal
        </p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-blue-600">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Urutan
              </th>

              <th class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Nama Kapal
              </th>

              <th class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                GT
              </th>

              <th class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Perusahaan
              </th>

              <th class="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="template in templates" :key="template.template_id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ template.urutan }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ template.nama_kapal }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ template.gt }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ template.nama_perusahaan }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="openEditModal(template)"
                  class="text-blue-600 hover:text-blue-900 mr-3"
                >
                  Edit
                </button>
                <button
                  @click="deleteTemplate(template)"
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

    <!-- Modal Add/Edit -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">
          {{ isEditMode ? 'Edit' : 'Tambah' }} Kapal
        </h3>

        <form @submit.prevent="saveTemplate">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Kapal <span class="text-red-500">*</span>
            </label>
            <SearchableSelect
              v-model="form.kapal_id"
              :options="kapalListFormatted"
              placeholder="Cari kapal..."
              value-key="kapal_id"
              label-key="display_name"
              :required="true"
            />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Urutan <span class="text-red-500">*</span>
            </label>
            <input
              v-model.number="form.urutan"
              type="number"
              min="1"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan urutan"
            />
          </div>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {{ saving ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';
import SearchableSelect from '@/components/SearchableSelect.vue';

export default {
  name: 'TemplateKapalRuteView',
  components: {
    SearchableSelect,
  },
  data() {
    return {
      ruteList: [],
      kapalList: [],
      templates: [],
      selectedRuteId: '',
      loading: false,
      saving: false,
      showModal: false,
      isEditMode: false,
      form: {
        template_id: null,
        kapal_id: '',
        urutan: 1,
      },
    };
  },
  computed: {
    kapalListFormatted() {
      return this.kapalList.map(kapal => ({
        ...kapal,
        display_name: `${kapal.nama_kapal} (${kapal.perusahaan?.nama_perusahaan || '-'})`
      }));
    }
  },
  mounted() {
    this.loadRuteList();
    this.loadKapalList();
  },
  methods: {
    async loadRuteList() {
      try {
        const response = await api.get('/master/rute');
        this.ruteList = response.data.data || response.data;
      } catch (error) {
        console.error('Error loading rute:', error);
        alert('Gagal memuat data rute');
      }
    },
    async loadKapalList() {
      try {
        const response = await api.get('/master/kapal');
        this.kapalList = response.data.data || response.data;
      } catch (error) {
        console.error('Error loading kapal:', error);
        alert('Gagal memuat data kapal');
      }
    },
    async loadTemplates() {
      if (!this.selectedRuteId) {
        this.templates = [];
        return;
      }

      this.loading = true;
      try {
        const response = await api.get(
          `/master/template-kapal-rute/rute/${this.selectedRuteId}`
        );
        this.templates = response.data.data || response.data;
      } catch (error) {
        console.error('Error loading templates:', error);
        alert('Gagal memuat template kapal');
      } finally {
        this.loading = false;
      }
    },
    openAddModal() {
      this.isEditMode = false;
      this.form = {
        template_id: null,
        kapal_id: '',
        urutan: this.templates.length + 1,
      };
      this.showModal = true;
    },
    openEditModal(template) {
      this.isEditMode = true;
      this.form = {
        template_id: template.template_id,
        kapal_id: template.kapal_id,
        urutan: template.urutan,
      };
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.form = {
        template_id: null,
        kapal_id: '',
        urutan: 1,
      };
    },
    async saveTemplate() {
      this.saving = true;
      try {
        const payload = {
          rute_id: this.selectedRuteId,
          kapal_id: this.form.kapal_id,
          urutan: this.form.urutan,
        };

        if (this.isEditMode) {
          await api.put(
            `/master/template-kapal-rute/${this.form.template_id}`,
            payload
          );
          alert('Template berhasil diupdate');
        } else {
          await api.post('/master/template-kapal-rute', payload);
          alert('Template berhasil ditambahkan');
        }

        this.closeModal();
        this.loadTemplates();
      } catch (error) {
        console.error('Error saving template:', error);
        alert(error.response?.data?.error || 'Gagal menyimpan template');
      } finally {
        this.saving = false;
      }
    },
    async deleteTemplate(template) {
      if (!confirm(`Hapus ${template.nama_kapal} dari template?`)) {
        return;
      }

      try {
        await api.delete(`/master/template-kapal-rute/${template.template_id}`);
        alert('Template berhasil dihapus');
        this.loadTemplates();
      } catch (error) {
        console.error('Error deleting template:', error);
        alert('Gagal menghapus template');
      }
    },
  },
};
</script>
