import NavBar from "@/components/NavBar";
import Image from "next/image";

export default function Dashboard() {
  return (
    <div className="h-screen bg-[#EFEBE3] w-full p-4 sm:p-6 overflow-hidden relative">

      {/* Background Effects */}
      <div className="absolute top-0 right-0 bottom-0 select-none pointer-events-none hidden lg:block">
        <Image
          src="/effects/effect1.svg"
          width={100}
          height={400}
          alt="effect1"
          className="h-full w-auto"
        />
      </div>

      <div className="absolute top-0 left-0 bottom-0 select-none pointer-events-none hidden lg:block">
        <Image
          src="/effects/effect2.svg"
          width={100}
          height={400}
          alt="effect2"
          className="h-full w-auto"
        />
      </div>

      <div className="h-full w-full bg-white/30 border border-white rounded-2xl shadow-2xl overflow-hidden">
        <NavBar />

        <div className="flex flex-col lg:flex-row justify-between items-center w-full h-[calc(100%-72px)] px-6 sm:px-12">

          {/* LEFT SECTION */}
          <div className="w-full flex flex-col justify-center gap-4 lg:pl-16 pt-24 lg:pt-0 text-center lg:text-left">

            <div className="flex flex-col  text-[#142E38] font-extrabold leading-tight">
              <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
                Build Faster.
              </span>
              <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
                Ship Faster.
              </span>
            </div>

            <div className="text-[#142E38] font-light text-base sm:text-lg max-w-xl mx-auto lg:mx-0">
              An online IDE built for modern developers who want speed,
              simplicity, and collaboration.
            </div>

            <button className="bg-[#318161] rounded-md mt-6 px-6 py-3 w-fit text-white mx-auto lg:mx-0">
              START NOW
            </button>
          </div>

          {/* RIGHT SECTION — Desktop Only */}
          <div className=" lg:flex w-full h-full md:p-4 lg:p-16">
            <div className="relative w-full h-full">
              <Image
                src="/assistant.svg"
                fill
                alt="assistant"
                className="object-contain"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}