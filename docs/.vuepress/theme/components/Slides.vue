<template>
  <div class="slider">
    <carousel v-if="carouselComp" :is="carouselComp"
      :navigationEnabled="true"
      :autoplayTimeout="10000"
      :autoplay="true"
      :per-page="1"
      :navigation-next-label="nextLabel"
      :navigation-prev-label="prevLabel"
      :center-mode="true"
    >
      <slide
          :is="slideComp"
          aria-hidden="false"

      >
        <div class="slide">
          <img src="/img/pause.gif" alt="pause">
          <div>
            <Content slot-key="pause"/>
          </div>
        </div>
      </slide>
      <slide
          :is="slideComp"
          aria-hidden="false"
      >

        <div class="slide" >
          <img src="/img/test.gif" alt="test">
          <div>
            <Content slot-key="run"/>
          </div>
        </div>
      </slide>
      <slide
          :is="slideComp"
          aria-hidden="false"
      >
        <div class="slide" >
          <img src="/img/edit.gif" alt="edit">
          <div>
            <Content slot-key="autocomplete"/>
          </div>
        </div>
      </slide>
      <slide
          :is="slideComp"
          aria-hidden="false"
      >
        <div class="slide" >
          <img src="/img/codeceptui.gif" alt="codeceptui">
          <div>
            <Content slot-key="ui"/>
            <router-link to="ui" class="button green">Try CodeceptUI &rarr;</router-link>
          </div>
        </div>
      </slide>
      <slide
          :is="slideComp"
          aria-hidden="false"
      >
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
  padding-left: 1rem;
  padding-right: 1rem;
  .VueCarousel-pagination {
    margin-top: -40px;
  }
  @media(min-width: 768px) {
    max-width: 640px;
    padding-left: 0;
    padding-right: 0;
  }
  @media(min-width: 1000px) {
    max-width: 910px;
  }
  @media(min-width: 1300px) {
    max-width: 1200px;
  }
}

.VueCarousel-slide {
  overflow-x: hidden;
}

.VueCarousel-navigation-prev {
  width: 15px;
  height: 15px;
  border-top: 2px solid #2c3e50 !important;
  border-right: 2px solid #2c3e50 !important;
  transform: rotate(-135deg) !important;
  padding: 0 !important;
  left: -30px !important;
  @media(min-width: 1000px) {
    left: -20px !important;
  }
}

.VueCarousel-navigation-next {
  width: 15px;
  height: 15px;
  border-top: 2px solid #2c3e50 !important;
  border-right: 2px solid #2c3e50 !important;
  transform: rotate(45deg) !important;
  padding: 0 !important;
  right: -30px !important;
  @media(min-width: 1000px) {
    right: -20px !important;
  }
}

.VueCarousel-navigation-button {
  @media(max-width: 767px) {
    display: none;
  }
  &:focus {
    outline: none !important;
  }
}

.slide {
  display: flex;
  align-items: center;
  flex-direction: column;
  @media(min-width: 1000px) {
    flex-direction: row;
  }
  img {
    border: 5px solid;
    width: 100%;
    @apply border-gray-200 shadow-md rounded-lg;
    @media(min-width: 1000px) {
      margin-right: 1rem;
      width: 50%;
      height: 50%;
    }
  }
  & > div {
    @apply flex-1;
    width: 100%;
  }
}
</style>