(function () {
  class AM2Wallets extends window.HTMLElement {
    connectedCallback () {
      const template = document.currentScript.ownerDocument.querySelector('#am2-wallets-template')
      if (template !== null) {
        const instance = template.content.cloneNode(true)
        this.appendChild(instance)

        const div = this.querySelector('div.am2-wallets-content')
        this._allDisplayWallets().forEach(w => {
          div.appendChild(w)
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

    _allDisplayWallets () {
      const walletList = Array.from(this.querySelectorAll('am2-wallet'))
      return walletList
    }
  }

  if (!window.customElements.get('am2-wallets')) window.customElements.define('am2-wallets', AM2Wallets)
})()
