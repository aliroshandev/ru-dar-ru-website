/** A single media asset attached to an advert (image or video). */
export interface Media {
  id: string;
  url: string;
  type: 'image' | 'video';
  /** Display order within the advert. */
  order: number;
}