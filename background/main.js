const Tabs = []

/**
*  Listen requests
**/
window.browser.webRequest.onBeforeRequest.addListener(
  req => {
    if (req.type === 'main_frame') {
      if (Tabs.indexOf(req.tabId) !== -1)
        window.browser.pageAction.hide(req.tabId)
      return
    }

    if (req.type === 'websocket') {
      if (Tabs.indexOf(req.tabId) === -1) Tabs.push(req.tabId)
      window.browser.pageAction.show(req.tabId)
      window.browser.pageAction.setTitle({ tabId: req.tabId, title: req.url })
    }
  },
  {
    urls: ['<all_urls>'],
  }
)

/**
*  Remove listed tab
**/
window.browser.tabs.onRemoved.addListener(tabId => {
  if (Tabs.indexOf(tabId) !== -1) Tabs.splice(Tabs.indexOf(tabId), 1)
})
