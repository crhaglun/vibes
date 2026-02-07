# Vibes

A small news aggregator to help prevent doom-scrolling. Built with [SvelteKit](https://kit.svelte.dev/) and deployed on [Deno Deploy](https://deno.com/deploy).

Live version: [https://vibes.hglnd.se](https://vibes.hglnd.se)

## Why?

### Mental health awareness
Constant news consumption takes a toll. Vibes deliberately limits the number of articles and uses positive news sources to make the experience less exhausting.

- [Impact of Media-Induced Uncertainty on Mental Health](https://mental.jmir.org/2025/1/e68640) - JMIR Mental Health (2025)
- [The Hidden Mental Health Cost of News on Social Media](https://www.psychologytoday.com/us/blog/not-just-an-algorithm/202601/the-hidden-mental-health-cost-of-news-on-social-media) - Psychology Today (2026)
- [News addiction linked to poor mental and physical health](https://www.sciencedaily.com/releases/2022/08/220824102936.htm) - ScienceDaily
- [Doomscrolling - tips for healthier news consumption](https://www.mentalhealth.org.uk/explore-mental-health/articles/doomscrolling-tips-healthier-news-consumption) - Mental Health Foundation

### Learning new tech
This is a playground app to learn more about both [SvelteKit](https://kit.svelte.dev/) and [Deno Deploy](https://deno.com/deploy)

## How it works

### News Feed

Once per day, the service refreshes a set of RSS feeds that curates good news.

Every five minutes, it picks three items from the cached set to present.

When you visit the site, you'll get a limited list of (hopefully) positive news.

Repeatedly refreshing the page - or picking up a different device - will not trigger a new set of articles. 

### Pleasant Weather

This widget uses browser's geolocation (with IP-based fallback) to find current weather from [OpenWeatherMap](https://openweathermap.org/api).
The presentation aims to be positive.

### A note on caching

News feeds are low-cardinality data, the set of feeds do not change over time. RSS feed content is cached server-side. 

Geo-coordinates are high-cardinality data, with a risk of low cache hit rate. Calls that use coordinates are cached client-side.