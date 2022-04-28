<template>
  <header class="sub-bar">
    <div class="message">
        <a target="_blank" href="https://stand-with-ukraine.pp.ua">🇺🇦 CodeceptJS was created in Ukraine.
        #StandWithUkraine</a>
      </p>
    </div>
  </header>
</template>

<script>
export default {
  name: 'Subbar',
}
</script>

<style lang="stylus">
 .sub-bar 
    height $navbarHeight
    position fixed
    top $navbarHeight
    background #171717
    width 100%
    z-index 19
    .message 
      margin 0 auto
      display flex
      justify-content center
      align-items center
      height 100%
      text-align center
      a
        color #e5e5e5
        font-weight 600
        
</style>
