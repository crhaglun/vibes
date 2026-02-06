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
