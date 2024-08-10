const puppeteer = require("puppeteer");
const fs = require("fs");
const { PuppeteerScreenRecorder } = require("puppeteer-screen-recorder");
const { sendEmail, manageCookies, randomDelay, delay } = require("./utils");
require("dotenv").config();

const naukriAutoUpdate = async (emailID, password) => {
  let browser;
  let recorder;
  const recordingPath = "/tmp/screenrecord.mp4";

  try {
    console.log("Naukri BOT is Running");
    const now = new Date();
    console.log(`Profile update started at: ${now.toLocaleString()}`);

    browser = await puppeteer.launch({
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
        "--disable-gpu",
        "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36",
      ],
      headless: true,
      slowMo: 100,
      timeout: 60000,
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", {
        get: () => false,
      });
    });

    await manageCookies(page);

    recorder = new PuppeteerScreenRecorder(page);
    await recorder.start(recordingPath);

    await page.goto("https://www.naukri.com/nlogin/login", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    await randomDelay(1000, 3000);
    console.log("Navigated to Naukri login page");

    const isLoggedIn = await page.evaluate(() => {
      return !document.querySelector("#usernameField");
    });

    if (!isLoggedIn) {
      if (!emailID || !password || typeof emailID !== "string" || typeof password !== "string") {
        throw new Error("Email ID or password is not set or not a string.");
      }

      console.log("Filling login form");
      console.log("Entering email ID");
      await page.type("#usernameField", emailID);
      console.log("Entered email ID");
      await randomDelay(1000, 2000);
      console.log("Entering password");
      await page.type("#passwordField", password);
      await randomDelay(1000, 2000);
      console.log("Entered password");
      console.log("Filled login form");

      console.log("Submitting login form");
      await page.click("button[data-ga-track='spa-event|login|login|Save||||true']");
      await randomDelay(2000, 4000);
      console.log("Clicked login button");
      console.log("Submitted login form");

      const otpErrorMessage = await page.evaluate(() => {
        const errorElement = document.querySelector(".err-container span.erLbl");
        return errorElement ? errorElement.innerHTML : null;
      });

      if (otpErrorMessage && otpErrorMessage.includes("you have reached max limit to generate otp today")) {
        console.error("Error: " + otpErrorMessage);
        const videoBuffer = fs.readFileSync(recordingPath);
        await sendEmail("Naukri Update Error", `Error: ${otpErrorMessage}`, videoBuffer);
        await recorder.stop();
        await browser.close();
        return;
      }

      try {
        console.log("Waiting for .dashboard-container");
        await page.waitForSelector(".dashboard-container", { timeout: 90000 });
        console.log("Login successful");
      } catch (error) {
        console.log("Login failed");
        console.error("Error waiting for .dashboard-container:", error);
        await recorder.stop();
        const videoBuffer = fs.readFileSync(recordingPath);
        await sendEmail("Naukri Update Error", `Error waiting for .dashboard-container: ${error}`, videoBuffer);
        throw error;
      }
    } else {
      console.log("Already logged in, skipping login.");
    }

    console.log("Navigating to profile update section");
    await page.goto("https://www.naukri.com/mnjuser/profile?id=&altresid", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    await randomDelay(2000, 4000);
    console.log("Navigated to profile update section");
    await page.waitForSelector("#skillDetails", { timeout: 60000 });
    console.log("Profile page loaded");

    const manageKeySkills = async (action) => {
      try {
        await page.evaluate(() => {
          const keySkillsSection = [...document.querySelectorAll(".heading-container")].find((section) => section.innerText.includes("Key skills"));
          if (keySkillsSection) {
            keySkillsSection.querySelector(".new-pencil img").click();
          }
        });

        await page.waitForSelector(".sugCont", { timeout: 15000 });
        await randomDelay(1000, 2000);
        console.log(`Key skills dialog opened for ${action} action`);

        if (action === "remove") {
          await page.evaluate(() => {
            const figmaSkill = [...document.querySelectorAll(".chip")].find((chip) => chip.innerHTML.includes("Figma"));
            if (figmaSkill) {
              figmaSkill.querySelector(".fn-chips-cross").click();
            }
          });
          console.log("Removed 'Figma' skill");
        } else if (action === "add") {
          await page.type('input[placeholder="Enter your key skills"]', "Figma");
          await randomDelay(1000, 2000);

          const suggestionVisible = await page.waitForSelector(".sugCont", { visible: true, timeout: 30000 });

          if (suggestionVisible) {
            const figmaSuggestionHandle = await page.evaluateHandle(() => {
              const suggestions = [...document.querySelectorAll(".sugCont .Sbtn")];
              return suggestions.find((item) => item.innerHTML.includes("Figma"));
            });

            if (figmaSuggestionHandle) {
              await figmaSuggestionHandle.click();
              console.log("Added 'Figma' skill");
            } else {
              throw new Error("Figma suggestion not found in dropdown");
            }
          } else {
            throw new Error("Suggestion dropdown not visible");
          }

          await delay(2000);
        }

        await page.click("#submit-btn");
        await randomDelay(1000, 2000);
        console.log(`Saved key skills after ${action} action`);
      } catch (error) {
        console.error(`Error managing key skills (${action}):`, error);
        await sendEmail("Naukri Update Error", `Error managing key skills (${action}): ${error}`);
      }
    };

    await manageKeySkills("remove");
    await manageKeySkills("add");

    await recorder.stop();
    const videoBuffer = fs.readFileSync(recordingPath);
    await sendEmail("Naukri Update Success", "Your Naukri profile has been successfully updated.", videoBuffer);
    console.log("Profile updated successfully");

    const later = new Date();
    console.log(`Profile update finished at: ${later.toLocaleString()}`);
  } catch (error) {
    console.error("Error in Naukri Auto Update BOT:", error);
    if (recorder) {
      await recorder.stop();
      const videoBuffer = fs.readFileSync(recordingPath);
      await sendEmail("Naukri Update Error", `Error in Naukri Auto Update BOT: ${error}`, videoBuffer);
    }
    if (browser) {
      await browser.close();
      console.log("Browser closed successfully");
    }
    throw error;
  } finally {
    if (browser) {
      await browser.close();
      console.log("Browser closed successfully");
    }
  }
};

naukriAutoUpdate(process.env.NAUKRI_EMAILID, process.env.NAUKRI_PASSWORD)
  .then(() => console.log("Naukri Auto Update BOT completed successfully"))
  .catch((error) => console.error("Naukri Auto Update BOT failed:", error));
