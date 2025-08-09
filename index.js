const { default: AutoWA } = require("whatsauto.js");
const cors = require("cors");
const express = require("express");
const app = express();
const PORT = 4322;

app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

let autoWA = new AutoWA("session_name", { printQR: true });
let isWAReady = false;
const startWA = async () => {
  autoWA.on("connecting", () => {
    console.log("WA connecting!");
  });

  autoWA.on("connected", () => {
    console.log("WA connected!");
    isWAReady = true;
  });

  autoWA.on("disconnected", () => {
    console.log("WA disconnected!");
    isWAReady = false;
  });

  autoWA.on("group-message-received", async (msg) => {
    if (msg.key.fromMe && msg.text == "id") {
      await msg.replyWithText(msg.from);
    }
  });

  // initialize session
  await autoWA.initialize();
};

app.route("/").all(async (req, res) => {
  if (!isWAReady)
    return res.json({
      msg: "WA not ready yet!",
      success: false,
    });

  const to = req.body?.to || req.query?.to;
  const text = req.body?.text || req.query?.text;
  const img = req.body?.img || req.query?.img;
  const video = req.body?.video || req.query?.video;
  const audio = req.body?.audio || req.query?.audio;
  const sticker = req.body?.sticker || req.query?.sticker;
  const doc = req.body?.doc || req.query?.doc;

  if (!to) {
    return res.json({
      msg: "attribute 'to' is required!",
      success: false,
    });
  }

  if (img)
    await autoWA.sendImage({
      to,
      text,
      media: img,
    });
  else if (video)
    await autoWA.sendVideo({
      to,
      text,
      media: video,
    });
  else if (audio)
    await autoWA.sendAudio({
      to,
      media: audio,
    });
  else if (sticker)
    await autoWA.sendSticker({
      to,
      media: sticker,
    });
  else if (doc)
    await autoWA.sendDocument({
      to,
      text,
      media: doc,
    });
  else if (text)
    await autoWA.sendText({
      to,
      text,
    });
  else {
    return res.json({
      msg: "gagal mengirim pesan!",
      success: false,
    });
  }

  res.json({
    msg: "berhasil mengirim pesan!",
    success: true,
  });
});

app.use((req, res) => {
  console.log(req.route);

  res.status(404).json({
    msg: `route '{req}' not found`,
    success: false,
  });
});

app.listen(PORT, async () => {
  console.log(`http://localhost:${PORT}`);

  await startWA();
});
