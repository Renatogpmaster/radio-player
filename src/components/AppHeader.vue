<template>
  <header class="player-header flex-row flex-middle flex-stretch">
    <h2 class="text-clip flex-1 ">
      <router-link :to="{name: 'home'}" style="text-decoration: none">
        <i class="fa fa-headphones"></i>&nbsp;
        <span role="link"> {{ title }}</span>
      </router-link>
    </h2>
    <button class="text-nowrap common-btn" id="sidebar" @click="$emit('toggle-sidebar')">
      <i class="fa fa-bars" aria-label="sidebar"></i>
    </button>
  </header>
</template>

<script>
export default {
  name: 'AppHeader',
  props: {
    title: {
      type: String,
      default: ''
    }
  },
  emits: ['toggle-sidebar']
}
</script>
