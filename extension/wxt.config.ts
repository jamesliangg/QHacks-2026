import { defineConfig } from "wxt";

export default defineConfig({
  srcDir: "src",
  entrypointsDir: "entrypoints",
  manifest: {
    name: "Java Oracle Docs Search",
    description: "Quickly search and open Java Oracle documentation.",
    content_security_policy: {
      extension_pages: "script-src 'self'; object-src 'self'; frame-src https://docs.oracle.com"
    },
    permissions: ["windows"],
    action: {
      default_title: "Java Docs Search",
      default_popup: "popup.html"
    }
  }
});
