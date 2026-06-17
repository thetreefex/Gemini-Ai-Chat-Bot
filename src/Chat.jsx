import { useState } from "react"
function Chat() {
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState("")
    const [loading,setLoading] = useState(false)
    const [model, setModel] = useState("gemini-2.5-flash")
    const [chatId] = useState(() => {
        let id = localStorage.getItem("chatId")
        if (!id) {
            id = crypto.randomUUID()
            localStorage.setItem("chatId", id)
        }
        return id
    })
    const sendMessage = async () => {
        try {setLoading(true)
        const res = await fetch("https://gemini-ai-chat-bot-qkbt.onrender.com/chat",{
            method:"POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({message: input,chatId,model})
        })
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`)
        }
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let fulltext = ""
        setMessages([...messages, { text: input, from: "user" }, { text: "", from: "ai" }])
        while (true) {
            const {done,value} = await reader.read()
            if (done === true) break
            const chunk = decoder.decode(value)
            fulltext += chunk
            setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { text: fulltext, from: "ai" }
                return updated
            })
        }
        setLoading(false)}
        catch(err) {
            console.error(err)
            setLoading(false)
            setMessages(prev => [...prev, { text: "Server Error", from: "ai" }])
        }
    }

    return (
    <div className="chat-container">
        <div className="messages">
            {messages.map((msg, index) => (
        <div
        key={index}
        className={`message ${msg.from}`}
        >
            {msg.text}
            </div>
        ))}
        {loading && <p>Gemini typing...</p>}
        </div>
        <div className="input-area">
            <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                <option value="gemini-3-flash-preview">Gemini 3 Flash</option>
                <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite</option>
                <option value="gemini-3.5-flash">Gemini 3.5 Flash</option>
                </select>
                <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Write Message..."
                />
                <button
                disabled={loading}
                onClick={sendMessage}
                >
                    Send
                    </button>
                    </div>
                    </div>
                    )
}

export default Chat