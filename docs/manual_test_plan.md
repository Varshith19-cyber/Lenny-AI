# Manual UI Test Plan (`docs/manual_test_plan.md`) — The Lenny Growth Assistant

---

## 1. Overview
This test plan defines the manual verification procedure for evaluating **The Lenny Growth Assistant** user interface, RAG retrieval quality, model toggle, Ship 30 essay generation, and HTML artifact viewer sandboxing.

---

## 2. Test Execution Matrix (22 Scenarios)

| # | Test Scenario | Action | Expected Behavior | Status |
|---|---|---|---|---|
| **1** | Open Application | Navigate to `http://localhost:3000` | Application loads with 3-pane layout, dark slate theme, empty chat state. | PASS |
| **2** | Create New Chat | Click "+ New Conversation" | Active chat resets, sidebar shows new conversation entry. | PASS |
| **3** | Grounded Q&A | Ask "What does Shreyas Doshi say about product strategy?" | Assistant returns grounded answer citing Shreyas Doshi's transcript with episode title & match score. | PASS |
| **4** | Verify Sources | Click "Grounded Transcript Sources (X)" accordion | Expandable citation cards display exact verbatim transcript excerpt & URL. | PASS |
| **5** | Follow-Up Question | Ask "How does that apply to the LNO framework?" | Assistant maintains session context and explains LNO framework tasks. | PASS |
| **6** | Independent Session | Create a 2nd chat session and ask about PLG | Session 2 maintains separate history from Session 1. | PASS |
| **7** | Context Isolation | Switch back to Session 1 | Session 1 history is restored accurately. | PASS |
| **8** | Switch to Ollama | Select "Ollama (Local)" in header | Provider switches to local model; active dot turns green/amber based on service status. | PASS |
| **9** | Local Inference | Ask a question with Ollama active | Response is generated via local Ollama provider. | PASS |
| **10** | Stop Ollama / Error | Stop Ollama server and send message | UI shows clean error banner: "Local model unavailable. Please start Ollama..." without stack trace. | PASS |
| **11** | Switch to Cloud | Select "Claude (Cloud)" in header | System switches provider to Anthropic Claude. | PASS |
| **12** | Ship 30 Essay Generation | Ask "Write a Ship 30 for 30 essay on product discovery" | Assistant generates ~1,250 word essay with 1-sentence hook, narrative structure, bullet points, and grounded claims. | PASS |
| **13** | Essay Bolding & Skimmability | Inspect generated essay formatting | Essay features selective bolding and skimmable section headers (`##`). | PASS |
| **14** | Essay Grounding | Check guest attribution in essay | Essay explicitly credits Marty Cagan / transcript insights. | PASS |
| **15** | Markdown Artifact | Request "Create a Markdown strategy framework" | Assistant generates artifact and triggers slide-out Artifact Viewer panel. | PASS |
| **16** | HTML Artifact | Request "Create a 1-page HTML strategy canvas" | Assistant generates complete HTML/CSS snippet; Artifact Viewer opens. | PASS |
| **17** | Sandboxed Preview | Click "Preview Mode" in Artifact Viewer | HTML canvas renders cleanly inside sandboxed `<iframe>`. | PASS |
| **18** | Code Mode Toggle | Click "Code Mode" in Artifact Viewer | Syntax-highlighted raw HTML source code is displayed. | PASS |
| **19** | Unsafe HTML Injection | Attempt prompt with `<script>alert('xss')</script>` | Bleach sanitizer removes script tag; iframe sandbox prevents execution. | PASS |
| **20** | Responsive Design | Resize browser window to mobile/tablet width | Sidebar and Artifact Viewer collapse cleanly into responsive drawer. | PASS |
| **21** | Empty States | Inspect chat view when session has no messages | Displays title, welcome description, and quick-action prompt chips. | PASS |
| **22** | Error Recovery | Send request with invalid payload | Error state displays clean error notification card. | PASS |
