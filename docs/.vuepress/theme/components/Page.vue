<template>
  <main class="page">
    <div class="article-title">{{title}}</div>

    <slot name="top">
    </slot>
    <div class="post">
      <article>
        <Content class="theme-default-content" />
      </article>
    </div>
    <PageEdit />
    <PageNav v-bind="{ sidebarItems }" />

    <slot name="bottom" />

    <Banner />
    <Footer/>
  </main>
</template>

<script>
import PageEdit from '@theme/components/PageEdit.vue'
import PageNav from '@theme/components/PageNav.vue'
import Footer from './Footer.vue'
import RightSidebar from './RightSidebar.vue'
import Banner from './Banner.vue'

export default {
  components: { PageEdit, PageNav, Footer, RightSidebar, Banner },
  props: ['sidebarItems'],

  computed: {
    title() {
      return this.$page.title;
    }
  }
}
</script>

<style lang="stylus">
@require '../styles/wrapper.styl'
@require '../styles/highlight.css'

.article-title
  @apply text-black uppercase

.page
  display block
  footer
    section
      max-width 760px

</style>
