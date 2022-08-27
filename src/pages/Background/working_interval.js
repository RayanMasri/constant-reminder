let lifeline;

keepAlive();

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'keepAlive') {
    console.log('Port "keepAlive" connected');
    lifeline = port;
    setTimeout(keepAliveForced, 295e3); // 5 minutes minus 5 seconds
    port.onDisconnect.addListener(keepAliveForced);
  }
});

function keepAliveForced() {
  console.log('Port disconnected, reconnecting...');
  lifeline?.disconnect();
  lifeline = null;
  keepAlive();
}

async function keepAlive() {
  if (lifeline)
    return console.log(
      'Attempted to keep alive, rejected due to lifeline already existing'
    );

  for (const tab of await chrome.tabs.query({ url: '*://*/*' })) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => chrome.runtime.connect({ name: 'keepAlive' }),
        // `function` will become `func` in Chrome 93+
      });
      chrome.tabs.onUpdated.removeListener(retryOnTabUpdate);
      console.log('Connected port');
      return;
    } catch (e) {
      console.log(e.toString());
    }
  }

  console.log('Found no tabs');
  chrome.tabs.onUpdated.addListener(retryOnTabUpdate);
}

async function retryOnTabUpdate(tabId, info, tab) {
  // Test if not chrome url
  if (info.url && /^(file|https?):/.test(info.url)) {
    keepAlive();
  }
}

setInterval(() => {
  console.log(getFormattedDate());
}, 1000);
