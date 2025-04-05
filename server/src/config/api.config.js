require('dotenv').config();

module.exports = {
    JSEARCH_API_KEY: process.env.JSEARCH_API_KEY,
    JSEARCH_API_HOST: 'jsearch.p.rapidapi.com',
    JSEARCH_API_URL: 'https://jsearch.p.rapidapi.com/search',
    DEFAULT_QUERY: 'developer',
    DEFAULT_MAX_PAGES: 1
};