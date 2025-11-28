export type AspectRatio = '1:1' | '3:4' | '4:3' | '16:9';

export interface VisionItem {
  id: string;
  keyword: string;
  prompt: string;
  status: 'pending' | 'loading' | 'completed' | 'error';
  imageUrl?: string;
  aspectRatio: AspectRatio;
}

export const INITIAL_TOPICS = [
  "Kitesurfing in turquoise water",
  "Acro yoga couple silhouette at sunset",
  "Energetic drumming performance on stage",
  "Electric guitar solo with neon lights",
  "Acrobatics performance in a spotlight",
  "Parkour jump across urban rooftop",
  "Fire spinning flow arts at night",
  "DIY woodworking workshop table close up",
  "Cool bunny wearing sunglasses on the beach",
  "Surfing a giant wave",
  "Mountain biking on a forest trail",
  "Abstract artistic painting process"
];