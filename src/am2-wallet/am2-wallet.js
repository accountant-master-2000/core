(function () {
  class AM2Wallet extends window.HTMLElement {
    constructor () {
      super()

      this.addEventListener('click', this._onClick)
    }

    get storeId () { return this.getAttribute('store-id') }
    get storeTagName () {
      let store = this
      while (store.parentNode) {
        store = store.parentNode
      }
      store = store.querySelector(`[store-id="${this.storeId}"]`)
      if (store === null) return ''
      return store.tagName.toLowerCase()
    }

    get id () { return this.getAttribute('id') }

    set data (value) { window.localStorage.setItem(`${this.storeTagName}-data-${this.storeId}`, JSON.stringify(value)) }
    get data () {
      if (this.storeTagName !== '') {
        return JSON.parse(window.localStorage.getItem(`${this.storeTagName}-data-${this.storeId}`)).wallets.find((v) => v.alias === this.id)
      } else {
        return { alias: this.id, lastUpdate: new Date(), transactions: [] }
      }
    }

    connectedCallback () {
      const template = document.currentScript.ownerDocument.querySelector('#am2-wallet-template')
      const instance = template.content.cloneNode(true)
      this.appendChild(instance)

      this.querySelector('.am2-wallet-title').innerHTML = this.data.alias
      this.querySelector('.am2-wallet-transactions').innerHTML = ''
      this.querySelector('.am2-wallet-transactions').appendChild(this._displayTransaction(this.data.transactions))

      this._toggleTable()
    }

    disconnectedCallback () {
      this.removeEventListener('click', this._onClick)
    }

    _onClick (event) {
      if (event.target.getAttribute('class') === 'am2-wallet-title') {
        this._toggleTable()
      }
    }

    _toggleTable () {
      const table = this.querySelector('div.am2-wallet-transactions')
      table.style.display = table.style.display === 'none' ? 'block' : 'none'
    }

    _displayTransaction (transactions = []) {
      const table = document.createElement('table')

      if (transactions.length > 0) {
        const tr = document.createElement('tr')
        for (let key in transactions[0]) {
          let th = document.createElement('th')
          th.innerHTML = key
          tr.appendChild(th)
        }
        const thead = document.createElement('thead')
        thead.appendChild(tr)
        table.appendChild(thead)

        const tbody = document.createElement('tbody')
        transactions.forEach((t) => {
          const tr = document.createElement('tr')
          for (let key in transactions[0]) {
            let td = document.createElement('td')
            td.innerHTML = t[key]
            tr.appendChild(td)
          }
          tbody.appendChild(tr)
        })
        table.appendChild(tbody)
      }

      return table
    }
  }

  if (!window.customElements.get('am2-wallet')) window.customElements.define('am2-wallet', AM2Wallet)
})()
