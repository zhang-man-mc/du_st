<!--点击站点 跳转至风险模型页面  -->
<script>
import subRiskModel from '@/views/line_graph/components/subRiskModel.vue'
export default {
  components: {
    subRiskModel
  },
  data() {
    return {
      siteName: '',
      month: ''
    }
  },
  watch: {},
  mounted() {},
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      // 通过 `vm` 访问组件实例
      vm.siteName = to.params.siteName
      vm.month = to.params.month
    })
  },
  methods: {
    // 回退页面
    onBack() {
      this.$router.back()
    }
  }
}
</script>

<template>
  <el-page-header @back="onBack">
    <template #content>
      <span> 站点风险数据详情 </span>
    </template>
  </el-page-header>

  <subRiskModel :sName="siteName" :month_1="month"> </subRiskModel>
</template>

<style scoped>
.el-page-header {
  margin: 10px 0px 10px 10px;
}
span {
  font-size: 14px;
  color: #333333;
}
</style>
