import { $http } from './index'

export default {
  /**
   *  根据站点名称和时段查找分析数据
   * @param {*} siteName
   * @param {*} beginTime
   * @param {*} endTime
   * @returns
   */
  analysisdata(siteName, beginTime, endTime,type) {
    return $http.get('/dust/analysisdata', {
      params: {
        siteName: siteName,
        beginTime: beginTime,
        endTime: endTime,
        type:type
      }
    })
  },
  // 根据月份和类型查找分析数据
  analysisdataByType(month,type) {
    return $http.get('/dust/analysisdataByType', {
      params: {
        month:month,
        type:type
      }
    })
  },
  // 根据时段和类型查找分析数据
  analysisdataByTimeAndType(beginTime,endTime,type) {
    return $http.get('/dust/analysisdataByTimeAndType', {
      params: {
        beginTime:beginTime,
        endTime:endTime,
        type:type
      }
    })
  },

  /**
   *
   * @param {*} siteName
   * @param {*} exceptionType
   * @param {*} beginTime
   * @param {*} endTime
   * @returns
   */
  exceptiondata1({ siteName, exceptionType, beginTime, endTime }) {
    const _params = {
      siteName: siteName,
      beginTime: beginTime,
      endTime: endTime
    }
    if (exceptionType) {
      _params.exceptionType = exceptionType
    }
    return $http.get('/dust/exceptiondata1', { params: _params })
  },

  




  getSitesNum() {
    return $http.get('/dust/sitename')
  },

  getExceptionName(exceptionType, beginTime, endTime) {
    const params = {
      beginTime: beginTime,
      endTime: endTime
    }
    if (exceptionType.length != 0) {
      let temp = exceptionType.join()
      console.log('调用了：', temp)
      params.exceptionType = temp
    }
    return $http.get('/dust/exceptionsSiteName', { params: params })
  }
}
