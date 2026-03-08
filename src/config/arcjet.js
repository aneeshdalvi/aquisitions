import arcjet, { shield, detectBot, slidingWindow } from '@arcjet/node';

const mode = process.env.NODE_ENV === 'test' ? 'DRY_RUN' : 'LIVE';

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({ mode }),
    detectBot({
      mode,
      allow: ['CATEGORY:SEARCH_ENGINE', 'CATEGORY:PREVIEW'],
    }),
    slidingWindow({
      mode,
      interval: '2s',
      max: 5,
    }),
  ],
});

export default aj;