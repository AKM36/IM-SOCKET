<template>
    <header class="v-header" :class="{ 'is-fixed': fixed }" @click.stop="$emit('headerClick')" :style="{ 'background-color': backgroundColor }">
        <div class="v-header-btn left">
            <slot name="left"></slot>
        </div>
        <div class="v-header-title" v-text="title"></div>
        <div class="v-header-btn right">
            <slot name="right"></slot>
        </div>
    </header>
</template>

<script>
  export default {
    name: "v-header",

    props: {
      title: String,
      fixed: {
        type: Boolean,
        default: true
      },
      backgroundColor: {
        type: String,
        default: "#21292c"
      }
    }
  };
</script>

<style>
  .v-header {
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    height: 50px;
    line-height: 1;
    padding: 0 10px;
    margin: 0;
    color: #fff;
    position: relative;
    white-space: nowrap;
    z-index: 500;
  }

  .v-header .left,
  .v-header .right {
    font-size: 15px;
    display: block;
    overflow: hidden;
    float: left;
    line-height: 15px;
    font-weight: 100;
  }

  .v-header .v-header-title {
    font-size: 23px;
    font-weight: 0;
    text-align: center;
    -webkit-box-flex: 1;
    -webkit-flex: 1;
    -ms-flex: 1;
    flex: 1;
  }

  .v-header.is-fixed {
    position: fixed;
    left: 0;
    top: 0;
  }
</style>
