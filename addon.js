const { addonBuilder, serveHTTP } = require('stremio-addon-sdk');
const axios = require('axios');
const cheerio = require('cheerio');

const manifest = {
    id: 'community.daddyTest',
    version: '1.0.0',
    name: 'Daddy Test',
    description: 'Live TV channels from thedaddy.to',
    resources: ['stream'],
    types: ['tv'],
    idPrefixes: ['tt']
};

const builder = new addonBuilder(manifest);

builder.defineStreamHandler(async ({ type, id }) => {
    if (type !== 'tv') return { streams: [] };

    const streams = [];

    try {
        const response = await axios.get('https://thedaddy.to/24-7-channels.php');
        const html = response.data;
        const $ = cheerio.load(html);

        $('.channel-item a').each((i, element) => {
            const streamUrl = $(element).attr('href');
            const channelName = $(element).text().trim();

            streams.push({
                name: channelName,
                url: streamUrl,
                isFree: true
            });
        });
    } catch (error) {
        console.error('Failed to fetch data from the website:', error);
    }

    return { streams };
});

serveHTTP(builder.getInterface(), { port: process.env.PORT || 7000 });