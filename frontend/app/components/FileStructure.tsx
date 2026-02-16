"use client"
import Image from "next/image";
import { file_icons } from "./HeadingTabs";


export default function FileStructure({files,onClick,selected}:{files:{name:string,content:string}[], onClick:(index:number)=>void,selected:number}){ 
    return <div className="px-4">
        
        <Row noHover name="Workspace" className={"font-bold hover:bg-transparent"}  src="/folder_icons/empty.svg"/>
        
        <div className="px-6">
            {files.map((file,index)=>
                <Row className={selected==index?"bg-white/10":""} onClick={()=>onClick(index)} name={file.name} key={index}/>
            )}
        </div>

    </div>
    
}

export function Row({name,src,className,onClick,noHover}:{name:string,src?:string,className?:string,onClick?:()=>void,selected?:number,noHover?:boolean}){
    return <div onClick={onClick} className={`flex select-none ${!noHover&&"hover:bg-white/20"} p-1 cursor-pointer ${className}`}>
            <Image src={src ??`/file-icons/${name.split('.').pop() && file_icons.includes(name.split('.').pop()!) ? name.split('.').pop() : 'empty'}.svg`} alt="File Icon" width={20} height={20} className="mr-2 inline-block"/>
            <div>{name}</div>
        </div>
}