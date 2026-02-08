import { browser } from "wxt/browser";
import { defineBackground } from "wxt/utils/define-background";

const DEFAULT_WIDTH = 1200;
const DEFAULT_HEIGHT = 800;

export default defineBackground(() => {
  browser.runtime.onMessage.addListener(async (message) => {
    if (message?.type !== "open-doc-window") return;

    const url = typeof message.url === "string" && message.url.length > 0
      ? message.url
      : browser.runtime.getURL("viewer.html");

    await browser.windows.create({
      url,
      type: "popup",
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT
    });
  });
});
