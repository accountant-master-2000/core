(function () {
  class AM2Wallets extends window.HTMLElement {
    get storeId () { return this.getAttribute('store-id') }

    get store () {
      let store = this
      while (store.parentNode) {
        store = store.parentNode
      }
      store = store.querySelector(`.am2-store[store-id="${this.storeId}"]`)
      return store
    }

    get data () {
      if (this.store !== null) {
        const data = JSON.parse(window.localStorage.getItem(`${this.store.tagName.toLowerCase()}-data-${this.storeId}`))
        return data
      }
      return { wallets: [] }
    }

    connectedCallback () {
      const template = document.currentScript.ownerDocument.querySelector('#am2-wallets-template')
      if (template !== null) {
        const instance = template.content.cloneNode(true)
        this.appendChild(instance)

        const div = this.querySelector('div.am2-wallets-content')
        this._allDisplayWallets().forEach(w => {
          div.appendChild(w)
          console.log('wallet', w, 'blabla')
        })

        this.data.wallets.forEach((w) => {
          const wallet = document.createElement('am2-wallet')
          wallet.setAttribute('id', w.alias)
          wallet.setAttribute('store-id', this.storeId)
          console.log('wallet', w, wallet)
          div.appendChild(wallet)
        })
      }

      this.addEventListener('click', this._onClick)
    }

    disconnectedCallback () {
      this.removeEventListener('click', this._onClick)
    }

    _onClick (event) {
      if (event.target.getAttribute('type') === 'button') {
        this._toggleDiv()
      }
    }

    _toggleDiv () {
      const div = this.querySelector('div.am2-wallets-content')
      div.style.display = div.style.display === 'none' ? 'block' : 'none'
    }

    _allDisplayWallets () {
      const walletList = Array.from(this.querySelectorAll('am2-wallet'))
      return walletList
    }
  }

  if (!window.customElements.get('am2-wallets')) window.customElements.define('am2-wallets', AM2Wallets)
})()
