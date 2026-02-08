import { defineConfig } from "wxt";

export default defineConfig({
  srcDir: "src",
  entrypointsDir: "entrypoints",
  manifest: {
    name: "Java Oracle Docs Search",
    description: "Quickly search and open Java Oracle documentation.",
    action: {
      default_title: "Java Docs Search",
      default_popup: "popup.html"
    }
  }
});
