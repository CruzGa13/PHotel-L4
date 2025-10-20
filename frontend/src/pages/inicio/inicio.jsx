import React from "react";
import { Fade, Slide } from "react-awesome-reveal";
import Header from "../../components/Header/Header"; 
import BlockQuote from "../../components/BlockQuote/BlockQuote";
import Carousel from "../../components/Carousel/Carousel";
import Images from "../../components/Images/Images";

const Inicio = () => {
  return (
    <div className="inicio-container">
      <Fade duration={1500} triggerOnce>
        <Header />
      </Fade>
      <Fade delay={500} triggerOnce>
        <BlockQuote />
      </Fade>
      <Fade delay={500} triggerOnce>
        <Carousel />
      </Fade>
      <Fade delay={500} triggerOnce>
        <Images />
      </Fade>
    </div>
  );
};

export default Inicio;