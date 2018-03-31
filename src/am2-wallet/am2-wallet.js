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
    store = store.querySelector(`#${this.storeId}`)
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
    if (this.shadowRoot !== null) return
    const shadowRoot = this.attachShadow({ mode: 'open' })

    const template = document.currentScript.ownerDocument.querySelector('#am2-wallet-template')
    const instance = template.content.cloneNode(true)
    shadowRoot.appendChild(instance)

    this.shadowRoot.querySelector('.am2-wallet-title').innerHTML = `${this.data.alias}: ${this.data.lastUpdate}`
    this.shadowRoot.querySelector('.am2-wallet-transactions').innerHTML = JSON.stringify(this.data.transactions)
  }

  disconnectedCallback () {
    this.removeEventListener('click', this._onClick)
  }

  _onClick (event) {
    this._selectWallet(event.target)
  }
}

if (!window.customElements.get('am2-wallet')) window.customElements.define('am2-wallet', AM2Wallet)