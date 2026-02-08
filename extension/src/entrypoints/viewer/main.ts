import { browser } from "wxt/browser";

const ORACLE_JAVA_API = "https://docs.oracle.com/en/java/javase/21/docs/api/";
const ORACLE_JAVA_SEARCH = "https://docs.oracle.com/en/java/javase/21/docs/api/search.html";

const queryInput = document.querySelector<HTMLInputElement>("#viewerQuery");
const searchBtn = document.querySelector<HTMLButtonElement>("#viewerSearch");
const openApiBtn = document.querySelector<HTMLButtonElement>("#viewerOpenApi");
const frame = document.querySelector<HTMLIFrameElement>("#viewerFrame");

function buildSearchUrl(term: string): string {
  const params = new URLSearchParams({ q: term });
  return `${ORACLE_JAVA_SEARCH}?${params.toString()}`;
}

function showUrl(url: string): void {
  if (!frame) return;
  frame.src = url;
}

function handleSearch(): void {
  const term = queryInput?.value.trim() ?? "";
  if (!term) return;
  showUrl(buildSearchUrl(term));
}

queryInput?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleSearch();
  }
});

searchBtn?.addEventListener("click", handleSearch);
openApiBtn?.addEventListener("click", () => showUrl(ORACLE_JAVA_API));

const params = new URLSearchParams(window.location.search);
const initialUrl = params.get("url");
const initialQuery = params.get("q");
if (initialUrl) {
  showUrl(initialUrl);
} else if (initialQuery) {
  if (queryInput) queryInput.value = initialQuery;
  showUrl(buildSearchUrl(initialQuery));
} else {
  showUrl(ORACLE_JAVA_API);
}

browser.runtime.onMessage.addListener((message) => {
  if (message?.type === "open-doc" && typeof message.url === "string") {
    showUrl(message.url);
  }
});
