import axios from 'axios';
import { pick, chain, sum } from 'lodash';
import config from './config';
import qs from 'qs';
import { format } from 'date-fns';
import { audioLogger } from './lib/utils';

interface SCUser {
  avatar_url: string;
  id: number;
  kind: 'user';
  permalink_url: string;
  uri: string;
  username: string;
  permalink: string;
  last_modified: Date;
}

export interface Track {
  comment_count: number;
  release: number;
  original_content_size: number;
  track_type: string;
  original_format: string;
  streamable: boolean;
  download_url: string;
  id: number;
  state: 'processing' | 'failed' | 'finished';
  last_modified: Date;
  favoritings_count: number;
  kind: 'track';
  purchase_url: string;
  release_year: number;
  sharing: 'all' | 'private' | 'public';
  attachments_uri: string;
  license:
    | 'no-rights-reserved'
    | 'all-rights-reserved'
    | 'cc-by'
    | 'cc-by-nc'
    | 'cc-by-nd'
    | 'cc-by-sa'
    | 'cc-by-nc-nd'
    | 'cc-by-nc-sa';
  user_id: number;
  user_favorite: boolean;
  waveform_url: string;
  permalink: string;
  permalink_url: string;
  playback_count: number;
  downloadable: boolean;
  created_at: Date;
  description: string;
  title: string;
  duration: number;
  artwork_url: string;
  video_url: string;
  tag_list: string;
  release_month: number;
  genre: string;
  release_day: number;
  reposts_count: number;
  label_name: string;
  commentable: boolean;
  bpm: number;
  policy: string;
  key_signature: string;
  isrc: string;
  uri: string;
  download_count: number;
  likes_count: number;
  purchase_title: string;
  embeddable_by: 'all' | 'me' | 'none';
  monetization_model: string;
  user: SCUser;
  user_playback_count: number;
  stream_url: string;
  label_id: number;
}

export type PickedTrack = Pick<
  Track,
  | 'stream_url'
  | 'download_url'
  | 'user'
  | 'description'
  | 'title'
  | 'purchase_title'
  | 'purchase_url'
  | 'tag_list'
  | 'permalink_url'
  | 'id'
  | 'duration'
>;
interface SCUserWebProfile {
  kind: 'web-profile';
  id: number;
  service: 'personal' | 'youtube' | 'twitter' | 'instagram' | 'facebook';
  title: string;
  url: string;
  username: string;
  created_at: string;
}

export const getTracksFromSoundcloud = async () => {
  try {
    audioLogger('fetching tracks');
    const response = await axios.get<Track[]>(
      `https://api.soundcloud.com/tracks`,
      {
        params: {
          client_id: config.SOUNDCLOUD_CLIENT_ID,
          tags: config.SOUNDCLOUD_SEARCH_TAGS.join(','),
          license: config.SOUNDCLOUD_SEARCH_LICENSE,
          created_at: {
            from: encodeURIComponent(
              format(
                new Date(Date.now() - 60 * 60 * 24 * 1000),
                'YYYY-MM-DD HH:mm:ss'
              )
            ),
            to: encodeURIComponent(format(new Date(), 'YYYY-MM-DD HH:mm:ss')),
          },
        },
        paramsSerializer: params =>
          qs.stringify(params, {
            arrayFormat: 'brackets',
            encode: false,
          }),
      }
    );

    audioLogger(`fetched and got ${response.data.length} responses`);
    const pickedSong = chain(response.data)
      .filter(
        e =>
          e.downloadable ||
          (Boolean(e.stream_url) &&
            e.duration < 60 * 5 * 1000) /* 5 mins or 300000 ms */
      )
      .sort(e => sum([e.playback_count, e.likes_count]))
      .get(0)
      .value();

    audioLogger(
      `Picked Song - ${pickedSong.title} (Soundcloud id - ${pickedSong.id})`
    );

    return pick(pickedSong, [
      'stream_url',
      'download_url',
      'user',
      'description',
      'title',
      'purchase_title',
      'purchase_url',
      'tag_list',
      'permalink_url',
      'id',
      'duration',
    ]);
  } catch (e) {
    audioLogger(`Something went wrong while fetching / picking track`);
    audioLogger(e);
    return Promise.reject(e);
  }
};

const pickUsername = (obj: SCUserWebProfile) =>
  pick(obj, ['username', 'service']);

export const getWebProfileForArtist = async (id: number) => {
  try {
    const { data: webProfiles } = await axios.get<SCUserWebProfile[]>(
      `https://api.soundcloud.com/users/${id}/web-profiles`
    );

    if (webProfiles.length <= 0) {
      return;
    }

    const profilesHash = chain(webProfiles)
      .groupBy('service')
      .mapValues(0)
      .value();

    if (profilesHash.twitter) {
      return pickUsername(profilesHash.twitter);
    } else if (profilesHash.instagram) {
      return pick(profilesHash.instagram);
    } else {
      return;
    }
  } catch (e) {
    return Promise.reject(e);
  }
};
