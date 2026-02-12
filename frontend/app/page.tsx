"use client";
import Editor from "@monaco-editor/react";
import { use, useEffect, useRef, useState, } from "react";
import type { editor as MonacoEditor } from "monaco-editor";
import XTerminal from "./components/Terminal";
import { useSocket } from "./hooks/websocket";

const Home = () => {

  const socket = useSocket();
  const [currentVal,setCurrentVal] = useState("")
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null)

  function handleEditorDidMount(editor :MonacoEditor.IStandaloneCodeEditor, monaco:typeof import("monaco-editor")){
    editorRef.current = editor;
  }

  function handleEditorDidChange(value:string | undefined){
    if(!value || !socket) return;
    setCurrentVal(value)
  }

  useEffect(()=>{
    if(!socket) return;
    const sendCode = setTimeout(()=>{
      socket.send(JSON.stringify({type:"code",data:currentVal}))
    },1000)

    return () => clearTimeout(sendCode);
  },[currentVal,socket])


 
  return (
    <div className="h-full w-full">
    <div className="flex h-full justify-start  w-full" >
      <div className="min-w-xs">files</div>
    <div className="h-full">
      {/* <div onKeyDown={(e)=>{ e.key=="Enter"&& socket?.send(currentVal)}}> */}
    <div>
    <Editor onChange={handleEditorDidChange}  height={"70vh"} className="min-w-xl h-full"  defaultLanguage="python" defaultValue={"# print Hello World"} theme="vs-dark" onMount={handleEditorDidMount}/>
    </div>
    </div>
    </div>
    <div>
      {<XTerminal socket={socket}/>}

    </div>
      </div>
  );
};

export default Home;