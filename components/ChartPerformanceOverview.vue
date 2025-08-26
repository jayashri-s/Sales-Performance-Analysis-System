<template>
  <div class="bg-white rounded-xl shadow-lg p-6">
    <h2 class="text-xl font-bold text-gray-900 mb-6">Performance Overview</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 class="text-sm font-medium text-gray-600 mb-4">Revenue by Region</h3>
        <canvas ref="regionChart"></canvas>
      </div>
      <div>
        <h3 class="text-sm font-medium text-gray-600 mb-4">Lead Source Effectiveness</h3>
        <canvas ref="leadSourceChart"></canvas>
      </div>
      <div>
        <h3 class="text-sm font-medium text-gray-600 mb-4">Sentiment Distribution</h3>
        <canvas ref="sentimentChart"></canvas>
      </div>
      <div>
        <h3 class="text-sm font-medium text-gray-600 mb-4">Product Performance</h3>
        <canvas ref="productChart"></canvas>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

export default {
  name: 'ChartPerformanceOverview',
  props: {
    regionData: {
      type: Object,
      default: () => ({})
    },
    leadSourceData: {
      type: Object,
      default: () => ({})
    },
    sentimentData: {
      type: Object,
      default: () => ({})
    },
    productData: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const regionChart = ref(null)
    const leadSourceChart = ref(null)
    const sentimentChart = ref(null)
    const productChart = ref(null)

    let charts = {}

    const createRegionChart = () => {
      const ctx = regionChart.value.getContext('2d')
      if (charts.region) charts.region.destroy()
      
      charts.region = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(props.regionData || {}),
          datasets: [{
            data: Object.values(props.regionData || {}).map(r => r.revenue),
            backgroundColor: [
              '#3B82F6',
              '#10B981',
              '#F59E0B',
              '#EF4444',
              '#8B5CF6',
              '#EC4899'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 10,
                font: {
                  size: 11
                }
              }
            }
          }
        }
      })
    }

    const createLeadSourceChart = () => {
      const ctx = leadSourceChart.value.getContext('2d')
      if (charts.leadSource) charts.leadSource.destroy()
      
      const data = props.leadSourceData || {}
      charts.leadSource = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(data),
          datasets: [{
            label: 'Conversion Rate',
            data: Object.values(data).map(d => d.calls > 0 ? (d.conversions / d.calls) * 100 : 0),
            backgroundColor: '#10B981'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return value + '%'
                }
              }
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      })
    }

    const createSentimentChart = () => {
      const ctx = sentimentChart.value.getContext('2d')
      if (charts.sentiment) charts.sentiment.destroy()
      
      charts.sentiment = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: Object.keys(props.sentimentData || {}),
          datasets: [{
            data: Object.values(props.sentimentData || {}),
            backgroundColor: [
              '#10B981',
              '#6B7280',
              '#EF4444'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 10,
                font: {
                  size: 11
                }
              }
            }
          }
        }
      })
    }

    const createProductChart = () => {
      const ctx = productChart.value.getContext('2d')
      if (charts.product) charts.product.destroy()
      
      const data = props.productData || {}
      charts.product = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(data),
          datasets: [{
            label: 'Average Quote',
            data: Object.values(data).map(d => d.avgQuote),
            backgroundColor: '#3B82F6'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '₹' + value.toLocaleString()
                }
              }
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      })
    }

    onMounted(() => {
      if (props.regionData) createRegionChart()
      if (props.leadSourceData) createLeadSourceChart()
      if (props.sentimentData) createSentimentChart()
      if (props.productData) createProductChart()
    })

    watch(() => props.regionData, () => {
      if (props.regionData) createRegionChart()
    })

    watch(() => props.leadSourceData, () => {
      if (props.leadSourceData) createLeadSourceChart()
    })

    watch(() => props.sentimentData, () => {
      if (props.sentimentData) createSentimentChart()
    })

    watch(() => props.productData, () => {
      if (props.productData) createProductChart()
    })

    return {
      regionChart,
      leadSourceChart,
      sentimentChart,
      productChart,
      createRegionChart,
      createLeadSourceChart,
      createSentimentChart,
      createProductChart
    }
  }
}
</script>

<style scoped>
canvas {
  max-height: 200px;
}
</style>