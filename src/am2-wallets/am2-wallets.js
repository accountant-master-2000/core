class AM2Wallets extends window.HTMLElement {
  connectedCallback () {
    const shadowRoot = this.attachShadow({ mode: 'open' })

    const template = document.currentScript.ownerDocument.querySelector('#am2-wallets-template')
    const instance = template.content.cloneNode(true)
    shadowRoot.appendChild(instance)

    this.addEventListener('click', this._onClick)

    console.log('allAccounts', JSON.stringify(this._allAccounts()))
    console.log('allCategories', JSON.stringify(this._allCategories()))

    Promise.all([
      window.customElements.whenDefined('am2-github-gist'),
      window.customElements.whenDefined('am2-wallet')
    ]).then(_ => {
      const store = this._store()
      if (store !== undefined) this.shadowRoot.querySelector('.am2-wallets-content').appendChild(store)
      this._allWallets().forEach((val, idx) => {
        this.shadowRoot.querySelector('.am2-wallets-content').appendChild(val)
      })
    })
  }

  disconnectedCallback () {
    this.removeEventListener('click', this._onClick)
  }

  get data () {
    let store = this._store()
    if (store === undefined) {
      store = this
      while (store.parentNode) {
        store = store.parentNode
      }
      store = Array.from(store.querySelectorAll('am2-github-gist'))[0]
    }
    if ((store !== undefined) && (store.tagName !== '') && store.getAttribute('id') !== undefined) {
      const data = JSON.parse(window.localStorage.getItem(`${store.tagName.toLowerCase()}-data-${store.getAttribute('id')}`))
      return data
    } else {
      return null
    }
  }

  _store () {
    const gist = Array.from(this.querySelectorAll('am2-github-gist'))
    // console.log('store', gist, gist[0])
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
    const walletList = Array.from(this.querySelectorAll('am2-wallet'))
    // console.log('allWallets', walletList)
    return walletList
  }

  _prevWallet () {
    const wallets = this._allWallets()
    let newIdx = wallets.findIndex(wallet => wallet.selected) - 1
    return wallets[(newIdx + wallets.length) % wallets.length]
  }

  _firstWallet () {
    const wallets = this._allWallets()
    return wallets[0]
  }

  _lastWallet () {
    const wallets = this._allWallets()
    return wallets[wallets.length - 1]
  }

  _nextWallet () {
    const wallets = this._allWallets()
    let newIdx = wallets.findIndex(wallet => wallet.selected) + 1
    return wallets[newIdx % wallets.length]
  }

  reset () {
    const wallets = this._allWallets()
    wallets.forEach(wallet => { wallet.selected = false })
  }

  _selectWallet (newWallet) {
    if (newWallet === undefined) return
    this.reset()
    newWallet.selected = true
    newWallet.focus()
  }

  _onClick (event) {
    this._selectWallet(event.target)
  }
}

if (!window.customElements.get('am2-wallets')) window.customElements.define('am2-wallets', AM2Wallets)
