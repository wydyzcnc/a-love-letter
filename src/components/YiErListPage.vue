<template>
  <div class="groupCourses">

    <div class="classItems">
      <div class="activeItem" v-for="(item, index) in courseList" :key="index">
        <router-link
          :to="{ path: '/yier_letter', query: { title: item.title, letterTitle: item.letterTitle, musicUrl: item.musicUrl, poemLines: item.poemLines } }">
          <span>
            <img :src="item.img" />
            <div class='sbottom'>
              <p class="title">{{ item.title }}</p>
              <p class="time-line"><span class='time'>{{ item.date }}</span>
              </p>
            </div>
          </span>
        </router-link>
      </div>
    </div>

  </div>
</template>

<script>
import { Tab, TabItem, XImg, XButton, Flexbox, FlexboxItem, InlineCalendar, Popup, XDialog } from 'vux';
export default {
  mounted() {
    this.$store.commit('UPDATE_PAGE_TITLE', '一二的来信');

    // 加载列表
    this.getList();
  },
  data() {
    return {
      courseList: ''
    }
  },
  methods: {
    // 获取列表数据
    getList() {
      let self = this;
      this.baseAjax({
        url: '/static/basicData/yierList.json',
        params: {},
        showLoading: true,
        success: function (data) {
          self.courseList = data.returnObject;
        }
      })
    },
  },
  components: {
    Tab, TabItem, XImg, XButton, Flexbox, FlexboxItem, InlineCalendar, Popup, XDialog
  }
}

</script>

<style>
.groupCourses .vux-tab .vux-tab-item {
  line-height: 20px;
}

.groupCourses .activeItem img {
  width: 100%
}

.groupCourses .activeItem {
  margin: 10px 10px 0 10px;
  position: relative;
  height: 180px;
  overflow: hidden;
  border-radius: 5px
}

.groupCourses .activeItem .sbottom {
  color: white;
  position: absolute;
  bottom: 10px;
  padding: 10px;
  width: 85%
}

.groupCourses .activeItem .title {
  font-size: 18px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.groupCourses .time-line {
  font-size: 14px;
  width: 100%;
  height: 20px;
}

.groupCourses .activeItem .view {
  float: right;
  font-size: 14px;
}

.groupCourses .activeItem img {
  width: 100%
}

.groupCourses .vux-tab .vux-tab-item.vux-tab-disabled {
  color: #666;
}

.groupCourses .vux-tab .vux-tab-item.vux-tab-selected {
  color: #DD5858;
  border-width: 3px !important;
  border-bottom: 3px solid #DD5858;
}


.groupCourses .d-box .d-title {
  margin-bottom: 15px;
}

.groupCourses .d-box .weui-dialog {
  max-width: 240px;
}

.groupCourses .d-icon {
  text-align: center;
  padding: 10px;
}

.groupCourses .d-icon img {
  height: 70px;
  margin: 15px auto;
}
</style>
