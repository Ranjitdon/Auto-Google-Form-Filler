export const getStoredData = async () => {
  return new Promise((resolve) => {
    chrome.storage.local.get(["resume", "apiKey"], (result) => {
      resolve(result);
    });
  });
};
