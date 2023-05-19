<template>
    <div class="sidebar">
      <div class="sidebar-wrapper">

        <h4>More Information</h4>

        <p>
          <router-link to="/videos">Videos</router-link>
        </p>
        <p>
          <router-link to="/books">Books & Posts</router-link>
        </p>
        <p>
          <router-link to="/examples">Examples</router-link>
        </p>
        <p>
          <a href="https://codecept.discourse.group/c/cookbook" >Cookbook &rarr;</a>
        </p>

        <hr>

        <p class="border">
          <a href="https://sdclabs.com/codeceptjs?utm_source=codecept.io&utm_medium=right&utm_term=link&utm_campaign=reference" class="dashed">
            Commercial Services &rarr;
          </a>
        </p>

        <p class="border">
          <a href="https://sdclabs.com/trainings/web-automation-codeceptjs?utm_source=codecept.io&utm_medium=rigth&utm_term=link&utm_campaign=reference" class="dashed">
            Trainings &rarr;
          </a>
        </p>


        <p class="border">
          <a href="https://testomat.io" class="dashed">
            Testomat.io &rarr;
          </a><br>
          <small><b>Plan your end 2 end tests</b>, collaborate, synchronize with code & get reports!<br>
          Join Testomat.io while it is in beta and get a huge discount!</small>
        </p>

        <p class="border">
          <a href="https://opencollective.com/codeceptjs" class="dashed">
            Support us via OpenCollective!
          </a>
        </p>
      </div>
    </div>
</template>

<style lang="scss" scoped>

.sidebar {
  position: fixed;
  top: 3.6rem;
  left: auto;
  right: 0;
  bottom: 0;
  opacity: 0.7;
  transition: opacity .2s;
  @apply text-sm bg-yellow-100 rounded;
  &:hover {
    opacity: 1;
  }

  p {
    @apply my-4;
  }

  a {
    @apply text-blue-600;
  }

  .border {
    border: 2px solid;
    @apply border-gray-400 px-4 py-2;
  }

  a.dashed {
    @apply border-gray-200 text-blue-600;
    border-bottom: 1px dashed;
  }
}

.sidebar-wrapper {
  @apply px-8 py-4;
}

@media (max-width: 1400px) {
  .sidebar {
    display: none;
  }
}

</style>