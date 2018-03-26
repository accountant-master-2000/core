let howtoTabCounter = 0

class AM2WalletTab extends window.HTMLElement {
  static get observedAttributes () {
    return ['selected']
  }

  connectedCallback () {
    this.setAttribute('role', 'tab')
    if (!this.id) this.id = `am2-wallet-tab-generated-${howtoTabCounter++}`
    this.setAttribute('aria-selected', 'false')
    this.setAttribute('tabindex', -1)
    this._upgradeProperty('selected')
  }
  _upgradeProperty (prop) {
    if (this.hasOwnProperty(prop)) {
      let value = this[prop]
      delete this[prop]
      this[prop] = value
    }
  }
  attributeChangedCallback () {
    const value = this.hasAttribute('selected')
    this.setAttribute('aria-selected', value)
    this.setAttribute('tabindex', value ? 0 : -1)
  }

  set selected (value) {
    value = Boolean(value)
    if (value) {
      this.setAttribute('selected', '')
    } else {
      this.removeAttribute('selected')
    }
  }

  get selected () {
    return this.hasAttribute('selected')
  }
}

if (!window.customElements.get('am2-wallet-tab')) window.customElements.define('am2-wallet-tab', AM2WalletTab)
