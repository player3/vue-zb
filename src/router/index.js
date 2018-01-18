import Vue from 'vue'
import Router from 'vue-router'
import ElementUI from 'element-ui'
import HelloWorld from '@/components/HelloWorld'
import Chart from '@/components/Chart'
import Bitfinex from '@/components/Bitfinex'
import Data from '@/components/Data'
import ECharts from 'vue-echarts/components/ECharts.vue'
import 'element-ui/lib/theme-chalk/index.css'


import 'echarts/lib/chart/bar'
import 'echarts/lib/chart/line'
import 'echarts/lib/chart/pie'
import 'echarts/lib/chart/map'
import 'echarts/lib/chart/radar'
import 'echarts/lib/chart/scatter'
import 'echarts/lib/chart/candlestick'
import 'echarts/lib/chart/effectScatter'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/polar'
import 'echarts/lib/component/geo'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/title'
import 'echarts/lib/component/visualMap'

Vue.component('chart', ECharts)
Vue.use(Router)
Vue.use(ElementUI)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path: '/chart',
      name: 'Chart',
      component: Chart
    },
    {
      path: '/bitfinex',
      name: 'Bitfinex',
      component: Bitfinex
    },
    {
      path: '/data',
      name: 'Data',
      component: Data
    }
  ]
})
