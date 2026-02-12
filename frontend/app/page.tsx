"use client";
import Editor from "@monaco-editor/react";
import { useEffect, useRef, useState, } from "react";
import type { editor as MonacoEditor } from "monaco-editor";
import XTerminal from "./components/Terminal";
import { useSocket } from "./hooks/websocket";

const Home = () => {

  const { socket, connected } = useSocket();
  const [currentVal,setCurrentVal] = useState<string | null>(null)
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null)
  const [files, setFiles] = useState<{name:string,content:string}[] >([])

  function handleEditorDidMount(editor :MonacoEditor.IStandaloneCodeEditor, monaco:typeof import("monaco-editor")){
    editorRef.current = editor;
  }

  function handleEditorDidChange(value:string | undefined){
    if(!value || !socket) return;
    setCurrentVal(value)
  }


  useEffect(()=>{
    if(!connected || !socket) return;
    const sendCode = setTimeout(()=>{
      socket.send(JSON.stringify({type:"code",data:currentVal}))
    },1000)

    return () => clearTimeout(sendCode);
  },[currentVal,connected])

  useEffect(()=>{
    if(!socket) return;
    console.log("Setting up socket listeners");
    // socket.onmessage = (event) => {
    //   console.log("Received message:", event.data);
    //   if(typeof event.data === "string") {
    //     const parsed = JSON.parse(event.data);
    //     console.log("Received message:", parsed);
    //     if(parsed.type === "files") {
    //       console.log("Received files:", parsed.data);
    //       setFiles(parsed.data);
    //     }
    //   }
    // };

    const handleMessage =  (event:MessageEvent<string>) => {
      console.log("Received message:", event.data);
      if(typeof event.data === "string") {
        const parsed = JSON.parse(event.data);
        console.log("Received message:", parsed);
        if(parsed.type === "files") {
          console.log("Received files:", parsed.data);
          setFiles(parsed.data);
          setCurrentVal(parsed.data[0].content);


        }
      }
    };
    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
      
    };
  },[socket])



 
  return (
    <div>
    {(!socket || files.length === 0 ) && <div className="w-full z-50 h-full bg-white">Loading...</div>}
    <div className="h-full w-full">
      
    <div className="flex h-full justify-start  w-full" >
    <div>
      {files &&files.map((file)=><div key={file.name}>
        <h3>{file.name}</h3>
      </div>)}
    </div>    <div className="h-full">
      {/* <div onKeyDown={(e)=>{ e.key=="Enter"&& socket?.send(currentVal)}}> */}
    <div>
    {currentVal!=null && <Editor onChange={handleEditorDidChange}  height={"70vh"} className="min-w-xl h-full" value={currentVal} defaultLanguage={"python"}  theme="vs-dark" onMount={handleEditorDidMount}/>}
    </div>
    </div>
    </div>
    <div className="z-10">
      {<XTerminal socket={socket}/>}
    </div>

      </div>
      </div>
  );
};

export default Home;