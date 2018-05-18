(function () {
  class AM2Setup extends window.HTMLElement {
    constructor () {
      super()

      this.addEventListener('click', this.buttonClicked)
    }

    get storeId () { return this.getAttribute('store-id') }

    set token (value) { window.localStorage.setItem(`am2-github-token-${this.storeId}`, value) }
    get token () { return window.localStorage.getItem(`am2-github-token-${this.storeId}`) }

    set gistid (value) { window.localStorage.setItem(`am2-github-gist-id-${this.storeId}`, value) }
    get gistid () { return window.localStorage.getItem(`am2-github-gist-id-${this.storeId}`) }

    set data (value) { window.localStorage.setItem(`am2-setup-data-${this.storeId}`, JSON.stringify(value)) }
    get data () { return JSON.parse(window.localStorage.getItem(`am2-setup-data-${this.storeId}`)) }

    connectedCallback () {
      const template = document.currentScript.ownerDocument.querySelector('#am2-setup-template')
      const instance = template.content.cloneNode(true)
      this.appendChild(instance)

      this._toggleForm()
    }

    buttonClicked (event) {
      event.preventDefault()
      switch (event.target.type) {
        case 'submit':
          this._refreshData()
          break
        case 'button':
          this._toggleForm()
          break
      }
    }

    _allAccounts () {
      const data = this.data
      if (data !== null) {
        let newArr = [ 'me' ]
        data.wallets.forEach((w) => {
          w.transactions.map((t) => (t.from !== 'me' ? t.from : t.to)).forEach(a => {
            if (newArr.indexOf(a) === -1) newArr.push(a)
          })
        })
        return newArr
      } else {
        return []
      }
    }

    _allCategories () {
      const data = this.data
      if (data !== null) {
        let newArr = []
        data.wallets.forEach((w) => {
          let newNewArr = []
          w.transactions.forEach((t) => {
            t.categories.forEach((c) => {
              if (newNewArr.indexOf(c) === -1 && newArr.indexOf(c) === -1) newNewArr.push(c)
            })
          })
          newArr = newArr.concat(newNewArr)
        })
        return newArr
      } else {
        return []
      }
    }
    bla () {
      console.log('oie')
    }

    _allWallets () {
      const data = this.data
      if (data !== null) {
        return data.wallets.map(w => (w.alias))
      } else {
        return []
      }
    }

    _allTransactions () {
      const data = this.data
      if (data !== null) {
        let newArr = []
        data.wallets.forEach((w) => {
          w.transactions.forEach(t => {
            t.wallet = w.alias
            newArr.push(t)
          })
        })
        return newArr
      } else {
        return []
      }
    }

    _transactionsData ({ wallet = null, account = null, category = null, transactionType = null } = {}) {
      const transactionsList = []
      this._allTransactions().forEach((t) => {
        if (wallet !== null && t.wallet !== wallet) return
        if (account !== null && (t.from !== account && t.to !== account)) return
        if (category !== null && t.categories.indexOf(category) === -1) return
        if (transactionType !== null && ((transactionType && t.from === 'me') || (!transactionType && t.to === 'me'))) return
        transactionsList.push(t)
      })
      return transactionsList
    }

    _toggleForm () {
      const form = this.querySelector('form.github-form')
      form.style.display = form.style.display === 'none' ? 'block' : 'none'
    }

    _refreshData (callback) {
      let token = this.querySelector('#github-token').value
      token = token === '' ? undefined : token
      if (this.token === undefined && token === undefined) {
        return
      } else {
        this.token = token || this.token
      }
      this.querySelector('#github-token').value = ''

      let gistid = this.querySelector('#github-gistid').value
      gistid = gistid === '' ? undefined : gistid
      if (this.gistid === undefined && gistid === undefined) {
        return
      } else {
        this.gistid = gistid || this.gistid
      }
      this.querySelector('#github-gistid').value = ''

      this._checkGist((data) => {
        data.wallets = [
          {
            alias: 'test01',
            lastUpdate: new Date(),
            transactions: [
              { amount: 4.20, from: 'me', to: 'green', date: new Date(), categories: [ 'test' ] },
              { amount: 4.23, from: 'me', to: 'blue', date: new Date(), categories: [ 'test1', 'test2' ] }
            ]
          },
          {
            alias: 'test02',
            lastUpdate: new Date(),
            transactions: [
              { amount: 4.23, from: 'me', to: 'green', date: new Date(), categories: [ 'test' ] }
            ]
          },
          {
            alias: 'test03',
            lastUpdate: new Date(),
            transactions: [
              { amount: 4.20, from: 'me', to: 'green', date: new Date(), categories: [ 'test' ] },
              { amount: 4.23, from: 'me', to: 'blue', date: new Date(), categories: [ 'test2' ] }
            ]
          }
        ]
        this.data = data
        this._saveGist(() => {
          document.location.reload()
        })
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
        const obj = JSON.parse(data).files[`data.${this.storeId}`]
        const objData = JSON.parse(obj.content)
        callback(objData)
      }, (reason) => {
        window.alert(reason)
      })
    }

    _saveGist (callback) {
      const sendData = {
        'description': 'accountant-master-2000 storage',
        'files': {}
      }
      sendData.files[`data.${this.storeId}`] = {
        'content': JSON.stringify(this.data)
      }

      _ajax({
        url: `https://api.github.com/gists/${this.gistid}`,
        type: 'PATCH',
        data: sendData,
        beforeSend: (xhr) => {
          xhr.setRequestHeader('Authorization', `token ${this.token}`)
          xhr.setRequestHeader('content-type', 'application/json')
        }
      }).then((d) => {
        console.log('gist saved!')
        callback()
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

  if (!window.customElements.get('am2-setup')) window.customElements.define('am2-setup', AM2Setup)
})()
