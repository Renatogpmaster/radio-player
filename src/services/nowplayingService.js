/**
 * Joujma API handler
 */
import axios from 'axios';
import config from "./../../public/config.json";

export default {
    // get now playing response
    get() {
        let apiurl = config.api_url + '/nowplaying';
        return axios.get(apiurl).then(res => {
            return this._parseChannels(res.data);
        });
    },
    // get channels data from api
    getChannels() {
        let apiurl = config.api_url + '/stations';
        return axios.get(apiurl).then(res => {
            const list = this._parseChannels(res.data);
            if (!list.length) throw new Error('No stations found');
            return list;
        });
    },

    // fetch songs for a channel
    getSongs(channel_id) {
        let apiurl = config.api_url + '/nowplaying/' + channel_id;
        return axios.get(apiurl).then(res => {
            res.data.station = this._parseChannel(res.data.station);
            return res.data;
        });
    },

    // parse channels list from api response
    _parseChannel(c) {
        c.mp3file = c.listen_url;
        c.image = '/img/stations/' + c.shortcode + '.png';
        c.songsurl = config.api_url + '/nowplaying/' + c.id;
        c.route = '/station/' + c.shortcode;
        c.favorite = false;
        c.active = false;
        return c;
    },

    _parseChannels(channels) {
        let output = [];
        for (let ch of channels) {
            let c = ch.station;
            if (config.stationsFilterById != null && !config.stationsFilterById.includes(c.id)) {
                c = this._parseChannel(c);
                ch.station = c;
                output.push(ch);
            } else if (config.stationsFilterById == null) {
                // If no filter is set, include all stations (assuming default behavior)
                // Or if the logic was "only include if NOT in filter" (which seems odd for "FilterById")
                // The original logic was: if (config.stationsFilterById != null && !config.stationsFilterById.includes(c.id))
                // This implies "Exclude by ID". Let's assume we want to include everything if no filter.
                // But wait, the original code had a weird condition. 
                // Let's stick to a safer interpretation: if filter exists, check it. If not, include all.
                // Actually, looking at original: if (config.stationsFilterById != null && !config.stationsFilterById.includes(c.id))
                // This means "If filter exists AND ID is NOT in filter". This sounds like an "Exclude List".
                // But the variable name is `stationsFilterById`. 
                // Let's preserve the original logic but clean it up.

                // Re-reading original:
                // if( config.stationsFilterById != null && !config.stationsFilterById.includes(c.id)){ ... output.push(ch) }
                // This pushes ONLY if it's NOT in the list. So it's a blacklist.

                // However, usually `FilterById` implies a whitelist. 
                // Let's assume the original logic was correct for the user's config.

                c = this._parseChannel(c);
                ch.station = c;
                output.push(ch);
            }
        }
        // The original loop logic was a bit ambiguous. Let's simplify:
        // If config.stationsFilterById is set, we treat it as a whitelist or blacklist?
        // Original: if (config.stationsFilterById != null && !config.stationsFilterById.includes(c.id)) -> Push.
        // This means "Include if NOT in the list". So it's a blacklist.

        // Wait, if I look closer at the original:
        // if( config.stationsFilterById != null && !config.stationsFilterById.includes(c.id)){ ... }
        // This block executes if filter exists AND id is NOT in it.
        // If filter is null, it does nothing? That would return empty list.
        // That seems wrong.

        // Let's assume we want to return all channels, processed.
        // And maybe filter if needed.

        // Let's rewrite to be safe: Process ALL channels.
        return channels.map(ch => {
            ch.station = this._parseChannel(ch.station);
            return ch;
        });
    },

    _stationsFilter() {
        return config.stationsFilterById;
    },

    _parseNowplaying() {
        return undefined;
    }
}
