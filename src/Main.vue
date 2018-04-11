<template>
    <div>

        <checklist :title="'用户列表--' + suser.nickname" align="right" v-model="values" :arrs="members" @change="mChange">
        </checklist>
        <checklist title="群组列表" align="right" v-model="options" :arrs="groups" :max="1" @change="gChange">
        </checklist>
        <div style="padding: 0 15px 15px;margin-top: 10px;">
            <button class="v-button v-button--primary v-button--large" @click="showWechat">
                <label>确定</label>
            </button>
        </div>
        <App ref="App" @getGroups="getGroups"></App>
    </div>
</template>
<script>
  import App from "./App";
  import checklist from "./components/checklist";
  import lsIM from "../dist/bundle";
  import config from "../server/config/dev";
  export default {
    data() {
      return {
        values: [],
        options: [],
        members: [],
        groups: [],
        suser: "",
        openid: ""
      };
    },
    components: {
      App,
      checklist
    },
    mounted() {
      let me = this;
      me.token = me.GetQueryString("token");
      me.getuser();
    },
    methods: {
      GetQueryString(name) {
        let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        let r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
      },
      mChange(arr) {
        if (arr.length > 0) this.options = [];
      },
      gChange(arr) {
        if (arr.length > 0) this.values = [];
      },
      getuser() {
        let me = this;
        if (!me.token) {
          me.$api.get("/chat/sign").then(res => {
            me.token = res.token;
            me.sign();
          });
        } else {
          me.sign();
        }
        // me.$api.get("/wx/getuser").then(response => {

        // });
      },
      sign() {
        let me = this;
        me.im = lsIM({
          token: me.token,
          uri: config.socket.uri + "/im",
          apiUrl: config.proxy.uri
        });

        me.im.errorhandler(err => {
          debugger;
        });
        me.$api.get("/chat/user/all").then(res => {
          me.members = res.map(item => {
            item.text = item.nickname;
            return item;
          });
        });
        me.im.getUserInfo().then(res => {
          me.suser = res;
          me.$refs.App.connect(me.suser, me.im);
          me.getGroups();
        });
      },
      getGroups() {
        let me = this;
        me.im.getGroups().then(res => {
          let groups = [];
          res.map(group => {
            group.text = group.name;
            groups.push(group);
          });
          me.groups = groups;
        });
      },
      showWechat() {
        let me = this;
        if (me.values.length === 0 && me.options.length === 0) {
          me.$messageBox.alert("请选择聊天组员或群组");
        } else if (me.values.length === 0) {
          me.$refs.App.opengroup(me.options[0]);
        } else {
          me.$refs.App.creatgroup(me.values);
        }
      }
    }
  };
</script>
<style>
  .v-button {
    -webkit-appearance: none;
    -moz-appearance: none;
    border-radius: 4px;
    border: 0;
    box-sizing: border-box;
    color: inherit;
    display: block;
    font-size: 18px;
    height: 41px;
    outline: 0;
    overflow: hidden;
    position: relative;
    text-align: center;
  }
  .v-button--large {
    display: block;
    width: 100%;
  }
  .v-button--primary {
    color: #fff;
    background-color: #26a2ff;
  }
</style>
