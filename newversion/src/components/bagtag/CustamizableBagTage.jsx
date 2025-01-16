import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
// import "./Bagtag.css";
const Bagtag = () => {
  const [bagTagData, setBagTagData] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const imageSectionRef = useRef(null);
  const [scrollState, setScrollState] = useState({ lastScrollTop: 2000, minimized: false });

  useEffect(() => {
    const fetchData = async () => {
      const url = '/bagtag.json';
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        console.log(data);
        localStorage.setItem('BagTagData', JSON.stringify(data));
        setBagTagData(data);
      } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
      }
    };

    fetchData();
  }, []);

  const handleDefaultBgChange = (event) => {
    const background = event.target.value;
    console.log(background)
    document.getElementById('background').src = background;
  };

  const handleForegroundChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      document.getElementById('foreground').src = url;
      setPhoto(url);
    }
  };

  const transformPhoto = (action) => {
    const img = document.getElementById('foreground');
    switch (action) {
      case 'del':
        img.src = '';
        break;
      case 'zoomin':
        img.style.transform += 'scale(1.1)';
        break;
      case 'zoomout':
        img.style.transform += 'scale(0.9)';
        break;
      case 'rleft':
        img.style.transform += 'rotate(-10deg)';
        break;
      case 'rright':
        img.style.transform += 'rotate(10deg)';
        break;
      case 'fliph':
        img.style.transform += 'scaleX(-1)';
        break;
      case 'flipv':
        img.style.transform += 'scaleY(-1)';
        break;
      default:
        break;
    }
  };

  const movePhoto = (direction) => {
    const img = document.getElementById('foreground');
    const step = 10;
    const currentTop = img.offsetTop;
    const currentLeft = img.offsetLeft;

    switch (direction) {
      case 'up':
        img.style.top = `${currentTop - step}px`;
        break;
      case 'down':
        img.style.top = `${currentTop + step}px`;
        break;
      case 'left':
        img.style.left = `${currentLeft - step}px`;
        break;
      case 'right':
        img.style.left = `${currentLeft + step}px`;
        break;
      default:
        break;
    }
  };

  const handleDownload = async () => {
    if (imageSectionRef.current) {
      await html2canvas(imageSectionRef.current, { scale: 2 }).then((canvas) => {
        const link = document.createElement('a');
        link.download = 'div-image.png';
        link.href = canvas.toDataURL();
        link.click();
      });
    }
  };

  const handleScroll = () => {
    if (window.screen.width <= 500) {
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
      const img = imageSectionRef.current;
      if (currentScroll > scrollState.lastScrollTop) {
        // Scrolling down
        img.style.width = '100px';
        img.style.height = '200px';
        img.style.marginLeft = '100px';
        setScrollState({ ...scrollState, minimized: true });
      } else {
        // Scrolling up
        img.style.width = '310px';
        img.style.height = '460px';
        img.style.marginLeft = '25px';
        setScrollState({ ...scrollState, minimized: false });
      }
      setScrollState({ ...scrollState, lastScrollTop: currentScroll });
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollState]);

  return (
    <div>
      <header id="header">BagTag Editor</header>

      <div id="image-section" ref={imageSectionRef}>
        <img id="background" alt="Background" />
        <img id="foreground" alt="Foreground" />
      </div>

      <div>
        <label>
          Default Background:
          <select id="defaultbg" onChange={handleDefaultBgChange}>
            {bagTagData?.images &&
              Object.keys(bagTagData.images).map((key) => (
                <option key={key} value={bagTagData.images[key]}>
                  {key}
                </option>
              ))}
          </select>
        </label>

        <input
          type="file"
          id="selectforeground"
          onChange={handleForegroundChange}
          style={{ display: 'none' }}
        />
        <button onClick={() => document.getElementById('selectforeground').click()}>
          Upload Foreground
        </button>
      </div>

      <div>
        <button onClick={() => transformPhoto('zoomin')}>Zoom In</button>
        <button onClick={() => transformPhoto('zoomout')}>Zoom Out</button>
        <button onClick={() => transformPhoto('rleft')}>Rotate Left</button>
        <button onClick={() => transformPhoto('rright')}>Rotate Right</button>
        <button onClick={() => transformPhoto('fliph')}>Flip Horizontally</button>
        <button onClick={() => transformPhoto('flipv')}>Flip Vertically</button>
      </div>

      <div>
        <button onClick={() => movePhoto('up')}>Move Up</button>
        <button onClick={() => movePhoto('down')}>Move Down</button>
        <button onClick={() => movePhoto('left')}>Move Left</button>
        <button onClick={() => movePhoto('right')}>Move Right</button>
      </div>

      <div>
        <label>
          Brightness:
          <input
            type="range"
            id="brightness"
            min="0"
            max="200"
            value={brightness}
            onChange={(e) => {
              setBrightness(e.target.value);
              document.getElementById('foreground').style.filter = `brightness(${e.target.value}%)`;
            }}
          />
        </label>
        <label>
          Contrast:
          <input
            type="range"
            id="contrast"
            min="0"
            max="200"
            value={contrast}
            onChange={(e) => {
              setContrast(e.target.value);
              document.getElementById('foreground').style.filter = `contrast(${e.target.value}%)`;
            }}
          />
        </label>
      </div>

      <button onClick={handleDownload}>Download Image</button>
    </div>
  );
};

export default Bagtag;