# Naukri Auto Update BOT

This GitHub Actions workflow automates the process of updating your Naukri profile by logging in and making specific changes, such as adding and removing a specific skill. It then sends an email notification with a video recording of the process.

## Features

- Automatically logs in to your Naukri account.
- Updates your profile by removing and then adding a specific skill ("Figma" in this case).
- Records the entire process as a video.
- Sends an email notification with the video attachment upon success or failure.
- Uses Puppeteer for browser automation and Nodemailer for email sending.

## Prerequisites

- A Naukri account
- A Gmail account (for sending notifications)
- GitHub account with a repository to store the code
- Basic understanding of GitHub Actions

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Create a `.env` file in the root directory:**

   ```
   NAUKRI_EMAILID=your_naukri_email_id
   NAUKRI_PASSWORD=your_naukri_password
   BOT_EMAILID=your_bot_email_id
   BOT_MAIL_PASSWORD=your_bot_mail_password
   RECEIVING_EMAILID=your_receiving_email_id
   ```

   **Replace the placeholders with your actual credentials.**

3. **Set up GitHub Secrets:**

   - Go to your GitHub repository settings > Secrets > Actions.
   - Create secrets for each environment variable in your `.env` file (`NAUKRI_EMAILID`, `NAUKRI_PASSWORD`, `BOT_EMAILID`, `BOT_MAIL_PASSWORD`, `RECEIVING_EMAILID`) and paste their respective values from the `.env` file.

4. **Customize the script (optional):**

   - You can modify the `index.js` file to customize the profile update actions according to your needs.
   - For example, you can change the skill being added/removed or add more actions like updating your resume.

5. **Commit and push the changes to your GitHub repository:**

   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

## GitHub Actions Workflow

The provided `.github/workflows/naukri-docker.yml` file defines a GitHub Actions workflow that automatically runs the script on a schedule.

- **Schedule:** The `cron` expression `0 0 4 * * *` in the workflow file schedules the job to run daily at 4:00 AM UTC. You can customize this to your desired schedule.

## How it Works

1. **Trigger:** The workflow is triggered on a schedule defined in the `naukri-docker.yml` file.

2. **Checkout Code:** The workflow checks out the latest code from your repository.

3. **Setup Environment:** It sets up the required environment, including installing Node.js and Puppeteer dependencies.

4. **Run the Script:** It executes the `index.js` script, which performs the following actions:
   - Launches a headless Chrome browser using Puppeteer.
   - Navigates to the Naukri login page.
   - Logs in to your account using the provided credentials.
   - Navigates to the profile update section.
   - Removes and then adds the specified skill.
   - Records the entire process as a video.
   - Sends an email notification with the video attachment.

5. **Notification:** You will receive an email notification upon successful profile update or if any error occurs during the process. The email will include a video recording of the browser automation.

## Disclaimer

This script is provided for educational purposes only. Automating interactions with websites may violate their terms of service. Use it responsibly and at your own risk.
