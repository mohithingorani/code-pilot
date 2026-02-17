"use client";
import Image from "next/image";
import { file_icons } from "./HeadingTabs";

export default function FileStructure({
  files,
  onClick,
  selected,
  removeFile,
}: {
  files: { name: string; content: string }[];
  onClick: (index: number) => void;
  selected: number;
  removeFile: (name: string) => void;
}) {
  return (
    <div className="px-4">
      <Row
        noHover
        name="Workspace"
        className={"font-bold hover:bg-transparent"}
        src="/folder_icons/empty.svg"
      />

      <div className="px-6">
        {files.map((file, index) => (
          <Row
            removeFile={() => removeFile(file.name)}
            className={selected == index ? "bg-white/10" : ""}
            onClick={() => onClick(index)}
            name={file.name}
            key={index}
          />
        ))}
      </div>
    </div>
  );
}

export function Row({
  name,
  src,
  className,
  onClick,
  noHover,
  removeFile,
}: {
  name: string;
  src?: string;
  className?: string;
  onClick?: () => void;
  selected?: number;
  noHover?: boolean;
  removeFile?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex group select-none ${!noHover && "hover:bg-white/20"} p-1 cursor-pointer ${className}`}
    >
      <Image
        src={
          src ??
          `/file-icons/${name.split(".").pop() && file_icons.includes(name.split(".").pop()!) ? name.split(".").pop() : "empty"}.svg`
        }
        alt="File Icon"
        width={20}
        height={20}
        className="mr-2 inline-block"
      />
      <div>{name}</div>
      {!noHover && (
        <div className="flex hover:opacity-90 justify-end w-full">
          <Image
            onClick={(e) => {
              e.stopPropagation();
              removeFile?.();
            }}
            className="opacity-0   group-hover:opacity-50 hover:opacity-100"
            src={"/remove.svg"}
            width={18}
            height={18}
            alt="remove"
          />
        </div>
      )}
    </div>
  );
}
