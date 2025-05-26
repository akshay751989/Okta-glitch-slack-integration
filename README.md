Okta-ngrok-slack-integration 🚀
Automated Alerting for Okta Group Membership Changes with Slack Notifications

📌 Overview
The Okta-ngrok-slack-integration project implements an automated alerting system designed to monitor Okta group membership changes, specifically focused on detecting and notifying about mass user removals from Okta groups. This helps security teams quickly identify and respond to potentially erroneous or unauthorized actions that may impact access controls or security posture.

🎯 Purpose
The primary goal of this project is to:

Automatically detect when users are removed from Okta groups.

Trigger Slack alerts when the number of removals exceeds a predefined threshold within a short timeframe (e.g., 5 users removed within 5 minutes).

Enable faster incident response to potential misconfigurations or malicious activities.

🛠️ Key Technologies & Integrations
Component	Description
Okta Event Hooks	Utilized to trigger outbound webhooks when a group.user_membership.remove event occurs.
ngrok	Creates a secure public URL to expose a local development server, making it accessible to receive Okta webhooks during development or testing.
Slack Incoming Webhooks	Sends alert messages to a designated Slack channel for real-time notifications.
Node.js & Express.js	Backend server implementation to receive and process incoming webhook payloads from Okta.
dotenv (.env)	Used for securely managing sensitive configuration details like Slack webhook URLs and Okta tokens.

🔁 How It Works (Flow of Operation)
A user is removed from an Okta group.

Okta sends a webhook (via Event Hook) to the public ngrok URL, forwarding it to the backend server.

The Express.js server parses the webhook payload and logs the group/user details.

A removal counter is maintained in-memory (or optionally persisted) per group within a specific time window.

If the threshold (e.g., 5 removals in 5 minutes) is exceeded:

A customized alert message is generated.

The message is sent to the Slack channel via Slack Incoming Webhook.

Teams are instantly notified, enabling quick investigation or rollback of unintended changes.

✅ Features
✅ Real-time alerting of mass user removals

✅ Configurable threshold and time window

✅ Secure handling of credentials and tokens using environment variables

✅ Simple, cost-effective setup using free tools (Okta Developer, ngrok, Slack Free Tier)

📂 Use Cases
Security Monitoring: Quickly detect unauthorized access changes.

Audit & Compliance: Ensure group access changes are logged and observable.

DevOps & Admin Tools: Enable visibility into user provisioning/deprovisioning automation issues.

🔒 Best Practices Followed
Secure storage of secrets via .env

Modular and readable code for easy extension

Uses public services (ngrok, Slack) to minimize infrastructure overhead

🚀 Getting Started
To run the project locally:

Clone the repository

Set up your .env file with necessary credentials

Start your local server (e.g., node index.js)

Start ngrok (e.g., ngrok http 3000)

Configure Okta Event Hook to point to your ngrok URL

Test removal and watch alerts appear in Slack!

📎 Future Enhancements
Persistent storage (e.g., Redis or file-based DB) for better tracking

Admin dashboard for monitoring activity

Email alerts or integration with other incident management platforms (e.g., PagerDuty)

📬 Contributions
Contributions, suggestions, and bug reports are welcome! Please open an issue or submit a pull request.
