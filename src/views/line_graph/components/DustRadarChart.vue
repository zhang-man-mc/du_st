<!-- 雷达图

-->
<script>
import * as echarts from 'echarts';
export default {
  props: {
    // 属性
    name: {
      type: Array,
      default: () => {
        return [];
      }
    },
    // 数据
    yData: {
      type: Array,
      default: () => {
        return [100,0,0,0,100];
      }
    }
  },
  data() {
    return {
      chart: null
    };
  },
  watch: {
    yData() {
      this.set();
    }
  },
  mounted() {
    this.initRadarChart();
    window.addEventListener('resize', this.resizeChart);
  },
  computed:{
    valid(){
      return (100-this.yData[0]).toFixed(2)
    },
    exceptionRecurrence(){
      return this.yData[1]*100
    },
    exceptionTypeAggregation(){
      return this.yData[2]*100
    },
    exceeding(){
      return  this.yData[3]
    },
    online(){
      return   (100-this.yData[4]).toFixed(2)
    }
  },
  methods: {
    initRadarChart() {
      this.chart = echarts.init(document.getElementById('main'));
    },
    set() {
      let option = {
        title: {
          text: '综合风险'
        },
        tooltip: {},
        radar: {
          // 边框颜色
          splitLine: {
            lineStyle: {
              // 使用深浅的间隔色
              color: ['#ddd', '#aaa']
            }
          },
      
          indicator: [
            { name: this.name[0] +' '+ this.valid+'%', max: 1 },
            { name: this.name[1] +' '+ this.exceptionRecurrence+'%', max: 1 },
            { name: this.name[2] +' '+ this.exceptionTypeAggregation+'%', max: 1 },
            { name: this.name[3] +' '+ this.exceeding+'%', max: 1 },
            { name: this.name[4] +' '+ this.online+'%', max: 1 }

          ],

          axisName: {
            color: '#428BD4',
            },
          legend: {
            borderColor: '#428BD4'
          }
        },
        series: [
          {
            type: 'radar',
            data: [
              {
                value: [
                  (1 - this.yData[0]/100).toFixed(4),
                  this.yData[1],
                  this.yData[2],
                 (this.yData[3]/100).toFixed(4),
                  (1-this.yData[4]/100).toFixed(4)
                ],
   
                name: '异常分析'
              }
            ],
            label: {
              show: false,
            position: 'bottom',
            formatter: function(params) {
              return params.value*100+'%'
            }
            }
          }
        ]
      };
      this.chart.setOption(option);
    },
        // 跟页面响应式变化
        resizeChart() {
          this.chart.resize();
          // this.$nextTick(() => {
          //   if (this.chart) {
          //     this.chart.resize();
          //   }
          // });
      }
  }
};
</script>

<template>
  <div id="main" class="chart"></div>
</template>

<style scoped>
.chart {
  width: 650px;
  height: 500px;
}
</style>
