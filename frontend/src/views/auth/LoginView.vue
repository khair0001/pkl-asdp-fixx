<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-8" style="background-color: #f0f2f5;">
    <div class="w-full max-w-5xl">

      <!-- Main Card Container -->
      <div class="card-container flex rounded-2xl overflow-hidden shadow-xl" style="min-height: 420px;">

        <!-- ===== LEFT COLUMN - BANNER ===== -->
        <div class="banner-col relative overflow-hidden" style="background: linear-gradient(135deg, #e8eef8 0%, #dce6f5 100%);">

          <!-- Banner image (full area) -->
          <img
            src="/public/login_img.png"
            class="absolute inset-0 w-full h-full object-cover object-center"
            alt="Banner"
          />

          <!-- Logo overlay — pojok kiri atas (desktop) / tengah atas (mobile) -->
          <div class="logo-wrap absolute top-0 left-0 z-20 px-8 pt-7">
            <img src="/public/logo_asdp.png" alt="ASDP Logo" class="h-10 object-contain" />
          </div>

          <!-- Title text overlay — pojok kiri bawah (desktop) / tengah bawah (mobile) -->
          <div class="title-wrap absolute bottom-7 left-8 z-20" style="max-width: 400px;">
            <h1
              class="font-black leading-tight"
              style="font-size: 1.7rem; letter-spacing: -0.025em; font-family: 'Georgia', 'Times New Roman', serif; color: #1a1a1a; text-shadow: 0 1px 3px rgba(255,255,255,0.6);"
            >
              Produksi Harian ASDP
            </h1>
          </div>

        </div>
        <!-- END LEFT COLUMN -->

        <!-- ===== RIGHT COLUMN - FORM ===== -->
        <div class="form-col bg-white flex flex-col justify-center px-10 py-10">

          <!-- Error Message -->
          <div v-if="error" class="mb-5 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-start gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {{ error }}
          </div>

          <!-- Form -->
          <form @submit.prevent="handleLogin" class="space-y-5">

            <!-- Username -->
            <div>
              <label class="block text-gray-700 text-sm font-medium mb-1.5" for="username">
                Username
              </label>
              <div class="relative">
                <input
                  id="username"
                  v-model="form.username"
                  type="text"
                  class="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent placeholder-gray-300 transition-all"
                  placeholder="Masukkan username"
                  required
                />
                <span class="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </span>
              </div>
            </div>

            <!-- Password -->
            <div>
              <label class="block text-gray-700 text-sm font-medium mb-1.5" for="password">
                Password
              </label>
              <div class="relative">
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent placeholder-gray-300 transition-all"
                  placeholder="Masukkan password"
                  required
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                >
                  <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Submit Button -->
            <div class="pt-1">
              <button
                type="submit"
                :disabled="loading"
                class="w-full py-3 px-4 rounded-xl text-white text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style="background-color: #1a56db;"
                @mouseover="(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#1648c0' }"
                @mouseout="(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#1a56db' }"
              >
                <span v-if="loading" class="flex items-center justify-center gap-2">
                  <svg class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Memproses...
                </span>
                <span v-else>Masuk</span>
              </button>
            </div>

          </form>

        </div>
        <!-- END RIGHT COLUMN -->

      </div>
      <!-- END CARD -->

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../services/api';

const router = useRouter();
const form = ref({
  username: '',
  password: ''
});
const loading = ref(false);
const error = ref('');
const showPassword = ref(false);

const handleLogin = async () => {
  try {
    loading.value = true;
    error.value = '';

    const response = await api.post('/auth/login', form.value);

    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    router.push('/');
  } catch (err) {
    error.value = err.response?.data?.error || 'Login gagal. Silakan coba lagi.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* ============================================================
   DESKTOP (default): side-by-side layout
   ============================================================ */
.card-container {
  flex-direction: row;
}

.banner-col {
  width: 60%;
  min-height: 420px;
}

.form-col {
  width: 40%;
}

/* Logo & title: default desktop positioning */
.logo-wrap {
  top: 0;
  left: 0;
  text-align: left;
}

.title-wrap {
  bottom: 1.75rem;
  left: 2rem;
  text-align: left;
}

/* ============================================================
   MOBILE / ANDROID  — breakpoint ≤ 640 px
   ============================================================ */
@media (max-width: 640px) {

  /* Stack banner on top, form below */
  .card-container {
    flex-direction: column;
  }

  /* Banner becomes a shorter horizontal strip */
  .banner-col {
    width: 100%;
    min-height: 180px;
    height: 180px;
  }

  /* Form takes full width */
  .form-col {
    width: 100%;
    padding: 2rem 1.5rem;
  }

  /* Logo: centered horizontally at the top of the banner */
  .logo-wrap {
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    padding: 1rem 0 0;
    text-align: center;
    width: auto;
    white-space: nowrap;
  }

  /* Title: centered horizontally at the bottom of the banner */
  .title-wrap {
    bottom: 0.75rem;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    width: 90%;
    max-width: none;
  }

  .title-wrap h1 {
    font-size: 1.15rem !important;
  }
}

/* ============================================================
   TABLET — breakpoint 641 px – 900 px  (optional tweak)
   ============================================================ */
@media (min-width: 641px) and (max-width: 900px) {

  .banner-col {
    width: 50%;
  }

  .form-col {
    width: 50%;
    padding: 2rem 1.75rem;
  }
}
</style>