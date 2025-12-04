import { createStore } from 'vuex';
import nowplayingService from '/src/services/nowplayingService.js';

export const state = {
    stationId: 0,
    stations: [],
    songs: [],
    trackList: [],
    nowplaying: [],
    currentSong: [],
    nextSong: [],
    currentStation: []
};

export const actions = {
    setStationId({ commit }, stationId) {
        commit("setStationId", stationId);
        commit("setNowplayingStation", stationId);
    },
    async fetchNowplaying({ commit }, stationId) {
        try {
            let nowplaying = await nowplayingService.get();
            commit("setNowplaying", nowplaying);
            if (!isNaN(stationId)) commit("setNowplayingStation", stationId);
        } catch (e) {
            console.error("Error fetching now playing:", e);
        }
    },
    async fetchStations({ commit }) {
        try {
            let stations = await nowplayingService.getChannels();
            commit("setStations", stations);
        } catch (e) {
            console.error("Error fetching stations:", e);
        }
    },
    async fetchSongs({ commit }, stationId) {
        try {
            let songs = await nowplayingService.getSongs(stationId);
            commit("setSongs", songs);
        } catch (e) {
            console.error("Error fetching songs:", e);
        }
    },
    resetSongs({ commit }) {
        commit("resetSongs");
    }
};

export const getters = {
    getIDfromShortcode: (state) => (shortcode) => {
        let found = state.nowplaying.find((d) => (d.station.shortcode === shortcode));
        if (!found) return false;
        return found.station.id;
    },
    hasSongs: (state) => {
        return !!Object.keys(state.songs).length;
    },
    getBackground: (state) => {
        if (state.currentSong && state.currentSong.song)
            return state.currentSong.song.art;
        else return "img/icon.png";
    },
    getStations: (state) => {
        return state.nowplaying.map(np => np.station);
    }
};

export const mutations = {
    setStationId: (currentState, stationId) => {
        currentState.stationId = stationId;
    },
    setNowplaying: (currentState, nowplaying) => {
        currentState.nowplaying = nowplaying;
        currentState.stations = nowplaying.map((s) => { return s.station });
    },
    setNowplayingStation: (currentState, stationId) => {
        let nowplaying = currentState.nowplaying;
        if (!isNaN(stationId)) {
            let currentStation = nowplaying.find((d) => d.station.id === stationId);
            if (currentStation) {
                currentState.currentStation = currentStation.station;
                currentState.currentSong = currentStation.now_playing;
                if (currentStation.playing_next != null)
                    currentState.nextSong = currentStation.playing_next.song;
                currentState.songs = currentStation.song_history;
            }
        }
    },
    setStations: (currentState, stations) => {
        currentState.stations = stations;
    },
    setSongs: (currentState, songs) => {
        currentState.currentSong = songs.now_playing;
        currentState.songs = songs;
    },
    resetSongs: (currentState) => {
        currentState.songs = [];
        currentState.currentSong = [];
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
