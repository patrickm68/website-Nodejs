<template>
  <div class="slider">
    <carousel v-if="carouselComp" :is="carouselComp"
      :navigationEnabled="true"
      :autoplayTimeout="10000"
      :autoplay="true"
      :per-page="1"
      :navigation-next-label="nextLabel"
      :navigation-prev-label="prevLabel"
      :center-mode="true" >
      <slide :is="slideComp">
        <div class="slide">
          <img src="/img/pause.gif" alt="pause">
          <div>
            <Content slot-key="pause"/>
          </div>
        </div>
      </slide>
      <slide :is="slideComp">

        <div class="slide" >
          <img src="/img/test.gif" alt="test">
          <div>
            <Content slot-key="run"/>
          </div>
        </div>
      </slide>
      <slide :is="slideComp">
        <div class="slide" >
          <img src="/img/edit.gif" alt="edit">
          <div>
            <Content slot-key="autocomplete"/>
          </div>
        </div>
      </slide>
      <slide :is="slideComp">
        <div class="slide" >
          <img src="/img/codeceptui.gif" alt="codeceptui">
          <div>
            <Content slot-key="ui"/>
            <router-link to="ui" class="button green">Try CodeceptUI &rarr;</router-link>
          </div>
        </div>
      </slide>
      <slide :is="slideComp">
        <div class="slide">
          <img src="/img/new-test.gif" alt="new-test">
          <div>
            <Content slot-key="write"/>
            <router-link to="ui" class="button green">Try CodeceptUI &rarr;</router-link>
          </div>
        </div>
      </slide>
    </carousel>
  </div>
</template>

<script>
// import { Carousel, Slide } from 'vue-carousel';

export default {
  // components: {
  //   Carousel,
  //   Slide
  // },
  data() {
    return {
      slideComp: null,
      carouselComp: null,
      nextLabel: "",
      prevLabel: ""
    }
  },
  mounted () {
    import('vue-carousel').then(module => {
      this.slideComp = module.Slide;
      this.carouselComp = module.Carousel;
    });
  }
}
</script>

<style lang="scss">

.slider {
  max-width: 1200px;
  margin: 0 auto;
  .VueCarousel-pagination {
    margin-top: -40px;
  }
}

.VueCarousel-navigation-prev {
  width: 15px;
  height: 15px;
  border-top: 2px solid #2c3e50 !important;
  border-right: 2px solid #2c3e50 !important;
  transform: rotate(-135deg) !important;
  padding: 0 !important;
  left: -20px !important;
}

.VueCarousel-navigation-next {
  width: 15px;
  height: 15px;
  border-top: 2px solid #2c3e50 !important;
  border-right: 2px solid #2c3e50 !important;
  transform: rotate(45deg) !important;
  padding: 0 !important;
  right: -20px !important;
}

.VueCarousel-navigation-button {
  &:focus {
    outline: none !important;
  }
}

.slide {
  @apply flex items-center;
  img {
    border: 5px solid;
    width: 50%;
    height: 50%;
    @apply mr-4 border-gray-200 shadow-md rounded-lg;
  }
  & > div {
    @apply flex-1;
  }
}
</style>