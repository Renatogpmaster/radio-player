<template>
  <div class="stationView">
    <main class="player-content flex-row">
      <section v-if="visible" :key="stationId" class="flex-1">
        <div class="flex-autorow flex-top flex-stretch player-channel">
          <!-- station details -->
          <MainSong></MainSong>
          <!-- songs list -->
          <SongsHistory></SongsHistory>
        </div>
      </section>
    </main>
    <!-- player footer with controls -->
    <footerPlayer :streamUrl="station.listen_url" :config="config"></footerPlayer>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import { useRoute, useRouter } from "vue-router";
import favBtn from "@/views/components/favBtn.vue";
import footerPlayer from '@/views/station/components/footerPlayer.vue';
import SongsHistory from "@/views/station/components/songsHistory.vue";
import MainSong from "@/views/station/components/mainSong.vue";

export default {
  name: 'station',
  components: {
    MainSong,
    SongsHistory,
    favBtn,
    footerPlayer,
  },
  data() {
    return {
      visible: false,
      volume: 0.5,
      errors: {},
      timeStart: 0,
      timeDisplay: '00:00:00',
      timeItv: null,
    };
  },
  computed: {
    ...mapState('nowplaying', {
      stationId: state => state.stationId,
      track: 'currentSong',
      currentsong: state => state.currentSong.song,
      nextSong: state => state.nextSong,
      station: state => state.currentStation,
      songs: state => state.songs,
    }),
    ...mapGetters('nowplaying', ['hasSongs', 'getIDfromShortcode']),
    config() {
      return this.$store.getters["playerConfig/getConfig"];
    },
  },
  watch: {
    currentsong() {
      this.updateMediaSession();
    },
    $route(to, from) {
      if (to.params.id !== from.params.id || to.params.shortcode !== from.params.shortcode) {
         this.handleRouteChange(to);
      }
    }
  },
  methods: {
    setError(key, err) {
      let errors = { ...this.errors };
      errors[key] = String(err || '').trim();
      if (err) console.warn('ERROR(' + key + '):', err);
      this.errors = errors;
    },
    checkError(key) {
      return (key && this.errors.hasOwnProperty(key) && this.errors[key]);
    },
    clearErrors() {
      this.errors = {};
    },
    updateMediaSession() {
      if ('mediaSession' in navigator && !!this.currentsong) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: this.currentsong.title,
          artist: this.currentsong.artist,
          artwork: [
            { src: this.currentsong.art }
          ]
        });
      }
    },
    updateCurrentChannel() {
      const route = useRoute();
      this.handleRouteChange(route);
    },
    handleRouteChange(route) {
       let stationId = route.params.id;
       let short_code = route.params.shortcode;
       
       if (!short_code) {
           this.$router.push({ name: "home" });
           return;
       }
       
       if (!stationId || isNaN(stationId)) {
           stationId = this.getIDfromShortcode(short_code);
       }
       
       if (!stationId || isNaN(stationId)) {
           // If we still don't have an ID, maybe we need to wait for stations to load?
           // But for now, let's redirect if it fails.
           // Actually, let's not redirect immediately if store isn't populated yet.
           // But assuming store is populated from App.vue...
           // this.$router.push({ name: "home" });
           return; 
       }
       
       this.$store.dispatch('nowplaying/setStationId', stationId);
       this.selectChannel();
    },
    updateChannelData() {
      this.$store.dispatch('nowplaying/fetchNowplaying', this.stationId).then(() => {
        if (this.timeItv) clearInterval(this.timeItv);
        this.setupMaintenance();
      });
    },
    setupMaintenance() {
      let remainingtime = Math.floor(this.track.remaining) || 30;
      // Ensure we don't have multiple intervals
      if (this.timeItv) clearInterval(this.timeItv);
      this.timeItv = setInterval(this.updateChannelData, remainingtime * 1000);
    },
    selectChannel() {
      this.initPlayer();
      this.setupMaintenance();
    },
    initPlayer() {
      this.visible = true;
      if (this.station && this.config) {
          document.title = this.station.name + " - " + this.config.title;
      }
    },
  },
  created() {
    // Initial load
    // We can use the route here directly or wait for mounted.
    // But since we use useRoute in updateCurrentChannel, it should be fine.
    // However, `this.$route` is available in options API.
    // Let's use `this.$route` for consistency with the watcher.
    
    // Actually, let's just call updateCurrentChannel which uses useRoute (composition) 
    // or just use this.$route (options). 
    // Mixing them is confusing. Let's stick to Options API since the component is Options API.
    
    const route = this.$route;
    if(route.params.shortcode) {
        this.handleRouteChange(route);
    }
  },
  mounted() {
    // this.selectChannel(); // Handled in created/route watcher
  },
  beforeUnmount() {
    if (this.timeItv) clearInterval(this.timeItv);
    this.$store.dispatch('nowplaying/resetSongs');
  }
}
</script>
