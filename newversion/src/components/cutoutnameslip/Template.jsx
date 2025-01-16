import React, { useState,useEffect } from 'react';
// import "./personal-style.css";

const Template = () => {
  
  const savedProduct = localStorage.getItem('product');
  const product = savedProduct ? JSON.parse(savedProduct) : null;

  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [className, setClassName] = useState('');
  const [section, setSection] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [subject, setSubject] = useState('');

  const [contrast, setContrast] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [circle, setCircle] = useState(false);
  const [imgBorder, setImgBorder] = useState(false);
  const [image, setImage] = useState('');
  useEffect(() => {
    if (product && product.source) {
      setImage(product.source);
      console.log(image);
    }
  }, [product]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };
  

  const handleTextChange = (setter) => (event) => {
    setter(event.target.value);
  };

  return (
    <div id="label-custom">
      <div id="image">
        <div id="image-section">
          <img src={image} alt="Uploaded" id="labelimg" />
          <div id="img-container">
            <img src={image} alt="Preview" id="photo" />
          </div>
          <h2 id="name" className="label-text">Enter Your Name</h2>
          <h2 id="class" className="label-text">{className}</h2>
          <h2 id="section" className="label-text">{section}</h2>
          <h2 id="rollno" className="label-text">{rollNo}</h2>
          <h2 id="subject" className="label-text">{subject}</h2>
          <h2 id="school" className="label-text">Enter Your School Name</h2>
        </div>
        <h4 id="labeldetails">Medium 12 labels in A4 sheet - Size of Lable (100 mm x 44 mm) 12 labels in A4 Sheet (36nos)</h4>
      </div>
      <div id="personalize">
        <div id="personalize-image">
          <label htmlFor="uploadimg" id="selectimg" className="btn">Select Image</label>
          <input
            type="file"
            placeholder="Upload image"
            id="uploadimg"
            onChange={handleImageChange}
          />
          <button className="editbtn" id="editbtn0">
            <i className="fas fa-user-edit"></i>
          </button>
          <div id="editimg">
            <h3>Edit Photo</h3>
            <button id="deleteButton">
              <i className="fa-solid fa-trash"></i>
            </button>
            {/* Image transformation buttons */}
            <button id="zoomInButton">
              <i className="fa fa-search-plus" aria-hidden="true"></i>
            </button>
            <button id="zoomOutButton">
              <i className="fa fa-search-minus" aria-hidden="true"></i>
            </button>
            <button id="rotateLeftButton">
              <i className="fa-solid fa-rotate-left"></i>
            </button>
            <button id="rotateRightButton">
              <i className="fa-solid fa-rotate-right"></i>
            </button>
            <button id="flipHorizontalButton">
              <i className="fas fa-arrows-alt-h"></i>
            </button>
            <button id="flipVerticalButton">
              <i className="fas fa-arrows-alt-v"></i>
            </button>
            <button id="up">
              <i className="fa-solid fa-arrow-up"></i>
            </button>
            <button id="down">
              <i className="fa-solid fa-arrow-down"></i>
            </button>
            <button id="left">
              <i className="fa-solid fa-arrow-left"></i>
            </button>
            <button id="right">
              <i className="fa-solid fa-arrow-right"></i>
            </button>
            <label htmlFor="contrast">
              Contrast:
              <input
                type="range"
                id="contrast"
                min="50"
                max="300"
                value={contrast}
                onChange={(e) => setContrast(e.target.value)}
              />
              <h4 id="contrastvalue">{contrast}</h4>
            </label>
            <label htmlFor="brightness">
              Brightness:
              <input
                type="range"
                id="brightness"
                min="50"
                max="200"
                value={brightness}
                onChange={(e) => setBrightness(e.target.value)}
              />
              <h4 id="brightnessvalue">{brightness}</h4>
            </label>
            <label htmlFor="imgColorPicker">
              Change Image Background Color:
              <input
                type="color"
                id="imgColorPicker"
                value="#000000"
              />
            </label>
            <label htmlFor="circle" id="circlelabel">
              Circle Border
              <input
                type="checkbox"
                id="circle"
                checked={circle}
                onChange={() => setCircle(!circle)}
              />
            </label>
            <label htmlFor="imgborder" id="borderlabel">
              Image Border
              <input
                type="checkbox"
                id="imgborder"
                checked={imgBorder}
                onChange={() => setImgBorder(!imgBorder)}
              />
            </label>
            <button id="bg">Remove Background</button>
          </div>
          {/* Text editing */}
          <div id="edittext">
            {/* Name Editing */}
            <div className="ed">
              <input
                type="text"
                placeholder="Name"
                id="stdname"
                value={name}
                onChange={handleTextChange(setName)}
                className="input"
              />
              <button className="editbtn" id="editbtn1">
                <i className="fas fa-user-edit"></i>
              </button>
            </div>
            {/* School Editing */}
            <div className="ed">
              <input
                type="text"
                placeholder="School Name"
                id="stdschool"
                value={school}
                onChange={handleTextChange(setSchool)}
                className="input"
              />
              <button className="editbtn" id="editbtn2">
                <i className="fas fa-user-edit"></i>
              </button>
            </div>
            {/* Class Editing */}
            <div className="ed">
              <input
                type="text"
                placeholder="Class"
                id="stdclass"
                value={className}
                onChange={handleTextChange(setClassName)}
                className="input"
              />
              <button className="editbtn" id="editbtn3">
                <i className="fas fa-user-edit"></i>
              </button>
            </div>
            {/* Section Editing */}
            <div className="ed">
              <input
                type="text"
                placeholder="Section"
                id="stdsec"
                value={section}
                onChange={handleTextChange(setSection)}
                className="input"
              />
              <button className="editbtn" id="editbtn4">
                <i className="fas fa-user-edit"></i>
              </button>
            </div>
            {/* Roll No Editing */}
            <div className="ed">
              <input
                type="text"
                placeholder="Roll No"
                id="stdrollno"
                value={rollNo}
                onChange={handleTextChange(setRollNo)}
                className="input"
              />
              <button className="editbtn" id="editbtn5">
                <i className="fas fa-user-edit"></i>
              </button>
            </div>
            {/* Subject Editing */}
            <div className="ed">
              <input
                type="text"
                placeholder="Subject"
                id="stdsub"
                value={subject}
                onChange={handleTextChange(setSubject)}
                className="input"
              />
              <button className="editbtn" id="editbtn6">
                <i className="fas fa-user-edit"></i>
              </button>
            </div>
            {/* <button id="extratext" className="btn">Other details</button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template;
