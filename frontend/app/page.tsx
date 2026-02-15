"use client";
import Editor from "@monaco-editor/react";
import { useEffect, useRef, useState, } from "react";
import type { editor as MonacoEditor } from "monaco-editor";
import XTerminal from "./components/Terminal";
import { useSocket } from "./hooks/websocket";
import Image from "next/image";
import { EDITOR_ICONS } from "./data";

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
    if(!connected || !socket || !files.length) return;
    files[0].content = currentVal || files[0].content;
    const sendCode = setTimeout(()=>{
      socket.send(JSON.stringify({type:"files",payload:{files}}))
    },1000)

    return () => clearTimeout(sendCode);
  },[currentVal,connected])

  const handleEditorWillMount = (monaco:typeof import("monaco-editor")) => {
    monaco.editor.defineTheme('my-custom-theme', {
      base: 'vs-dark', 
      inherit: true, 
      rules: [
        { token: '', foreground: 'FFFFFF', background: '222222' },
        { token: 'keyword', foreground: '569CD6' },
        { token: 'identifier', foreground: '9CDCFE' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },  
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
      ],
      colors: {
        'editor.background': '#222222', // Set the background color here
      },
    });
  };


  useEffect(()=>{
    if(!socket) return;
    console.log("Setting up socket listeners");


    

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
  <div className="w-full h-full flex justify-center items-center py-12">
    <div className=" w-5xl h-full rounded-lg  flex flex-start overflow-hidden ">
      <div className="w-xs text-white bg-black/50 py-2  backdrop-filter backdrop-blur-md ">
      <div className="flex justify-center items-center font-medium text-lg">Editor</div>
      <div><EditorOptions/></div>
      </div>
      <div className="w-full max-h-full relative ">
        {headingTabs(files)}
        <div className=" w-full">
          <Editor onChange={handleEditorDidChange} beforeMount={handleEditorWillMount} height={"83vh"}   className="w-full " value={currentVal || ""} defaultLanguage={"python"}  theme="my-custom-theme" onMount={handleEditorDidMount}/>
        </div>
         <div className="absolute overflow-scroll z-100 bottom-0 max-h-64 w-full bg-black p-3">
        <XTerminal socket={socket}/>

      </div>
      </div>
     
    </div>
  </div>
)
}



export default Home;


function headingTabs(files:{name:string,content:string}[]){
  return (
    <div className="bg-[#191919] text-white text-sm h-fit">
      {files.map((file)=>
      <span key={file.name} className="px-4 max-w-24 flex justify-center items-center cursor-pointer hover:bg-white/10 py-2">
        <Image src={`/file-icons/${file.name.split('.').pop() || 'empty'}.svg`} alt="File Icon" width={20} height={20} className="mr-2 inline-block"/>
        {file.name}</span>)}
    </div>
  )
}

function EditorOptions(){
  return (

      <div className="flex gap-4 w-full justify-center py-4">
        {EDITOR_ICONS.map((icon)=>
        <button key={icon.icon_name}  className="p-2 hover:bg-white/10 rounded">
        <Image src={icon.href} alt={icon.icon_name} width={25} height={25}/>
        </button>)}
      </div>
  )
}