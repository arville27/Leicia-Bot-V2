import { createAudioResource } from '@discordjs/voice';
import { stream as getVideoStream, YouTubeVideo } from 'play-dl';

/**
 * This is the data required to create a Track object.
 */
export interface TrackData {
  metadata: YouTubeVideo;
  onStart: () => void;
  onFinish: () => void;
  onError: (error: Error) => void;
}

// eslint-disable-next-line no-empty-function, @typescript-eslint/no-empty-function
const noop = () => {};

/**
 * A Track represents information about a YouTube video (in this context) that can be added to a queue.
 * It contains the title and URL of the video, as well as functions onStart, onFinish, onError, that act
 * as callbacks that are triggered at certain points during the track's lifecycle.
 *
 * Rather than creating an AudioResource for each video immediately and then keeping those in a queue,
 * we use tracks as they don't pre-emptively load the videos. Instead, once a Track is taken from the
 * queue, it is converted into an AudioResource just in time for playback.
 */
export class Track implements TrackData {
  public readonly title: string;
  public readonly metadata: YouTubeVideo;
  public readonly onStart: () => void;
  public readonly onFinish: () => void;
  public readonly onError: (error: Error) => void;

  private constructor({ metadata, onStart, onFinish, onError }: TrackData) {
    this.metadata = metadata;
    this.title = metadata.title ?? 'None';
    this.onStart = onStart;
    this.onFinish = onFinish;
    this.onError = onError;
  }

  /**
   * Creates an AudioResource from this Track.
   */
  public async createAudioResource() {
    const videoStream = await getVideoStream(this.metadata.url);

    const resource = createAudioResource(videoStream.stream, {
      inputType: videoStream.type,
      metadata: this,
    });

    return resource;
  }

  /**
   * Creates a Track from a video URL and lifecycle callback methods.
   *
   * @param url The URL of the video
   * @param methods Lifecycle callbacks
   *
   * @returns The created Track
   */
  public static async from(
    trackData: YouTubeVideo,
    methods: Pick<Track, 'onStart' | 'onFinish' | 'onError'>
  ): Promise<Track> {
    // The methods are wrapped so that we can ensure that they are only called once.
    const wrappedMethods = {
      onStart() {
        wrappedMethods.onStart = noop;
        methods.onStart();
      },
      onFinish() {
        wrappedMethods.onFinish = noop;
        methods.onFinish();
      },
      onError(error: Error) {
        wrappedMethods.onError = noop;
        methods.onError(error);
      },
    };

    return new Track({
      metadata: trackData,
      ...wrappedMethods,
    });
  }
}
