import Image from "next/image";

export function HeadingTabs({files}:{files:{name:string,content:string}[]}){
  return (
    <div className="bg-[#191919] text-white text-sm h-fit">
      {files.map((file)=>
      <span key={file.name} className="px-4 max-w-24 flex justify-center items-center cursor-pointer hover:bg-white/10 py-2">
        <Image src={`/file-icons/${file.name.split('.').pop() || 'empty'}.svg`} alt="File Icon" width={20} height={20} className="mr-2 inline-block"/>
        {file.name}</span>)}
    </div>
  )
}