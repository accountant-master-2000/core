let howtoPanelCounter = 0

class AM2WalletPanel extends window.HTMLElement {
  connectedCallback () {
    this.setAttribute('role', 'tabpanel')
    if (!this.id) this.id = `am2-wallet-panel-generated-${howtoPanelCounter++}`
  }
}

if (!window.customElements.get('am2-wallet-panel')) window.customElements.define('am2-wallet-panel', AM2WalletPanel)
