<template>
    <div class="wxchat-container" :style="{backgroundColor: wrapBg}">
        <div class="window-view-container">
            <div v-if="isUpperLaoding" class="top-loading">
                <div class="loader">加载中...</div>
            </div>
            <!-- main -->
            <ScrollLoader @scroll-to-top="refresh" ref="scroller">
                <div class="message">
                    <!-- data is empty -->
                    <div class="loading" v-if="isNone">
                        <div style="margin-top: 50%;text-align:center; font-size: 16px;">
                            <span>未查找到聊天记录</span>
                        </div>
                    </div>
                    <ul>
                        <li class="an-move-right">
                            <p v-if="isRefreshedAll" class="time system">
                                <span>已无更多数据</span>
                            </p>
                        </li>
                        <li v-for="msg in msgArr" :key="msg._id" :class="msg.creator&&msg.creator._id==suid?'an-move-right':'an-move-left'">
                            <div v-if="msg.type===10000">
                                <!-- <div v-if="msg.suid!=suid"> -->
                                <p v-if="msg.operateTime" class="time">
                                    <span v-text="msg.operateTime"></span>
                                </p>
                                <p class="time system">
                                    <span v-html="msg.content"></span>
                                </p>
                                <!-- </div> -->
                            </div>
                            <div v-else-if="!msg.recall&&!msg.delete">
                                <p v-if="msg.operateTime" class="time">
                                    <span v-text="msg.operateTime"></span>
                                </p>
                                <div :class="'main' + (msg.creator&&msg.creator._id==suid?' self':'')">
                                    <img class="avatar" width="45" height="45" :src="msg.creator&&msg.creator.avatarfileurl" @click="watchInfo(msg)">
                                    <!-- 文本 -->
                                    <div class="text" v-emotion="msg.content" v-if="msg.type===0"></div>

                                    <!-- 图片 -->
                                    <div class="text" v-else-if="msg.type===1" @click="watchPic(msg)">
                                        <img :src="msg.content" class="image" alt="聊天图片" @load="imgLoad">
                                    </div>

                                    <!-- 其他 -->
                                    <div v-else-if="msg.type===2" :style="{width: msg.width}" class="text voice" @click="playVoice(msg)">
                                        <span class="iconfont" :class="[msg.creator&&msg.creator._id==suid ? 'icon-message-voice-right' : 'icon-message-voice-left']"></span>
                                    </div>
                                </div>
                            </div>
                        </li>

                    </ul>
                </div>

            </ScrollLoader>

        </div>
        <audio hidden="true" ref="audio"></audio>
    </div>
</template>

<script>
  import ScrollLoader from "./scroller.vue";
  import toEmotion from "./emotion";
  export default {
    name: "wxChat",

    components: {
      ScrollLoader
    },

    props: {
      isActive: {
        type: Boolean,
        default: true
      },

      suid: {
        type: String
      },

      groupid: {
        type: String
      },

      wrapBg: {
        type: String,
        default: "#efefef"
      }
    },

    data() {
      return {
        isUpperLaoding: false, //是否下拉刷新中
        isRefreshedAll: false, //是否已经加载所有信息
        isNone: false, //是否无聊天记录
        msgArr: [],
        msgObj: {},
        pics: [],
        page: 1,
        perpage: 10,
        isPaly: false
      };
    },
    directives: {
      emotion: {
        bind: function(el, binding) {
          el.innerHTML = toEmotion(binding.value, true);
        }
      }
    },
    activated() {
      let me = this;
      me.msgArr = [];
    },

    methods: {
      initIM(im) {
        this.im = im;
      },
      addTop(msgs) {
        let me = this;
        msgs.forEach(msg => {
          if (msg.del.indexOf(me.suid) != -1) {
            msg.delete = true;
          } else if (msg.type === 10000) {
            msg.operateTime = new Date(msg.crtdate / 1).toLocaleString();
          } else {
            msg.delete = false;
            if (msg.type === 0) {
              // 文字
            } else if (msg.type === 1) {
              // 图片
              me.pics.unshift(msg.content);
            } else if (msg.type === 2) {
              //语音
              msg.width = msg.len / 1 * 10 + 50 + "px";
            }
            me.msgObj[msg._id] = msg;
          }
        });
        me.msgArr = msgs.reverse().concat(me.msgArr); //倒序合并
      },
      addBottom(msg) {
        let me = this;
        if (msg.type === 10000) {
          msg.operateTime = new Date(msg.crtdate / 1).toLocaleString();
        } else {
          msg.delete = false;
          if (msg.type === 0) {
            // 文字
          } else if (msg.type === 1) {
            // 图片
            me.pics.push(msg.content);
          } else if (msg.type === 3) {
            //语音
            msg.width = msg.len / 1 * 10 + 50 + "px";
          }
          me.msgObj[msg._id] = msg;
        }
        me.msgArr.push(msg);
        me.$nextTick(() => {
          me.scrollToBottom();
        });
      },
      sendcancel(msg) {
        let me = this;
        me.$emit("msg", {
          evt: "msgcancel",
          data: {
            msgid: msg._id,
            groupid: me.groupid
          }
        });
      },

      msgcancel(msgid) {
        let me = this;
        let msg = me.msgObj[msgid];
        msg.recall = true;
      },
      history(callback) {
        let me = this;
        me.im
          .historyMsg({
            page: me.page,
            perpage: me.perpage,
            groupid: me.groupid
          })
          .then(res => {
            if (res.length > 0) {
              if (res.length > me.perpage) {
                me.addTop(res.slice(0, me.perpage));
              } else {
                me.addTop(res);
              }
              me.page += 1;
            }
            if (callback) callback(res.length);
          })
          .catch(err => {
            if (callback) callback(0);
          });
      },

      //向下拉刷新
      refresh() {
        let me = this;
        if (me.isUpperLaoding) {
          me.$refs.scroller.topDone();
          return;
        }

        if (me.isRefreshedAll) {
          me.$refs.scroller.topDone();
          me.isUpperLaoding = false;
          return;
        }
        try {
          me.isUpperLaoding = true;
          me.history(len => {
            if (len == 0 || len <= me.perpage) {
              me.isRefreshedAll = true;
            }
            me.isUpperLaoding = false;
            me.$refs.scroller.topDone();
          });
        } catch (error) {
          me.isUpperLaoding = false;
        }
      },

      imgLoad() {
        this.scrollToBottom();
      },

      watchPic(msg) {
        wx.previewImage({
          current: msg.content, // 当前显示图片的http链接
          urls: this.pics // 需要预览的图片http链接列表
        });
      },

      watchInfo(msg) {},

      reset() {
        let me = this;
        setTimeout(function() {
          if (me.$refs.scroller) me.$refs.scroller.resetSize();
        }, 50);
      },

      playVoice(msg) {
        let audio = this.$refs.audio;
        if (
          audio.src == msg.content &&
          audio.currentTime > 0 &&
          !audio.paused &&
          !audio.ended &&
          audio.readyState > 2
        ) {
          return audio.pause();
        }
        audio.src = msg.content;
        audio.autoplay = true;
        audio.load();
        audio.oncanplay = function() {
          audio.play();
        };
      },

      scrollToBottom() {
        let me = this;
        if (me.$refs.scroller) me.$refs.scroller.resetSize();
        setTimeout(function() {
          let scrollHeight =
            me.$refs.scroller.$el.scrollHeight -
            me.$refs.scroller.$el.offsetHeight;
          me.$refs.scroller.scrollTop(scrollHeight);
        }, 50);
      }
    },
    updated: function() {
      this.reset();
    }
  };
</script>


<style scoped>
  .wxchat-container {
    width: 100%;
    height: 100%;
    z-index: 100;
    overflow: hidden;
  }

  .window-view-container {
    background: #f5f5f5;
    margin: 0 auto;
    overflow: hidden;
    padding: 0;
    height: 100%;
    position: relative;
    z-index: 101;
  }

  .loading {
    text-align: center;
    color: #b0b0b0;
    line-height: 100px;
  }

  .top-loading {
    width: 100%;
    height: 40px;
    position: relative;
    overflow: hidden;
    text-align: center;
    margin: 5px 0;
    color: #999;
    font-size: 13px;
  }

  .loader {
    font-size: 10px;
    margin: 8px auto;
    text-indent: -9999em;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #999;
    background: -moz-linear-gradient(left, #999 10%, rgba(255, 255, 255, 0) 42%);
    background: -webkit-linear-gradient(
      left,
      #999 10%,
      rgba(255, 255, 255, 0) 42%
    );
    background: -o-linear-gradient(left, #999 10%, rgba(255, 255, 255, 0) 42%);
    background: linear-gradient(to right, #999 10%, rgba(255, 255, 255, 0) 42%);
    position: relative;
    -webkit-animation: load3 1s infinite linear;
    animation: load3 1s infinite linear;
  }

  .loader:before {
    width: 50%;
    height: 50%;
    background: #999;
    border-radius: 100% 0 0 0;
    position: absolute;
    top: 0;
    left: 0;
    content: "";
  }

  .loader:after {
    background: #f5f5f5;
    width: 72%;
    height: 75%;
    border-radius: 68%;
    content: "";
    margin: auto;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
  }

  @-webkit-keyframes load3 {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }

  @keyframes load3 {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }

  .message {
    padding: 10px 15px;
    background-color: #f5f5f5;
  }

  .message li {
    margin-bottom: 15px;
    left: 0;
    position: relative;
    display: block;
  }

  .message .time {
    margin: 10px 0;
    text-align: center;
  }

  .message .text {
    display: inline-block;
    position: relative;
    padding: 0 10px;
    max-width: calc(100% - 75px);
    min-height: 35px;
    line-height: 2.1;
    font-size: 15px;
    padding: 6px 10px;
    text-align: left;
    word-break: break-all;
    background-color: #fff;
    color: #000;
    border-radius: 4px;
    box-shadow: 0px 1px 7px -5px #000;
  }

  .message .avatar {
    float: left;
    margin: 0 10px 0 0;
    border-radius: 3px;
    background: #fff;
  }

  .message .time > span {
    display: inline-block;
    padding: 0 5px;
    font-size: 12px;
    color: #fff;
    border-radius: 2px;
    background-color: #dadada;
  }

  .message .system > span {
    padding: 4px 9px;
    text-align: left;
  }

  .message .text:before {
    content: " ";
    position: absolute;
    top: 9px;
    right: 100%;
    border: 6px solid transparent;
    border-right-color: #fff;
  }

  .message .self {
    text-align: right;
  }

  .message .self .avatar {
    float: right;
    margin: 0 0 0 10px;
  }

  .message .self .text {
    background-color: #9eea6a;
  }

  .message .self .voice {
    text-align: right;
  }

  .message .self .text:before {
    right: inherit;
    left: 100%;
    border-right-color: transparent;
    border-left-color: #9eea6a;
  }

  .message .image {
    max-width: 200px;
  }

  .message .voice {
    max-width: 200px;
    min-width: 50px;
  }

  img.static-emotion-gif,
  img.static-emotion {
    vertical-align: middle !important;
  }

  .an-move-left {
    left: 0;
    animation: moveLeft 0.7s ease;
    -webkit-animation: moveLeft 0.7s ease;
  }

  .an-move-right {
    left: 0;
    animation: moveRight 0.7s ease;
    -webkit-animation: moveRight 0.7s ease;
  }

  @keyframes moveRight {
    0% {
      left: -20px;
      opacity: 0;
    }
    100% {
      left: 0;
      opacity: 1;
    }
  }

  @-webkit-keyframes moveRight {
    0% {
      left: -20px;
      opacity: 0;
    }
    100% {
      left: 0px;
      opacity: 1;
    }
  }

  @keyframes moveLeft {
    0% {
      left: 20px;
      opacity: 0;
    }
    100% {
      left: 0px;
      opacity: 1;
    }
  }

  @-webkit-keyframes moveLeft {
    0% {
      left: 20px;
      opacity: 0;
    }
    100% {
      left: 0px;
      opacity: 1;
    }
  }
</style>
<style>
  .chat-static-emotion {
    width: 24px;
    height: 24px;
    display: inline-block;
    vertical-align: middle;
  }
</style>

