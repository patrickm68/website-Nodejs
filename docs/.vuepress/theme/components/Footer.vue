<template>
  <footer>
    <section>
      <div class="col">
        <h4>Docs</h4>

        <ul>
          <li>
            <router-link to="/quickstart">Quickstart</router-link>
          </li>
          <li>
            <router-link to="/basics">Getting Started</router-link>
          </li>
          <li>
            <router-link to="/puppeteer">CodeceptJS & Puppeteer</router-link>
          </li>
          <li>
            <router-link to="/puppeteer">CodeceptJS & WebDriver</router-link>
          </li>
        </ul>
      </div>
      <div class="col">
        <h4>Community</h4>
        <ul>
          <li><a href="https://github.com/codeceptjs/CodeceptJS">GitHub</a></li>
          <li><a href="http://bit.ly/chat-codeceptjs">Slack Chat</a></li>
          <li><a href="https://codecept.discourse.group/">Forum</a></li>
          <li><a href="https://twitter.com/codeceptjs">Twitter</a></li>
        </ul>
      </div>
      <div class="col">
        <h4 class="important">Commercial Support</h4>
        <ul>
          <li><a href="http://sdclabs.com/codeceptjs?utm_source=codecept.io&utm_medium=footer&utm_term=link&utm_campaign=reference">Consulting</a></li>
          <li><a href="http://sdclabs.com/trainings/web-automation-codeceptjs?utm_source=codecept.io&utm_medium=top_menu&utm_term=link&utm_campaign=reference">Trainings</a> </li>
          <li><a href="https://sdclabs.com/#services">Hire Engineers</a></li>
        </ul>
      </div>
    </section>
    <div class="copyright">
    <h5>CodeceptJS - supercharged end 2 end testing framework for NodeJS</h5>
      © {{ year }}
    </div>
  </footer>
</template>

<script>
export default {
  data() {
    return {
      year: (new Date()).getFullYear(),
    }
  }
}
</script>

<style lang="scss" scoped>
  .sectionLayout footer section {
    margin: auto;
    max-width: 860px;
  }
  footer {
    border-top: 5px dashed #fff;
    @apply bg-gray-100 mt-4;
    .copyright {
      border-top: 5px dashed;
      @apply bg-purple-600 py-2 text-center text-xs border-gray-200 text-gray-400;
    }

    ul {
      @apply list-none list-outside pl-0 ml-0;
    }

    .important {
      position: relative;
      &:before {
        content: '';
        position: absolute;
        left: -18px;
        top: 50%;
        transform: translateY(-50%);
        width: 10px;
        height: 10px;
        border-radius: 100%;
        background-color: #f56565;
      }
    }

    h5 {
      @apply mb-4 text-xs uppercase;
    }
    section {
      max-width: 960px;
      margin: 0 auto;
      padding: 1rem 2rem;
      @apply flex;
      justify-content: space-around;
      .col {
        @apply px-2;
      }
    }
  }

@media(max-width: 600px) {
  footer section {
    display: block;
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>