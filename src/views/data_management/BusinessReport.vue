<script>
import MonthSelect from '@/sfc/MonthSelect.vue'
import exceptionApi from '@/api/exceptionApi.js'
import dayjs from 'dayjs'
export default {
  components: {
    MonthSelect
  },
  data() {
    return {
      month: ''
    }
  },
  mounted() {
    this.get()
  },
  methods: {
    giveTime(val) {
      //将中国标准时间转为指定格式(该组件返回的标准时间的格式，所以必须的加这个函数)
      this.month = dayjs(val).format('YYYY-MM-DD HH:mm:ss')
    },
    async getExceptionData() {
      await exceptionApi
        .exceptiondata1({
          siteName: '',
          beginTime: '2023-07-01 00:00:00',
          endTime: '2023-07-05 00:00:00'
        }).then(res=>{
          console.log(res);
       exceptionApi
        .exceptiondata1({
          siteName: '',
          beginTime: '2023-07-01 00:00:00',
          endTime: '2023-07-05 00:00:00'
        })
        // .then((res) => {
        //   const data = res.data.data
        //   console.log('data', data)
          
        // })
        return a
        })
     
        
    },
    get() {
      this.getExceptionData().then( b=>{
        console.log('b',b.data.data);
      })
     
    }
  }
}
</script>

<template>
  <div>
    业务报表
    <MonthSelect @submit-value="giveTime"></MonthSelect>
    {{ month }}
  </div>
</template>

<style scoped></style>
