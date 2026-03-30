import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '../layouts/MainLayout.vue';
import LoginView from '../views/auth/LoginView.vue';
import DashboardView from '../views/DashboardView.vue';
import MasterDataView from '../views/masterdata/MasterDataView.vue';
import PerusahaanView from '../views/masterdata/PerusahaanView.vue';
import KapalView from '../views/masterdata/KapalView.vue';
import PelabuhanView from '../views/masterdata/PelabuhanView.vue';
import RuteView from '../views/masterdata/RuteView.vue';
import TarifView from '../views/masterdata/TarifView.vue';
import TemplateKapalRuteView from '../views/masterdata/TemplateKapalRuteView.vue';
import SuratDokumenView from '../views/masterdata/SuratDokumenView.vue';
import InputProduksiView from '../views/produksi/InputProduksiView.vue';
import DataProduksiView from '../views/produksi/DataProduksiView.vue';
import UserManagementView from '../views/admin/UserManagementView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: DashboardView
        },
        {
          path: 'master-data',
          name: 'master-data',
          component: MasterDataView
        },
        {
          path: 'master-data/perusahaan',
          name: 'perusahaan',
          component: PerusahaanView
        },
        {
          path: 'master-data/kapal',
          name: 'kapal',
          component: KapalView
        },
        {
          path: 'master-data/pelabuhan',
          name: 'pelabuhan',
          component: PelabuhanView
        },
        {
          path: 'master-data/rute',
          name: 'rute',
          component: RuteView
        },
        {
          path: 'master-data/tarif',
          name: 'tarif',
          component: TarifView
        },
        {
          path: 'master-data/template-kapal-rute',
          name: 'template-kapal-rute',
          component: TemplateKapalRuteView
        },
        {
          path: 'master-data/surat-dokumen',
          name: 'surat-dokumen',
          component: SuratDokumenView
        },
        {
          path: 'produksi/input',
          name: 'input-produksi',
          component: InputProduksiView
        },
        {
          path: 'produksi/data',
          name: 'data-produksi',
          component: DataProduksiView
        },
        {
          path: 'admin/users',
          name: 'user-management',
          component: UserManagementView,
          meta: { requiresAdmin: true }
        }
      ]
    }
  ]
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);

  if (requiresAuth && !token) {
    next('/login');
  } else if (to.path === '/login' && token) {
    next('/');
  } else if (requiresAdmin && user.role !== 'admin') {
    alert('Akses ditolak. Hanya admin yang dapat mengakses halaman ini.');
    next('/');
  } else {
    next();
  }
});

export default router;
