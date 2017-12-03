const WSTabs = []
const UrlPathRe = /^(.+:\/(\/[^\?]+)+?)(\?)?.*$/

/**
*  Update pageAction: title, icon, popup
**/
function UpdatePageAction(tab) {
  window.browser.pageAction.show(tab.id)
  window.browser.pageAction.setTitle({
    tabId: tab.id,
    title: 'WebSocket detected',
  })
  window.browser.pageAction.setIcon({
    tabId: tab.id,
    path: {
      '19': './assets/icons/ws-16_logo.png',
      '38': './assets/icons/ws-32_logo.png',
    },
  })
  window.browser.pageAction.setPopup({
    tabId: tab.id,
    popup: './assets/ws-list.html',
  })
}

// Setup communication with popup
window.browser.runtime.onConnect.addListener(port => {
  // Send message to popup with active tab info
  browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
    port.postMessage(WSTabs.find(t => t.id === tabs[0].id))
  })
})

// Handle requests
window.browser.webRequest.onBeforeRequest.addListener(
  req => {
    if (req.type === 'websocket') {
      let targetTab = WSTabs.find(t => t.id === req.tabId)
      let urlPath = UrlPathRe.exec(req.url)[1]

      if (targetTab) {
        // Check if there is similar ws url
        let wsUrlIndex = targetTab.ws.findIndex(
          url => url.indexOf(urlPath) !== -1
        )

        if (wsUrlIndex === -1)
          // Add new ws url
          targetTab.ws.push(req.url)
        else
          // Replace similar ws url to new one
          targetTab.ws.splice(wsUrlIndex, 1, req.url)
      } else {
        // Create
        targetTab = {
          id: req.tabId,
          originUrl: req.originUrl,
          ws: [req.url],
        }
        WSTabs.push(targetTab)
      }

      UpdatePageAction(targetTab)
    }
  },
  {
    urls: ['<all_urls>'],
  }
)

// Handle tab closing
window.browser.tabs.onRemoved.addListener(tabId => {
  let targetIndex = WSTabs.findIndex(t => t.id === tabId)
  if (targetIndex !== -1) WSTabs.splice(targetIndex, 1)
})

// Handle tab updates
window.browser.tabs.onUpdated.addListener((id, info) => {
  if (info.status !== 'complete') return

  let targetTab = WSTabs.find(t => t.id === id)
  if (!targetTab) return

  if (info.url) UpdatePageAction(targetTab)
})
