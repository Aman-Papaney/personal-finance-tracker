export interface User {
	_id: string
	name: string
	email: string
}

export interface Expense {
	_id: string
	user: string
	amount: number
	category: string
	date: string
	paymentMethod: string
	description: string
}

export interface Budget {
	_id?: string
	user: string
	category: string
	monthlyLimit: number
}
