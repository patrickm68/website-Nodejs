<template>
  <div class="slider">
    <carousel v-if="carouselComp" :is="carouselComp"
      :navigationEnabled="true"
      :autoplayTimeout="10000"
      :autoplay="false"
      :per-page="1"
      :navigation-next-label="nextLabel"
      :navigation-prev-label="prevLabel"
      :center-mode="true"
      :perPageCustom="[[768, 2], [1024, 3]]"
    >
      <slide
          :is="slideComp"
          aria-hidden="false"

      >
        <div class="slide">
          <img src="/img/companies/doxyme.png" title="Doxy.me" alt="Doxy.me" >
        </div>
      </slide>
      <slide
          :is="slideComp"
          aria-hidden="false"

      >
        <div class="slide">
          <img src="/img/companies/zenitech.png" title="Zenitech"  alt="Zenitech" class="rounded" >
        </div>
      </slide>
      <slide
          :is="slideComp"
          aria-hidden="false"

      >
        <div class="slide">
          <img src="/img/companies/kiabi.png" title="Kiabi"  alt="Kiabi" class="rounded" style="max-height: 95px" >
        </div>
      </slide>
      <slide
          :is="slideComp"
          aria-hidden="false"
      >

        <div class="slide" >
          <img src="/img/companies/mynd.png" title="Mynd"  alt="Mynd" class="rounded mynd-img" style="max-height: 65px" >
        </div>
      </slide>
      <slide
          :is="slideComp"
          aria-hidden="false"
      >

        <div class="slide" >
          <img src="/img/companies/gen3.png" title="Gen3"  alt="Gen3" style="background: rgb(143 156 150); padding: 10px; max-height: 75px" class="rounded" >
        </div>
      </slide>
      <slide
          :is="slideComp"
          aria-hidden="false"
      >

        <div class="slide" >
          <img src="/img/companies/isotipo.png" title="Gamelearn"  alt="Gamelearn" class="rounded" >
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

<style lang="scss" scoped>

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
  display: flex;
}

.VueCarousel-navigation-prev {
  width: 15px;
  height: 15px;
  border-top: 2px solid #2c3e50 !important;
  border-right: 2px solid #2c3e50 !important;
  transform: rotate(-135deg) !important;
  padding: 0 !important;
  left: -30px !important;

}

.VueCarousel-navigation-next {
  width: 15px;
  height: 15px;
  border-top: 2px solid #2c3e50 !important;
  border-right: 2px solid #2c3e50 !important;
  transform: rotate(45deg) !important;
  padding: 0 !important;
  right: -30px !important;
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
  width: 100%;
  @apply flex items-center justify-around;
  flex-direction: row;
  @media(min-width: 1000px) {
    img {
      border: none;
      
      @apply p-1 my-4 shadow-none;
    }
  }

    img {
      filter: grayscale(0.9);
      @apply flex-none rounded-xl my-2 mx-auto;
      height: 100%;
      max-height: 100px;
      -webkit-transition : -webkit-filter 500ms linear;
      width: auto;
      border: none;
      @apply p-1 my-4 shadow-none;
      @media (max-width: 767px) {
        max-height: 180px !important;
        &.mynd-img {
          max-height: 130px !important;
        }
      }

      &:hover {
        filter: grayscale(0);
      }
    }


  & > div {
    @apply flex-1;
    width: 100%;
  }
}
</style>