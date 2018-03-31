class AM2GithubGist extends window.HTMLElement {
  constructor () {
    super()

    this.addEventListener('click', this.buttonClicked)
  }

  get id () { return this.getAttribute('id') }

  set token (value) { window.localStorage.setItem(`am2-github-token-${this.id}`, value) }
  get token () { return window.localStorage.getItem(`am2-github-token-${this.id}`) }

  set gistid (value) { window.localStorage.setItem(`am2-github-gist-id-${this.id}`, value) }
  get gistid () { return window.localStorage.getItem(`am2-github-gist-id-${this.id}`) }

  set gistData (value) { window.localStorage.setItem(`am2-github-gist-data-${this.id}`, JSON.stringify(value)) }
  get gistData () { return JSON.parse(window.localStorage.getItem(`am2-github-gist-data-${this.id}`)) }

  connectedCallback () {
    if (this.shadowRoot !== null) return
    const shadowRoot = this.attachShadow({ mode: 'open' })

    const template = document.currentScript.ownerDocument.querySelector('#am2-github-gist-template')
    const instance = template.content.cloneNode(true)
    shadowRoot.appendChild(instance)

    // this.render()
  }

  render () {
    const dataStr = JSON.stringify(this.gistData)
    // this.shadowRoot.querySelector('.card__something').innerHTML = dataStr
    console.log(`data synced: ${dataStr}`)
  }

  buttonClicked (event) {
    let token = this.shadowRoot.querySelector('#github-token').value
    token = token === '' ? undefined : token
    if (this.token === undefined && token === undefined) {
      return
    } else {
      this.token = token || this.token
    }
    this.shadowRoot.querySelector('#github-token').value = ''
    let gistid = this.shadowRoot.querySelector('#github-gistid').value
    gistid = gistid === '' ? undefined : gistid
    if (this.gistid === undefined && gistid === undefined) {
      return
    } else {
      this.gistid = gistid || this.gistid
    }
    this.shadowRoot.querySelector('#github-gistid').value = ''

    this._checkGist((data) => {
      data.wallets = [
        {
          alias: 'test01',
          lastUpdate: new Date(),
          transactions: [
            { amount: 4.20, from: 'me', to: 'green', categories: [ 'test' ] },
            { amount: 4.23, from: 'me', to: 'blue', categories: [ 'test2' ] }
          ]
        },
        {
          alias: 'test02',
          lastUpdate: new Date(),
          transactions: [
            { amount: 4.23, from: 'me', to: 'green', categories: [ 'test' ] }
          ]
        }
      ]
      this.gistData = data
      // this.render()
      this._saveGist()
    })
  }

  _checkGist (callback) {
    _ajax({
      url: `https://api.github.com/gists/${this.gistid}`,
      type: 'GET',
      beforeSend: (xhr) => {
        xhr.setRequestHeader('Authorization', `token ${this.token}`)
      }
    }).then((data) => {
      const obj = JSON.parse(data).files[`data.${this.id}`]
      const objData = JSON.parse(obj.content)
      callback(objData)
    }, (reason) => {
      window.alert(reason)
    })
  }

  _saveGist () {
    const data = {
      'description': 'accountant-master-2000 storage',
      'files': {}
    }
    data.files[`data.${this.id}`] = {
      'content': JSON.stringify(this.gistData)
    }

    _ajax({
      url: `https://api.github.com/gists/${this.gistid}`,
      type: 'PATCH',
      data: data,
      beforeSend: (xhr) => {
        xhr.setRequestHeader('Authorization', `token ${this.token}`)
        xhr.setRequestHeader('content-type', 'application/json')
      }
    }).then((data) => {
      console.log('gist saved!')
    }, (reason) => {
      window.alert(reason)
    })
  }
}

function _ajax ({ url, data = undefined, type = 'GET', beforeSend = undefined }) {
  return new Promise((resolve, reject) => {
    const xhr = window.XMLHttpRequest ? new window.XMLHttpRequest() : new window.ActiveXObject('Microsoft.XMLHTTP')
    xhr.open(type, url)
    xhr.onreadystatechange = function () {
      if (xhr.readyState > 3) {
        if (xhr.status === 200) {
          resolve(xhr.responseText)
        } else {
          console.log('[_ajax] error', xhr.status, xhr.statusText, xhr.responseText)
          reject(xhr.statusText)
        }
      }
    }
    if (beforeSend === undefined) {
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
    } else {
      beforeSend(xhr)
    }
    if (data !== undefined) {
      xhr.send(JSON.stringify(data))
    } else {
      xhr.send()
    }
  })
}

if (!window.customElements.get('am2-github-gist')) {
  window.customElements.define('am2-github-gist', AM2GithubGist)
}
