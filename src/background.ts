
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed!')
})

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('Received message in background:', message)
  if (message === 'ping') {
    sendResponse('pong from background')
  }
})
