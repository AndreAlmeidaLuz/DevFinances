const Modal = {
	open() {
		//Abrir modal
		//adicionar a classe active ao modal
		document.querySelector('.modal-overlay').classList.add('active')
	},
	close() {
		//Fechar modal
		//Remover a classe activr no modal
		document.querySelector('.modal-overlay').classList.remove('active')
	},
}
//=========================================================================//
const Storage = {
	get() {
		return (
			JSON.parse(localStorage.getItem('dev.finances:transactions')) || []
		)
	},
	set(transactions) {
		localStorage.setItem(
			'dev.finances:transactions',
			JSON.stringify(transactions),
		)
	},
}
//=====Calculando os valores===================//
const Transaction = {
	all: Storage.get(),

	add(transaction) {
		Transaction.all.push(transaction)
		App.reload()
	},

	remove(index) {
		Transaction.all.splice(index, 1)

		App.reload()
	},

	incomes() {
		let income = 0
		//somar as entradas
		//pegar todas as transacoes
		//para cada transacao
		Transaction.all.forEach((transaction) => {
			//se for maior que zero
			if (transaction.amount > 0) {
				// somar a uma variavel e retornar a variavel
				income += transaction.amount
			}
		})

		return income
	},

	expenses() {
		let expense = 0
		//somar as entradas
		//pegar todas as transacoes
		//para cada transacao
		Transaction.all.forEach((transaction) => {
			//se for maior que zero
			if (transaction.amount < 0) {
				// somar a uma variavel e retornar a variavel
				expense += transaction.amount
			}
		})

		return expense
	},

	total() {
		//entradas - saidas
		return Transaction.incomes() + Transaction.expenses()
	},
}

const DOM = {
	transactionsContainer: document.querySelector('#data-table tbody'),
	addTransaction(transaction, index) {
		console.log(transaction)
		const tr = document.createElement('tr')
		tr.innerHTML = DOM.innerHTMLtransaction(transaction, index)
		tr.dataset.index = index

		DOM.transactionsContainer.appendChild(tr)
	},

	innerHTMLtransaction(transaction, index) {
		const CSSclass = transaction.amount > 0 ? 'income' : 'expense'

		const amount = Utils.formatCurrency(transaction.amount)

		const html = `
			<td class="description">${transaction.description}</td>
			<td class="${CSSclass}">${amount}</td>
			<td class="date">${transaction.date}</td>
			<td>
				<img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação" />
			</td>
			`
		return html
	},

	//---------------mostrando valores de entrada. saida e total---------------------
	updateBalance() {
		document.getElementById('incomeDisplay').innerHTML =
			Utils.formatCurrency(Transaction.incomes())

		document.getElementById('expenseDisplay').innerHTML =
			Utils.formatCurrency(Transaction.expenses())

		document.getElementById('totalDisplay').innerHTML =
			Utils.formatCurrency(Transaction.total())
	},

	clearTransactions() {
		DOM.transactionsContainer.innerHTML = ''
	},
}

//======Adicionando sinal e moeda brasileira
const Utils = {
	formatAmount(value) {
		value = Number(value) * 100

		return value
	},

	formatDate(date) {
		const splitteDate = date.split('-')

		return `${splitteDate[2]}/ ${splitteDate[1]}/ ${splitteDate[0]}`
	},

	formatCurrency(value) {
		const signal = Number(value) < 0 ? '-' : '' //adicionando sinal

		value = String(value).replace(/\D/g, '')

		value = Number(value) / 100

		value = value.toLocaleString('pt-BR', {
			style: 'currency',
			currency: 'BRL',
		})

		return signal + value
	},
}

const Form = {
	description: document.querySelector('input#description'),
	amount: document.querySelector('input#amount'),
	date: document.querySelector('input#date'),

	getValues() {
		return {
			description: Form.description.value,
			amount: Form.amount.value,
			date: Form.date.value,
		}
	},

	//verifcar se possui campos em branco
	validateField() {
		const { description, amount, date } = Form.getValues()

		if (
			description.trim() === '' ||
			amount.trim() === '' ||
			date.trim() === ''
		) {
			throw new Error('Por favor preencha todos os campos!')
		}
	},

	formatValues() {
		let { description, amount, date } = Form.getValues()
		amount = Utils.formatAmount(amount)

		date = Utils.formatDate(date)

		return {
			description: description,
			amount: amount,
			date: date,
		}
	},

	saveTransaction(transaction) {
		Transaction.add(transaction)
	},

	clearFields() {
		Form.description.value = ''
		Form.amount.value = ''
		Form.date.value = ''
	},

	submit(event) {
		event.preventDefault()

		try {
			//verificar se todas as informações foram preenchidas
			Form.validateField()
			//formatar os dados para salvar
			const transaction = Form.formatValues()
			//salvar
			Form.saveTransaction(transaction)
			//apagar os dados do formulario
			Form.clearFields()
			//fechar modal
			Modal.close()
		} catch (error) {
			alert(error.message)
		}
	},
}

const App = {
	init() {
		Transaction.all.forEach(function (transaction, index) {
			DOM.addTransaction(transaction, index)
		})

		DOM.updateBalance()

		Storage.set(Transaction.all)
	},
	reload() {
		DOM.clearTransactions()
		App.init()
	},
}

App.init()
