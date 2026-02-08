import { browser } from "wxt/browser";

const ORACLE_JAVA_API = "https://docs.oracle.com/en/java/javase/21/docs/api/";
const ORACLE_JAVA_SEARCH = "https://docs.oracle.com/en/java/javase/21/docs/api/search.html";
const JAVA_SE_DOCS = "https://docs.oracle.com/en/java/javase/";

const queryInput = document.querySelector<HTMLInputElement>("#query");
const searchBtn = document.querySelector<HTMLButtonElement>("#searchBtn");
const openLatestBtn = document.querySelector<HTMLButtonElement>("#openLatest");
const openGuideBtn = document.querySelector<HTMLButtonElement>("#openGuide");
const clearRecentBtn = document.querySelector<HTMLButtonElement>("#clearRecent");
const openExternalBtn = document.querySelector<HTMLButtonElement>("#openExternal");
const popOutBtn = document.querySelector<HTMLButtonElement>("#popOut");
const docsFrame = document.querySelector<HTMLIFrameElement>("#docsFrame");
const viewerEmpty = document.querySelector<HTMLDivElement>("#viewerEmpty");
const viewerWrap = document.querySelector<HTMLDivElement>(".viewer__frame-wrap");
const recentList = document.querySelector<HTMLUListElement>("#recentList");
const emptyState = document.querySelector<HTMLDivElement>("#emptyState");

const MAX_RECENT = 8;
const RECENT_KEY = "java-docs-recent";

type RecentItem = {
  term: string;
  url: string;
  timestamp: number;
};

function buildSearchUrl(term: string): string {
  const params = new URLSearchParams({ q: term });
  return `${ORACLE_JAVA_SEARCH}?${params.toString()}`;
}

function openUrl(url: string): void {
  if (browser?.tabs?.create) {
    browser.tabs.create({ url });
    return;
  }

  window.open(url, "_blank", "noopener");
}

function showInViewer(url: string): void {
  if (!docsFrame || !viewerEmpty || !viewerWrap) return;
  docsFrame.src = url;
  viewerEmpty.style.display = "none";
  viewerWrap.style.display = "block";
}

function openDocs(url: string): void {
  showInViewer(url);
}

function normalizeTerm(term: string): string {
  return term.trim();
}

function loadRecent(): RecentItem[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRecent(items: RecentItem[]): void {
  localStorage.setItem(RECENT_KEY, JSON.stringify(items));
}

function addRecent(term: string, url: string): void {
  const items = loadRecent();
  const next = [{ term, url, timestamp: Date.now() }, ...items.filter((item) => item.term !== term)];
  saveRecent(next.slice(0, MAX_RECENT));
  renderRecent();
}

function renderRecent(): void {
  if (!recentList || !emptyState) return;
  const items = loadRecent();
  recentList.innerHTML = "";

  if (items.length === 0) {
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";
  for (const item of items) {
    const li = document.createElement("li");
    li.className = "results__item";

    const text = document.createElement("button");
    text.type = "button";
    text.className = "results__button";
    text.textContent = item.term;
    text.addEventListener("click", () => openDocs(item.url));

    const time = document.createElement("span");
    time.className = "results__time";
    const date = new Date(item.timestamp);
    time.textContent = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });

    li.append(text, time);
    recentList.append(li);
  }
}

function handleSearch(): void {
  const term = normalizeTerm(queryInput?.value ?? "");
  if (!term) {
    queryInput?.focus();
    return;
  }

  const url = buildSearchUrl(term);
  addRecent(term, url);
  openDocs(url);
}

queryInput?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleSearch();
  }
});

searchBtn?.addEventListener("click", handleSearch);

openLatestBtn?.addEventListener("click", () => openDocs(ORACLE_JAVA_API));
openGuideBtn?.addEventListener("click", () => openDocs(JAVA_SE_DOCS));
clearRecentBtn?.addEventListener("click", () => {
  localStorage.removeItem(RECENT_KEY);
  renderRecent();
});

openExternalBtn?.addEventListener("click", () => {
  const url = docsFrame?.src || ORACLE_JAVA_API;
  if (url && url !== "about:blank") {
    openUrl(url);
  } else {
    openUrl(ORACLE_JAVA_API);
  }
});

popOutBtn?.addEventListener("click", () => {
  const url = docsFrame?.src || browser.runtime.getURL("viewer.html");
  browser.runtime.sendMessage({ type: "open-doc-window", url }).catch(() => {
    openUrl(url);
  });
});

renderRecent();
