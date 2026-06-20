class ChatMemory:

    def __init__(self):
        self.sessions = {}

    def get_history(self, session_id):
        return self.sessions.get(session_id, {}).get("messages", [])

    def add_message(self, session_id, role, content):

        if session_id not in self.sessions:
            self.sessions[session_id] = {"messages": [], "farm": None}

        self.sessions[session_id]["messages"].append({
            "role": role,
            "content": content
        })

        # limit history
        self.sessions[session_id]["messages"] = \
            self.sessions[session_id]["messages"][-5:]

    # 🔥 NEW
    def set_farm_context(self, session_id, farm_data):
        if session_id not in self.sessions:
            self.sessions[session_id] = {"messages": [], "farm": None}

        self.sessions[session_id]["farm"] = farm_data

    def get_farm_context(self, session_id):
        return self.sessions.get(session_id, {}).get("farm")


chat_memory = ChatMemory()