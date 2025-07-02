// const BASE_URL = "http://localhost:3000/api"
const BASE_URL = "https://personal-finance-tracker-backend-rfyp.onrender.com"

export async function fetchApi(endpoint: string, options: RequestInit = {}, auth: boolean = true) {
	const token = localStorage.getItem("token")
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		...((options.headers && typeof options.headers === "object" && !Array.isArray(options.headers) ? options.headers : {}) as Record<string, string>),
	}
	if (auth && token) headers["Authorization"] = `Bearer ${token}`
	const res = await fetch(BASE_URL + endpoint, {...options, headers})
	const data = await res.json().catch(() => ({}))
	if (!res.ok) throw {response: {data}}
	return data
}

// Call Flask service for suggestions
export async function fetchSuggestions(expenses: any[]) {
	// Flask service runs on port 5000 by default
	const FLASK_URL = "http://localhost:5000/suggestions"
	const res = await fetch(FLASK_URL, {
		method: "POST",
		headers: {"Content-Type": "application/json"},
		body: JSON.stringify({expenses}),
	})
	if (!res.ok) throw new Error("Failed to fetch suggestions")
	return res.json()
}
