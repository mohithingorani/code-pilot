import Image from "next/image";


export const file_icons = ["js","cpp","java","md","py"];

// export const EDITOR_ICONS = file_icons.reduce((acc, icon) => {
//   acc[icon] = `/file-icons/${icon}.svg`;
//   return acc;
// }, {} as Record<string, string>);


export function HeadingTabs({files,onClick,selectedFile}:{files:{name:string,content:string}[],onClick:(index:number)=>void,selectedFile:number}){
  return (
    <div className="bg-[#191919]/80 overflow-x-scroll [&::-webkit-scrollbar]:hidden flex text-white text-sm h-fit">
      {files.map((file,index)=>
      <span key={file.name} className={`px-4 w-fit flex justify-center items-center cursor-pointer hover:bg-white/20 py-2 ${index === selectedFile ? 'bg-white/10' : ''}`} onClick={()=>onClick(index)}>
        <Image src={`/file-icons/${file.name.split('.').pop() && file_icons.includes(file.name.split('.').pop()!) ? file.name.split('.').pop() : 'empty'}.svg`} alt="File Icon" width={20} height={20} className="mr-2 inline-block"/>
        {file.name}</span>)}
    </div>
  )
}