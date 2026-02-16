"use client";
import Editor from "@monaco-editor/react";
import { useEffect, useRef, useState, } from "react";
import type { editor as MonacoEditor } from "monaco-editor";
import XTerminal from "./components/Terminal";
import { useSocket } from "./hooks/websocket";
import Image from "next/image";
import { EDITOR_ICONS } from "./data";
import { HeadingTabs } from "./components/HeadingTabs";
import getLanguageFromFileName from "./utils/languageSupport";
import FileStructure from "./components/FileStructure";

const Home = () => {

  const { socket, connected } = useSocket();

  const [currentVal,setCurrentVal] = useState<string | null>(null)
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null)
  const [files, setFiles] = useState<{name:string,content:string}[] >([])
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState<string>("");

  function handleEditorDidMount(editor :MonacoEditor.IStandaloneCodeEditor, monaco:typeof import("monaco-editor")){
    editorRef.current = editor;
  }

  function handleEditorDidChange(value:string | undefined){
    if(!value || !socket) return;
    setCurrentVal(value)
  }



useEffect(() => {
  if (!connected || !socket || !files.length) return;

  const updatedFiles = files.map((file, index) => {
    if (index === selectedFileIndex) {
      return {
        ...file,
        content: currentVal?.endsWith("\n") ? currentVal : currentVal + "\n",
      };
    }
    return file;
  });

  const sendCode = setTimeout(() => {
    socket.send(
      JSON.stringify({
        type: "files",
        payload: { files: updatedFiles },
      })
    );
  }, 800);

  return () => clearTimeout(sendCode);
}, [currentVal]);


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
          const newFiles = parsed.payload.files as {name:string,content:string}[];
          
          setFiles(newFiles);

          if(newFiles.length > 0){
            setCurrentVal(newFiles[0].content);
            setSelectedFileIndex(0);
            setCurrentLanguage(getLanguageFromFileName(newFiles[0].name));
          }
        }
      }
    };
    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
      
    };
  },[socket])

  function handleClick(index:number){
    setSelectedFileIndex(index);
    setCurrentVal(files[index].content)
    setCurrentLanguage(getLanguageFromFileName(files[index].name));
  }

return (
  <div className="w-full min-h-screen flex justify-center items-center py-12 px-6">
    <div className="max-w-5xl h-[90vh] rounded-lg  grid grid-cols-7 overflow-hidden ">
      
      <div className="col-span-2 w-full text-white bg-black/50 py-2  backdrop-filter backdrop-blur-md ">
        <div className="flex justify-center items-center font-medium text-lg">Editor</div>
        <div><EditorOptions/></div>
        <div>
          <FileStructure selected={selectedFileIndex} onClick={handleClick} files={files}/>
        </div>
      </div>

      <div className="col-span-5 w-full max-h-full relative ">
        <HeadingTabs selectedFile={selectedFileIndex} files={files} onClick={ handleClick}/>
        <div className=" w-full bg-[#222222] pt-4">
          <Editor options={{
            wordWrap:"on"
          }} onChange={handleEditorDidChange} beforeMount={handleEditorWillMount} height={"83vh"}   className="w-full " value={currentVal || ""} language={currentLanguage} theme="my-custom-theme" onMount={handleEditorDidMount}/>
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