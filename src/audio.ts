import axios from 'axios';
import url from 'url';
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
  first_name?: string;
  last_name?: string;
  full_name?: string;
  username: string;
  permalink: string;
  last_modified: string;
  urn?: string;
  verified?: boolean;
  city?: string | null;
  country_code?: string | null;
}

export interface Track {
  full_duration?: number;
  comment_count: number;
  release: string | null;
  original_content_size: number;
  track_type: string | null;
  original_format: string;
  streamable: boolean;
  download_url: string | null;
  id: number;
  state: 'processing' | 'failed' | 'finished';
  last_modified: string;
  favoritings_count: number;
  kind: 'track';
  purchase_url: string | null;
  release_year: number | null;
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
  created_at: string;
  description: string;
  title: string;
  duration: number;
  artwork_url: string | null;
  video_url: string | null;
  tag_list: string;
  release_month: number | null;
  genre: string;
  release_day: number | null;
  reposts_count: number;
  label_name: string | null;
  commentable: boolean;
  bpm: number | null;
  policy: string;
  key_signature: string | null;
  isrc: string | null;
  uri: string;
  download_count: number;
  likes_count: number;
  purchase_title: string | null;
  embeddable_by: 'all' | 'me' | 'none';
  monetization_model: string;
  user: SCUser;
  user_playback_count: number;
  stream_url: string;
  label_id: number | null;
  publisher_metadata?: {
    urn: string;
    contains_music: boolean;
    id: number;
  };
  has_downloads_left?: boolean;
  public?: boolean;
  visuals?: string | null;
  secret_token?: string | null;
  urn?: string;
  display_date?: string;
  release_date?: string | null;

  // custom
  media_url?: string;
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
  | 'uri'
  | 'media_url'
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

export interface Transcoding {
  url: string;
  preset: string;
  duration: number;
  snipped: boolean;
  format: {
    protocol: 'hls' | 'progressive';
    mime_type: 'audio/mpeg' | 'audio/ogg; codecs="opus"';
  };
  quality: 'sq';
}

export interface TrackMedia {
  transcodings: Array<Transcoding>;
}

export const getTranscodingForTrack = async (
  track_id: Track['id']
): Promise<Transcoding> => {
  try {
    audioLogger('Fetching media information for track');
    const response = await axios.get<Array<Track & { media: TrackMedia }>>(
      `https://api-v2.soundcloud.com/tracks`,
      {
        params: {
          ids: track_id,
          client_id: config.SOUNDCLOUD_CLIENT_ID,
        },
      }
    );

    if (!response.data.length) {
      return Promise.reject(
        `v2 api responded with 0 tracks for track id - ${track_id}`
      );
    }

    if (!response.data[0].media.transcodings.length) {
      return Promise.reject(
        `No transcodings found for this track (track id - ${track_id})`
      );
    }

    audioLogger('Picking a suitable transcoding');

    const transcoding = response.data[0].media.transcodings.find(
      transcoding => {
        return (
          transcoding.format.protocol === 'progressive' &&
          transcoding.format.mime_type.includes('audio/mpeg')
        );
      }
    );

    if (!transcoding) {
      return Promise.reject(
        `No valid transcoding found for track (track id - ${track_id})`
      );
    }

    if (!transcoding.url) {
      return Promise.reject(
        `URL property is undefined for the selected transcoding ${JSON.stringify(
          transcoding,
          null,
          2
        )} (track id - ${track_id})`
      );
    }

    if (url.parse(transcoding.url).host !== 'api-v2.soundcloud.com') {
      return Promise.reject(
        `Media URL is not a soundcloud url for track (track id - ${track_id})`
      );
    }

    audioLogger('Found a sutiable transcoding for this track');

    return transcoding;
  } catch (error) {
    audioLogger(
      `Something went wrong while fetching transcodings for the track - ${track_id}`
    );
    audioLogger(error);
    return Promise.reject(error);
  }
};

export const getStreamUrlFromTranscoding = async (
  transcoding: Transcoding,
  track_id: Track['id']
): Promise<string> => {
  try {
    audioLogger(`Fetching a streamable media url for this track - ${track_id}`);

    const { url } = transcoding;
    const { data } = await axios.get<{ url: string }>(url, {
      params: {
        client_id: config.SOUNDCLOUD_CLIENT_ID,
      },
    });

    if (!data.url) {
      return Promise.reject(
        `No stream url found in the response of the transcoding API (track id - ${track_id}, media url - ${transcoding.url})`
      );
    }

    audioLogger(`Fetched the streamable media url`);

    return data.url;
  } catch (error) {
    audioLogger(
      `Something went wrong while fetching stream url for the track - ${track_id}`
    );
    audioLogger(error);
    return Promise.reject(error);
  }
};

export const getTrackFromSoundcloud = async (track_id: Track['id']) => {
  try {
    audioLogger('fetching track document');
    const response = await axios.get<Track>(
      `https://api.soundcloud.com/tracks/${track_id}`,
      {
        params: {
          client_id: config.SOUNDCLOUD_CLIENT_ID,
        },
      }
    );

    return response.data;
  } catch (error) {
    audioLogger(
      `There was an error while fetching track metadata for track id - ${track_id}`
    );
    audioLogger(error);
    return Promise.reject(error);
  }
};

const pluckPropertiesFromTrack = (track: Track) =>
  pick(track, [
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
    'uri',
    'media_url',
  ]);

export const getTracksFromSoundcloud = async () => {
  try {
    audioLogger('fetching tracks');

    if (process.env.TRACK_ID) {
      audioLogger(
        `Fetching the preselected track using the track id provided ${process.env.TRACK_ID}`
      );
      const track = await getTrackFromSoundcloud(Number(process.env.TRACK_ID));

      return pluckPropertiesFromTrack(track);
    }

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
          (e.downloadable || Boolean(e.stream_url)) &&
          e.duration < 60 * 5 * 1000 /* 5 mins or 300000 ms */
      )
      .sort(e => sum([e.playback_count, e.likes_count]))
      .get(0)
      .value();

    audioLogger(
      `Picked Song - ${pickedSong.title} (Soundcloud id - ${pickedSong.id})`
    );

    return pluckPropertiesFromTrack(pickedSong);
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
