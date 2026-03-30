<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Manajemen User</h1>
      <button @click="showAddModal = true" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        + Tambah User
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-blue-600">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-white uppercase">Username</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-white uppercase">Nama Lengkap</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-white uppercase">Role</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-white uppercase">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-white uppercase">Dibuat</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-white uppercase">Aksi</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in users" :key="user.user_id">
            <td class="px-6 py-4 whitespace-nowrap">{{ user.username }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ user.nama_lengkap }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'" 
                    class="px-2 py-1 text-xs rounded-full">
                {{ user.role }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" 
                    class="px-2 py-1 text-xs rounded-full">
                {{ user.is_active ? 'Aktif' : 'Nonaktif' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(user.created_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <button @click="editUser(user)" class="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
              <button @click="changePassword(user)" class="text-yellow-600 hover:text-yellow-900 mr-3">Password</button>
              <button @click="deleteUser(user)" class="text-red-600 hover:text-red-900">Hapus</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">{{ showAddModal ? 'Tambah User' : 'Edit User' }}</h2>
        <form @submit.prevent="showAddModal ? addUser() : updateUser()">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Username</label>
            <input v-model="formData.username" type="text" required 
                   class="w-full border rounded px-3 py-2" />
          </div>
          <div class="mb-4" v-if="showAddModal">
            <label class="block text-sm font-medium mb-2">Password</label>
            <input v-model="formData.password" type="password" required 
                   class="w-full border rounded px-3 py-2" />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Nama Lengkap</label>
            <input v-model="formData.nama_lengkap" type="text" required 
                   class="w-full border rounded px-3 py-2" />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Role</label>
            <select v-model="formData.role" class="w-full border rounded px-3 py-2">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div class="mb-4" v-if="showEditModal">
            <label class="block text-sm font-medium mb-2">Status</label>
            <select v-model="formData.is_active" class="w-full border rounded px-3 py-2">
              <option :value="true">Aktif</option>
              <option :value="false">Nonaktif</option>
            </select>
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" @click="closeModal" class="px-4 py-2 border rounded hover:bg-gray-100">
              Batal
            </button>
            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Password Modal -->
    <div v-if="showPasswordModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">Ganti Password</h2>
        <form @submit.prevent="updatePassword()">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Password Baru</label>
            <input v-model="passwordData.password" type="password" required 
                   class="w-full border rounded px-3 py-2" />
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" @click="showPasswordModal = false" class="px-4 py-2 border rounded hover:bg-gray-100">
              Batal
            </button>
            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'UserManagementView',
  data() {
    return {
      users: [],
      showAddModal: false,
      showEditModal: false,
      showPasswordModal: false,
      formData: {
        username: '',
        password: '',
        nama_lengkap: '',
        role: 'user',
        is_active: true
      },
      passwordData: {
        user_id: null,
        password: ''
      },
      selectedUser: null
    };
  },
  mounted() {
    this.loadUsers();
  },
  methods: {
    async loadUsers() {
      try {
        const response = await api.get('/users');
        this.users = response.data;
      } catch (error) {
        alert('Gagal memuat data user: ' + (error.response?.data?.error || error.message));
      }
    },
    async addUser() {
      try {
        await api.post('/users', this.formData);
        alert('User berhasil ditambahkan');
        this.closeModal();
        this.loadUsers();
      } catch (error) {
        alert('Gagal menambahkan user: ' + (error.response?.data?.error || error.message));
      }
    },
    editUser(user) {
      this.selectedUser = user;
      this.formData = {
        username: user.username,
        nama_lengkap: user.nama_lengkap,
        role: user.role,
        is_active: user.is_active
      };
      this.showEditModal = true;
    },
    async updateUser() {
      try {
        await api.put(`/users/${this.selectedUser.user_id}`, this.formData);
        alert('User berhasil diupdate');
        this.closeModal();
        this.loadUsers();
      } catch (error) {
        alert('Gagal mengupdate user: ' + (error.response?.data?.error || error.message));
      }
    },
    changePassword(user) {
      this.passwordData.user_id = user.user_id;
      this.passwordData.password = '';
      this.showPasswordModal = true;
    },
    async updatePassword() {
      try {
        await api.put(`/users/${this.passwordData.user_id}/password`, {
          password: this.passwordData.password
        });
        alert('Password berhasil diupdate');
        this.showPasswordModal = false;
      } catch (error) {
        alert('Gagal mengupdate password: ' + (error.response?.data?.error || error.message));
      }
    },
    async deleteUser(user) {
      if (!confirm(`Yakin ingin menghapus user ${user.username}?`)) return;
      
      try {
        await api.delete(`/users/${user.user_id}`);
        alert('User berhasil dihapus');
        this.loadUsers();
      } catch (error) {
        alert('Gagal menghapus user: ' + (error.response?.data?.error || error.message));
      }
    },
    closeModal() {
      this.showAddModal = false;
      this.showEditModal = false;
      this.formData = {
        username: '',
        password: '',
        nama_lengkap: '',
        role: 'user',
        is_active: true
      };
      this.selectedUser = null;
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  }
};
</script>
