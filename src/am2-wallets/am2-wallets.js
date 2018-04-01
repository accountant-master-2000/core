(function () {
  class AM2Wallets extends window.HTMLElement {
    connectedCallback () {
      const template = document.currentScript.ownerDocument.querySelector('#am2-wallets-template')
      const instance = template.content.cloneNode(true)
      this.appendChild(instance)

      console.log('allWallets', JSON.stringify(this._allWallets()))
      console.log('allAccounts', JSON.stringify(this._allAccounts()))
      console.log('allCategories', JSON.stringify(this._allCategories()))
    }

    disconnectedCallback () {
      this.removeEventListener('click', this._onClick)
    }

    get data () {
      let store = this._store()
      if ((store !== undefined) && (store.tagName !== '') && store.getAttribute('store-id') !== undefined) {
        const data = JSON.parse(window.localStorage.getItem(`${store.tagName.toLowerCase()}-data-${store.getAttribute('store-id')}`))
        return data
      } else {
        return null
      }
    }

    _store () {
      let gist = Array.from(this.querySelectorAll('am2-setup'))
      if (gist.length === 0) {
        gist = this
        while (gist.parentNode) {
          gist = gist.parentNode
        }
        gist = Array.from(gist.querySelectorAll('am2-setup'))
      }
      return gist[0]
    }

    _allAccounts () {
      const data = this.data
      if (data !== null) {
        let newArr = [ 'me' ]
        data.wallets.forEach((w) => {
          w.transactions.map((t) => (t.from !== 'me' ? t.from : t.to)).forEach(a => {
            if (newArr.indexOf(a) === -1) newArr.push(a)
          })
        })
        return newArr
      } else {
        return []
      }
    }

    _allCategories () {
      const data = this.data
      if (data !== null) {
        let newArr = []
        data.wallets.forEach((w) => {
          let newNewArr = []
          w.transactions.forEach((t) => {
            t.categories.forEach((c) => {
              if (newNewArr.indexOf(c) === -1 && newArr.indexOf(c) === -1) newNewArr.push(c)
            })
          })
          newArr = newArr.concat(newNewArr)
        })
        return newArr
      } else {
        return []
      }
    }

    _allWallets () {
      const data = this.data
      if (data !== null) {
        return data.wallets.map(w => (w.alias))
      } else {
        return []
      }
    }

    _allDisplayWallets () {
      const walletList = Array.from(this.querySelectorAll('am2-wallet'))
      return walletList
    }
  }

  if (!window.customElements.get('am2-wallets')) window.customElements.define('am2-wallets', AM2Wallets)
})()
