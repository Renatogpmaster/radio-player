<template>
  <section class="player-stations" :class="{ visible: isOpen }" @click="$emit('close')" v-if="channels">
    <aside class="player-stations-sidebar" @click.stop>
      <!-- sidebar search -->
      <header class="player-stations-header flex-row flex-middle flex-stretch">
        <div class="form-input push-right">
          <i class="fa fa-search"></i>
          <input type="text" :placeholder="$t('search_a_station')" v-model="searchText" aria-label="search"/>
        </div>
        <button class="common-btn" @click="$emit('close')">
          <i class="fa fa-times-circle" aria-label="Closesidebar"></i>
        </button>
      </header>
      <!-- sidebar stations list -->
      <ul class="player-stations-list">
        <router-link tag="li" class="player-stations-list-item flex-row flex-top flex-stretch" v-for="c of filteredStations" :key="c.station.id" :to="{ name: 'station', params: { shortcode: c.station.shortcode }}">
          <figure class="push-right">
            <img class="img-round" width="70" height="70" :src="c.now_playing.song.art" :alt="c.station.name" @error="c.station.image='/img/icon.png'"/>
          </figure>
          <aside class="flex-1">
            <div class="flex-row flex-middle flex-space">
              <div class="player-stations-list-title text-bright text-clip">{{ c.station.name }}</div>
              <div class="text-nowrap">
                <fav-btn :id="c.station.id"></fav-btn>
              </div>
            </div>
            <div class="text-small nowplaying">
              <div v-if="c.live.islive" id="live">LIVE:</div>
              <span class="text-condense" id="title">{{ toText(c.now_playing.song.title) }}</span>
              <span class="text-uppercase text-small" id="artist">{{ toText(c.now_playing.song.artist) }}</span>
            </div>
          </aside>
        </router-link>
      </ul>
    </aside>
  </section>
</template>

<script>
import favBtn from "@/views/components/favBtn.vue";
import { useFormatters } from "@/composables/useFormatters";
import { ref, computed } from 'vue';

export default {
  name: 'AppSidebar',
  components: {
    favBtn
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    channels: {
      type: Array,
      default: () => []
    }
  },
  emits: ['close'],
  setup(props) {
    const { toText } = useFormatters();
    const searchText = ref('');

    const filteredStations = computed(() => {
      let search = searchText.value;
      let list = props.channels.slice();

      if (search && search.length > 1) {
        search = search.replace(/[^\w\s\-]+/g, '').replace(/[\r\s\t\n]+/g, ' ').trim();
        return list.filter(item => item.station.name.toLowerCase().includes(search.toLowerCase()));
      } else {
        return list;
      }
    });

    return {
      toText,
      searchText,
      filteredStations
    }
  }
}
</script>
