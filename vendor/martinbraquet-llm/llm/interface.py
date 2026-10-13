import tkinter as tk
from tkinter import scrolledtext

from llm.sample import Sampler, DEFAULT_PROMPT


class UserInterface:
    def __init__(self, model_path, model_kw=None, text_kw=None):
        self.sampler = Sampler(model_path=model_path, **(model_kw or {}))
        self.text_kw = text_kw or {}

        # Set up the main application window
        self.root = tk.Tk()
        self.root.title(f"Chat with the {self.name} LLM")
        self.root.geometry("600x400")

        # Chat display window (read-only)
        self.chat_window = scrolledtext.ScrolledText(self.root, wrap=tk.WORD, state=tk.DISABLED, width=60, height=20)
        self.chat_window.pack(pady=10)
        self.chat_window.tag_config("you_tag", foreground="blue", font=("Helvetica", 8, "bold"))

        # Entry box for user input
        self.user_entry = tk.Entry(self.root, width=50)
        self.user_entry.pack(pady=10)

        self.user_entry.bind("<Return>", self.handle_send)

        # Button to send the message
        send_button = tk.Button(self.root, text="Send", command=self.handle_send)
        send_button.pack()

    def run(self):
        """
        Run the Tkinter event loop
        """
        self.root.mainloop()

    def handle_send(self, event=None):
        user_input = self.user_entry.get()

        if not user_input:
            user_input = DEFAULT_PROMPT

        should_handle = True  # user_input.strip()
        if should_handle:
            # Display user input
            self.chat_window.config(state=tk.NORMAL)
            self.chat_window.insert(tk.END, "You: " + user_input + "\n", "you_tag")

            # Clear the entry box after sending message
            self.user_entry.delete(0, tk.END)

            # Bot response (this can be expanded or connected to an AI model)
            bot_response = self.get_bot_response(user_input)
            self.chat_window.insert(tk.END, "Bot: " + bot_response + "\n")

            self.chat_window.yview(tk.END)  # Auto scroll to the bottom
            self.chat_window.config(state=tk.DISABLED)

    def get_bot_response(self, user_input):
        return self.sampler.generate_text(prompt=user_input, **self.text_kw)

    @property
    def name(self):
        return self.sampler.model_name
