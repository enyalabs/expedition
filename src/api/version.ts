
const VERSION = process.env.REACT_APP_VERSION;
const SERVICE_API_URL = process.env.REACT_APP_SERVICE_API_URL;

export const checkVersion = () => {
  fetch(SERVICE_API_URL + 'get.blockexplorer.version', {
    method: "GET",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  }).then(res => {
    if (res.status === 201) {
      return res.json()
    } else {
      return ""
    }
  }).then(data => {
    if (data !== "") {
      if (data.version !== VERSION) {
        caches.keys().then(async function(names) {
          await Promise.all(names.map(name => caches.delete(name)))
        });
      }
    }
  })
}