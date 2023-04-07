#!/usr/bin/env node
const { spawn } = require("child_process");

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
    mediaroot: "./public",
    allow_origin: "*",
  },
  hls: {
    fragment_length: 5,
    fragment_type: "mpegts",
    start_sequence: 0,
    end_sequence: "inf",
    static: true,
    cleanup: true,
    hls_path: "./public/hls",
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
};

let nms = new NodeMediaServer(config);
nms.run();

nms.on("preConnect", (id, args) => {
  console.log(
    "[NodeEvent on preConnect]",
    `id=${id} args=${JSON.stringify(args)}`
  );
  // let session = nms.getSession(id);
  // session.reject();
});

nms.on("postConnect", (id, args) => {
  console.log(
    "[NodeEvent on postConnect]",
    `id=${id} args=${JSON.stringify(args)}`
  );
});

nms.on("doneConnect", (id, args) => {
  console.log(
    "[NodeEvent on doneConnect]",
    `id=${id} args=${JSON.stringify(args)}`
  );
});

nms.on("prePublish", (id, StreamPath, args) => {
  console.log(
    "[NodeEvent on prePublish]",
    `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
  );

  // const streamKey = StreamPath.split("/")[1];

  // // Set up the HLS transcoding options for FFmpeg
  // const hlsOptions = [
  //   "-c:v",
  //   "libx264",
  //   "-c:a",
  //   "aac",
  //   "-f",
  //   "hls",
  //   "-hls_time",
  //   "5",
  //   "-hls_playlist_type",
  //   "vod", // Use 'event' for live streaming
  //   "-start_number",
  //   "0",
  //   `public/hls/${streamKey}/playlist.m3u8`, // Output path for HLS manifest
  // ];

  // // Execute FFmpeg command to convert RTMP to HLS
  // const ffmpeg = spawn("ffmpeg", [
  //   "-i",
  //   `rtmp://localhost/${StreamPath}`,
  //   ...hlsOptions,
  // ]);

  // // Log FFmpeg output
  // ffmpeg.stdout.on("data", (data) => {
  //   console.log(`[FFmpeg] ${data}`);
  // });

  // ffmpeg.stderr.on("data", (data) => {
  //   console.log(data);
  //   console.error(`[FFmpeg] ${data}`);
  // });

  // ffmpeg.on("close", (code) => {
  //   console.log(`[FFmpeg] child process exited with code ${code}`);
  // });

  // // Return false to stop NMS from processing the RTMP stream
  // return false;

  // let session = nms.getSession(id);
  // session.reject();
});

nms.on("postPublish", (id, StreamPath, args) => {
  console.log(
    "[NodeEvent on postPublish]",
    `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
  );
});

nms.on("donePublish", (id, StreamPath, args) => {
  console.log(
    "[NodeEvent on donePublish]",
    `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
  );
});

nms.on("prePlay", (id, StreamPath, args) => {
  console.log(
    "[NodeEvent on prePlay]",
    `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
  );
  // let session = nms.getSession(id);
  // session.reject();
});

nms.on("postPlay", (id, StreamPath, args) => {
  console.log(
    "[NodeEvent on postPlay]",
    `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
  );
});

nms.on("donePlay", (id, StreamPath, args) => {
  console.log(
    "[NodeEvent on donePlay]",
    `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
  );
});
