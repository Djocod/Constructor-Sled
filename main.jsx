import React from "react";
import { createRoot } from "react-dom/client";
import TemplateLuge from "./storefront/TemplateLuge";

import img1 from "./storefront/img/gurteblaurotgraugelbb(1).jpeg";
import img2 from "./storefront/img/gurterotschwarzb(2).jpeg";
import img3 from "./storefront/img/gurterotblaub(2).jpeg";
import img4 from "./storefront/img/gurten-vilolett-blau-trkis-b(1).jpeg";
import img5 from "./storefront/img/beige.jpeg";
import wood from "./storefront/img/bois-1.jpg";
import guide from "./storefront/img/cuir2.jpeg";
import skating from "./storefront/img/padoukdafrique.jpg";
import hoop from "./storefront/img/tirolBlue1.jpg";
import imgAD1 from "./storefront/img/GasserBlack.webp";
import imgAD2 from "./storefront/img/GasserBlue.webp";
import imgAD3 from "./storefront/img/GasserBordeaux.webp";
import imgAD4 from "./storefront/img/GasserRed.webp";
import imgAD5 from "./storefront/img/GasserBlack.webp";

createRoot(document.getElementById("root")).render(
  <TemplateLuge
    img1={img1}
    img2={img2}
    img3={img3}
    img4={img4}
    img5={img5}
    wood={wood}
    guide={guide}
    skating={skating}
    hoop={hoop}
    imgAD1={imgAD1}
    imgAD2={imgAD2}
    imgAD3={imgAD3}
    imgAD4={imgAD4}
    imgAD5={imgAD5}
  />,
);
