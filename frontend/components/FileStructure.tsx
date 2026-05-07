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
    <div className="px-3">
      <Row
        noHover
        name="Workspace"
        className={"font-semibold text-white/90 hover:bg-transparent"}
        src="/folder_icons/empty.svg"
      />

      <div className="px-4 mt-1">
        {files.map((file, index) => (
          <Row
            removeFile={() => removeFile(file.name)}
            className={
              selected === index
                ? "bg-white/10 border-l-2 border-sky-400/70"
                : "border-l-2 border-transparent"
            }
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
      className={`flex group select-none items-center gap-2 ${
        !noHover && "hover:bg-white/10"
      } px-2 py-1.5 rounded-md cursor-pointer text-sm text-white/85 ${className}`}
      title={name}
    >
      <Image
        src={
          src ??
          `/file-icons/${name.split(".").pop() && file_icons.includes(name.split(".").pop()!) ? name.split(".").pop() : "empty"}.svg`
        }
        alt="File Icon"
        width={20}
        height={20}
        className="inline-block opacity-90 shrink-0"
      />
      <div className="whitespace-nowrap">{name}</div>
      {!noHover && (
        <div className="flex justify-end w-full">
          <Image
            onClick={(e) => {
              e.stopPropagation();
              removeFile?.();
            }}
            className="opacity-0 group-hover:opacity-60 hover:opacity-100 transition-opacity"
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
