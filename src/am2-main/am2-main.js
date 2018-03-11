class AM2Main extends window.HTMLElement {
  constructor () {
    super()

    this.addEventListener('click', e => {
      this.toggleCard()
    })
  }

  connectedCallback () {
    const shadowRoot = this.attachShadow({ mode: 'open' })

    const template = document.currentScript.ownerDocument.querySelector('#am2-main-template')
    const instance = template.content.cloneNode(true)
    shadowRoot.appendChild(instance)

    const userId = this.getAttribute('user-id')
    console.log(`user-id: ${userId}`)

    this.render({ user: 'Fumasa', blabla: 'heu hauhuh au heua heua heu ahueh uae heu ha' })
  }

  render (someData) {
    this.shadowRoot.querySelector('.card__user-name').innerHTML = someData.user
    this.shadowRoot.querySelector('.card__something').innerHTML = someData.blabla
  }

  toggleCard () {
    let elem = this.shadowRoot.querySelector('.card__hidden-content')
    let btn = this.shadowRoot.querySelector('.card__details-btn')
    btn.innerHTML = elem.style.display === 'none' ? 'Less Details' : 'More Details'
    elem.style.display = elem.style.display === 'none' ? 'block' : 'none'
  }
}

if (!window.customElements.get('am2-main')) {
  window.customElements.define('am2-main', AM2Main)
}
