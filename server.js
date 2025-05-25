import express from "express";
import axios   from "axios";
import 'dotenv/config';      // for ESM  (or  require('dotenv').config()  for CJS)

const app  = express();
const PORT = process.env.PORT || 3000;

/* -----------------------  CONFIG  ----------------------- */
const SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/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";
if (!SLACK_WEBHOOK_URL) {
  console.error("❌  Set SLACK_WEBHOOK_URL in the .env file!");
  process.exit(1);
}

/* --------------------  IN-MEMORY STORE  ------------------ */
const THRESHOLD_COUNT   = 5;
const THRESHOLD_WINDOW  = 5 * 60 * 1000;          // 5 min
const removalsPerGroup  = {};                     // {group: [{t,user,admin}], ...}

/* ------------- 1️⃣  OKTA VERIFICATION (GET) -------------- */
app.get('/okta-webhook', (req, res) => {
    const challenge = req.headers['x-okta-verification-challenge'];
    if (challenge) {
      return res.json({ verification: challenge });   // what Okta expects
    }
    res.status(404).send('Not Found');
  });

/* ------------- 2️⃣  OKTA WEBHOOK EVENTS (POST) ----------- */
app.post(
  "/okta-webhook",
  (req, res, next) => {                           // early challenge check
    const challenge = req.headers["x-okta-verification-challenge"];
    if (challenge) return res.json({ verification: challenge });
    next();
  },
  express.json(),                                 // parse JSON only for real events
  async (req, res) => {
    const ev = req.body;
    if (ev.eventType !== "group.user_membership.remove") {
      return res.status(200).send("Ignored – not a removal event");
    }

    /* ---- extract group name & user removed ---- */
    const groupObj  = ev.target.find(t => t.type === "UserGroup");
    const userObj   = ev.target.find(t => t.type === "User");
    const groupName = groupObj?.displayName?.replace("Group Name:","").trim() || "Unknown Group";
    const userName  = userObj?.displayName || "Unknown User";
    const adminName = ev.actor?.displayName || "Unknown Admin";

    const now = Date.now();
    if (!removalsPerGroup[groupName]) removalsPerGroup[groupName] = [];
    removalsPerGroup[groupName].push({ t: now, user: userName, admin: adminName });

    /* ---- keep only last 5 min ---- */
    removalsPerGroup[groupName] =
      removalsPerGroup[groupName].filter(e => now - e.t < THRESHOLD_WINDOW);

    const recent = removalsPerGroup[groupName];
    console.log(`[${groupName}] removals in last 5 min → ${recent.length}`);

    /* ---- alert Slack if threshold crossed ---- */
    if (recent.length > THRESHOLD_COUNT && !recent.notified) {
      await sendSlackAlert(groupName, recent);
      recent.notified = true;                     // simple debounce
    }
    if (recent.length <= THRESHOLD_COUNT) delete recent.notified;

    res.send("OK");
  }
);

/* --------------------  SLACK ALERT  --------------------- */
async function sendSlackAlert(group, removals) {
  const users  = removals.map(r => r.user).join(", ");
  const admin  = removals[0].admin;
  const blocks = [
    { type: "header", text: { type: "plain_text", text: "🚨  Mass Removal Detected" } },
    { type: "section", fields: [
        { type: "mrkdwn", text: `*Group:* ${group}` },
        { type: "mrkdwn", text: `*Removals (5 min):* ${removals.length}` },
        { type: "mrkdwn", text: `*Initiated by:* ${admin}` },
        { type: "mrkdwn", text: `*Time:* ${new Date().toLocaleString()}` }
    ]},
    { type: "section",
      text: { type: "mrkdwn", text: `*Affected Users:* ${users}` } }
  ];

  try {
    await axios.post(SLACK_WEBHOOK_URL, { blocks });
    console.log("✅  Slack alert sent");
  } catch (err) {
    console.error("❌  Slack error:", err.response?.data || err.message);
  }
}

/* -------------------  HEALTH CHECK  -------------------- */
app.get("/", (_req, res) => res.send("Okta Group Monitor running"));

app.listen(PORT, () => console.log(`▶️  Server on :${PORT}`));
