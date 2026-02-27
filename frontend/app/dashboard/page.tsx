import NavBar from "@/components/NavBar";
import Image from "next/image";

export default function Dashboard() {
  return (
   <div className="h-full bg-[#EFEBE3] w-full p-6">
    <div className="absolute top-[-5] select-none right-[10] bottom-0">
        
        <Image src={"/effects/effect1.svg"} className="w-full h-full" width={"100"} height={"400"} alt="effect1"/>
    </div>
       <div className="absolute top-[-5] select-none left-0 bottom-0">
        
        <Image src={"/effects/effect2.svg"} className="w-full h-full" width={"100"} height={"400"} alt="effect1"/>
    </div>
    <div className="h-full w-full bg-white/30 border border-white rounded-2xl shadow-2xl overflow-hidden">
    <NavBar/>
    <div className="flex justify-between w-full h-full ">
        <div className=" pl-16 w-full h-full flex flex-col justify-center gap-4">
            {/* <div className="bg-[#D5EEC6] text-[#244030] px-3 py-2 text-sm rounded-full w-fit">POWERED BY R2</div> */}
            <div className="flex flex-col text-[#142E38] text-7xl font-extrabold">
                <div>
               Build Faster.
                </div>
                <div>
                Ship Faster.
                </div>
            </div>
            <div className="text-[#142E38] font-light text-lg">An online IDE built for modern developers who want speed, simplicity, and collaboration.</div>
           <button className="bg-[#318161] rounded-md mt-8 px-4 py-2 w-fit text-white">
                START NOW
            </button>

        </div>
        <div className="w-full h-full p-24">
            <div className="w-full h-full relative">

            <Image src={"/assistant.svg"} fill alt="assistant"/>
            </div>
        </div>
    </div>
    </div>

   </div>
  );
}