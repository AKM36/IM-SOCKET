<template>
    <div class="scroller">
        <div class="scroller-container">
            <div class="scroller-content">
                <slot></slot>
            </div>
        </div>
    </div>
</template>
<script>
  import "lib/xScroll/standalone/xscroll";
  import "lib/xScroll/standalone/plugins/pulldown";
  export default {
    name: "scroller",
    props: {
      scrollBar: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        topLoading: false
      };
    },
    methods: {
      resetSize() {
        this.xscroll.resetSize();
      },
      getScrollPos() {
        return this.xscroll.getScrollPos();
      },
      getScrollTop() {
        return this.xscroll.getScrollTop();
      },
      scrollTo(scrollLeft, scrollTop, duration, easing, callback) {
        if (typeof easing === "function") {
          callback = easing;
          easing = undefined;
        }
        this.xscroll.scrollTo(scrollLeft, scrollTop, duration, easing, callback);
      },
      scrollTop(scrollTop, duration, easing, callback) {
        if (typeof easing === "function") {
          callback = easing;
          easing = undefined;
        }
        this.xscroll.scrollTop(scrollTop, duration, easing, callback);
      },
      topDone() {
        this.topLoading = false;
      },
      bottonDone(stopBottonLoading) {
        this.bottonLoading = false;
        if (stopBottonLoading) this.stopBottonLoading = true;
      }
    },
    mounted() {
      let me = this;
      me.xscroll = new XScroll({
        renderTo: me.$el,
        container: ".scroller-container",
        content: ".scroller-content",
        scrollbarX: false,
        scrollbarY: me.scrollBar,
        lockX: true,
        lockY: false
      });
      me.pulldown = new XScroll.Plugins.PullDown({
        content: "",
        height: 1,
        autoRefresh: false,
        downContent: "",
        upContent: "",
        loadingContent: "",
        clsPrefix: "xs-plugin-pulldown-"
      });
      me.xscroll.plug(me.pulldown);
      me.pulldown.on("loading", e => {
        if (me.topLoading) return;
        me.topLoading = true;
        me.$emit("scroll-to-top");
      });
      me.xscroll.render();
    },
    updated: function() {
      if (this.xscroll) this.xscroll.resetSize();
    },
    beforeDestroy() {
      if (this.xscroll) {
        this.xscroll.destroy();
        this.xscroll = null;
      }
    }
  };
</script>
<style lang="less">
  .scroller {
    height: 100%;
    width: 100%;
  }
</style>
