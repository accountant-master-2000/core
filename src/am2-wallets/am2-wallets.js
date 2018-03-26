const KEYCODE = {
  DOWN: 40,
  LEFT: 37,
  RIGHT: 39,
  UP: 38,
  HOME: 36,
  END: 35
}

class AM2Wallets extends window.HTMLElement {
  constructor () {
    super()

    this._onSlotChange = this._onSlotChange.bind(this)
  }

  connectedCallback () {
    const shadowRoot = this.attachShadow({ mode: 'open' })

    const template = document.currentScript.ownerDocument.querySelector('#am2-wallets-template')
    const instance = template.content.cloneNode(true)
    shadowRoot.appendChild(instance)

    this._tabSlot = this.shadowRoot.querySelector('slot[name=tab]')
    this._panelSlot = this.shadowRoot.querySelector('slot[name=panel]')

    this._tabSlot.addEventListener('slotchange', this._onSlotChange)
    this._panelSlot.addEventListener('slotchange', this._onSlotChange)

    this.addEventListener('keydown', this._onKeyDown)
    this.addEventListener('click', this._onClick)
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'tablist')
    }

    Promise.all([
      window.customElements.whenDefined('am2-wallet-tab'),
      window.customElements.whenDefined('am2-wallet-panel')
    ]).then(_ => this._linkPanels())
  }

  disconnectedCallback () {
    this.removeEventListener('keydown', this._onKeyDown)
    this.removeEventListener('click', this._onClick)
  }

  _onSlotChange (someData) {
    this._linkPanels()
  }

  _linkPanels () {
    const tabs = this._allTabs()
    tabs.forEach(tab => {
      const panel = tab.nextElementSibling
      if (panel.tagName.toLowerCase() !== 'am2-wallet-panel') {
        console.error(`Tab #${tab.id} is not a sibling of a <am2-wallet-panel>`)
        return
      }

      tab.setAttribute('aria-controls', panel.id)
      panel.setAttribute('aria-labelledby', tab.id)
    })
    const selectedTab = tabs.find(tab => tab.selected) || tabs[0]
    this._selectTab(selectedTab)
  }

  _allPanels () {
    return Array.from(this.querySelectorAll('am2-wallet-panel'))
  }

  _allTabs () {
    return Array.from(this.querySelectorAll('am2-wallet-tab'))
  }

  _panelForTab (tab) {
    if (tab === undefined) return
    const panelId = tab.getAttribute('aria-controls')
    return this.querySelector(`#${panelId}`)
  }

  _prevTab () {
    const tabs = this._allTabs()
    let newIdx = tabs.findIndex(tab => tab.selected) - 1
    return tabs[(newIdx + tabs.length) % tabs.length]
  }

  _firstTab () {
    const tabs = this._allTabs()
    return tabs[0]
  }

  _lastTab () {
    const tabs = this._allTabs()
    return tabs[tabs.length - 1]
  }

  _nextTab () {
    const tabs = this._allTabs()
    let newIdx = tabs.findIndex(tab => tab.selected) + 1
    return tabs[newIdx % tabs.length]
  }

  reset () {
    const tabs = this._allTabs()
    const panels = this._allPanels()
    tabs.forEach(tab => { tab.selected = false })
    panels.forEach(panel => { panel.hidden = true })
  }

  _selectTab (newTab) {
    if (newTab === undefined) return
    this.reset()
    const newPanel = this._panelForTab(newTab)
    if (!newPanel) throw new Error(`No panel with id ${newPanel}`)
    newTab.selected = true
    newPanel.hidden = false
    newTab.focus()
  }

  _onKeyDown (event) {
    if (event.target.getAttribute('role') !== 'tab') return
    if (event.altKey) return
    let newTab
    switch (event.keyCode) {
      case KEYCODE.LEFT:
      case KEYCODE.UP:
        newTab = this._prevTab()
        break
      case KEYCODE.RIGHT:
      case KEYCODE.DOWN:
        newTab = this._nextTab()
        break
      case KEYCODE.HOME:
        newTab = this._firstTab()
        break
      case KEYCODE.END:
        newTab = this._lastTab()
        break
      default:
        return
    }
    event.preventDefault()
    this._selectTab(newTab)
  }

  _onClick (event) {
    if (event.target.getAttribute('role') !== 'tab') return
    this._selectTab(event.target)
  }
}

if (!window.customElements.get('am2-wallets')) window.customElements.define('am2-wallets', AM2Wallets)