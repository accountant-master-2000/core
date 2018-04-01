(function () {
  class AM2Wallet extends window.HTMLElement {
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

    get data () {
      let store = this._store()
      if ((store !== undefined) && (store.tagName !== '') && store.getAttribute('store-id') !== undefined) {
        const data = JSON.parse(window.localStorage.getItem(`${store.tagName.toLowerCase()}-data-${store.getAttribute('store-id')}`))
        for (let i = 0; i < data.wallets.length; i++) {
          if (data.wallets[i].alias === this.id) return data.wallets[i]
        }
      }
      return { alias: this.id, date: new Date(), transactions: [] }
    }

    get balance () {
      let amount = 0
      this.data.transactions.forEach(t => {
        if (t.to === 'me') {
          amount += t.amount
        } else {
          amount -= t.amount
        }
      })
      return amount
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

    connectedCallback () {
      const template = document.currentScript.ownerDocument.querySelector('#am2-wallet-template')
      if (template !== null) {
        const instance = template.content.cloneNode(true)
        this.appendChild(instance)

        this.querySelector('.am2-wallet-title').innerHTML = `${this.data.alias} => ${this.balance}`
        this.querySelector('.am2-wallet-transactions').innerHTML = ''
        this.querySelector('.am2-wallet-transactions').appendChild(this._displayTransaction(this.data.transactions))

        this._toggleTable()
      }
      this.addEventListener('click', this._onClick)
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
