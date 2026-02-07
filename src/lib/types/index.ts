export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  contentSnippet?: string;
}

export interface Quote {
  text: string;
  author?: string;
}

export interface WeatherMoodData {
  location: string;
  temperature: number;
  mood: string;
  description: string;
  icon: string;
  coordinates: { lat: number; lon: number };
}
