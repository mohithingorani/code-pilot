import Image from "next/image";


export const file_icons = ["js","cpp","java","md","py"];

// export const EDITOR_ICONS = file_icons.reduce((acc, icon) => {
//   acc[icon] = `/file-icons/${icon}.svg`;
//   return acc;
// }, {} as Record<string, string>);


export function HeadingTabs({files,onClick,selectedFile,splitFileIndex,onSplitFileClick}:{files:{name:string,content:string}[],onClick:(index:number)=>void,selectedFile:number,splitFileIndex?:number|null,onSplitFileClick?:(index:number)=>void}){
  return (
    <div className="border-b border-paper/10 bg-ink overflow-x-auto [&::-webkit-scrollbar]:hidden flex text-paper font-mono text-xs">
      {files.map((file, index) => (
        <button
          key={file.name}
          className={`relative px-4 w-fit flex justify-center items-center cursor-pointer py-2.5 whitespace-nowrap border-r border-paper/5 transition-colors ${
            index === selectedFile
              ? "bg-paper/[0.06] text-paper"
              : index === splitFileIndex
              ? "bg-paper/[0.03] text-acid"
              : "text-paper/55 hover:bg-paper/5 hover:text-paper/80"
          }`}
          onClick={() => {
            if (index === selectedFile && onSplitFileClick) {
              onSplitFileClick(index);
            } else if (index === splitFileIndex && onSplitFileClick) {
              onSplitFileClick(index);
            } else {
              onClick(index);
            }
          }}
          title={file.name}
        >
          <Image
            src={`/file-icons/${file.name.split(".").pop() && file_icons.includes(file.name.split(".").pop()!) ? file.name.split(".").pop() : "empty"}.svg`}
            alt="File Icon"
            width={18}
            height={18}
            className="mr-2 inline-block opacity-90"
          />
          <span>{file.name}</span>
          {index === selectedFile && (
            <span className="absolute left-0 right-0 bottom-0 h-[2px] bg-acid" />
          )}
          {index === splitFileIndex && (
            <span className="absolute left-0 right-0 top-0 h-[2px] bg-acid/60" />
          )}
        </button>
      ))}
    </div>
  )
}
