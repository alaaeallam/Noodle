'use client'

// libraries
import React from "react";

//Componets
import Start from "../../screen-components/un-protected/Home/Start";
import Info from "../../screen-components/un-protected/Home/Info";
import BTBInfo from "../../screen-components/un-protected/Home/LifeWithBTB";
import Couriers from "../../screen-components/un-protected/Home/ForCouriers";
import { PaddingContainer } from "../../useable-components/containers";

const Main = () => {  
  return (
    <div className="w-screen dark:bg-gray-900">
      <Start />
      <PaddingContainer>
        <div className="w-full">
          <Info />
          <BTBInfo />

          <Couriers />
        </div>
      </PaddingContainer>
    </div>
  );
};

export default Main;
