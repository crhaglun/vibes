import type { Quote } from '$lib/types/index.js';

const quotes: Quote[] = [
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  {
    text: 'In the middle of difficulty lies opportunity.',
    author: 'Albert Einstein'
  },
  { text: 'Life is what happens when you are busy making other plans.', author: 'John Lennon' },
  { text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt' },
  { text: 'It is during our darkest moments that we must focus to see the light.', author: 'Aristotle' },
  { text: 'The only impossible journey is the one you never begin.', author: 'Tony Robbins' },
  {
    text: 'You miss 100% of the shots you do not take.',
    author: 'Wayne Gretzky'
  },
  { text: 'Be the change you wish to see in the world.', author: 'Mahatma Gandhi' },
  { text: 'Happiness is not something ready made. It comes from your own actions.', author: 'Dalai Lama' },
  {
    text: 'The best time to plant a tree was 20 years ago. The second best time is now.',
    author: 'Chinese Proverb'
  },
  { text: 'Your time is limited, do not waste it living someone else\'s life.', author: 'Steve Jobs' },
  { text: 'The only real failure in life is not trying at all.', author: 'Tony Robbins' },
  { text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill' },
  { text: 'Believe you can and you\'re halfway there.', author: 'Theodore Roosevelt' },
  { text: 'Do what you can, with what you have, where you are.', author: 'Theodore Roosevelt' },
  { text: 'Every accomplishment starts with the decision to try.', author: 'John F. Kennedy' },
  { text: 'Don\'t let yesterday take up too much of today.', author: 'Will Rogers' },
  { text: 'You learn more from failure than from success.' },
  { text: 'It\'s not whether you get knocked down, it\'s whether you get up.', author: 'Vince Lombardi' },
  { text: 'Keep your face always toward the sunshine, and shadows will fall behind you.', author: 'Walt Whitman' },
  { text: 'Believe in yourself. You are braver than you believe, stronger than you seem, and smarter than you think.', author: 'A.A. Milne' },
  { text: 'Everything you\'ve ever wanted is on the other side of fear.', author: 'George Addair' },
  { text: 'What lies behind us and what lies before us are tiny matters compared to what lies within us.', author: 'Ralph Waldo Emerson' },
  { text: 'The only way to achieve the impossible is to believe it is possible.', author: 'Charles Kingsleigh' },
  { text: 'Great things never came from comfort zones.' },
  { text: 'Dream big and dare to fail.', author: 'Norman Vaughan' },
  { text: 'Life is either a daring adventure or nothing at all.', author: 'Helen Keller' },
  { text: 'You are never too old to set another goal or to dream a new dream.', author: 'C.S. Lewis' },
  { text: 'The only limits you have are the ones you believe.', author: 'Wayne Dyer' },
  { text: 'Your limitation—it\'s only your imagination.' },
  { text: 'Push yourself, because no one else is going to do it for you.' },
  { text: 'Sometimes we\'re tested not to show our weaknesses, but to discover our strengths.' },
  { text: 'The key to success is to focus on goals, not obstacles.', author: 'Stephen Covey' },
  { text: 'Dream it. Wish it. Do it.' },
  { text: 'Success doesn\'t just find you. You have to go out and get it.' },
  { text: 'Great success is built on great failure.' },
  { text: 'Don\'t stop when you are tired. Stop when you are done.' },
  { text: 'Wake up with determination. Go to bed with satisfaction.' },
  { text: 'Do something today that your future self will thank you for.', author: 'Sean Patrick Flanery' },
  { text: 'Little things make big days.' },
  { text: 'It\'s going to be hard, but hard does not mean impossible.' },
  { text: 'Don\'t wait for opportunity. Create it.' },
  { text: 'Sometimes later becomes never. Do it now.' },
  { text: 'The only person you should try to be better than is the person you were yesterday.' },
  { text: 'Forget all the reasons why it won\'t work and believe the one reason why it will.' },
  { text: 'Be proud of every small victory in your life. This is progress.' },
  { text: 'Kindness is a language which the deaf can hear and the blind can see.', author: 'Mark Twain' },
  { text: 'No act of kindness, no matter how small, is ever wasted.', author: 'Aesop' },
  { text: 'Three things in human life are important: the first is to be kind; the second is to be kind; and the third is to be kind.', author: 'Henry James' },
  { text: 'Kindness is the sunshine in which virtue grows.', author: 'Robert Green Ingersoll' },
  { text: 'Kindness is the language of love.' },
  { text: 'A single act of kindness throws out roots in all directions, and the roots spring up and make new trees.', author: 'Amelia Earhart' },
  { text: 'Kindness is a gift everyone can afford to give.' },
  { text: 'The best way to find yourself is to lose yourself in the service of others.', author: 'Mahatma Gandhi' },
  { text: 'Carry out a random act of kindness, with no expectation of reward, safe in the knowledge that one day someone might do the same for you.', author: 'Princess Diana' },
  { text: 'You don\'t have to save the world. You just have to make a difference.' },
  { text: 'Kindness is the key to unlocking the door of happiness.' },
  { text: 'The world is full of kind people. If you can\'t find one, be one.' },
  { text: 'Kindness is the light that dissolves all walls between souls, families, and nations.', author: 'Paramahansa Yogananda' },
  { text: 'A little thought and a little kindness are often worth more than a great deal of money.', author: 'John Ruskin' },
  { text: 'Kindness is the oil that takes the friction out of life.' },
  { text: 'The best portion of a good man\'s life is his little, nameless, unremembered acts of kindness and love.', author: 'William Wordsworth' },
];

// Cache configuration
const QUOTE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  quote: Quote;
  timestamp: number;
}

let cachedQuote: CacheEntry | null = null;

export function getRandomQuote(): Quote {
  // Return cached quote if available and not expired
  if (cachedQuote && Date.now() - cachedQuote.timestamp < QUOTE_CACHE_TTL) {
    return cachedQuote.quote;
  }

  // Generate new random quote
  const quote = quotes[Math.floor(Math.random() * quotes.length)];

  // Cache it
  cachedQuote = {
    quote,
    timestamp: Date.now()
  };

  return quote;
}

export function getAllQuotes(): Quote[] {
  return [...quotes];
}
