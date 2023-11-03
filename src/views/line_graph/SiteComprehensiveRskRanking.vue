<script>
import AreaAndmonitorType from '@/sfc/AreaAndmonitorType.vue'
import exceptionApi from '@/api/exceptionApi.js'
import { useCommonFunction } from '../../utils/common.js'
import index from '@/utils/risk_estimate_common_function/index.js'
import dayjs from 'dayjs'
import ButtonExportExcel from '@/sfc/ButtonExportExcel.vue'
import ButtonClick from '@/sfc/ButtonClick.vue'
import { ElMessage } from 'element-plus'
import MonthSelect from '@/sfc/MonthSelect.vue';
import SiteDetail from '@/views/line_graph/components/SiteDetail.vue'
import { useLoadingStore } from '@/stores/loadingStore';
import { mapStores } from 'pinia';
export default {
  components: {
    AreaAndmonitorType,
    ButtonExportExcel,
    ButtonClick,
    MonthSelect,
    SiteDetail,
  },
  data() {
    return {
      //   表格数据
      tableData: [],
      isNoData: true,
      loading: false,
      // 统计分析按钮加载中
      queryButton: false,
      // 导出按钮加载中
      exportButton: false,
      form: {
        // 站点名称
        name: '',
        // 开始时间
        beginTime: '',
        // // 结束时间
        endTime: '',

        // 选择的月份
        month:''
      },
      bill: {
        min: '',
        max: '',
        avg: '',
        online: '',
        valid: '',
        exceeding: '',

        //  典型异常复现率
        exceptionRecurrence: '',
        // 异常类型据聚集度
        exceptionTypeAggregation: ''
      },

      // 表格数据
      table: [],
      // 表格高度
      tableHeight: 600,
      currentRow:[]
    }
  },
  setup() {
    // 引入 百分号比较大小 导出功能
    const { exportToExcel } = useCommonFunction()
    return { exportToExcel }
  },
    computed: {
    ...mapStores(useLoadingStore),
  },
  mounted(){
    // 
    this.fetch()
    this.calTableHeight()
  },
  methods: {

    /**
     * 将中国标准时间转为指定格式
     * @param：
     * @returns：
     */
     giveMonth(val){
      //将中国标准时间转为指定格式(该组件返回的标准时间的格式，所以必须的加这个函数)
      this.form.month = dayjs(val).format('YYYY-MM-DD');
      // 同时更新开始和结束时间 
      this.form.beginTime = dayjs(this.form.month).startOf().format('YYYY-MM-DD HH:mm:ss')
      this.form.endTime = dayjs(this.form.month).endOf('month').format('YYYY-MM-DD HH:mm:ss')
      console.log(this.form.beginTime,this.form.endTime);

     },
     
    // 功能：改变表格某个单元格的颜色
    tableCellClassName({ row, columnIndex }) {
      // 平均值不满足标准时
      if (columnIndex == 4) {
        if (row.riskValue >= 0.8) {
          return 'warning-row';
        }
      }

     
    },
    // 功能：表格高度根据内容自适应
    calTableHeight() {
      const h1 = this.$refs.h1.$el.offsetHeight
      // 其中一个40是盒子的总外边距
      this.tableHeight = `calc(100vh - ${h1}px  - 40px - 40px - var(--el-main-padding) * 2`
    },
    // 点击风险排名按钮
    fetchData() {
      this.loading = true
      this.queryButton = true
      exceptionApi
        .analysisdataByType(this.form.month, 'month')
        .then((response) => {
          this.chartData = response.data.data
          this.queryButton = false
          this.isNoData = false

          if (response.data.data.length == 0) {
            this.isNoData = true
            return
          }

          exceptionApi
            .exceptiondata1({
              siteName: '',
              beginTime: this.form.beginTime,
              endTime: this.form.endTime
            })
            .then((res) => {
              this.isNoData = false
 
              this.table = index.merge(
                this.chartData,
                res.data.data,
                this.form.beginTime,
                this.form.endTime
              )
              this.loading = false

              this.$nextTick(()=>{
              this.$refs.table.sort('riskValue','descending')
              
            })

            })
            
        })
    },

    /**
     * 初始加载函数
     */
    fetch() {
      // 分析数据
      this.fetchData()
      // 异常数据
      // this.exceptiondataCount()
    },

    /**
     * 导出为Excel

     */
    exportData() {
      if (this.table.length != 0) {
        const tableColumns = [
          'siteName',
          'region',
          'monitorType',
          'riskValue',
          'riskGrage',
          'riskAdvice',
          'beginTime',
          'endTime'
        ]
        const excelColumns = [
          ['A1', '站点名称'],
          ['B1', '区域'],
          ['C1', '监测类型'],
          ['D1', '风险值'],
          ['E1', '风险等级'],
          ['F1', '管控措施'],
          ['G1', '开始日期'],
          ['H1', '结束日期']
        ]
        this.exportButton = true
        this.exportToExcel(this.table, tableColumns, excelColumns, '综合风险排名.xlsx')
        this.exportButton = false
      } else {
        ElMessage('无数据需要导出')
      }
    },
    openDetail(row){
      const encodedSiteName = encodeURIComponent(row.siteName);
      this.$router.push(`/detail/${encodedSiteName}/${this.form.month}`)

      // this.$router.push(`/detail/${row.siteName}/${this.form.month}`)
    }
  }
}
</script>

<template>
  <el-row ref="h1">
    <el-row>
      <el-form :inline="true" :model="form">
        <el-form-item>
          <AreaAndmonitorType></AreaAndmonitorType>
        </el-form-item>

        <el-form-item>
          <MonthSelect  @submit-value="giveMonth"></MonthSelect>
        </el-form-item>

        <el-form-item>
          <ButtonClick
            style="margin-right: 12px"
            content="风险排名"
            type="primary"
            :loading="queryButton"
            @do-search="fetch"
          ></ButtonClick>
          <ButtonExportExcel
            content="导出数据"
            type="success"
            :loading="exportButton"
            @do-export="exportData"
          ></ButtonExportExcel>
        </el-form-item>
      </el-form>
    </el-row>
  </el-row>

  <el-table
    ref="table"
    :data="table"
    :height="tableHeight"
    v-loading="loading"
    element-loading-text="后台分析中..."
    style="width: 98%"
    :cell-class-name="tableCellClassName"
    :default-sort="{ prop: 'riskValue', order: 'descending' }"
    v-show="!isNoData"
    border
  >
    <el-table-column
      type="index"
      prop="name"
      label="序号"
      :index="indexMethod"
      fixed
      align="center"
      width="55"
      show-overflow-tooltip
    />
    <el-table-column prop="siteName" label="站点名称" align="center" show-overflow-tooltip >
      <template #default="{ row }">
        <el-button type="primary" text class="table-button" @click="openDetail(row)"
          >{{row.siteName}}</el-button
        >
      </template>
      </el-table-column>
    <el-table-column prop="region" label="区域" align="center" width="80" show-overflow-tooltip />
    <el-table-column prop="monitorType" label="检测类型" align="center" width="80" show-overflow-tooltip />
    <el-table-column
      prop="riskValue"
      label="风险值"
      sortable
      align="center"
      width="100"
      show-overflow-tooltip
    />
    <el-table-column prop="riskGrage" label="风险等级" align="center" width="100" show-overflow-tooltip />
    <el-table-column prop="riskAdvice" label="管控措施" align="center" show-overflow-tooltip />
    <el-table-column
      prop="beginTime"
      label="开始日期"
      sortable
      align="center"
      width="160"
      show-overflow-tooltip
    />
    <el-table-column
      prop="endTime"
      label="结束日期"
      sortable
      align="center"
      width="160"
      show-overflow-tooltip
    />
  </el-table>
  <el-empty v-show="isNoData" :image-size="200" />



</template>

<style scoped>
.el-row,
.el-table {
  margin: 10px 0px 0px 10px;
}

:deep(.el-table__row .warning-row){
  background-color: red;
  /* color: rgb(241, 236, 236); */
}
.table-button {
  letter-spacing: 1px;
  text-decoration: underline;
  border-radius: 0px;
}

</style>
