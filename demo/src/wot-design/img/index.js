import VueComponent from '../common/component';
import { isDef, addUnit } from '../common/util';
VueComponent({
  externalClasses: ['custom-image'],
  props: {
    src: String,
    round: Boolean,
    mode: String,
    lazyLoad: Boolean,
    width: {
      type: String,
      observer: 'setStyle'
    },
    height: {
      type: String,
      observer: 'setStyle'
    }
  },
  data: {
    style: ''
  },

  created() {
    this.setStyle();
  },

  methods: {
    handleError({
      detail
    }) {
      this.$emit('error', detail);
    },

    handleClick() {
      this.$emit('click');
    },

    handleLoad({
      detail
    }) {
      this.$emit('load', detail);
    },

    setStyle() {
      const {
        width,
        height
      } = this.data;
      let style = '';
      style = isDef(width) && `width: ${addUnit(width)};`;
      style = isDef(height) ? style + `height: ${addUnit(height)}` : style;
      this.setData({
        style
      });
    }

  }
});