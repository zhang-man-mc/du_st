import { createRouter, createWebHashHistory  } from 'vue-router'


const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/layout',
      name: 'home',
      meta: { title: '首页' },
      component: () => import('@/components/layout/AppLayout.vue'),
      children: 
            [
              // {
              //   path:'/avalue',
              //   name:'avalue',
              //   meta: {title: '风险评估'},
              //   children:[
              //       // 数据分险模型
              //   {
              //     path: "/avgDay",
              //     name: 'avgDay',
              //     meta: { title: '数据分险模型' },
              //     component: () => import('@/views/line_graph/DataRiskModel.vue')
              //   },
    
              //   //  数据风险排名
              //   {
              //     path: "/analysis",
              //     name: 'analysis',
              //     meta: { title: '数据风险排名' },
              //     component: () => import('@/views/line_graph/DataRiskRank.vue')
              //   },
              //   //  数据风险排名
              //   {
              //     path: "/riskrank",
              //     name: 'riskrank',
              //     meta: { title: '综合风险排名' },
              //     component: () => import('@/views/line_graph/SiteComprehensiveRskRanking.vue')
              //   },
              //     ]
              // },
              
            // 数据分险模型
            {
              path: "/avgDay",
              name: 'avgDay',
              meta: { title: '数据分险模型' , keepAlive: true},
              component: () => import('@/views/line_graph/DataRiskModel.vue')
            },

            //  数据风险排名
            {
              path: "/analysis",
              name: 'analysis',
              meta: { title: '数据风险排名' , keepAlive: true},
              component: () => import('@/views/line_graph/DataRiskRank.vue')
            },
            //  数据风险排名
            {
              path: "/riskrank",
              name: 'riskrank',
              meta: { title: '综合风险排名' , keepAlive: true },
              component: () => import('@/views/line_graph/SiteComprehensiveRskRanking.vue')
            },
       
            // 飞行巡检
            {
              path: "/edata",
              name: 'edata',
              meta: { title: '飞行巡检' , keepAlive: true},
              component: () => import('@/views/exception/FlightInspection.vue')
            },

            //  站点审核辅助
            {
              path: "/testData",
              name: 'testData',
              meta: { title: '站点审核辅助' , keepAlive: true},
              component: () => import('@/views/exception/SiteAuditAssistance.vue')
            },
        
      
            {
              path: "/hdata",
              name: 'hdata',
              meta: { title: '历史数据管理' , keepAlive: true},
              component: () => import('@/views/data_management/HistoryData.vue')
            },
            //  数据接入管理
            {
              path: "/management",
              name: 'management',
              meta: { title: '数据接入管理' },
              component: () => import('@/views/data_management/DataAccessManagement.vue')
            },

            //  业务报表
            {
              path: "/report",
              name: 'report',
              meta: { title: '业务报表' },
              component: () => import('@/views/data_management/BusinessReport.vue')
            },
       
            //  数据接入配置
            {
              path: "/setting",
              name: 'setting',
              meta: { title: '数据接入配置' },
              component: () => import('@/views/setting/SetConfiguration.vue')
            },

            
            //  数据接入配置
            {
              path: "/detail/:siteName/:month",
              name: 'detail',
              meta: { title: '站点具体信息',transition: 'slide-left' },
              component: () => import('@/views/line_graph/components/SiteDetail.vue')
            },

            // 风险模型嵌入
            {
              path: "/subRiskModel",
              name: 'subRiskModel',
              meta: { title: '风险模型嵌入' },
              component: () => import('@/views/line_graph/components/subRiskModel.vue')
            },

          ],
    },


    // 登陆页面
    {
      path: "/login",
      name: 'login',
      component: () => import('@/views/login/LoginSystem.vue')

    },
    {
      path: '/',
      redirect: '/edata'
    },
  ]
})


export default router
