"use client"

import { useEffect } from "react"

export default function DotBackground() {

  useEffect(() => {
    const move = (e: MouseEvent) => {
      document.documentElement.style.setProperty(
        "--mouse-x",
        `${e.clientX}px`
      )

      document.documentElement.style.setProperty(
        "--mouse-y",
        `${e.clientY}px`
      )
    }

    window.addEventListener("mousemove", move)

    return () => window.removeEventListener("mousemove", move)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden">

      {/* gradient base */}
      <div className="absolute inset-0 bg-linear-to-b from-neutral-900 via-black to-black" />

      {/* dot grid */}
      {/* <div
        className="absolute inset-0 opacity-40 dot-mask"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 2px)",
          backgroundSize: "19px 19px",
        }}
      /> */}

      noise texture
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url('https://grainy-gradients.vercel.app/noise.svg')",
        }}
      />

    </div>
  )
}