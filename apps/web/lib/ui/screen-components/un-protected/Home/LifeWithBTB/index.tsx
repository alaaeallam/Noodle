// libraries
import React from "react";

// Components
import MoveableCard from "@/lib/ui/useable-components/Moveable-Card";

// images
import deliveryFee from "@/public/assets/images/png/deliveryFee.webp";
import ZeroDelivery from "@/public/assets/images/png/0delivery.webp";
import { useTranslations } from "next-intl";


const BTBInfo: React.FC = () => {
  const t = useTranslations();
  return (
    <div className="mt-[80px] mb-[80px]">
      <div className="flex flex-col justify-center items-center my-[20px] dark:text-white">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold m-4">
          {t("InfoCardHomeScreen.tagLine")}
        </h1>
        <p className="m-4 text-xl md:text-2xl lg:text-3xl">
                    {t("InfoCardHomeScreen.subHeading")}

        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 ">
        <MoveableCard
          image={deliveryFee}
          heading={t("InfoCardHomeScreen.Title1")}

          subText={t("InfoCardHomeScreen.SubText1")}

        />
        <MoveableCard
          image={ZeroDelivery}
          heading={t("InfoCardHomeScreen.Title2")}
          subText={t("InfoCardHomeScreen.SubText2")}

        />
      </div>

    </div>
  );
};

export default BTBInfo;
