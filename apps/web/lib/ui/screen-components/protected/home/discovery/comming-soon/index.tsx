"use client";

import CustomButton from "@/lib/ui/useable-components/button";
import { USER_CURRENT_LOCATION_LS_KEY } from "@/lib/utils/constants";
import { onUseLocalStorage } from "@/lib/utils/methods/local-storage";
import { useTranslations } from "next-intl";

export default function ComingSoonScreen() {

  //  // API
  //   const { loading, error, data, refetch } = useQuery(GET_ZONES);

  //   console.log("Zones",{loading, error, data});
  // trnaslations
  const t = useTranslations();
  // handle click
  const handleClick = () => {
    onUseLocalStorage(
      "save",
      USER_CURRENT_LOCATION_LS_KEY,
      JSON.stringify({
        label: "Home",
        location: {
          coordinates: [73.036187, 33.699619],
        },
        _id: "",

        deliveryAddress: "Islamabad, Pakistan",
      })
    );
    // reload window
    window.location.reload();
  };  
  return (
    <div onClick={handleClick} className=" cursor-pointer relative flex flex-col rounded-lg items-center justify-center py-8  overflow-hidden  mt-10 text-center bg-gradient-to-b from-[#5AC12F] to-[#51b427] hover:from-[#47a320] hover:to-[#51b427] dark:bg-gradient-to-b dark:from-[#467e2e]  dark:to-[#316e17] dark:hover:from-[#316e17] dark:hover:to-[#386425] text-white">
      {/* Floating Food Emojis */}
      <span
        aria-hidden="true"
        className="absolute top-10 left-10 text-4xl opacity-20 animate-bounce"
      >
        🍕
      </span>
      <span
        aria-hidden="true"
        className="absolute top-1/3 right-10 text-5xl opacity-20 animate-pulse"
      >
        🍔
      </span>
      <span
        aria-hidden="true"
        className="absolute bottom-16 left-1/4 text-3xl opacity-20 animate-bounce"
      >
        🥗
      </span>
      <span
        aria-hidden="true"
        className="absolute bottom-24 right-1/3 text-4xl opacity-20 animate-pulse"
      >
        🍣
      </span>
      <span
        aria-hidden="true"
        className="absolute top-1/4 left-36 text-4xl opacity-20 animate-bounce"
      >
        🍩
      </span>
      <span
        aria-hidden="true"
        className="absolute bottom-10 right-1/4 text-4xl opacity-20 animate-pulse"
      >
        🌮
      </span>

      {/* Main Illustration */}
      <div className="w-40 h-40 md:w-56 md:h-56 rounded-full flex items-center justify-center bg-white/20 mb-8">
        <span className="text-5xl md:text-7xl">🍴</span>
      </div>

      {/* Heading */}
      <h1 className="text-3xl md:text-5xl font-extrabold mb-3 drop-shadow-lg">
        {t("coming_soon_in_your_area_label")}
      </h1>

      {/* Sub Text */}
      <p className="text-lg md:text-xl text-white/90 max-w-xl mb-8">
        {t("coming_soon_in_your_area_message")}
      </p>

      {/* Explore Another Region Button */}
      <CustomButton
        label={"Click anywhere on this screen to explore restaurants."}
        // onClick={handleClick}
        className="px-8 py-3 rounded-full font-semibold bg-white text-[#5AC12F] shadow-lg 
                   hover:bg-white/90 hover:scale-105 transition-transform duration-200"
      />
    </div>
  );
}
