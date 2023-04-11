#!/usr/bin/env node
const { spawn } = require("child_process");
const createPlaylist = require("./create-playlist");
const isEmpty = require("lodash/isEmpty");

const NodeMediaServer = require("..");
let argv = require("minimist")(process.argv.slice(2), {
  string: ["rtmp_port", "http_port", "https_port"],
  alias: {
    rtmp_port: "r",
    http_port: "h",
    https_port: "s",
  },
  default: {
    rtmp_port: 1935,
    http_port: 8000,
    https_port: 8443,
  },
});

if (argv.help) {
  console.log("Usage:");
  console.log("  node-media-server --help // print help information");
  console.log("  node-media-server --rtmp_port 1935 or -r 1935");
  console.log("  node-media-server --http_port 8000 or -h 8000");
  console.log("  node-media-server --https_port 8443 or -s 8443");
  process.exit(0);
}

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
    // ssl: {
    //   port: 443,
    //   key: __dirname+'/privatekey.pem',
    //   cert: __dirname+'/certificate.pem',
    // }
  },
  http: {
    port: 8000,
    mediaroot: "./media/steamvideo",
    webroot: "./www",
    allow_origin: "*",
  },
  https: {
    port: argv.https_port,
    key: __dirname + "/privatekey.pem",
    cert: __dirname + "/certificate.pem",
  },
  auth: {
    api: true,
    api_user: "admin",
    api_pass: "admin",
    play: false,
    publish: false,
    secret: "nodemedia2017privatekey",
  },
  relay: {
    ffmpeg: "/usr/bin/ffmpeg",
    tasks: [
      {
        app: "stream",
        mode: "push",
        edge: "rtmp://127.0.0.1/hls_1080p",
      },
      {
        app: "stream",
        mode: "push",
        edge: "rtmp://127.0.0.1/hls_720p",
      },
      {
        app: "stream",
        mode: "push",
        edge: "rtmp://127.0.0.1/hls_480p",
      },
      {
        app: "stream",
        mode: "push",
        edge: "rtmp://127.0.0.1/hls_360p",
      },
    ],
  },
  trans: {
    ffmpeg: "/usr/bin/ffmpeg",
    tasks: [
      {
        app: "hls_1080p",
        hls: true,
        ac: "aac",
        acParam: ["-b:a", "192k", "-ar", 48000],
        vcParams: [
          "-vf",
          "'scale=1920:-1'",
          "-b:v",
          "5000k",
          "-preset",
          "fast",
          "-profile:v",
          "baseline",
          "-bufsize",
          "7500k",
        ],
        hlsFlags: "[hls_time=10:hls_list_size=0:hls_flags=delete_segments]",
      },
      {
        app: "hls_720p",
        hls: true,
        ac: "aac",
        acParam: ["-b:a", "128k", "-ar", 48000],
        vcParams: [
          "-vf",
          "'scale=1280:-1'",
          "-b:v",
          "2800k",
          "-preset",
          "fast",
          "-profile:v",
          "baseline",
          "-bufsize",
          "4200k",
        ],
        hlsFlags: "[hls_time=10:hls_list_size=0:hls_flags=delete_segments]",
      },
      {
        app: "hls_480p",
        hls: true,
        ac: "aac",
        acParam: ["-b:a", "128k", "-ar", 48000],
        vcParams: [
          "-vf",
          "'scale=854:-1'",
          "-b:v",
          "1400k",
          "-preset",
          "fast",
          "-profile:v",
          "baseline",
          "-bufsize",
          "2100k",
        ],
        hlsFlags: "[hls_time=10:hls_list_size=0:hls_flags=delete_segments]",
      },
      {
        app: "hls_360p",
        hls: true,
        ac: "aac",
        acParam: ["-b:a", "96k", "-ar", 48000],
        vcParams: [
          "-vf",
          "'scale=480:-1'",
          "-b:v",
          "800k",
          "-preset",
          "fast",
          "-profile:v",
          "baseline",
          "-bufsize",
          "1200k",
        ],
        hlsFlags: "[hls_time=10:hls_list_size=0:hls_flags=delete_segments]",
      },
    ],
  },
};

let nms = new NodeMediaServer(config);
nms.run();

var tokens = {};

const parseStreamName = (streamPath) => {
  return streamPath
    .replace("/hls_1080", "")
    .replace("/hls_720p", "")
    .replace("/hls_480p/", "")
    .replace("/hls_360p/", "")
    .replace("/stream/", "");
};

nms.on("prePublish", async (id, StreamPath, args) => {
  const streamName = parseStreamName(StreamPath);
  console.log(`${streamName} has started streaming`);
  if (args.streamKey && args.streamToken) {
    tokens[streamName] = {
      app: "stream",
      streamKey: args.streamKey,
      streamToken: args.streamToken,
    };
  }

});

nms.on("postPublish", async (_id, StreamPath, _args) => {
  if (StreamPath.indexOf("hls_") != -1) {
    const name = StreamPath.split("/").pop();
    createPlaylist(name);
  }
});

nms.on("donePublish", async (id, StreamPath, _args) => {
  const streamName = parseStreamName(StreamPath);
  console.log(`${streamName} has stopped streaming...`);
});
