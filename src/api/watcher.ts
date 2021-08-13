import { orderBy } from "lodash";

class APIWatcher {
  watcherURL: string | undefined;

  constructor() {
    this.watcherURL = window.location.href.includes("Mainnet") ? 
      process.env.REACT_APP_WATCHER_API_URL_1 : 
      process.env.REACT_APP_WATCHER_API_URL_2;
  }

  async getTransaction(address: string, fromRange: number, toRange: number) {
    return fetch(this.watcherURL + 'get.transaction', {
      method: 'POST',
      body: JSON.stringify({ address, fromRange, toRange}),
    }).then(res => {
      if (res.status === 201) return res.json();
      return ""
    }).then(response => {
      if (response) return orderBy(response, ['blockNumber'], ['desc']);
      return []
    })
  }

  async getCrossDomainMessage(hash: any) {
    return fetch(this.watcherURL + 'get.crossdomainmessage', {
      method: 'POST',
      body: JSON.stringify({ hash }),
    }).then(res => {
      if (res.status === 201) return res.json();
      return ""
    }).then(response => {
      if (response) return response;
      return {}
    })
  }
}

export default APIWatcher;