<template>
  <div class="row q-col-gutter-md">
    <div class="col-md-3 col-12">
      <dash-board-card
        title="تعداد حواله های در انتظار بررسی"
        icon="assignment_late"
        :loading="pendingTransfersCountLoading"
        :number="pendingTransfersCount" />
    </div>
    <div class="col-md-3 col-12">
      <dash-board-card
        title="تعداد انبارهای قفل شده"
        icon="lock"
        :loading="lockedInventoriesCountLoading"
        :number="lockedInventoriesCount" />
    </div>
    <div class="col-md-3 col-12">
      <dash-board-card
        title="تعداد زیر محصولات"
        icon="add"
        :number="12" />
    </div>
    <div class="col-md-3 col-12">
      <dash-board-card
        title="تعداد انبارها"
        icon="add"
        :number="12" />
    </div>
  </div>
  <div class="row q-col-gutter-md q-mt-md">
    <div class="col-md-5 col-12">
      <q-card>
        <q-card-section>
          <v-chart
            class="chart"
            :option="option1"
            autoresize />
        </q-card-section>
      </q-card>
    </div>
    <div class="col-md-7 col-12">
      <q-card>
        <q-card-section>
          <v-chart
            class="chart"
            :option="option2"
            autoresize />
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
// https://vue-echarts.dev/?renderer=canvas
// https://echarts.apache.org/examples/en/index.html
// https://echarts.apache.org/examples/en/editor.html?c=bump-chart
// https://stackblitz.com/edit/vue-echarts-vue-3?file=src%2FApp.vue
import DashBoardCard from 'src/components/DashBoardCard.vue'
import { use } from 'echarts/core'
import ReportAPI from 'src/repositories/report'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  GridComponent,
  ToolboxComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
// import VChart, { THEME_KEY } from 'vue-echarts';
import VChart from 'vue-echarts'
// import { ref, provide } from 'vue';
import { ref, onMounted } from 'vue'

use([
  CanvasRenderer,
  PieChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  ToolboxComponent,
  LegendComponent
])

const reportAPI = new ReportAPI()
const pendingTransfersCount = ref<number | null>(null)
const pendingTransfersCountLoading = ref<boolean>(false)
const lockedInventoriesCount = ref<number | null>(null)
const lockedInventoriesCountLoading = ref<boolean>(false)
// provide(THEME_KEY, 'dark');
const names = [
  'Orange',
  'Tomato',
  'Lemon',
  'Pasta'
]
const years = ['2001', '2002', '2003', '2004', '2005', '2006']

const option1 = ref({
  title: {
    text: 'Traffic Sources',
    left: 'center'
  },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b} : {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 'left',
    data: ['Direct', 'Email', 'Ad Networks', 'Video Ads', 'Search Engines']
  },
  series: [
    {
      name: 'Traffic Sources',
      type: 'pie',
      radius: '55%',
      center: ['50%', '60%'],
      data: [
        { value: 335, name: 'Direct' },
        { value: 310, name: 'Email' },
        { value: 234, name: 'Ad Networks' },
        { value: 135, name: 'Video Ads' },
        { value: 1548, name: 'Search Engines' }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
})

function generateSeriesList () {
  const seriesList: any[] = []
  const rankingMap = generateRankingData()
  rankingMap.forEach((data, name) => {
    const series = {
      name,
      symbolSize: 20,
      type: 'line',
      smooth: true,
      emphasis: {
        focus: 'series'
      },
      endLabel: {
        show: true,
        formatter: '{a}',
        distance: 20
      },
      lineStyle: {
        width: 4
      },
      data
    }
    seriesList.push(series)
  })
  return seriesList
};
function generateRankingData () {
  const map = new Map()
  const defaultRanking = Array.from({ length: names.length }, (_, i) => i + 1)
  years.forEach(()=> {
    const shuffleArray = shuffle(defaultRanking)
    names.forEach((name, i) => {
      map.set(name, (map.get(name) || []).concat(shuffleArray[i]))
    })
  })
  return map
};
function shuffle (array: any[]) {
  let currentIndex = array.length
  let randomIndex = 0
  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex]
    ]
  }
  return array
};

const option2 = ref({
  title: {
    text: 'Bump Chart (Ranking)'
  },
  tooltip: {
    trigger: 'item'
  },
  grid: {
    left: 30,
    right: 110,
    bottom: 30,
    containLabel: true
  },
  toolbox: {
    feature: {
      saveAsImage: {}
    }
  },
  xAxis: {
    type: 'category',
    splitLine: {
      show: true
    },
    axisLabel: {
      margin: 30,
      fontSize: 16
    },
    boundaryGap: false,
    data: years
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      margin: 30,
      fontSize: 16,
      formatter: '#{value}'
    },
    inverse: true,
    interval: 1,
    min: 1,
    max: names.length
  },
  series: generateSeriesList()
})

async function getPendingTransfersCountAll () {
  try {
    pendingTransfersCountLoading.value = true
    pendingTransfersCount.value = await reportAPI.getPendingTransfersCountAll()
  } finally {
    pendingTransfersCountLoading.value = false
  }
}

async function getLockedInventoriesCount () {
  try {
    lockedInventoriesCountLoading.value = true
    lockedInventoriesCount.value = await reportAPI.getLockedInventoriesCount()
  } finally {
    lockedInventoriesCountLoading.value = false
  }
}

onMounted(()=> {
  getLockedInventoriesCount()
  getPendingTransfersCountAll()
})

</script>

<style lang="scss" scoped>
.chart {
  height: 500px;
}
</style>
