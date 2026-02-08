import { browser } from "wxt/browser";
import { defineBackground } from "wxt/utils/define-background";

const DEFAULT_WIDTH = 1200;
const DEFAULT_HEIGHT = 800;
const VIEWER_URL_PREFIX = browser.runtime.getURL("viewer.html");

export default defineBackground(() => {
  browser.runtime.onMessage.addListener(async (message) => {
    if (message?.type !== "open-doc-window") return;

    const url = typeof message.url === "string" && message.url.length > 0
      ? message.url
      : browser.runtime.getURL("viewer.html");

    const viewerTabs = await browser.tabs.query({
      url: [`${VIEWER_URL_PREFIX}*`]
    });

    if (viewerTabs.length > 0 && viewerTabs[0].id) {
      await browser.tabs.update(viewerTabs[0].id, { url });
      await browser.windows.update(viewerTabs[0].windowId, { focused: true });
      return;
    }

    await browser.windows.create({
      url,
      type: "popup",
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT
    });
  });
});
