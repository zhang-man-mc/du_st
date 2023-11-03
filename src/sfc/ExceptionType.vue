
<!-- 异常类型复选框组件  
    自动获取扬尘历史表中不同异常类型
    将选中的多个异常以数组形式返回给父组件 

    **
    在父组件中设置
   <ExceptionType @submit-value="(n)=>form.exceptionName=n"></ExceptionType>
-->

<script>
  export default {
    emits:['submitValue'],
    data() {
      return{
        // 返回的所有异常类型
        exceptionType:[],
        //已勾选的异常
        checkedList: [],
        // 全选
        checkAll:false,
        isIndeterminate:false,
      }
    },
    mounted() {
        this.getExceptionType()
    },
    methods: {
        // 获取不同的异常名称
        getExceptionType(){
            this.$http.get('/dust/exceptiontype').then(response=>{   
                // this.exceptionType = response.data.data
                response.data.data.forEach(item => {
                    this.exceptionType.push(item.exceptionType)
                });
                // console.log('获取到的异常类型：',this.exceptionType);
                let a = ['0','1','2','3','4','5','6','7']
                a.forEach(item=>{
                  if(this.exceptionType.indexOf(item) == -1){
                    this.exceptionType.push(item)
                  }
                })
            })
        },
        handleCheckAllChange (val) {
          this.checkedList = val ? this.exceptionType : []
          this.isIndeterminate = false
          this.$emit('submitValue',this.checkedList)
        },
        handleCheckedExceptionChange  (value)  {
  const checkedCount = value.length
  this.checkAll = checkedCount === this.exceptionType.length
  this.isIndeterminate = checkedCount > 0 && checkedCount < this.exceptionType.length
  this.$emit('submitValue',this.checkedList)
}
     }
}
</script>

<template>
  <div class="excption">
    <h1 class="exception-text">异常类型：</h1>
     <el-checkbox
    v-model="checkAll"
    :indeterminate="isIndeterminate"
    @change="handleCheckAllChange"
    class="select-text"
    >全选</el-checkbox
  >
    <el-checkbox-group  v-model="checkedList"  @change="handleCheckedExceptionChange">
    <el-checkbox :label="item"  v-for="item in exceptionType" :key="item">
      <template #default>
        <!-- <div style="display: flex; flex-flow: row wrap;">  -->
        <span v-if="item == '0'">断电或断网</span>
        <span v-else-if="item == '1'">数据超低</span>
        <span v-else-if="item == '2'">超标</span>
        <span v-else-if="item == '3'">数据长时段无波动</span>
        <span v-else-if="item == '4'">量级突变异常</span>
        <span v-else-if="item == '5'">临近超标异常</span>
        <span v-else-if="item == '6'">单日超标次数临界异常</span>
        <span v-else-if="item == '7'">滑动平均值突变</span>
      <!-- </div> -->
      </template>
    </el-checkbox>
  </el-checkbox-group>
  </div>
</template>

<style lang="scss" scoped>
.excption {
    display: flex; 
}
.exception-text {
  font-size: 14px;
  color: #333333;
  margin-top: 5px;
  margin-right: 7px;
}
.el-checkbox-group {
  margin-top: 5px;
}
.select-text {
  margin-top: 5px;
  margin-right: 5px;
}
</style>