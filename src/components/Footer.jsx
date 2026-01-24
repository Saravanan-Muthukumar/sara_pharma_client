import React from "react";
import Logo from "../img/logo.png";

const Footer = () => {
  return (
    <footer className="w-full bg-teal-50">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-6 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <img
          src={Logo}
          alt="Sara Pharma"
          className="h-10 w-auto"
        />

        <span>
          <b>Sara Pharma</b> Thillai Nagar, Trichy
        </span>
      </div>
    </footer>
  );
};

export default Footer;
