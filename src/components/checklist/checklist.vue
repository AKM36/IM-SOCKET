<template>
    <div>
        <label v-if="title" class="v-checklist-title" v-html="title"></label>
        <a class="v-cell" v-for="item in arrs" :key="item._id">
            <!---->
            <div class="v-cell-wrapper">
                <div class="v-cell-title">
                    <!---->
                    <label class="v-checklist-label">
                        <span :class="{'is-right': align === 'right'}" class="v-checkbox">
                            <input class="v-checkbox-input" type="checkbox" v-model="currentValue" :value="item">
                            <span class="v-checkbox-core"></span>
                        </span>
                        <span class="v-checkbox-label" v-text="item.text"></span>
                    </label>
                </div>
            </div>
        </a>
    </div>
</template>

<script>
  export default {
    name: "checklist",

    props: {
      title: String,
      align: String,
      arrs: {
        type: Array,
        required: true
      },
      max: Number,
      value: Array
    },

    data() {
      return {
        currentValue: this.value,
        tempValue: "" // used only for radio mode
      };
    },

    beforeUpdate() {
      if (this.isRadio) {
        const length = this.currentValue.length;
        if (length > 1) {
          this.currentValue = [this.currentValue[length - 1]];
        }
        this.tempValue = this.currentValue.length ? this.currentValue[0] : "";
      }
    },
    computed: {
      isRadio() {
        if (typeof this.max === "undefined") {
          return false;
        } else {
          return this.max === 1;
        }
      }
    },
    watch: {
      tempValue(val) {
        const _val = val ? [val] : [];
        this.$emit("input", _val);
        this.$emit("change", _val);
      },
      currentValue(val) {
        if (!this.isRadio) {
          this.$emit("input", val);
          this.$emit("change", val);
        }
      },

      value(val) {
        if (JSON.stringify(val) !== JSON.stringify(this.currentValue)) {
          this.currentValue = val;
        }
      }
    }
  };
</script>

<style scoped>
  .v-cell {
    background-color: #fff;
    box-sizing: border-box;
    color: inherit;
    min-height: 48px;
    display: block;
    overflow: hidden;
    position: relative;
    text-decoration: none;
  }
  .v-cell:last-child {
    background-image: -webkit-linear-gradient(
      bottom,
      #d9d9d9,
      #d9d9d9 50%,
      transparent 0
    );
    background-image: linear-gradient(0deg, #d9d9d9, #d9d9d9 50%, transparent 0);
    background-size: 100% 1px;
    background-repeat: no-repeat;
    background-position: bottom;
  }
  .v-checklist-title {
    color: #888;
    display: block;
    font-size: 12px;
    margin: 8px;
  }
  .v-cell-wrapper {
    background-image: -webkit-linear-gradient(
      top,
      #d9d9d9,
      #d9d9d9 50%,
      transparent 0
    );
    background-image: linear-gradient(
      180deg,
      #d9d9d9,
      #d9d9d9 50%,
      transparent 0
    );
    background-size: 120% 1px;
    background-repeat: no-repeat;
    background-position: 0 0;
    background-origin: content-box;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    box-sizing: border-box;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    font-size: 16px;
    line-height: 1;
    min-height: inherit;
    overflow: hidden;
    padding: 0 10px;
    width: 100%;
  }
  .v-cell-title {
    -webkit-box-flex: 1;
    -ms-flex: 1;
    flex: 1;
  }
  .v-cell-value {
    color: #888;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
  }
  .v-checklist-label {
    display: block;
    padding: 0 10px;
  }
  .v-checkbox-label {
    vertical-align: middle;
    margin-left: 6px;
  }
  .v-checkbox-input {
    display: none;
  }
  [type="checkbox"],
  [type="radio"] {
    box-sizing: border-box;
    padding: 0;
  }

  input,
  textarea {
    -webkit-user-modify: read-write-plaintext-only;
  }
  .v-checkbox-input:checked + .v-checkbox-core {
    background-color: #26a2ff;
    border-color: #26a2ff;
  }
  .v-checkbox-core {
    display: inline-block;
    background-color: #fff;
    border-radius: 100%;
    border: 1px solid #ccc;
    position: relative;
    width: 20px;
    height: 20px;
    vertical-align: middle;
  }
  .v-checkbox.is-right {
    float: right;
  }
  .v-checkbox-input:checked + .v-checkbox-core:after {
    border-color: #fff;
    -webkit-transform: rotate(45deg) scale(1);
    transform: rotate(45deg) scale(1);
  }
  .v-checkbox-core:after {
    border: 2px solid transparent;
    border-left: 0;
    border-top: 0;
    content: " ";
    top: 2px;
    left: 6px;
    position: absolute;
    width: 6px;
    height: 12px;
    -webkit-transform: rotate(45deg) scale(0);
    transform: rotate(45deg) scale(0);
    -webkit-transition: -webkit-transform 0.2s;
    transition: -webkit-transform 0.2s;
    transition: transform 0.2s;
    transition: transform 0.2s, -webkit-transform 0.2s;
  }
  .v-checkbox-label {
    vertical-align: middle;
    margin-left: 6px;
  }
</style>
