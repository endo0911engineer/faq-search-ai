const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function signup(email: string, username: string, password: string) {
  const res = await fetch(`${BASE_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password }),
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`Signup failed: ${errorText}`)
  }

  return res.json()
}

export async function signin(email: string, password: string): Promise<{ token: string }> {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`Login failed: ${errorText}`)
  }

  const data = await res.json()
  if (!data.token) throw new Error('No token received')

  return data
}

export async function fetchFAQs(token: string) {
  const res = await fetch(`${BASE_URL}/faqs`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error("Failed to fetch FAQs")
  return res.json()
}

export async function createFAQ(token: string, question: string, answer: string) {
  const res = await fetch(`${BASE_URL}/faqs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ question, answer }),
  })
  if (!res.ok) throw new Error("Failed to create FAQ")
}

export async function updateFAQ(token: string, id: string, question: string, answer: string) {
  const res = await fetch(`${BASE_URL}/faqs/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ question, answer }),
  })
  if (!res.ok) throw new Error("Failed to update FAQ")
}

export async function deleteFAQ(token: string, id: string) {
  const res = await fetch(`${BASE_URL}/faqs/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error("Failed to delete FAQ")
  return
}

export async function askFAQ(token: string, question: string) {
  const res = await fetch(`${BASE_URL}/faqs/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ question }),
  })
  if (!res.ok) throw new Error("Failed to get FAQ answer")
  return res.json()
}