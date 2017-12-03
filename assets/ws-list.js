const Port = window.browser.runtime.connect({ name: 'ws-list-port' })
const ListEl = document.getElementById('ws_list')

Port.onMessage.addListener(wsTab => {
  wsTab.ws.map(ws => {
    let wsUrlEl = document.createElement('div')
    wsUrlEl.classList.add('ws-url')
    wsUrlEl.setAttribute('title', ws)
    wsUrlEl.innerText = ws
    ListEl.appendChild(wsUrlEl)
  })
})
