-- Metadata for the addon
ADDON_TITLE = "TheDaddy Sports Live TV"
ADDON_NAME = "theDaddySports"
ADDON_VERSION = "1.0"
ADDON_DEV = "Your Name"

-- Import Streamio modules
local Addon = require("addon")
local Net = require("net")
local Url = require("url")
local Log = require("log")

function get_live_streams()
    local streams = {}
    local url = "https://thedaddy.to/24-7-channels.php"

    -- Fetch HTML content from the URL
    local headers = {
        ["User-Agent"] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    local response = Net:http_get(url, headers)
    
    if not response or response.status_code ~= 200 then
        Log:error("Failed to fetch data from the website.")
        return streams
    end

    local html = response.text

    -- Parse the HTML to extract channel names and stream URLs
    -- Adjust this parsing logic based on the actual HTML structure of the website
    for channel_name, stream_url in html:gmatch('<li|div] class="channel%-item">.-<a href="(.-)">(.-)</a>') do
        table.insert(streams, {
            name = channel_name:gsub("%s+", " "):trim(), -- Clean up whitespace
            url = stream_url,
            flags = Addon.LiveFlags.LIVE
        })
    end

    return streams
end

-- Register the addon with Streamio
Addon.register({
    id = "theDaddySports",
    title = ADDON_TITLE,
    version = ADDON_VERSION,
    get_live_streams = get_live_streams
})