<template>
  <div class="personalCourses">

    <div class="classItems">
      <div class="item-box" v-for="(item, index) in courseList" :key="index">
        <router-link
          :to="{ path: '/bubu-letter', query: { title: item.title, letterTitle: item.letterTitle, musicUrl: item.musicUrl, poemLines: item.poemLines, date: item.date } }">
          <flexbox>
            <flexbox-item :span="3">
              <div class="item-icon">
                <img :src="item.img" />
              </div>
            </flexbox-item>

            <flexbox-item>
              <div class="top-name">
                <flexbox>
                  <flexbox-item>
                    <div>{{ item.title }}</div>
                  </flexbox-item>

                  <flexbox-item :span="4">
                    <x-button mini type="warn" action-type='button'>查看</x-button>
                  </flexbox-item>
                </flexbox>
              </div>

              <div class="bottom-cer">
                <span>{{ item.date }}</span>
              </div>
            </flexbox-item>
          </flexbox>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { Tab, TabItem, XImg, XButton, Flexbox, FlexboxItem, InlineCalendar, Popup } from 'vux';

export default {
  mounted() {
    this.$store.commit('UPDATE_PAGE_TITLE', '布布的来信');

    //加载列表
    this.getList();
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
        showLoading: true,
        success: function (data) {
          self.courseList = data.returnObject;
        }
      })
    }
  },

  components: {
    Tab, TabItem, XImg, XButton, Flexbox, FlexboxItem, InlineCalendar, Popup
  }
}
</script>

<style>
.personalCourses .activeItem img {
  width: 100%
}

.personalCourses .activeItem {
  margin: 10px 10px 0 10px;
  position: relative;
  height: 180px;
  overflow: hidden;
  border-radius: 5px
}

.personalCourses .item-box .item-icon {
  height: 60px;
  text-align: center;
  overflow: hidden;
}

.personalCourses .item-box .item-icon img {
  height: 100%;
  border-radius: 50%
}

.personalCourses .item-box {
  border-bottom: 1px solid #eee;
  background: #fff;
}

.personalCourses .top-name {
  border-bottom: 1px solid #eee;
  padding: 10px 0;
  font-size: 18px;
  color: #e6a311;
  font-weight: 600;
}

.personalCourses .item-desc {
  font-size: 12px;
  line-height: 20px;
  color: #666
}

.personalCourses .bottom-cer {
  padding: 10px 0;
  font-size: 12px;
  color: #666
}

.personalCourses .bottom-cer span {
  padding: 5px;
  border-radius: 5px;
  background: #eee;
  margin: 5px;
}
</style>
