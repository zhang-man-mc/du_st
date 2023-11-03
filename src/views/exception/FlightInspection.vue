<script>
import { defineAsyncComponent } from 'vue'
import TimeShortCuts from '@/sfc/TimeShortCuts.vue'
import { useCommonFunction } from '../../utils/common.js'
import AreaAndmonitorType from '@/sfc/AreaAndmonitorType.vue'
import ButtonClick from '@/sfc/ButtonClick.vue'
import index from '@/utils/exception_common_function/index.js'
//  异常图形异步组件
const DustLineChart = defineAsyncComponent(() => import('./components/DustLineChart.vue'))
import exceptionApi from '@/api/exceptionApi.js'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import AnalysisCard from './components/AnalysisCard.vue'

export default {
  components: {
    TimeShortCuts,
    DustLineChart,
    ButtonClick,
    AreaAndmonitorType,
    AnalysisCard
  },
  data() {
    return {
      //  表单内容
      form: {
        // 站点名称
        name: '',
        // 选择的异常类型
        exceptionName: []
      },
      beginTime: '',
      endTime: '',
      // 返回的数据
      tableData: [],
      // 表格展示的数据
      displayData: [],
      // 表格高度
      tableHeight: 400,
      // 表格显示
      isTableShow: false,
      // 当前页
      currentPage: 1,
      // 每页条数
      pageSize: 20,
      // 表格的总记录数
      total: 0,

      // 查询按钮无数据时
      isNoData: {
        exception0:true,
        exception1:true,
        exception2:true,
        exception3:true,
        exception4:true,
        exception5:true,
        exception6:true,
        exception7:true,
      },
      // eslint-disable-next-line no-undef
      // 对话框显示
      dialogTableVisible: false,
      // 保存异常对应的店铺名称和设备编号
      exception: {
        // 断电或断网
        exception0: [],
        // 数据超低
        exception1: [],
        // 超标
        exception2: [],
        // 数据长时段无波动
        exception3: [],
        // 量级突变异常
        exception4: [],
        // 临近超标异常
        exception5: [],
        // 单日超标次数临界异常
        exception6: [],
        // 滑动平均值异常
        exception7: [],

        // 该时段的异常数量
        exception0Num: 0,
        exception1Num: 0,
        exception2Num: 0,
        exception3Num: 0,
        exception4Num: 0,
        exception5Num: 0,
        exception6Num: 0,
        exception7Num: 0
      },
      // 站点总数量
      siteTotal: 0,

      // 选中表格当前行的数据
      tableCurrentRowData: null,
      // 选中表格当前行的索引
      selectedRowIndex: -2,
      // 页面上的按钮加载状态
      loading: {
        // 查询按钮
        queryButton: false,
        // 表格加载中
        tableLoading: false,
        // 上一条按钮
        preButton: false,
        // 下一条按钮
        afterButton: false,
        // 折线图
        lineChart: false
      },

      dialog: {
        // 打开对话框请求该区间的历史数据
        historyData: [],
        // 该时间段的异常条数
        exceptionTotal: 0,
        // 折线图配置项
        option: {},
        // ’上一条‘按钮是否可以被点击状态
        isPreCantouch: false,
        // ’下一条‘按钮是否可以被点击状态
        isNextCantouch: false,
        // 异常的前中后区间所有数据
        allExceptionTimeData: []
      },

      // 标记位
      flag: {
        // 加载时 上下条按钮不能再点击
        banTouch: 0,
        // 0代表分页，1代表不分页
        originClick: 0
      },
      
    }
  },
  setup() {
    // provide('search',readonly(form))
    const { isExceedOneMonth } = useCommonFunction()
    return {
      isExceedOneMonth
    }
  },
  // 监听  判断按钮是否可点击
  watch: {
    selectedRowIndex(newVaue) {
      // 处于表格的最后一条数据 设置‘上一条’按钮不可点
      // if (newVaue === this.displayData.length - 1) {
      //   this.dialog.isPreCantouch = true
      //   //用户先点了第一条，pre为true,然后点击最后一条,next为true。此时两个按钮都被封锁
      //   if (this.dialog.isNextCantouch == true) {
      //     this.dialog.isNextCantouch = false
      //   }
      // }
      // // 处于表格第一条数据 设置‘下一条’按钮不可点
      // else if (newVaue === 0) {
      //   this.dialog.isNextCantouch = true
      //   //用户先点了表格最后一条,next为true,然后点击第一条，pre为true。此时两个按钮都被封锁
      //   if (this.dialog.isPreCantouch == true) {
      //     this.dialog.isPreCantouch = false
      //   }
      // }
      // // 处于表格的中间行 将按钮设置为可点击状态
      // else {
      //   this.dialog.isPreCantouch = false
      //   this.dialog.isNextCantouch = false
      // }
      // 处于表格的最后一条数据 设置‘上一条’按钮不可点
      if (newVaue === 0) {
          this.dialog.isPreCantouch = true
        //用户先点了第一条，pre为true,然后点击最后一条,next为true。此时两个按钮都被封锁
        if (this.dialog.isNextCantouch == true) {
          this.dialog.isNextCantouch = false
        }
      }
      // 处于表格第一条数据 设置‘上一条’按钮不可点
      else if (newVaue === this.displayData.length - 1) {
        this.dialog.isNextCantouch = true
        //用户先点了表格最后一条,next为true,然后点击第一条，pre为true。此时两个按钮都被封锁
        if (this.dialog.isPreCantouch == true) {
          this.dialog.isPreCantouch = false
        }
      }
      // 处于表格的中间行 将按钮设置为可点击状态
      else {
        this.dialog.isPreCantouch = false
        this.dialog.isNextCantouch = false
      }
    },

    // 当选择的时间发生变化时，异常分析部分的异常店铺数量同步变化
    // beginTime() {
    //   this.getShopNames()
    // },
    // endTime() {
    //   this.getShopNames()
    // },
    dialogTableVisible() {
      window.addEventListener('resize', this.updateChart)
    }
  },
  computed: {
    exceptionAllNum() {
      let sum = this.exception.exception0Num +
        this.exception.exception1Num +
        this.exception.exception2Num +
        this.exception.exception3Num +
        this.exception.exception4Num +
        this.exception.exception5Num +
        this.exception.exception6Num +
        this.exception.exception7Num
      if(sum == 0){
        return 1
      }else {
        return sum
      }
    },
    long_time_notchange(){
      let sum = this.exception.exception0Num +
        this.exception.exception1Num +
        this.exception.exception2Num +
        this.exception.exception3Num +
        this.exception.exception4Num +
        this.exception.exception5Num +
        this.exception.exception6Num +
        this.exception.exception7Num
      if(sum ==0){
        return 0
      }else{
        return (
                        100 -
                        (this.exception.exception0Num /
                        this.exceptionAllNum) *
                          100 -
                        (this.exception.exception1Num /
                        this.exceptionAllNum) *
                          100 -
                        (this.exception.exception2Num /
                        this.exceptionAllNum) *
                          100 -
                        (this.exception.exception4Num /
                        this.exceptionAllNum) *
                          100 -
                        (this.exception.exception5Num /
                        this.exceptionAllNum) *
                          100 -
                        (this.exception.exception6Num /
                        this.exceptionAllNum) *
                          100 -
                        (this.exception.exception7Num /
                        this.exceptionAllNum) *
                          100
                      ).toFixed(1)
      }
    },
    // 第一排卡片
    cardRow1(){
      return [
        {
          siteName:this.exception.exception4,
          exceptionType:'4',
          exceptionName:'量级突变',
          iconSrc:'@/assets/exception/exception4.png',
          siteNum:this.exception.exception4.length,
          exceptionNum:this.exception.exception4Num,
          isNoDataStatus:this.isNoData.exception4
        },
        {
          siteName:this.exception.exception5,
          exceptionType:'5',
          exceptionName:'临近超标异常',
          iconSrc:'@/assets/exception/exception5.png',
          siteNum:this.exception.exception5.length,
          exceptionNum:this.exception.exception5Num,
          isNoDataStatus:this.isNoData.exception5
        },
        {
          siteName:this.exception.exception6,
          exceptionType:'6',
          exceptionName:'单日超标次数临界异常',
          iconSrc:'@/assets/exception/exception6.png',
          siteNum:this.exception.exception6.length,
          exceptionNum:this.exception.exception6Num,
          isNoDataStatus:this.isNoData.exception6
        },
        {
          siteName:this.exception.exception7,
          exceptionType:'7',
          exceptionName:'变化趋势异常',
          iconSrc:'@/assets/exception/exception7.png',
          siteNum:this.exception.exception7.length,
          exceptionNum:this.exception.exception7Num,
          isNoDataStatus:this.isNoData.exception7
        }
      ]
    },  
      cardRow2(){
        return [
      {
        siteName:this.exception.exception0,
          exceptionType:'0',
          exceptionName:'数据缺失异常',
          iconSrc:'@/assets/exception/exception0.png',
          siteNum:this.exception.exception0.length,
          exceptionNum:this.exception.exception0Num,
          isNoDataStatus:this.isNoData.exception0
        },
        {
          siteName:this.exception.exception1,
          exceptionType:'1',
          exceptionName:'数据超低',
          iconSrc:'@/assets/exception/exception1.png',
          siteNum:this.exception.exception1.length,
          exceptionNum:this.exception.exception1Num,
          isNoDataStatus:this.isNoData.exception1
        },
        {
          siteName:this.exception.exception2,
          exceptionType:'2',
          exceptionName:'超标',
          iconSrc:'@/assets/exception/exception2.png',
          siteNum:this.exception.exception2.length,
          exceptionNum:this.exception.exception2Num,
          isNoDataStatus:this.isNoData.exception2
        },
        {
          siteName:this.exception.exception3,
          exceptionType:'3',
          exceptionName:'数据长时段无波动',
          iconSrc:'@/assets/exception/exception3.png',
          siteNum:this.exception.exception3.length,
          exceptionNum:this.exception.exception3Num,
          isNoDataStatus:this.isNoData.exception3
        }, 
      ]
      }
  },
  mounted() {
    this.backExceptionDataAWeekAgo()
    // 查询时间段的各异常的站点，查询该时间区间的各异常数量
    this.getShopNames()
    this.getSiteNume()
  },

  methods: {
    getImageUrl(name){
        return new URL(`../../lib/Carousel/assets/${name}`, import.meta.url).href
    },
    // 放回站点总数量
    getSiteNume() {
      exceptionApi.getSitesNum().then((res) => {
        this.siteTotal = res.data.data.length
      })
    },

    /**
     * description：点击异常站点名字时 返回的数据
     * @param：
     * @createTime:2023-08-17
     * @returns：
     */
    getAbnormalDataByClick(val) {
      this.flag.originClick = 1
      // 显示表格
      this.isTableShow = true
      this.tableData = val
      this.total = this.tableData.length
      // 默认显示第一页
      this.handleCurrentChange(1)
    },
    // 点击表格的行时
    selectTableRow() {
      // 获取当前行的索引
      this.selectedRowIndex = this.displayData.indexOf(this.tableCurrentRowData)
    },
    /**
     * description：断电或断网时设置的表格数据
     */
    setOfflineTbleData() {
      // 无数据时的时间数组 时间相差15分钟
      const abnormalTimeTenMinute = index.descFiftyTime(
        this.tableCurrentRowData.beginTime,
        this.tableCurrentRowData.endTime
      )
      // 保存无数据时表格条数
      this.dialog.exceptionTotal = abnormalTimeTenMinute.length

      // 去除供电异常和掉线区间的第一个有元素的值
      this.dialog.historyData = []

      for (let i = 0; i < abnormalTimeTenMinute.length; i++) {
        this.dialog.historyData.push({
          name: this.tableCurrentRowData.name,
          mnCode: this.tableCurrentRowData.mnCode,
          dutyCompany: this.tableCurrentRowData.dutyCompany,
          lst: abnormalTimeTenMinute[i],
          dustValue: ''
        })
      }
    },

    // 段电或断网区间无数据，需要补充。其他的都有数据，直接一次请求全部时段就好

    // 根据异常区间构造前后端首尾 前区间 中间区间 后区间
    // 判断是段电或断网？是则请求前后区间，否则只请求一次完整的
    // 得到最终数据
    // 再判断异常种类 ，进行设置配置项

    /**
     * description：一次请求回前中后区间的数据,对数据进行分析
     * @param： 前中后区间的请求参数，前中后的总区间时间，异常开始时间，一场结束时间
     */
    otherExceptionRequest(allTimeArgs, allTime, exceptionBT, exceptionET) {
      // 折线图加载中效果
      this.loading.lineChart = true
      this.$http.get('/dust/history', { params: allTimeArgs }).then((result) => {
        this.dialog.allExceptionTimeData = result.data.data
        //  数据缺失异常时重新设置表格
        if (this.tableCurrentRowData.exceptionType == '0') {
          this.setOfflineTbleData()
        }

        // x轴日期时间
        let dateList = []
        // y轴 超标油烟浓度
        let dustValue = []
        let timeAndValue = {}

        // 从添加了首位区间的开始和结束时间进行遍历 保证时间以10分钟为间隔
        timeAndValue = index.keepContinuousByEachFiftyMinutes(
          allTime[0],
          allTime[3],
          this.dialog.allExceptionTimeData
        )
        dateList = timeAndValue['xAxis']
        dustValue = timeAndValue['yAxis']

        // 提取异常起始时间点在整个区间内的数据索引
        let startIndex = dateList.findIndex((item) => item === exceptionBT)
        let endIndex = dateList.findIndex((item) => item === exceptionET)

        // 设置折线图配置项
        this.reSetChart(dateList, dustValue, exceptionBT, exceptionET, startIndex, endIndex)
        this.loading.lineChart = false
      })
    },

    /**
     * description：绘制折线图
     * @param： x轴时间， y轴油烟浓度， 异常开始时间，异常结束时间，异常开始时间在整个区间的索引下标，异常结束时间在整个区间的索引下标
     */
    reSetChart(xData, yData, exceptionBeginTime, exceptionEndTime, beginIndex, endIndex) {
      this.dialog.option = {}
      switch (this.tableCurrentRowData.exceptionType) {
        // 断电或断网  时间段
        case '0':
          this.dialog.option = {
            title: {
            text: this.tableCurrentRowData.exception,
            left: '1%',
            textStyle:{
              fontSize:14
            }
          },
            tooltip: {},
            toolbox: {
              // 工具栏
              feature: {
                // dataZoom: {
                //   // 区域缩放
                //   yAxisIndex: 'none'
                // },
                // 保存为图片
                saveAsImage: {}
              }
            },
            xAxis: {
              type: 'category',
              data: xData,
              name: '时间',
              axisLabel: {
                formatter: function (value) {
                  return value.slice(11, -3)
                }
              }
            },
            yAxis: {
              type: 'value',
              name: 'mg/m³'
            },
            series: [
              {
                name: '颗粒物浓度',
                type: 'line',
                data: yData,
                markLine: {
                  silent: true,
                  data: [
                    // 标注无数据时间段的效果，将这个时间段的数轴部分变为红色
                    {
                      name: '无数据',
                      xAxis: exceptionBeginTime
                    },
                    {
                      xAxis: exceptionEndTime
                    }
                  ],
                  lineStyle: {
                    color: 'red'
                  }
                }
              }
            ]
          }
          break
        // 超标
        case '2':
          this.dialog.option = {
            title: {
            text: this.tableCurrentRowData.exception,
            left: '1%',
            textStyle:{
              fontSize:14
            }
          },
            tooltip: {},
            toolbox: {
              // 工具栏
              feature: {
                //     dataZoom: {
                //   yAxisIndex: 'none'
                // },
                // 保存为图片
                saveAsImage: {}
              }
            },
            xAxis: {
              type: 'category',
              data: xData,
              name: '时间',
              axisLabel: {
                formatter: function (value) {
                  return value.slice(11, -3)
                }
              }
            },
            yAxis: {
              type: 'value',
              name: 'mg/m³'
            },
            series: [
              {
                name: '颗粒物浓度',
                type: 'line',
                data: yData.map((item) => {
                  if (item >= 1) {
                    return {
                      value: item,
                      itemStyle: {
                        color: 'red'
                      }
                    }
                  }
                  return item
                }),
                // 变换指定时间区间的背景颜色
                markArea: {
                  itemStyle: {
                    color: 'rgba(255, 173, 177, 0.4)'
                  },
                  data: [
                    [
                      {
                        name: '异常时间段',
                        xAxis: exceptionBeginTime
                      },
                      {
                        xAxis: exceptionEndTime
                      }
                    ]
                  ]
                },
                markLine: {
                  symbol: 'none',
                  itemStyle: {
                    // 基线公共样式
                    normal: {
                      lineStyle: {
                        type: 'dashed'
                      },
                      label: {
                        show: true,
                        position: 'end',
                        formatter: '{b}'
                      }
                    }
                  },
                  data: [
                    {
                      name: '超标',
                      type: 'average',
                      yAxis: 1,
                      lineStyle: {
                        // color: '#ff0000'
                        color: 'red'
                      }
                    }
                  ]
                }
              }
            ],
            // 指定时间区间的线段变颜色
            visualMap: {
              show: false,
              dimension: 0,
              pieces: [
                {
                  lte: beginIndex,
                  color: 'green'
                },
                {
                  gt: beginIndex,
                  lte: endIndex,
                  color: 'red'
                },
                {
                  gt: endIndex,
                  lte: xData.length - 1,
                  color: 'green'
                }
              ]
            }
          }
          break
        // 数据超低 只有时间点
        case '1':
          this.dialog.option = {
            title: {
            text: this.tableCurrentRowData.exception,
            left: '1%',
            textStyle:{
              fontSize:14
            }
          },
            tooltip: {},
            toolbox: {
              // 工具栏
              feature: {
                //     dataZoom: {
                //   yAxisIndex: 'none'
                // },
                // 保存为图片
                saveAsImage: {}
              }
            },
            xAxis: {
              type: 'category',
              data: xData,
              name: '时间',
              axisLabel: {
                formatter: function (value) {
                  return value.slice(11, -3)
                }
              }
            },
            yAxis: {
              type: 'value',
              name: 'mg/m³'
            },
            series: [
              {
                name: '颗粒物浓度',
                type: 'line',
                data: yData.map((item) => {
                  if (item <= 0.01) {
                    return {
                      value: item,
                      itemStyle: {
                        color: 'red'
                      }
                    }
                  }
                  return item
                }),

                markLine: {
                  symbol: 'none',
                  itemStyle: {
                    // 基线公共样式
                    normal: {
                      lineStyle: {
                        type: 'dashed'
                      },
                      label: {
                        show: true,
                        position: 'end',
                        formatter: '{b}'
                      }
                    }
                  },
                  data: [
                    {
                      name: '数据超低',
                      type: 'average',
                      yAxis: 0.01,
                      lineStyle: {
                        // color: '#ff0000'
                        color: 'red'
                      }
                    }
                  ]
                }
              }
            ],
            // 指定时间区间的线段变颜色
            visualMap: {
              show: false,
              dimension: 0,
              pieces: [
                {
                  lte: beginIndex,
                  color: 'green'
                },
                {
                  gt: beginIndex,
                  lte: endIndex,
                  color: 'red'
                },
                {
                  gt: endIndex,
                  lte: xData.length - 1,
                  color: 'green'
                }
              ]
            }
          }
          break
        // 数据长时段无波动 
        case '3':
          this.dialog.option = {
            title: {
            text: this.tableCurrentRowData.exception,
            left: '1%',
            textStyle:{
              fontSize:14
            }
          },
            tooltip: {},
            toolbox: {
              // 工具栏
              feature: {
                //  dataZoom: {
                //   yAxisIndex: 'none'
                // },
                // 保存为图片
                saveAsImage: {}
              }
            },
            xAxis: {
              type: 'category',
              data: xData,
              name: '时间',
              axisLabel: {
                formatter: function (value) {
                  return value.slice(11, -3)
                }
              }
            },
            yAxis: {
              type: 'value',
              name: 'mg/m³'
            },
            series: [
              {
                name: '颗粒物浓度',
                type: 'line',
                data: yData.map((item) => {
                  if (item >= 1) {
                    return {
                      value: item,
                      itemStyle: {
                        color: 'red'
                      }
                    }
                  }
                  return item
                }),
                // 变换指定时间区间的背景颜色
                markArea: {
                  itemStyle: {
                    color: 'rgba(255, 173, 177, 0.4)'
                  },
                  data: [
                    [
                      {
                        name: '异常时间段',
                        xAxis: exceptionBeginTime
                      },
                      {
                        xAxis: exceptionEndTime
                      }
                    ]
                  ]
                }
              }
            ],
            // 指定时间区间的线段变颜色
            visualMap: {
              show: false,
              dimension: 0,
              pieces: [
                {
                  lte: beginIndex,
                  color: 'green'
                },
                {
                  gt: beginIndex,
                  lte: endIndex,
                  color: 'red'
                },
                {
                  gt: endIndex,
                  lte: xData.length - 1,
                  color: 'green'
                }
              ]
            }
          }
          break
        // 量级突变异常
        case '4':
        case '5':
        case '6':
        case '7':
          this.dialog.option = {
            title: {
            text: this.tableCurrentRowData.exception,
            left: '1%',
            textStyle:{
              fontSize:14
            }
          },
            tooltip: {},
            toolbox: {
              // 工具栏
              feature: {
                //     dataZoom: {
                //   yAxisIndex: 'none'
                // },
                // 保存为图片
                saveAsImage: {}
              }
            },
            xAxis: {
              type: 'category',
              data: xData,
              name: '时间',
              axisLabel: {
                formatter: function (value) {
                  return value.slice(11, -3)
                }
              }
            },
            yAxis: {
              type: 'value',
              name: 'mg/m³'
            },
            series: [
              {
                name: '颗粒物浓度',
                type: 'line',
                data: yData,
                // 变换指定时间区间的背景颜色
                markArea: {
                  itemStyle: {
                    color: 'rgba(255, 173, 177, 0.4)'
                  },
                  data: [
                    [
                      {
                        name: '异常时间段',
                        xAxis: exceptionBeginTime
                      },
                      {
                        xAxis: exceptionEndTime
                      }
                    ]
                  ]
                }
              }
            ],
            // 指定时间区间的线段变颜色
            visualMap: {
              show: false,
              dimension: 0,
              pieces: [
                {
                  lte: beginIndex,
                  color: 'green'
                },
                {
                  gt: beginIndex,
                  lte: endIndex,
                  color: 'red'
                },
                {
                  gt: endIndex,
                  lte: xData.length - 1,
                  color: 'green'
                }
              ]
            }
          }
          break
        default:
          console.log('没有设置该异常类型！')
      }
      this.flag.banTouch = 0
    },
    /**
     * description：划分出异常起始时间，构造请求前中后的参数
     */
    timeAndDataProcessed() {
      //异常的开始时间 结束时间
      let exceptionBeginTime = this.tableCurrentRowData.beginTime
      let exceptionEndTime = this.tableCurrentRowData.endTime

      // beforeAndAfterTime[0]:前45分钟的时间点
      // beforeAndAfterTime[1]:前15分钟的时间点
      // beforeAndAfterTime[2]:后15分钟的时间点
      // beforeAndAfterTime[3]:后45分钟的时间点
      let beforeAndAfterTime = index.before45AndAfter45(exceptionBeginTime, exceptionEndTime)

      // 构造异常时间前后区间数据请求参数(除了断网中都用到）
      let paramsAllTime = index.requestGetParms(
        this.tableCurrentRowData.name,
        beforeAndAfterTime[0],
        beforeAndAfterTime[3]
      )
      
      // 将异常数据进行预处理，随后将结果作为折线图的配置项
      this.otherExceptionRequest(
        paramsAllTime,
        beforeAndAfterTime,
        exceptionBeginTime,
        exceptionEndTime
      )
    },

    /**
     * description：获取下一条异常信息
     */
    getPreviousRowData() {
      //     // 不是表格的最后一行
      if (this.selectedRowIndex < this.displayData.length - 1) {
        // 点击过程中 锁住上下条按钮  在设置完图形配置项后解锁
        this.flag.banTouch = 1

        //得到上一行数据索引
        this.selectedRowIndex = this.selectedRowIndex + 1

        //请求数据 改变exceedingData
        // this.setinfo(this.selectedRowIndex);

        // 得到上一行的数据
        this.tableCurrentRowData = this.displayData[this.selectedRowIndex]
        let params = index.requestGetParms(
          this.tableCurrentRowData.name,
          this.tableCurrentRowData.beginTime,
          this.tableCurrentRowData.endTime
        )
        this.loading.preButton = true
        this.$http.get('/dust/history', { params: params }).then((response) => {
          // 保存返回的超标数据
          this.dialog.historyData = response.data.data
          this.dialog.exceptionTotal = response.data.data.length
          // 逻辑处理
          this.timeAndDataProcessed()
          this.loading.preButton = false
        })
      }

      //得到上一行数据索引
      // this.selectedRowIndex = this.selectedRowIndex + 1;
      // this.tableCurrentRowData = this.displayData[this.selectedRowIndex]
    },
    /**
     * description：获取下一条异常信息
     */
    getNextRowData() {
      // 不是表格的第一行
      if (this.selectedRowIndex !== 0) {
        // 点击过程中 锁住上下条按钮  在设置完图形配置项后解锁
        this.flag.banTouch = 1

        //得到上一行数据索引
        this.selectedRowIndex = this.selectedRowIndex - 1
        //请求数据 改变exceedingData
        // this.setinfo(this.selectedRowIndex);

        // 得到上一行的数据
        this.tableCurrentRowData = this.displayData[this.selectedRowIndex]

        let params = index.requestGetParms(
          this.tableCurrentRowData.name,
          this.tableCurrentRowData.beginTime,
          this.tableCurrentRowData.endTime
        )
        this.loading.afterButton = true
        this.$http.get('/dust/history', { params: params }).then((response) => {
          // 保存返回的超标数据
          this.dialog.historyData = response.data.data
          this.dialog.exceptionTotal = response.data.data.length
          // 逻辑处理
          this.timeAndDataProcessed()
          this.loading.afterButton = false
        })
      }
    },

    /**
     * description：从子组件获得某站点该时段的异常数据
     * @createTime:2023-08-18
     */
    backExceptionData(val1, val2) {
      this.displayData = val1
      this.total = val2
    },

    /**
     * description：当用户改变查询的时间区间时，会根据该区间查询各异常的站点，查询该时间区间的各异常数量
     * @createTime:2023-08-18
     */
    getShopNames() {
      /* 查询异常的站点 */

      this.$http
        .get('/dust/sitenamecode', {
          params: {
            exceptionType: '0',
            beginTime: this.beginTime,
            endTime: this.endTime
          }
        })
        .then((result) => {
          this.exception.exception0 = result.data.data
          if(result.data.data.length ==0 ){
            this.isNoData.exception0=true
            return
          }
          this.isNoData.exception0=false
        })
      this.$http
        .get('/dust/sitenamecode', {
          params: {
            exceptionType: '1',
            beginTime: this.beginTime,
            endTime: this.endTime
          }
        })
        .then((result) => {
          this.exception.exception1 = result.data.data
          if(result.data.data.length == 0 ){
            this.isNoData.exception1=true
            return
          }
          this.isNoData.exception1=false
        })
      this.$http
        .get('/dust/sitenamecode', {
          params: {
            exceptionType: '2',
            beginTime: this.beginTime,
            endTime: this.endTime
          }
        })
        .then((result) => {
          this.exception.exception2 = result.data.data
          if(result.data.data.length ==0 ){
            this.isNoData.exception2=true
            return
          }
          this.isNoData.exception2=false
        })

      this.$http
        .get('/dust/sitenamecode', {
          params: {
            exceptionType: '3',
            beginTime: this.beginTime,
            endTime: this.endTime
          }
        })
        .then((result) => {
          this.exception.exception3 = result.data.data
          if(result.data.data.length ==0 ){
            this.isNoData.exception3=true
            return
          }
          this.isNoData.exception3=false
        })

      this.$http
        .get('/dust/sitenamecode', {
          params: {
            exceptionType: '4',
            beginTime: this.beginTime,
            endTime: this.endTime
          }
        })
        .then((result) => {
          this.exception.exception4 = result.data.data
          if(result.data.data.length ==0 ){
            this.isNoData.exception4=true
            return
          }
          this.isNoData.exception4=false
        })
      this.$http
        .get('/dust/sitenamecode', {
          params: {
            exceptionType: '5',
            beginTime: this.beginTime,
            endTime: this.endTime
          }
        })
        .then((result) => {
          this.exception.exception5 = result.data.data
          if(result.data.data.length ==0 ){
            this.isNoData.exception5=true
            return
          }
          this.isNoData.exception5=false
        })
      this.$http
        .get('/dust/sitenamecode', {
          params: {
            exceptionType: '6',
            beginTime: this.beginTime,
            endTime: this.endTime
          }
        })
        .then((result) => {
          this.exception.exception6 = result.data.data
          if(result.data.data.length ==0 ){
            this.isNoData.exception6=true
            return
          }
          this.isNoData.exception6=false
        })
        this.$http
        .get('/dust/sitenamecode', {
          params: {
            exceptionType: '7',
            beginTime: this.beginTime,
            endTime: this.endTime
          }
        })
        .then((result) => {
          this.exception.exception7 = result.data.data
          if(result.data.data.length ==0 ){
            this.isNoData.exception7=true
            return
          }
          this.isNoData.exception7=false
        })


      /* 异常异常数量 */
      this.$http
        .get('/dust/exceptionnum', {
          params: {
            exceptionType: '0',
            beginTime: this.beginTime,
            endTime: this.endTime
          }
        })
        .then((result) => {
          this.exception.exception0Num = result.data.data
          
        })
      this.$http
        .get('/dust/exceptionnum', {
          params: {
            exceptionType: '1',
            beginTime: this.beginTime,
            endTime: this.endTime
          }
        })
        .then((result) => {
          this.exception.exception1Num = result.data.data
        })
      this.$http
        .get('/dust/exceptionnum', {
          params: {
            exceptionType: '2',
            beginTime: this.beginTime,
            endTime: this.endTime
          }
        })
        .then((result) => {
          this.exception.exception2Num = result.data.data
        })

      this.$http
        .get('/dust/exceptionnum', {
          params: {
            exceptionType: '3',
            beginTime: this.beginTime,
            endTime: this.endTime
          }
        })
        .then((result) => {
          this.exception.exception3Num = result.data.data
        })

      this.$http
        .get('/dust/exceptionnum', {
          params: {
            exceptionType: '4',
            beginTime: this.beginTime,
            endTime: this.endTime
          }
        })
        .then((result) => {
          this.exception.exception4Num = result.data.data
        })
      this.$http
        .get('/dust/exceptionnum', {
          params: {
            exceptionType: '5',
            beginTime: this.beginTime,
            endTime: this.endTime
          }
        })
        .then((result) => {
          this.exception.exception5Num = result.data.data
        })
      this.$http
        .get('/dust/exceptionnum', {
          params: {
            exceptionType: '6',
            beginTime: this.beginTime,
            endTime: this.endTime
          }
        })
        .then((result) => {
          this.exception.exception6Num = result.data.data
        })
        this.$http
        .get('/dust/exceptionnum', {
          params: {
            exceptionType: '7',
            beginTime: this.beginTime,
            endTime: this.endTime
          }
        })
        .then((result) => {
          this.exception.exception7Num = result.data.data
        })



    },

    /**
     * description：请求异常的店铺名字
     * @param：异常类型，开始时间，结束时间
     * @returns： 异常的数据
     */
    // getSiteNameByExceptionType(exception, beginT, endT) {
    //   let param = {
    //     exceptionType: exception,
    //     beginTime: beginT,
    //     endTime: endT
    //   };

    //   this.$http.get('/dust/sitenamecode', { params: param }).then((res) => {
    //     return res.data.data;
    //   });
    //   return;
    // },

    /**
     * description：显示对话框,返回该异常时间段的所有数据
     * @param：点击‘查看详情’的该行所有字段数据
     * @createTime:2023-08-18
     */
    showDialog(row) {
      // 打开对话框
      this.dialogTableVisible = true

      // 保存当前行数据
      this.tableCurrentRowData = row

      // 获取当前行的索引
      this.selectedRowIndex = this.displayData.indexOf(row)

      //根据当前行的编号，起始时间来 请求异常数据
      // 对请求到的数据进行首尾拼接
      // 得到前后完整数据进行绘制图形
      this.loading.lineChart = true
      let params = {}
      if (row.name) {
        params['siteName'] = row.name
      }
      if (row.beginTime) {
        params['beginTime'] = row.beginTime
      }
      if (row.endTime) {
        params['endTime'] = row.endTime
      }

      this.$http.get('/dust/history', { params: params }).then((response) => {
        this.dialog.historyData = response.data.data
        this.dialog.exceptionTotal = response.data.data.length
        // 逻辑处理
        this.timeAndDataProcessed()
      })
    },
    /**
     * description：条件查询异常的数据
     * @createTime:2023-08-18
     */
    handleSubmit() {
      if (this.isExceedOneMonth(this.beginTime, this.endTime)) {
        alert('时间跨度不能超过一个月')
        return
      }
      // 更新异常分析
      this.getShopNames()

      this.loading.queryButton = true
      this.flag.originClick = 0
      this.loading.tableLoading = true
      let params = {}
      params['page'] = this.currentPage
      params['pageSize'] = this.pageSize
      if (this.form.name) {
        params['siteName'] = this.form.name
      }
      if (this.form.exceptionName.length != 0) {
        params['exceptionType'] = this.form.exceptionName.join()
      }
      params['beginTime'] = this.beginTime
      params['endTime'] = this.endTime

      this.$http.get('/dust/exceptiondata', { params: params }).then((response) => {
        // 保存返回的
        // this.tableData = response.data.data.rows;
        this.displayData = response.data.data.rows
        this.loading.queryButton = false
        this.loading.tableLoading = false

        if (response.data.data.total == 0) {
          ElMessage('该时段无数据')
          this.isTableShow = false
          return
        }
        this.isTableShow = true
        this.total = response.data.data.total
        // 移除空数据状态
      })

    },

    /**
     * description：打开页面默认加载最近一周的异常数据
     * @createTime:2023-08-18
     */
    backExceptionDataAWeekAgo() {
      this.loading.tableLoading = true
      let params = {}
      if (this.form.name) {
        params['siteName'] = this.form.name
      }
      if (this.form.exceptionName) {
        params['exceptionType'] = this.form.exceptionName
      }
      params['beginTime'] = this.beginTime
      params['endTime'] = this.endTime

      this.$http.get('/dust/exceptiondata', { params: params }).then((response) => {
        // 保存返回的
        // this.tableData = response.data.data.rows;
        this.displayData = response.data.data.rows
        this.loading.tableLoading = false
        if (response.data.data.total == 0) {
          ElMessage('该时段无数据')
          this.isTableShow = false
          return
        }
        this.isTableShow = true
        this.total = response.data.data.total
        
      })
    },

    /**
     * description：将中国标准时间转为指定格式(该组件返回的标准时间的格式，所以必须的加这个函数)
     * @createTime:2023-08-17
     */
    giveTime(val) {
      this.beginTime = dayjs(val[0]).format('YYYY-MM-DD HH:mm:ss')
      this.endTime = dayjs(val[1]).format('YYYY-MM-DD HH:mm:ss')
    },

    // 功能：表格高度根据内容自适应
    calTableHeight() {
      const h1 = this.$refs.h1.$el.offsetHeight
      const h2 = this.$refs.h2.$el.offsetHeight
      const h3 = this.$refs.h3.$el.offsetHeight
      const h4 = this.$refs.h4.$el.offsetHeight
      // 其中一个40是盒子的总外边距
      this.tableHeight = `calc(100vh - ${h1}px - ${h2}px - ${h3}px - ${h4}px - 40px - var(--el-main-padding) * 2)`
    },

    // 页大小改变时触发
    handleSizeChange(val) {
      this.pageSize = val

      // 改变每页显示数目时跳到当前页
      this.handleCurrentChange(1)
    },

    // 页号改变时触发
    /**
     * description：页号改变时触发
     * @param： 当前页，标记位（0代表是点击‘查询’触发的，1代表时点击异常站点文本按钮触发的）
     * @createTime:2023-08-17
     * @returns：
     */
    handleCurrentChange(val) {
      // 将当前页号给currentPage
      this.currentPage = val

      // 页面变化时调用 查询数据函数
      if (this.flag.originClick == 0) {
        this.handleSubmit()
      } else if (this.flag.originClick == 1) {
        const startIndex = (val - 1) * this.pageSize
        const endIndex = startIndex + this.pageSize

        this.displayData = this.tableData.slice(startIndex, endIndex)
      }
    },
    // 表格序号递增
    indexMethod1(index) {
      return index + 1 + (this.currentPage - 1) * this.pageSize
    },
    // 表格序号递增
    indexMethod2(index) {
      return index + 1
    }
  }
}
</script>

<template>
<div class="all-container">
  <el-row ref="h1" >
    <el-col>
      <el-form :inline="true">
        <div class="head-container-text">
          <el-form-item>
            <AreaAndmonitorType></AreaAndmonitorType>
          </el-form-item>

          <el-form-item>
            <TimeShortCuts
              timeType="day"
              @submit-time="giveTime"
            ></TimeShortCuts>
          </el-form-item >

          <el-form-item>
            <ButtonClick
              content="风险评估"
              type="warning"
              color="rgb(12,104,165)"
              :loading="loading.queryButton"
              :havaIcon="false"
              @do-search="handleSubmit"
            ><img src="@/assets/exception/riskButton.png" height="24" class="img-button"></ButtonClick>
           
          </el-form-item>

        </div>

      </el-form>
    </el-col>
  </el-row>

<!-- 时间摘要 -->
  <el-row class="head-describtion-text" ref="h2">
    <el-row>
      <span> 金山区 {{ beginTime }} —— {{ endTime }} 扬尘监测异常信息汇总</span>
    </el-row>
  </el-row>

  <!-- 异常分析 -->
  <el-row ref="h3">
    <el-col>
      <el-card class="card-container">
        <template #header>
          <div class="card-header">异常分析</div>
        </template>

        <el-row :gutter="20" class="card-row">
          <el-col :span="6">
            <AnalysisCard  :site-name="cardRow1[0].siteName"  :exception-type="cardRow1[0].exceptionType" :begin-time="beginTime" :end-time="endTime" :exception-name="cardRow1[0].exceptionName" :site-num="cardRow1[0].siteNum" :exception-num="cardRow1[0].exceptionNum" :exception-all-num="exceptionAllNum" :site-num-all="siteTotal"  :isNoDataStatus="cardRow1[0].isNoDataStatus" @get-abnormal-data-by-click="getAbnormalDataByClick"> 
                <img src="@/assets/exception/exception4.png"  height="24" width="24">
            </AnalysisCard>
          </el-col>
          <el-col :span="6"> 
            <AnalysisCard  :site-name="cardRow1[1].siteName"  :exception-type="cardRow1[1].exceptionType" :begin-time="beginTime" :end-time="endTime" :exception-name="cardRow1[1].exceptionName" :site-num="cardRow1[1].siteNum" :exception-num="cardRow1[1].exceptionNum" :exception-all-num="exceptionAllNum" :site-num-all="siteTotal"  :isNoDataStatus="cardRow1[1].isNoDataStatus" @get-abnormal-data-by-click="getAbnormalDataByClick"> 
                <img src="@/assets/exception/exception5.png"  height="24" width="24">
            </AnalysisCard>
          </el-col>
          <el-col :span="6">
            <AnalysisCard  :site-name="cardRow1[2].siteName"  :exception-type="cardRow1[2].exceptionType" :begin-time="beginTime" :end-time="endTime" :exception-name="cardRow1[2].exceptionName" :site-num="cardRow1[2].siteNum" :exception-num="cardRow1[2].exceptionNum" :exception-all-num="exceptionAllNum" :site-num-all="siteTotal"  :isNoDataStatus="cardRow1[2].isNoDataStatus" @get-abnormal-data-by-click="getAbnormalDataByClick"> 
                <img src="@/assets/exception/exception6.png"  height="24" width="24">
            </AnalysisCard>
          </el-col>
          <el-col :span="6">
            <AnalysisCard  :site-name="cardRow1[3].siteName"  :exception-type="cardRow1[3].exceptionType" :begin-time="beginTime" :end-time="endTime" :exception-name="cardRow1[3].exceptionName" :site-num="cardRow1[3].siteNum" :exception-num="cardRow1[3].exceptionNum" :exception-all-num="exceptionAllNum" :site-num-all="siteTotal"  :isNoDataStatus="cardRow1[3].isNoDataStatus" @get-abnormal-data-by-click="getAbnormalDataByClick"> 
                <img src="@/assets/exception/exception7.png"  height="24" width="24">
            </AnalysisCard>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="6" >
            <AnalysisCard  :site-name="cardRow2[0].siteName" :exception-type="cardRow2[0].exceptionType" :begin-time="beginTime" :end-time="endTime" :exception-name="cardRow2[0].exceptionName" :site-num="cardRow2[0].siteNum" :exception-num="cardRow2[0].exceptionNum" :exception-all-num="exceptionAllNum" :site-num-all="siteTotal"  :isNoDataStatus="cardRow2[0].isNoDataStatus" @get-abnormal-data-by-click="getAbnormalDataByClick"> 
              <img src="@/assets/exception/exception0.png"  height="24" width="24">
            </AnalysisCard>
          </el-col>
          <el-col :span="6" >
            <AnalysisCard  :site-name="cardRow2[1].siteName" :exception-type="cardRow2[1].exceptionType" :begin-time="beginTime" :end-time="endTime" :exception-name="cardRow2[1].exceptionName" :site-num="cardRow2[1].siteNum" :exception-num="cardRow2[1].exceptionNum" :exception-all-num="exceptionAllNum" :site-num-all="siteTotal"  :isNoDataStatus="cardRow2[1].isNoDataStatus" @get-abnormal-data-by-click="getAbnormalDataByClick"> 
              <img src="@/assets/exception/exception1.png"  height="24" width="24">
            </AnalysisCard>
          </el-col>
          <el-col :span="6" >
            <AnalysisCard  :site-name="cardRow2[2].siteName" :exception-type="cardRow2[2].exceptionType" :begin-time="beginTime" :end-time="endTime" :exception-name="cardRow2[2].exceptionName" :site-num="cardRow2[2].siteNum" :exception-num="cardRow2[2].exceptionNum" :exception-all-num="exceptionAllNum" :site-num-all="siteTotal"  :isNoDataStatus="cardRow2[2].isNoDataStatus" @get-abnormal-data-by-click="getAbnormalDataByClick"> 
              <img src="@/assets/exception/exception2.png"  height="24" width="24">
            </AnalysisCard>
          </el-col>
          <el-col :span="6" >
            <AnalysisCard  :site-name="cardRow2[3].siteName" :exception-type="cardRow2[3].exceptionType" :begin-time="beginTime" :end-time="endTime" :exception-name="cardRow2[3].exceptionName" :site-num="cardRow2[3].siteNum" :exception-num="cardRow2[3].exceptionNum" :exception-all-num="exceptionAllNum" :site-num-all="siteTotal"  :isNoDataStatus="cardRow2[3].isNoDataStatus" @get-abnormal-data-by-click="getAbnormalDataByClick"> 
              <img src="@/assets/exception/exception3.png"  height="24" width="24">
            </AnalysisCard>
          </el-col>


        </el-row>

      </el-card>
    </el-col>
  </el-row>

  <el-button-group>
    <el-button color="#626aef"  plain @click="isTableShow=true" v-show="!isTableShow">
      显示异常清单<el-icon class="i-ep-Arrow"><i-ep-ArrowUp /></el-icon>
    </el-button>
    <el-button color="#626aef"  plain @click="isTableShow=false" v-show="isTableShow">
      隐藏异常清单<el-icon class="i-ep-Arrow"><i-ep-ArrowDown /></el-icon>
    </el-button>
  </el-button-group>

  <!-- 表格 -->
  <el-row v-show="isTableShow">
    <el-col>
      
      <el-table
        ref="table"
        :data="displayData"
        :height="tableHeight"
        :highlight-current-row="true"
        size="default"
        v-loading="loading.tableLoading"
        border
      >
        <el-table-column
          type="index"
          label="序号"
          width="60px"
          align="center"
          fixed
          :index="indexMethod1"
        />
        <el-table-column prop="name" label="站点名称" show-overflow-tooltip />
        <el-table-column prop="mnCode" label="设备编号" align="center" show-overflow-tooltip />
        <el-table-column prop="exception" label="异常类型" align="center" show-overflow-tooltip />
        <el-table-column prop="region" label="区域" align="center" show-overflow-tooltip />
        <el-table-column prop="beginTime" label="开始时间" align="center" show-overflow-tooltip />
        <el-table-column prop="endTime" label="结束时间" align="center" show-overflow-tooltip />
        <el-table-column prop="typename" label="场景" align="center" width="82" show-overflow-tooltip />
        <el-table-column prop="address" label="地址" align="center" show-overflow-tooltip />
        <el-table-column prop="dutyCompany" label="运维商" align="center" show-overflow-tooltip />
        
        <el-table-column label="操作" align="center">
          <template #default="{ row }">
            <el-button type="primary" class="table-button" @click="showDialog(row)"
              >查看详情</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        ref="h4"
        background
        layout="total, sizes, prev, pager, next, jumper"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      >
      </el-pagination>
    </el-col>
  </el-row>

  <!-- 对话框 -->
  <el-dialog
    class="exception-dialog"
    v-model="dialogTableVisible"
    draggable
    align-center
    height="700px"
    width="700px"
  >
    <!-- 头 -->
    <template #header>
      <div class="diag-head">
        <div class="diag-head-text">
          <div><span class="diag-head-text1">站点名称：</span>{{ tableCurrentRowData.name }}</div>
          <div><span class="diag-head-text1">设备编号：</span>{{ tableCurrentRowData.mnCode }}</div>
          <div><span class="diag-head-text1">运维商：</span>{{ tableCurrentRowData.dutyCompany }}</div>
          <!-- <div>
            <span class="diag-head-text1">异常类型：</span>
            <span v-if="tableCurrentRowData.exceptionType == '0'">数据缺失异常</span>
            <span v-else-if="tableCurrentRowData.exceptionType == '1'">数据超低</span>
            <span v-else-if="tableCurrentRowData.exceptionType == '2'">超标</span>
            <span v-else-if="tableCurrentRowData.exceptionType == '3'">数据长时间无波动</span>
            <span v-else-if="tableCurrentRowData.exceptionType == '4'">量级突变异常</span>
            <span v-else-if="tableCurrentRowData.exceptionType == '5'">临近超标异常</span>
            <span v-else-if="tableCurrentRowData.exceptionType == '6'">单日超标次数临界异常</span>
            <span v-else-if="tableCurrentRowData.exceptionType == '7'">滑动平均值异常</span>
          </div> -->

          <div>
            <span class="diag-head-text1">异常时间段：</span>{{ tableCurrentRowData.beginTime }} ~
            {{ tableCurrentRowData.endTime }}
          </div>
        </div>

        <!-- <div class="chart-jump-button">
          <el-button
            type="danger"
            :loading="loading.preButton"
            :disabled="dialog.isPreCantouch || flag.banTouch"
            @click="getPreviousRowData"
            >上条异常</el-button
          >
          <el-button
            type="danger"
            :loading="loading.afterButton"
            :disabled="dialog.isNextCantouch || flag.banTouch"
            @click="getNextRowData"
            >下条异常</el-button
          >
        </div> -->
        <div class="chart-jump-button">
          <el-button
            type="danger"
            :loading="loading.preButton"
            :disabled="dialog.isPreCantouch || flag.banTouch"
            @click="getNextRowData"
            >上条异常</el-button
          >
          <el-button
            type="danger"
            :loading="loading.afterButton"
            :disabled="dialog.isNextCantouch || flag.banTouch"
            @click="getPreviousRowData"
            >下条异常</el-button
          >
        </div>

      </div>
    </template>

    <!-- :option="dialog.option" -->

    <!-- 图形 -->
    <DustLineChart
      :option="dialog.option"
      :is-open-dialog="dialogTableVisible"
      v-loading="loading.lineChart"
    ></DustLineChart>

    <!-- 表格 -->
    <div>
      <el-table :data="dialog.historyData" size="default" height="200" border>
        <el-table-column
          type="index"
          label="序号"
          width="60px"
          align="center"
          fixed
          :index="indexMethod2"
        ></el-table-column>
        <!-- <el-table-column fixed prop="name" label="站点名称" show-overflow-tooltip />
        <el-table-column prop="mnCode" label="设备编号" align="center" show-overflow-tooltip />
        <el-table-column prop="dutyCompany" label="运维商" align="center" show-overflow-tooltip /> -->
        <el-table-column prop="lst" label="采集时间" align="center" show-overflow-tooltip />
        <el-table-column
          prop="dustValue"
          label="颗粒物浓度(mg/m³)"
          align="center"
          show-overflow-tooltip
        />
      </el-table>
    </div>
    <template #footer>
      <el-tag type="success" class="mx-1" effect="dark" round
        ><span class="table-line-lable" v-show="tableCurrentRowData.exceptionType == '0'"
          >缺失数据：
        </span>
        <span
          v-show="
            tableCurrentRowData.exceptionType == '1' ||
            tableCurrentRowData.exceptionType == '2' ||
            tableCurrentRowData.exceptionType == '3' ||
            tableCurrentRowData.exceptionType == '4'
          "
          >异常数据：</span
        >
        <span class="table-line-num">{{ dialog.exceptionTotal }}条</span>
        <span v-show="tableCurrentRowData.exceptionType == '0'"> (逻辑计算)</span>
      </el-tag>
    </template>
  </el-dialog>
</div>
</template>

<style lang="scss" scoped>

.el-row {
  margin-left: 10px;
}

/* 条件查询模块的样式 */
.el-form {
  margin: 10px;
}
img {
  margin-right: 5px;
}
.head-container-search {

  float: right;
}

.head-describtion-text {
  justify-content: flex-end;
  margin-bottom: 2px;
  margin-right: 20px;
  font-size: 14px;
  color: gray;
}
.button-set {
  margin: 10px;
}
/* 条件查询模块结束 */

/* 异常分析模块的样式 */


.card-text1 {
  /* 黑体的异常名字部分 */
  margin: 10px;
}
.card-text1 + div {
  /* 黑体的异常名字下面的 */
  margin: 12px;
}
.card-exception-buttom {
  /* 异常站点文本按钮区域 */
  padding: 11px;
}
.card-header {
  margin-left: 5px;
  font-size: 18px;
  font-weight: bold;
}
.card-content-unnormal {
  min-height: 200px;
  border: 2px solid #ffcf8b;
  border-radius: 20px;
}
.card-content-normal {
  min-height: 200px;
  border: 2px solid red;
  border-radius: 20px;
}

.card-header-text {
  font-size: 16px;
  font-weight: bold;
  margin-top: 4px;
  margin-left: 4px;
}
.card-content-text {
  white-space: nowrap;
}
.card-exceptionname-text1 {
  /*  异常站点占比 */
  font-size: 14px;
  white-space: nowrap;
}

.card-exceptionname-text2 {
  /* 异常数占比的外边距 */
  font-size: 14px;
  white-space: nowrap;
}
.text-blank {
   /* 逗号 */
  margin-right: 10px;
  color: #000000;
}
.card-row {
  margin-bottom: 10px;
}

/* 异常分析模块结束 */

/* 隐藏表格按钮组样式 */
.el-button-group {
  margin:10px 0px 10px 10px;
}
.i-ep-Arrow {
  margin-left: 6px;
  margin-bottom:2px;
  font-size: 1.2em;
}
/* 隐藏表格按钮组样式结束 */



/* 表格模块的样式 */
.el-table {
  color: #333333;
}
/* 表格模块结束 */

/* 查看详情对话框模块的样式 */

.diag-head {
  /* 对话框头部区域 */
  min-height: 200px;
}
.diag-head-text1 {
  /* 对话框头部的属性字段加粗 */
  font-weight: bold;
}

.diag-head-text > div {
  /*  对话框异常时间段 */
  margin-top: 15px;
}
.diag-head-text {
  margin: 10px;
  padding: 10px;
  background: linear-gradient(90deg, #00c9ff 0%, #92fe9d 100%);
  border: 2px solid #7bc0fc;
}
.chart-jump-button {
  display: flex;
  justify-content: right;
}

.mx-1 {
  position: absolute;
  left: 10px;
  bottom: 10px;
}
/* 查看详情对话框模块结束 */
</style>
