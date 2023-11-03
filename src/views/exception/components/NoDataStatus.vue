<script>
  export default {
    props:{
    isNoData:{
        type:Boolean,
        default:()=>{
            return true
        }
    }
},
    data() {
      return{

      }
    },
    mounted() {

    },
    methods: {

     }
}
</script>

<template>
  <div class="container" v-show="isNoData">
    <span>暂无数据</span>
  </div>
</template>

<style  scoped>
.container {
    height: 90px;
    display: flex;
    justify-content: center;
    align-items: center;

    color: gray;
}

</style>