import Image from "next/image";

export default function NavBar() {
  return (
    <div className="w-full flex justify-between items-center relative px-4 sm:px-6 py-4">

      <div className="text-[#435151] text-lg sm:text-xl font-bold">
        Code Pilot
      </div>

      <div className="hidden md:flex gap-8 text-[#142F38] font-medium">
        <button>About Us</button>
        <button>Contact Us</button>
      </div>

      <div className="h-full text-white">
        <button className="absolute z-0 h-full bg-[#142E38] flex justify-center items-center px-6 sm:px-10 top-0 right-0 w-fit rounded-bl-xl gap-3">
          <div>
            <Image
              src="/navbar/profile.svg"
              width={18}
              height={18}
              alt="profile"
            />
          </div>
          <div>Join Now</div>
        </button>
      </div>
    </div>
  );
}