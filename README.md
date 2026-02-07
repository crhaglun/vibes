# Vibes

A small news aggregator to help prevent doom-scrolling. Built with SvelteKit and deployed on Deno Deploy.

Live version: [https://vibes.hglnd.se](https://vibes.hglnd.se)

## Why?

### Mental health awareness  
Constant news consumption takes a toll. Vibes deliberately limits the number of articles and uses positive news sources to make the experience less exhausting.

### Learning new tech  
This is a playground app to learn more about both SvelteKit and Deno Deploy

## How it works

Once per day, the service  refresh a set of RSS feeds that curates good news.

Every five minutes, it picks three items from the cached set to present.

When you visit the site, you'll get a limited list of (hopefully) positive news.

Repeatedly refreshing the page will not pick new articles until a couple of minutes have passed. 