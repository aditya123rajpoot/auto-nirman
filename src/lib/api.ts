export async function sendMessageToAI(message: string): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    throw new Error("Failed to connect to AI");
  }

  const data = await res.json();
  return data.response;
}
