<template>
  <div class="bg-white rounded-lg shadow p-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold text-gray-800">
        Pendapatan Bulan {{ monthName }} {{ selectedYear }}
      </h3>
      <div class="flex gap-2">
        <select
          v-model="selectedMonth"
          :disabled="loading"
          class="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option v-for="month in months" :key="month.value" :value="month.value">
            {{ month.label }}
          </option>
        </select>
        <select
          v-model="selectedYear"
          :disabled="loading"
          class="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option v-for="year in years" :key="year" :value="year">
            {{ year }}
          </option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center h-80">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="isEmpty" class="flex justify-center items-center h-80 text-gray-500">
      <div class="text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p>Belum ada data produksi untuk bulan ini</p>
      </div>
    </div>

    <!-- Chart -->
    <div v-else class="relative h-80">
      <canvas ref="chartCanvas" class="w-full h-full"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { Chart, registerables } from 'chart.js';
import api from '../services/api';

Chart.register(...registerables);

const chartCanvas = ref(null);
const chartInstance = ref(null);
const loading = ref(false);
const revenueData = ref([]);

const currentDate = new Date();
const selectedMonth = ref(currentDate.getMonth() + 1);
const selectedYear = ref(currentDate.getFullYear());

const months = [
  { value: 1, label: 'Januari' },
  { value: 2, label: 'Februari' },
  { value: 3, label: 'Maret' },
  { value: 4, label: 'April' },
  { value: 5, label: 'Mei' },
  { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' },
  { value: 8, label: 'Agustus' },
  { value: 9, label: 'September' },
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'Desember' }
];

const years = computed(() => {
  const currentYear = new Date().getFullYear();
  const yearList = [];
  for (let i = currentYear - 2; i <= currentYear + 1; i++) {
    yearList.push(i);
  }
  return yearList;
});

const monthName = computed(() => {
  const month = months.find(m => m.value === selectedMonth.value);
  return month ? month.label : '';
});

const isEmpty = computed(() => {
  return !loading.value && (revenueData.value.length === 0 || revenueData.value.every(item => item.total === 0 && item.totalAsdp === 0));
});

const formatCurrency = (value) => {
  if (value >= 1000000000) {
    return (value / 1000000000).toFixed(1) + ' M';
  } else if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + ' Jt';
  } else if (value >= 1000) {
    return (value / 1000).toFixed(0) + ' Rb';
  }
  return value.toString();
};

const formatTooltipCurrency = (value) => {
  return 'Rp ' + value.toLocaleString('id-ID');
};

const loadData = async () => {
  loading.value = true;
  try {
    const response = await api.get('/dashboard/monthly-revenue', {
      params: {
        month: selectedMonth.value,
        year: selectedYear.value
      }
    });
    
    console.log('Monthly revenue response:', response.data);
    revenueData.value = response.data.data.dailyRevenue;
    console.log('Revenue data:', revenueData.value);
  } catch (error) {
    console.error('Error loading monthly revenue:', error);
    revenueData.value = [];
  } finally {
    loading.value = false;
  }
};

const renderChart = async () => {
  // Tunggu nextTick untuk memastikan canvas sudah di-render
  await nextTick();
  
  if (!chartCanvas.value) {
    console.log('Canvas element not found');
    return;
  }

  if (revenueData.value.length === 0) {
    console.log('No revenue data to render');
    return;
  }

  try {
    // Destroy existing chart
    if (chartInstance.value) {
      chartInstance.value.destroy();
      chartInstance.value = null;
    }

    const labels = revenueData.value.map(item => item.tanggal);
    const dataTotal = revenueData.value.map(item => item.total);
    const dataAsdp = revenueData.value.map(item => item.totalAsdp || 0);

    console.log('Rendering chart with', labels.length, 'data points');

    const ctx = chartCanvas.value.getContext('2d');
    
    if (!ctx) {
      console.error('Failed to get canvas context');
      return;
    }
    
    chartInstance.value = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
  label: 'Total Pendapatan',
  data: dataTotal,
  borderColor: '#3B82F6', // biru
  backgroundColor: 'rgba(59, 130, 246, 0.1)',
  tension: 0,
  fill: true,
  pointRadius: 3,
  pointHoverRadius: 5,
  pointBackgroundColor: '#3B82F6',
  pointBorderColor: '#fff',
  pointBorderWidth: 2
},
{
  label: 'Pendapatan ASDP',
  data: dataAsdp,
  borderColor: '#EF4444', // merah
  backgroundColor: 'rgba(239, 68, 68, 0.1)',
  tension: 0,
  fill: true,
  pointRadius: 3,
  pointHoverRadius: 5,
  pointBackgroundColor: '#EF4444',
  pointBorderColor: '#fff',
  pointBorderWidth: 2
}
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 15,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              title: (context) => {
                const date = context[0].label;
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
                return `Tanggal: ${date} ${monthNames[selectedMonth.value - 1]} ${selectedYear.value}`;
              },
              label: (context) => {
                return `${context.dataset.label}: ${formatTooltipCurrency(context.parsed.y)}`;
              }
            },
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
              size: 13
            },
            bodyFont: {
              size: 13
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Tanggal',
              font: {
                size: 12,
                weight: 'bold'
              }
            },
            grid: {
              display: false
            }
          },
          y: {
            title: {
              display: true,
              text: 'Pendapatan (Rp)',
              font: {
                size: 12,
                weight: 'bold'
              }
            },
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return formatCurrency(value);
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          }
        }
      }
    });
    
    console.log('Chart rendered successfully');
  } catch (error) {
    console.error('Error rendering chart:', error);
  }
};

onMounted(async () => {
  console.log('Component mounted');
  await loadData();
});

watch([selectedMonth, selectedYear], async () => {
  console.log('Filter changed');
  await loadData();
});

watch(revenueData, async (newData) => {
  console.log('Revenue data updated:', newData?.length, 'items');
  if (newData && newData.length > 0 && !loading.value && !isEmpty.value) {
    // Tunggu sebentar untuk memastikan DOM sudah update
    setTimeout(() => {
      renderChart();
    }, 100);
  }
}, { deep: true });
</script>
