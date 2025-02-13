const { addonBuilder, serveHTTP } = require('stremio-addon-sdk');
const axios = require('axios');
const cheerio = require('cheerio');

// Define the addon manifest
const builder = new addonBuilder({
    id: 'com.thedaddy.sports',
    version: '1.0.0',
    name: 'TheDaddy Sports Streams',
    description: 'Live sports channels from thedaddy.to',
    resources: ['catalog', 'stream'],
    types: ['channel'],
    idPrefixes: ['td_'],
    catalogs: [
        {
            type: 'channel',
            id: 'td_sports',
            name: 'Sports Channels',
            extra: [{ name: 'genre', isRequired: false }]
        }
    ]
});

// Predefined list of channels (example)
const CHANNELS = [
    { id: 'td_43', name: 'PDC TV', streamPath: '/stream/stream-43.php' },
    // Add more channels as needed
];

// Catalog handler to list available channels
builder.defineCatalogHandler(async ({ type, id, extra }) => {
    if (type === 'channel' && id === 'td_sports') {
        return {
            metas: CHANNELS.map(channel => ({
                id: channel.id,
                type: 'channel',
                name: channel.name,
                poster: 'https://example.com/sports-poster.jpg',
                posterShape: 'landscape',
                genres: ['Sports']
            }))
        };
    }
    return { metas: [] };
});

// Stream handler to resolve channel streams
builder.defineStreamHandler(async ({ type, id }) => {
    if (type === 'channel' && id.startsWith('td_')) {
        const channel = CHANNELS.find(ch => ch.id === id);
        if (!channel) return { streams: [] };

        try {
            // Fetch the stream page
            const response = await axios.get(`https://thedaddy.to${channel.streamPath}`);
            const $ = cheerio.load(response.data);
            
            // Extract actual stream URL (customize this selector based on site structure)
            const streamUrl = $('video source').attr('src') || 
                             $('iframe').attr('src') || 
                             `https://thedaddy.to${channel.streamPath}`;

            return {
                streams: [{
                    title: channel.name,
                    url: streamUrl,
                    behaviorHints: { isProxy: true } // Enable if URL needs Stremio's proxy
                }]
            };
        } catch (error) {
            console.error('Error fetching stream:', error);
            return { streams: [] };
        }
    }
    return { streams: [] };
});

// Start the server
serveHTTP(builder.getInterface(), { port: 7000 }, (err, url) => {
    console.log('Addon URL:', url);
    console.log('Install in Stremio using: ' + url.replace('http://', 'stremio://'));
});