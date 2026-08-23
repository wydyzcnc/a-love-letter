import { Tab, TabItem, XImg, dateFormat, XButton, Flexbox, FlexboxItem, InlineCalendar, Popup } from 'vux';

export default {
  mounted() {
    this.$store.commit('UPDATE_PAGE_TITLE', '布布的声音')
    this.getList();    //加载列表
  },

  data() {
    let data = {
      courseList: '',
    }

    return data
  },

  methods: {

    // 获取列表
    getList() {
      let self = this;
      this.baseAjax({
        url: '/static/basicData/bubuList.json',
        params: {
          date: ''
        },
        showLoading: true,
        success: function (data) {
          console.log(data)
          self.courseList = data.returnObject;
        }
      })
    },

    makeReserve1(id, idx) {
      alert('功能还未开发完成，敬请期待~')
    },
  },

  components: {
    Tab, TabItem, XImg, XButton, Flexbox, FlexboxItem, InlineCalendar, Popup
  }
}
