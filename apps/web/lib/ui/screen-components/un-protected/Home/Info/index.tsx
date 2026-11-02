import MoveableCard from "@/lib/ui/useable-components/Moveable-Card";
import React from "react";
import TranparentButton from "@/lib/ui/useable-components/Home-Buttons/TranparentButton";

import riderImg from '@/public/assets/images/png/riderImg.webp'
import { useTranslations } from "next-intl";
const Info = () => {
  const t = useTranslations()
  const CourierButton = <TranparentButton text={t("for_riders")} link={"/rider"} />;
  return (
    <div className="grid grid-cols-1 gap-8">
      <MoveableCard
        button={CourierButton}
        image={
          riderImg
        }
        heading={t('MoveableCardHomeScreen.title1')}
        subText={
          t('MoveableCardHomeScreen.subText1')
        }
      />
    </div>
  );
};

export default Info;
