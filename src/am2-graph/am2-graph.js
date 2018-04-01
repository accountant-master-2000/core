/* global Chart */

(function () {
  class AM2Graph extends window.HTMLElement {
    get _chartColors () {
      return [
        'rgb(255, 99, 132)',
        'rgb(255, 159, 64)',
        'rgb(255, 205, 86)',
        'rgb(75, 192, 192)',
        'rgb(54, 162, 235)',
        'rgb(153, 102, 255)',
        'rgb(201, 203, 207)'
      ]
    }
    get _randColor () {
      const rand = Math.round(Math.random() * this._chartColors.length)
      if (this.randControl[rand] === undefined) {
        this.randControl[rand] = {}
        return this._chartColors[rand]
      } else {
        if (Object.keys(this.randControl).length >= this._chartColors.length) {
          this.randControl = {}
        }
        return this._randColor
      }
    }

    constructor () {
      super()

      this.randControl = {}
      this._graph = null
    }

    get storeId () { return this.getAttribute('store-id') }

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
      const template = document.currentScript.ownerDocument.querySelector('#am2-graph-template')
      if (template !== null) {
        const instance = template.content.cloneNode(true)
        this.appendChild(instance)

        this._toggleGraph()
        this._refreshData()
      }

      this.addEventListener('click', this._onClick)
    }

    disconnectedCallback () {
      this.removeEventListener('click', this._onClick)
    }

    _onClick (event) {
      event.preventDefault()
      switch (event.target.type) {
        case 'submit':
          this._refreshData()
          break
        case 'button':
          this._toggleGraph()
          break
      }
    }

    _toggleGraph () {
      const graph = this.querySelector('div.graph-container')
      graph.style.display = graph.style.display === 'none' ? 'block' : 'none'
    }

    _refreshData () {
      const graphData = this._graphData()

      let ctx = document.querySelector('canvas.graph-canvas').getContext('2d')
      this._graph = new Chart(ctx, {
        type: 'bar',
        data: graphData,
        options: {
          title: {
            display: true,
            text: 'Accountant Master 2000 - Accounts'
          },
          tooltips: {
            mode: 'index',
            intersect: false
          },
          responsive: true,
          scales: {
            xAxes: [{
              stacked: true
            }],
            yAxes: [{
              stacked: true
            }]
          }
        }
      })
    }

    _graphData () {
      function applyLabels (ref, labels, transactions) {
        const dataByLabel = []
        labels.forEach((l) => {
          let value = 0
          transactions.forEach((t) => {
            const tDate = new Date(t.date)
            if (tDate.getFullYear() !== ref.getFullYear()) return
            if (tDate.getMonth() !== ref.getMonth()) return
            if (tDate.getDate() !== l) return
            value += t.amount
          })
          dataByLabel.push(value)
        })
        return dataByLabel
      }

      const chartData = {
        labels: [],
        datasets: []
      }

      const today = new Date()
      const lastDay = new Date(today.getFullYear(), today.getMonth(), 0).getDate()
      for (let day = 1; day <= lastDay; day++) chartData.labels.push(day)

      this._store()._allAccounts().forEach((a) => {
        if (a === 'me') return
        const labelTransactions = this._store()._transactionsData({ account: a })
        const credits = []
        const debits = []

        labelTransactions.forEach((t) => {
          if (t.from === 'me') {
            debits.push(t)
          } else {
            credits.push(t)
          }
        })
        if (!credits.every((c) => c === 0)) {
          chartData.datasets.push({
            label: `${a} (Credit)`,
            backgroundColor: this._randColor,
            stack: 'Credit',
            data: applyLabels(today, chartData.labels, credits)
          })
        }
        if (!debits.every((c) => c === 0)) {
          chartData.datasets.push({
            label: `${a} (Debit)`,
            backgroundColor: this._randColor,
            stack: 'Debit',
            data: applyLabels(today, chartData.labels, debits)
          })
        }
      })
      return chartData
    }
  }

  if (!window.customElements.get('am2-graph')) window.customElements.define('am2-graph', AM2Graph)
})()
