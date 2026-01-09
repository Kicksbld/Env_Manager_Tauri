import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <h1 className="text-4xl font-bold text-emerald-400">
        Hello Tailwind v4 + Tauri
      </h1>
    </div>
  );
}

export default App;
