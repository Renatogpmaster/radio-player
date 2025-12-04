<template>
  <!-- app player container -->
  <main id="player-wrap" class="player-wrap" :style="{ opacity: init ? 1 : 0 }">
    <!-- bg absolute elements -->
    <figure id="player-bg" class="player-bg" :style="{ 'background-image':  `url(  ${ getBackground} )` }"></figure>
    <audio-visualizations></audio-visualizations>
    <!-- main player layout -->
    <section class="player-layout" v-if="init">
      <!-- player top header -->
      <AppHeader :title="config.title" @toggle-sidebar="toggleSidebar(true)" />
      
      <router-view></router-view>
    </section> <!-- layout wrapper -->
    
    <!-- player stations overlay + sidebar -->
    <AppSidebar 
      :is-open="sidebar" 
      :channels="channels" 
      @close="toggleSidebar(false)" 
    />
  </main> <!-- player -->
</template>

<script>
import './scss/app.scss';
import { mapState, mapGetters } from 'vuex';
import AudioVisualizations from "@/views/station/components/audioVisualizations.vue";
import AppHeader from "@/components/AppHeader.vue";
import AppSidebar from "@/components/AppSidebar.vue";

export default {
  name: 'Home',
  components: {
    AudioVisualizations,
    AppHeader,
    AppSidebar
  },
  data() {
    return {
      init: false,
      visible: false,
      loading: true,
      sidebar: false,
      errors: {}
    };
  },
  methods: {
    initView() {
      console.log("init View");

      this.init = true;
      // Removed direct DOM manipulation for #_spnr as it should be handled by Vue state or removed if it's a preloader
      const spnr = document.querySelector('#_spnr');
      if (spnr) spnr.style.display = 'none';
      
      document.addEventListener('visibilitychange', e => {
        this.visible = (document.visibilityState === 'visible');
      });
    },
    setError(key, err) {
      let errors = { ...this.errors };
      errors[key] = String(err || '').trim();
      if (err) console.warn('ERROR(' + key + '):', err);
      this.errors = errors;
    },
    toggleSidebar(toggle) {
      this.sidebar = (typeof toggle === 'boolean') ? toggle : !this.sidebar;
    },
    onKeyboard(e) {
      const k = e.key || '';
      if (k === 'Enter') return this.toggleSidebar(true);
      if (k === 'Escape') return this.toggleSidebar(false);
    }
  },
  computed: {
    ...mapState('nowplaying', {
      channels: 'nowplaying'
    }),
    ...mapGetters('nowplaying', [
      'getBackground'
    ]),
    config() {
      return this.$store.getters["playerConfig/getConfig"];
    }
  },
  mounted() {
    console.log("App : mounted");
    this.$store.dispatch('playerConfig/fetchConfig').then(() => {
      document.title = this.config.title;
    });
    this.$store.dispatch('nowplaying/fetchNowplaying').then(() => {
      this.initView();
    });
    
    window.addEventListener('keydown', this.onKeyboard);
  },
  watch: {
    $route() {
      this.toggleSidebar(false);
    }
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.onKeyboard);
  }
};
</script>
