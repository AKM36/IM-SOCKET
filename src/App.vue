<template>
    <div class="detail pageContainer" :class=" {footshow : clickmore}" :style="{height: cHeight,display:display}">
        <header class="header">
            <v-header title="chat">
                <div slot="left" @click="display='none'">
                    返回
                </div>
                <div slot="right" @click="closeMsg">
                    关闭
                </div>
            </v-header>
            <!--头部-->
            <span class="tip-active tip-btn" style="margin-top: 55px;" @click="addMember">
                添加成员
            </span>
            <span class="tip-active tip-btn" style="margin-top: 80px;" @click="removeMember">
                删除成员
            </span>
            <span class="tip-active tip-btn" style="margin-top: 105px;" @click="outGroup">
                退出群组
            </span>

            <span v-for="(item, index) in members" :key="item._id" class="tip-active tip-btn" :style="{ display: mDisplay,marginTop: (105 + (index+1)*25) + 'px' }" @click="listClick(item)">
                {{item.nickname}}
            </span>
            <div v-if="isActive" class="tip tip-active">
                医生的回复仅为建议，具体诊疗前往医院进行。
            </div>
            <div v-else class="tip">
                本次咨询已结束
            </div>
        </header>
        <section class="contend" @click="MenuOutsideClick" :class=" {isActive : isActive}">
            <wxChat ref="wxChat" :isActive="isActive" :suid="suid" :groupid="groupid">
            </wxChat>
        </section>
        <footer v-if="isActive" class="footer">
            <div class="component-dialogue-bar">
                <section class="component-dialogue-bar-person">
                    <span class="iconfont icon-jianpan" v-show="!currentChatWay" @click="currentChatWay=true"></span>
                    <span class="iconfont icon-Voice" v-show="currentChatWay" @click="currentChatWay=false"></span>
                    <div class="chat-way" v-show="!currentChatWay">
                        <div class="chat-say" v-press>
                            <span class="one">按住 说话</span>
                            <span class="two">松开 结束</span>
                        </div>
                    </div>
                    <div class="chat-way" v-show="currentChatWay">
                        <input class="chat-txt" type="text" v-model="inputmessage" @input="whatInput" @focus="focusIpt" @blur="blurIpt" :class="{lightborder : light}" @keyup.enter="enterThing" />
                    </div>
                    <span class="iconfont icon-smile" @click="smileShow"></span>
                    <span class="send" v-show="light" @click="clickSend">
                        <span>发送</span>
                    </span>
                    <span v-show="!light" class="iconfont icon-jia" @click="bottomShow"></span>
                    <div class="recording" style="display: none;" ref="recording">
                        <div class="recording-voice" style="display: none;" ref="recordingVoice">
                            <div class="voice-inner">
                                <div class="voice-icon"></div>
                                <div class="voice-volume">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                            <p>手指上划,取消发送</p>
                        </div>
                        <div class="recording-cancel" ref="recordingCancel" style="display: none;">
                            <div class="cancel-inner"></div>
                            <p>松开手指,取消发送</p>
                        </div>
                    </div>
                </section>
                <transition name="move" type="animation" @after-enter="afterAnima" @after-leave="afterAnima">
                    <section v-show="clickmore" class="foot_bottom">
                        <div class="swiper-container">
                            <div class="swiper-wrapper">
                                <div class="swiper-slide">
                                    <ul class="clear">
                                        <li>
                                            <div class="swiper_icon iconfont icon-xiangce" @click="clickIcon('xc')"></div>
                                            <div class="swiper_text" @click="clickIcon('xc')">
                                                相册
                                            </div>
                                        </li>
                                        <li>
                                            <div class="swiper_icon iconfont icon-camera" @click="clickIcon('cm')"></div>
                                            <div class="swiper_text" @click="clickIcon('cm')">
                                                拍摄
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div class="swiper-pagination"></div>
                        </div>
                    </section>
                </transition>
                <transition name="move" type="animation" @after-enter="afterAnima" @after-leave="afterAnima">
                    <section v-show="smileIcons" class="foot_bottom">
                        <div class="swiper-container">
                            <div class="swiper-wrapper">
                                <div class="swiper-slide">
                                    <ul class="clear">
                                        <li>
                                            <div class="swiper_icon iconfont icon-xiangce" @click="clickIcon('xc')"></div>
                                            <div class="swiper_text" @click="clickIcon('xc')">
                                                相册
                                            </div>
                                        </li>
                                        <li>
                                            <div class="swiper_icon iconfont icon-camera" @click="clickIcon('cm')"></div>
                                            <div class="swiper_text" @click="clickIcon('cm')">
                                                拍摄
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div class="swiper-pagination"></div>
                        </div>
                    </section>
                </transition>
            </div>
        </footer>
    </div>
</template>

<script>
  import header from "./components/header";
  import wxChat from "./components/wxChat";
  export default {
    data() {
      return {
        members: [],
        mDisplay: "none",
        display: "none",
        inputmessage: "", //输入的文本内容
        light: false, //输入框不为空时，input下边框变色
        clickmore: false, //点击加号底部显示、隐藏
        smileIcons: false,
        isActive: true,
        isInput: false,
        currentChatWay: true, //ture为键盘打字 false为语音输入
        suid: "",
        nickname: "", //昵称
        cancelRecording: false,
        cHeight: "100%",
        groupid: ""
      };
    },
    components: {
      wxChat,
      "v-header": header
    },
    directives: {
      press: {
        inserted(element, binding, vnode) {
          let me = vnode.context;
          let recording = me.$refs.recording,
            recordingVoice = me.$refs.recordingVoice,
            recordingCancel = me.$refs.recordingCancel,
            startTx,
            startTy,
            startTime,
            endTime;
          element.addEventListener(
            "touchstart",
            function(e) {
              me.startRecord = false;
              let touches = e.touches[0];
              startTx = touches.clientX;
              startTy = touches.clientY;
              e.preventDefault();
              startTime = new Date().getTime();
              me.voiceTimer = setTimeout(function() {
                wx.startRecord({
                  success: function() {
                    me.startRecord = true;
                    element.className = "chat-say say-active";
                    recording.style.display = recordingVoice.style.display =
                      "block";
                  },
                  cancel: function() {
                    alert("用户拒绝授权录音");
                  }
                });
              }, 300);
            },
            false
          );
          element.addEventListener(
            "touchend",
            function(e) {
              element.className = "chat-say";
              recordingCancel.style.display = recording.style.display = recordingVoice.style.display =
                "none";
              console.log("end");
              e.preventDefault();
              endTime = new Date().getTime();
              if (endTime - startTime < 300) {
                startTime = endTime = 0;
                clearTimeout(me.voiceTimer);
              } else {
                wx.stopRecord({
                  success: function(res) {
                    if (!me.cancelRecording && me.startRecord) {
                      let localId = res.localId;
                      me.uploadVoice(localId);
                    }
                    me.cancelRecording = false;
                  },
                  fail: function(res) {
                    console.log(JSON.stringify(res));
                  }
                });
              }
            },
            false
          );
          element.addEventListener(
            "touchmove",
            function(e) {
              let touches = e.changedTouches[0],
                endTx = touches.clientX,
                endTy = touches.clientY,
                distanceX = startTx - endTx,
                distanceY = startTy - endTy;
              if (distanceY > 50) {
                console.log("chat-say-none");
                element.className = "chat-say";
                recordingVoice.style.display = "none";
                recordingCancel.style.display = "block";
                me.cancelRecording = true;
              } else {
                console.log("chat-say-block");
                element.className = "chat-say say-active";
                recordingVoice.style.display = "block";
                recordingCancel.style.display = "none";
              }
              // 阻断事件冒泡 防止页面被一同向上滑动
              e.preventDefault();
            },
            false
          );
        }
      }
    },
    mounted() {
      let me = this;
      // let openid = me.GetQueryString("openid");
      // me.$api.get("fzxmp/lwj/mp/signature?openid=" + openid).then(res => {
      //   wx.config({
      //     debug: false, // 开启调试模式
      //     appId: res.data.appId, // 必填，公众号的唯一标识
      //     timestamp: res.data.timestamp, // 必填，生成签名的时间戳
      //     nonceStr: res.data.nonceStr, // 必填，生成签名的随机串
      //     signature: res.data.signature, // 必填，签名，见附录1
      //     jsApiList: [
      //       "chooseImage",
      //       "uploadImage",
      //       "uploadVoice",
      //       "startRecord",
      //       "stopRecord",
      //       "downloadVoice",
      //       "playVoice"
      //     ]
      //   });
      //   wx.ready(() => {
      //     wx.onVoiceRecordEnd({
      //       // 录音时间超过一分钟没有停止的时候会执行 complete 回调
      //       complete: res => {
      //         if (!me.cancelRecording) {
      //           let localId = res.localId;
      //           me.uploadVoice(localId);
      //         }
      //         me.cancelRecording = false;
      //       }
      //     });
      //   });
      // });
    },
    methods: {
      connect(suser, im) {
        let me = this;
        me.suser = suser;
        me.nickname = suser.nickname;
        me.suid = suser._id;
        me.im = im;
        me.socket = im.conn;
        me.initEvents();
        me.$refs.wxChat.initIM(im);
      },
      creatgroup(members, callback) {
        let me = this;
        let name = "测试" + new Date().getTime();
        me.im.creatGroup(name, members).then(res => {
          let group = res.group;
          me.groupid = group._id;
          me.isActive = !group.state;
          me.$nextTick(() => {
            me.$refs.wxChat.history();
          });
          me.socket.emit("joingroup", {
            groupid: me.groupid
          });
          me.display = "block";
        });
      },
      opengroup(parmas, callback) {
        let me = this;
        me.groupid = parmas._id;
        me.isActive = !parmas.state;
        me.$nextTick(() => {
          me.$refs.wxChat.history();
        });
        me.socket.emit("joingroup", {
          groupid: me.groupid
        });
        me.display = "block";
      },
      initEvents() {
        let me = this;
        if (!me.isActive) return;
        me.socket.on("connect", () => {
          console.log("创建链接成功");
        });
        me.socket.on("error", err => {
          alert(err.message);
        });
        me.socket.on("disconnect", () => {
          alert("与服务器断开连接");
        });
        me.socket.on("systemmsg", msg => {
          alert(msg);
        });
        me.socket.on("msgreceive", msg => {
          me.$refs.wxChat.addBottom(msg);
        });
        me.socket.on("msgcancel", msgid => {
          me.$refs.wxChat.msgcancel(msgid);
        });
        me.socket.on("groupclose", msg => {
          me.isActive = false;
          me.$refs.wxChat.addBottom(msg);
        });
        me.socket.on("groupout", msg => {
          me.isActive = false;
          me.$refs.wxChat.addBottom(msg);
          me.$emit("getGroups");
        });
        me.socket.on("groupjoin", msg => {
          me.$emit("getGroups");
        });
      },
      saveMsg(params) {
        let me = this;
        me.socket.emit("send", params);
      },
      addMember() {
        let me = this;
        me.listOpt = "add";
        me.$api.get("/chat/user/all").then(res => {
          me.members = res;
        });
        me.mDisplay = "block";
      },
      removeMember() {
        let me = this;
        me.listOpt = "remove";
        me.im.getMembers(me.groupid).then(res => {
          me.members = res;
          me.mDisplay = "block";
        });
      },
      outGroup() {
        let me = this;
        me.socket.emit("outgroup", {
          groupid: me.groupid
        });
      },
      listClick(item) {
        let me = this;
        if (me.listOpt == "add") {
          me.socket.emit("addmember", {
            groupid: me.groupid,
            users: [
              {
                uid: item.uid,
                nickname: item.nickname,
                avatarfileurl: item.avatarfileurl
              }
            ]
          });
        } else if (me.listOpt == "remove") {
          me.socket.emit("removemember", {
            groupid: me.groupid,
            suid: item._id
          });
        }
      },
      GetQueryString(name) {
        let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        let r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
      },
      clickSend() {
        let me = this;

        let params = {
          groupid: me.groupid,
          type: 0,
          content: me.inputmessage
        };

        me.inputmessage = "";

        me.light = false;
        me.saveMsg(params);
      },
      closeMsg() {
        let me = this;
        me.$messageBox.confirm("确定已经完成回复，结束本次咨询?", {
          callback: function(action) {
            if (action) {
              me.socket.emit("closegroup", {
                groupid: me.groupid
              });
            }
          }
        });
      },
      whatInput() {
        let me = this;
        if (me.inputmessage.replace(/\s+/g, "") == "") {
          me.light = false;
        } else {
          me.light = true;
        }
      },
      bottomShow() {
        this.clickmore = true;
      },
      smileShow() {
        this.smileIcons = true;
      },
      afterAnima() {
        this.$refs.wxChat.scrollToBottom();
      },
      // 解决输入法被激活时 底部输入框被遮住问题
      focusIpt() {
        this.isInput = true;
        this.clickmore = false;
        this.$nextTick(() => {
          this.$refs.wxChat.scrollToBottom();
          this.cHeight = "calc(100% - 325px)";
          this.timer = setInterval(function() {
            document.body.scrollTop = document.body.scrollHeight;
          }, 100);
        });
      },
      blurIpt() {
        this.isInput = false;
        clearInterval(this.timer);
        this.cHeight = "100%";
        this.$nextTick(() => {
          if (this.$refs.wxChat) this.$refs.wxChat.reset();
        });
      },
      // 点击空白区域，菜单被隐藏
      MenuOutsideClick(e) {
        this.clickmore = false;
        if (this.$refs.wxChat) this.$refs.wxChat.reset();
      },
      enterThing() {
        if (this.light) {
          this.clickSend();
        }
      },
      getsuid(callback) {},
      clickIcon(imgTpye) {
        let me = this;
        if (imgTpye == "xc") {
          wx.chooseImage({
            count: 1, // 默认9
            sizeType: ["original", "compressed"], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ["album"], // 可以指定来源是相册还是相机，默认二者都有
            success: function(res) {
              let localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
              me.uploadImg(localIds[0]);
            }
          });
        } else if (imgTpye == "cm") {
          wx.chooseImage({
            count: 1, // 默认9
            sizeType: ["original", "compressed"], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ["camera"], // 可以指定来源是相册还是相机，默认二者都有
            success: function(res) {
              let localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
              me.uploadImg(localIds[0]);
            }
          });
        }
      },
      uploadImg(src) {
        let me = this;
        //发送图片消息后 上传服务器
        me.$nextTick(() => {
          wx.uploadImage({
            localId: src, // 需要上传的图片的本地ID，由chooseImage接口获得
            isShowProgressTips: 0, // 默认为1，显示进度提示
            success: function(res) {
              let serverId = res.serverId; // 返回图片的服务器端ID
              //返回服务器地址后 将地址发送后台
              me.im.imageMsg(serverId).then(res => {
                me.saveMsg({
                  groupid: me.groupid,
                  type: 1,
                  content: res.url
                });
              });
            },
            fail: function(res) {
              console.log(res.errMsg);
            }
          });
        });
      },
      uploadVoice(src) {
        let me = this;
        //发送语音消息后，上传服务器
        me.$nextTick(() => {
          wx.uploadVoice({
            localId: src, // 需要上传的音频的本地ID，由stopRecord接口获得
            isShowProgressTips: 0, // 默认为1，显示进度提示
            success: function(res) {
              let serverId = res.serverId; // 返回音频的服务器端ID
              //返回服务器地址后 将地址发送后台
              me.im.voiceMsg(serverId).then(res => {
                me.saveMsg({
                  len: res.len,
                  groupid: me.groupid,
                  type: 2,
                  content: res.url
                });
              });
            },
            fail: function(res) {
              console.log(res.errMsg);
            }
          });
        });
      }
    }
  };
</script>

<style scoped>
  .detail.pageContainer {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0px;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -webkit-flex-direction: column;
    flex-direction: column;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-align: center;
    -webkit-align-items: center;
    align-items: center;
    background-color: #f5f5f5;
  }

  .detail .header {
    width: 100%;
    /* height: 77px; */
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-align: center;
    -webkit-align-items: center;
    align-items: center;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    justify-content: center;
  }

  .detail .mint-header {
    height: 50px;
    background-color: #fff;
    color: #26a2ff;
    font-size: 16px;
  }

  .closeMsg {
    font-size: 14px;
  }

  .detail .mint-header-button {
    display: block;
    flex: 0;
  }

  .detail .header .tip {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 30px;
    margin-top: 48px;
    font-size: 14px;
    background: #ffff99;
    color: #ffaa0c;
  }

  .detail .header .tip-btn {
    font-size: 14px;
    position: fixed;
    z-index: 1000;
    left: 0px;
  }

  .detail .header .tip-active {
    background: #d8f2ff;
    color: #26a2ff;
  }

  .detail .contend {
    width: 100%;
    height: calc(100% - 77px);
    -webkit-box-flex: 1;
    -webkit-flex: 1;
    flex: 1;
    overflow: hidden;
  }

  .detail .contend.isActive {
    height: calc(100% - 128px);
  }

  .detail.footshow .contend.isActive {
    height: calc(100% - 268px);
  }

  .detail .footer {
    width: 100%;
    height: 50px;
    background: #f5f5f5;
  }

  .detail.footshow .footer {
    height: 190px;
  }

  .detail .footer::before {
    content: "";
    position: absolute;
    width: 200%;
    left: 0;
    top: 0;
    -webkit-transform: scale(0.5);
    transform: scale(0.5);
    -webkit-transform-origin: 0 0;
    transform-origin: 0 0;
    -webkit-transform: scale(0.5);
    -webkit-transform-origin: 0 0;
    background-color: #e0e0e0;
    height: 1px;
    z-index: 2;
  }

  .detail .component-dialogue-bar {
    width: 100%;
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 10000;
  }

  .detail .component-dialogue-bar-person {
    width: 100%;
    height: 40px;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    background-color: #ffffff;
  }

  .detail .component-dialogue-bar-person::before {
    content: "";
    position: absolute;
    width: 200%;
    left: 0;
    top: 0;
    -webkit-transform: scale(0.5);
    transform: scale(0.5);
    -webkit-transform-origin: 0 0;
    transform-origin: 0 0;
    -webkit-transform: scale(0.5);
    -webkit-transform-origin: 0 0;
    background-color: #b7b7b7;
    height: 1px;
    z-index: 2;
  }

  .detail .component-dialogue-bar-person .iconfont {
    color: #7d7e83;
    line-height: 40px;
  }
  .detail .component-dialogue-bar-person .iconfont.icon-Voice {
    font-size: 30px;
    margin-top: 1px;
    margin-left: 7px;
  }

  .detail .component-dialogue-bar-person .iconfont.icon-jianpan {
    font-size: 34px;
    margin-top: 1px;
  }

  .detail .component-dialogue-bar-person .iconfont.icon-jia {
    font-size: 32px;
    margin-top: 1px;
  }

  .detail .component-dialogue-bar-person .iconfont.icon-smile {
    font-size: 30px;
    margin-top: 1px;
  }

  .detail .icon-Voice:before,
  .detail .icon-Voice,
  .detail .icon-jianpan:before,
  .detail .icon-smile:before {
    margin-left: 5px;
    margin-right: 5px;
  }

  .detail .icon-jianpan {
    margin-left: 4px;
    margin-right: 4px;
  }

  .detail .chat-way {
    height: 32px;
    margin-top: 4px;
    line-height: 32px;
  }

  .detail .chat-way .chat-say {
    display: -webkit-flex;
    display: flex;
    -webkit-justify-content: center;
    justify-content: center;
    border-radius: 3px;
    overflow: hidden;
    padding: 0 5px;
    width: 245px;
    height: 32px;
    color: #565656;
    border: 1px solid #7d7e83;
    font-size: 16px;
  }

  .detail .chat-way .chat-say.say-active {
    background-color: #c6c7ca;
  }

  .detail .chat-way .two {
    display: none;
  }

  .detail .chat-way .chat-say.say-active .two {
    display: block;
  }

  .detail .chat-way .chat-say.say-active .one {
    display: none;
  }

  .detail .chat-way .chat-txt {
    border-radius: 3px;
    overflow: hidden;
    padding: 0 5px;
    width: 245px;
    height: 32px;
    border: 1px solid #7d7e83;
    font-size: 16px;
  }

  .detail .recording {
    position: fixed;
    left: 50%;
    top: 45%;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    width: 140px;
    height: 140px;
    padding: 5px;
    background-color: rgba(0, 0, 0, 0.5);
    color: #ffffff;
    border-radius: 5px;
    font-size: 14px;
    text-align: center;
  }

  .detail .recording-voice .voice-inner {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    justify-content: center;
    -webkit-box-align: center;
    -webkit-align-items: center;
    align-items: center;
    height: 110px;
  }

  .detail .voice-inner .voice-icon {
    width: 55px;
    height: 90px;
    background: url(./assets/images/recording-bkg.png) no-repeat center center;
    background-size: contain;
  }

  .detail .voice-inner .voice-volume {
    width: 30px;
    height: 55px;
  }

  .detail .lightborder {
    border-color: #19ad17;
  }

  .detail .footer .send {
    width: 40px;
    height: 40px;
    display: flex;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    justify-content: center;
    -webkit-box-align: center;
    -webkit-align-items: center;
    align-items: center;
  }

  .detail .footer .send span {
    height: 32px;
    width: 40px;
    border-radius: 5px;
    background: #16af17;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    justify-content: center;
    -webkit-box-align: center;
    -webkit-align-items: center;
    align-items: center;
    font-size: 14px;
    color: #fff;
  }

  .detail .voice-inner .voice-volume span {
    display: block;
    height: 2px;
    margin-top: 4px;
    min-width: 8px;
    float: left;
    clear: both;
    -webkit-animation-iteration-count: infinite;
    animation-iteration-count: infinite;
    -webkit-animation-timing-function: linear;
    animation-timing-function: linear;
    -webkit-animation-duration: 2000ms;
    animation-duration: 2000ms;
    background-color: #e4e4e5;
  }

  .detail .voice-inner .voice-volume span:nth-child(1) {
    width: 24px;
    visibility: hidden;
  }

  .detail .voice-inner .voice-volume span:nth-child(2) {
    width: 22px;
  }

  .detail .voice-inner .voice-volume span:nth-child(3) {
    width: 20px;
  }

  .detail .voice-inner .voice-volume span:nth-child(4) {
    width: 18px;
  }

  .detail .voice-inner .voice-volume span:nth-child(5) {
    width: 16px;
  }

  .detail .voice-inner .voice-volume span:nth-child(6) {
    width: 14px;
  }

  .detail .voice-inner .voice-volume span:nth-child(7) {
    width: 12px;
  }

  .detail .voice-inner .voice-volume span:nth-child(8) {
    width: 10px;
  }

  .detail .voice-inner .voice-volume span:nth-child(9) {
    width: 8px;
  }

  .detail .recording-cancel p {
    border-radius: 3px;
  }

  .detail .cancel-inner {
    width: 110px;
    height: 110px;
    margin: 0 auto;
    background-image: url(./assets/images/record-cancel.png);
    background-repeat: no-repeat;
    background-position: center center;
    background-size: contain;
  }

  .detail .swiper-container {
    width: 100%;
    height: 140px;
    overflow: hidden;
  }

  .detail .swiper-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    z-index: 1;
    display: -webkit-box;
    display: -moz-box;
    display: -webkit-flex;
    display: flex;
    -webkit-transition-property: -webkit-transform;
    -moz-transition-property: -moz-transform;
    -o-transition-property: -o-transform;
    transition-property: transform;
    -webkit-box-sizing: content-box;
    -moz-box-sizing: content-box;
    box-sizing: content-box;
  }

  .detail .swiper-slide {
    -webkit-flex-shrink: 0;
    flex-shrink: 0;
    width: 100%;
    height: 100%;
    position: relative;
  }

  .detail .foot_bottom {
    background: #f5f5f5;
  }

  .detail .foot_bottom .swiper-container .swiper-slide ul {
    padding: 32px 28px 0;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }

  .detail .foot_bottom .swiper-container .swiper-slide ul li {
    float: left;
    margin-right: 24px;
  }

  .detail .foot_bottom .swiper-container .swiper-slide ul li .swiper_icon {
    width: 60px;
    height: 60px;
    background: #fcfcfc;
    border: 1px solid #d3d3d3;
    border-radius: 10px;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    justify-content: center;
    -webkit-box-align: center;
    -webkit-align-items: center;
    align-items: center;
  }

  .detail .icon-xiangce,
  .detail .icon-camera {
    color: rgb(122, 129, 135);
    font-size: 32px;
  }

  .detail .foot_bottom .swiper-container .swiper-slide ul li .swiper_text {
    width: 100%;
    margin-top: 12px;
    text-align: center;
    font-size: 12px;
    color: #7a8187;
  }

  .move-enter-active {
    animation: move-in 0.5s;
  }

  .move-leave-active {
    animation: move-out 0.5s;
  }

  @-webkit-keyframes move-in {
    0% {
      height: 0px;
    }
    100% {
      height: 140px;
    }
  }

  @-webkit-keyframes move-out {
    0% {
      height: 140px;
    }
    100% {
      height: 0px;
    }
  }

  @keyframes move-in {
    0% {
      height: 0px;
    }
    100% {
      height: 140px;
    }
  }

  @keyframes move-out {
    0% {
      height: 140px;
    }
    100% {
      height: 0px;
    }
  }
</style>
