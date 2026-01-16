import React, { useState, useEffect } from 'react'
import RacingGame from './RacingGame'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import 'remixicon/fonts/remixicon.css'

function App() {
  let [showContent, setShowContent] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 4;

  useEffect(() => {
    if (!showContent) return;
    const slideList = document.querySelector(".carousel .list");
    if (slideList) {
      slideList.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
    const thumbs = document.querySelectorAll(".thumbnail .item");
    thumbs.forEach((thumb, i) => {
      thumb.classList.toggle("active", i === currentSlide);
    });
  }, [currentSlide, showContent]);
  useEffect(() => {
    const nextBtn = document.getElementById("next");
    const prevBtn = document.getElementById("prev");

    const handleNext = () =>
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    const handlePrev = () =>
      setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);

    nextBtn?.addEventListener("click", handleNext);
    prevBtn?.addEventListener("click", handlePrev);

    return () => {
      nextBtn?.removeEventListener("click", handleNext);
      prevBtn?.removeEventListener("click", handlePrev);
    };
  }, []);
  useEffect(() => {
    const thumbs = document.querySelectorAll(".thumbnail .item");
    thumbs.forEach((thumb, i) => {
      thumb.onclick = () => setCurrentSlide(i);
    });
  }, []);

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.to(".vi-mask-group", {
      rotate: 10,
      duration: 2,
      ease: "power4.inOut",
      transformOrigin: "50% 50%"
    })
      .to(".vi-mask-group", {
        scale: 10,
        duration: 2,
        delay: -1.8,
        ease: "expo.easeInOut",
        transformOrigin: "50% 50%",
        opacity: 0,
        onUpdate: function () {
          if (this.progress() >= 0.9) {
            document.querySelector(".svg").remove();
            setShowContent(true);
            this.kill();
          }
        }
      });
  });
  useGSAP(() => {
    if (!showContent) return;
    gsap.to(".main", {
      scale: 1,
      rotate: 0,
      duration: 2,
      delay: -0.5,
      ease: "Expo.easeInOut"
    });
    gsap.to(".sky", {
      scale: 1,
      rotate: 0,
      duration: 2,
      delay: -.8,
      ease: "Expo.easeInOut"
    });
    gsap.to(".bg", {
      scale: 1,
      rotate: 0,
      duration: 2,
      delay: -.8,
      ease: "Expo.easeInOut"
    });
    gsap.to(".character", {
      scale: 0.5,
      x: "-50%",
      bottom: "-65%",
      rotate: 0,
      duration: 2,
      delay: -.8,
      ease: "Expo.easeInOut"
    });
    gsap.to(".text", {
      scale: 1,
      rotate: 0,
      duration: 2,
      delay: -.8,
      ease: "Expo.easeInOut"
    });
    const main = document.querySelector(".main");

    main?.addEventListener("mousemove", function (e) {
      const xMove = (e.clientX / window.innerWidth - 0.5) * 40;
      gsap.to(".main .text", {
        x: `${xMove * 0.4}%`,
      });
      gsap.to(".main .imagediv .sky", {
        x: `${xMove * 4.5}px`, // match bg movement
        scale: 1.2, // slightly larger to always cover bg
        duration: 0.7,
        ease: "power2.out"
      });
      gsap.to(".main .imagediv .bg", {
        x: `${xMove * 4.5}px`,
        scale: 1.1,
        duration: 0.7,
        ease: "power2.out"
      });
    });
  }, [showContent]);
  useGSAP(() => {
    if (!showContent) {
      gsap.set(".main .imagediv .bg", { scale: 1.1, x: 0 });
    }
  }, [showContent]);
  return (
    <>
      <div className="svg flex items-center justify-center fixed top-0 left-0 z-[100] w-full h-screen overflow-hidden bg-[#000]">
        <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
          <defs>
            <mask id="viMask">
              <rect width="100%" height="100%" fill="black" />
              <g className="vi-mask-group">
                <text
                  x="50%"
                  y="50%"
                  fontSize="250"
                  textAnchor="middle"
                  fill="white"
                  dominantBaseline="middle"
                  fontFamily="Arial Black"
                >
                  VI
                </text>
              </g>
            </mask>
          </defs>
          <image
            href="./bg.png"
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid slice"
            mask="url(#viMask)"
          />
        </svg>
      </div>
      {showContent && <div className="main w-full rotate-[-10deg] scale-[1.3]">
        <div className="landing  overflow-hidden relative w-full h-screen bg-black">
          <div className="navBar absolute top-0 left-0 z-[10] w-full py-6 px-6 " >
            <div className="logo flex gap-6">
              <div className="lines  flex flex-col gap-1">
                <div className="line w-15 h-1.5 bg-white "></div>
                <div className="line w-8 h-1.5 bg-white "></div>
                <div className="line w-5 h-1.5 bg-white "></div>
              </div>

              <h3 className='text-4xl -mt-[10px] leading-none text-white' >Rockstar</h3>
            </div>
          </div>

          <div className="imagediv relative overflow-hidden w-full h-screen">
            <img className="sky absolute top-0 scale-[1.1] rotate-[-20deg] left-0 w-full h-full object-cover " src="./sora_desu.png" alt=" " />
            <img className="absolute scale-[1.4] rotate-[-5deg]  bg top-0 left-0 w-full h-full object-cover" src="./bg.png" alt="" />
            <div className="text text-white  absolute top-10 left-1/2 -translate-x-1/2 scale-[1.4] rotate-[-12deg]">
              <h1 className="text-[7rem] -ml-30 leading-none">grand</h1>
              <h1 className="text-[7rem] ml-15  leading-none">theft</h1>
              <h1 className="text-[7rem] -ml-15 leading-none">auto</h1>
            </div>
            <img className="absolute character -bottom-[300%] left-1/2 -translate-x-1/2 scale-[3] rotate-[-20deg]" src="./onna_-desu(1).png" />

          </div>
          <div className="btmBar text-white  absolute bottom-0 left-0 w-full px-8 py-11 bg-gradient-to-t from-black to-transparent">
            <div className="flex gap-4 items-center">
              <i className=" text-3xl ri-arrow-down-line"></i>
              <h3 className=" text-[16px] font-[Helvetica_Now_Display]">Scroll down</h3>
            </div>
            <img className="h-[40px]  absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" src="./ps5.png"></img>
          </div>
        </div>
        <div className="w-full h-screen flex px-10  items-center justify-center bg-black relative">
          <div className="Cntnr overflow-hidden flex text-white w-full h-[80%] ">
            <div className="limg relative w-1/2 h-full" >
              <img className="absolute scale-[1.1] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 " src="./imag.png " alt="" />
            </div>
            <div className="rg  w-[40%] py-20">
              <h1 className="text-5xl">Build Your Empire,</h1>
              <h1 className="text-5xl mb-2">Burn the rest.</h1>
              <p className="mt-[10] mb-2 font-[Helvetica_Now_Display] ">
                Welcome to the next generation of Grand Theft Auto. Bigger maps. Deeper stories. And a city that breathes danger and beauty in equal measure. GTA VI isn't here to play nice. It's here to change everything.

              </p>
              <p className="mt-[8] font-[Helvetica_Now_Display] mb-1.2  ">
                "From the streets of Vice City to the mountains of San Andreas, every corner of this world is yours to conquer. Whether you're a lone wolf or part of a crew, the city is alive with opportunities and threats. Choose your path, build your empire, and leave your mark on the criminal underworld."
              </p>
              <p className="mt-[8] font-[Helvetica_Now_Display]">
                "Every choice has a consequence. Every job is a gamble. Whether you're running guns, robbing vaults, or flipping deals, remember one thing — in this city, you're either the hunter or the hunted."
              </p>
              <button className="bg-yellow-500 text-3xl text-black px-6 py-3 mt-4 rounded-lg hover:bg-yellow-600 transition-colors">Download Now</button>
            </div>
          </div>
          <div className="btmBar text-white absolute bottom-0 left-0 w-full px-8 py-11 bg-gradient-to-t from-purple-900 to-transparent"></div>
        </div>

        <div className="carousel next relative w-full h-[600px] overflow-hidden">
          <div className="list flex w-full h-full transition-transform duration-500" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            <div className="item w-full h-full flex-shrink-0 relative">
              <img src="./cb.png" className="w-full h-full object-cover" alt="" />
              <div className="content absolute bottom-10 left-10 text-white">
                <div className="author">Cassidy Blaze</div>
                <div className='title'>The Outlaw Queen / WAVE RIDER</div>
                <div className="desc">"Smuggler's Wharf Specialist — Drives a boat better than most drive cars." You'll find her where the tide turns sharp and the streets meet the sea. Cool head, sharper instincts — and yeah, she doesn't miss a beat."</div>
                <div className="buttons mt-4"><button>See more</button></div>
              </div>
            </div>
            <div className="item w-full h-full flex-shrink-0 relative">
              <img src="./co.png" className="w-full h-full object-cover" alt="" />
              <div className="content absolute bottom-10 left-10 text-white">
                <div className="author">Dev Rao</div>
                <div className='title'>"Ground Zero"</div>
                <div className="desc">"He's been holding it down since before the city learned his name. Power's not in the fists — it's in knowing when to swing. The muscle — but don't mistake him for just that."</div>
                <div className="buttons mt-4"><button>See more</button></div>
              </div>
            </div>
            <div className="item w-full h-full flex-shrink-0 relative">
              <img src="./rw.png" className="w-full h-full object-cover" alt="" />
              <div className="content absolute bottom-10 left-10 text-white">
                <div className="author">Anika Vora</div>
                <div className='title'>"Redline"</div>
                <div className="desc">"Some keep their head down. She walks in with hers held high — no bluff, no breaks, just hustle."</div>
                <div className="buttons mt-4"><button>See more</button></div>
              </div>
            </div>

            <div className="item w-full h-full flex-shrink-0 relative">
              <img src="./by.png" className="object-cover object-top h-[80%] mx-auto" style={{ objectPosition: 'center top' }} alt="" />
              <div className="content absolute bottom-10 left-10 text-white">
                <div className="author">Ricky Yadav</div>
                <div className='title'>"Grinshot"</div>
                <div className="desc">"He's always laughing — until he's not. Then things tend to explode. Literally. Wildcard techie — builds bombs and breaks rules with equal flair."</div>
                <div className="buttons mt-4"><button>See more</button></div>
              </div>
            </div>
          </div>
          {/* Thumbnails */}
          <div className="thumbnail">
            {["cb.png", "co.png", "rw.png", "by.png"].map((img, idx) => (
              <div
                key={img}
                className={`item cursor-pointer ${currentSlide === idx ? "active border-2 border-yellow-400" : "opacity-50"}`}
                onClick={() => setCurrentSlide(idx)}
              >
                <img src={`./${img}`} className="w-20 h-14 object-cover rounded" alt={img} />
              </div>
            ))}
          </div>
          {/* Arrows */}
          <div className="arrows absolute bottom-5 right-5 flex gap-4 z-10">
            <button id="prev" className="arrow-button text-4xl text-white" onClick={() => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)}>‹</button>
            <button id="next" className="arrow-button text-4xl text-white" onClick={() => setCurrentSlide((prev) => (prev + 1) % totalSlides)}>›</button>
          </div>
        </div>
        <div className="game flex justify-center mt-8">
          <button
            className="bg-yellow-500 text-2xl text-black px-8 py-4 rounded-lg hover:bg-yellow-600 transition-colors shadow-lg"
            onClick={() => setShowGame(true)}
          >
            Play Game
          </button>
        </div>
      </div>}
      {showGame && <RacingGame onClose={() => setShowGame(false)} />}
    </>
  );
}

export default App