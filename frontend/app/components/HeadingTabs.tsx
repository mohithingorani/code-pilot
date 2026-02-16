import Image from "next/image";

export function HeadingTabs({files,onClick,selectedFile}:{files:{name:string,content:string}[],onClick:(index:number)=>void,selectedFile:number}){
  return (
    <div className="bg-[#191919] flex text-white text-sm h-fit">
      {files.map((file,index)=>
      <span key={file.name} className={`px-4 w-fit flex justify-center items-center cursor-pointer hover:bg-white/20 py-2 ${index === selectedFile ? 'bg-white/10' : ''}`} onClick={()=>onClick(index)}>
        <Image src={`/file-icons/${file.name.split('.').pop() || 'empty'}.svg`} alt="File Icon" width={20} height={20} className="mr-2 inline-block"/>
        {file.name}</span>)}
    </div>
  )
}