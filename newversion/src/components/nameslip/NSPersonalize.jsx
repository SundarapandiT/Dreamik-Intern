import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
//  import "./NSPersonalize.css";
//  import "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css";

const NSPersonalize = ({navigateTo}) => {
  const persImgContRef = useRef(null);
  const [brightness, setBrightness] = useState(100); // Default 100% (no change)
  const [contrast, setContrast] = useState(100); // Default 100% (no change)

  const [selectedImage, setSelectedImage] = useState(null);
  const [transformations, setTransformations] = useState({
    scale: 1, // Zoom level
    rotate: 0, // Rotation angle
    translateX: 0, // Horizontal movement
    translateY: 0, // Vertical movement
    mirror: 1,
  });
  const [nameTrans, setNameTrans] = useState({
    scale: 1, // Zoom level
    rotate: 0, // Rotation angle
    translateX: 0, // Horizontal movement
    translateY: 0, // Vertical movement
    mirror: 1,
  });
  const [schooltrans, setschooltrans] = useState({
    scale: 1, // Zoom level
    rotate: 0, // Rotation angle
    translateX: 0, // Horizontal movement
    translateY: 0, // Vertical movement
    mirror: 1,
  });
  // State for student details
  const [studentDetails, setStudentDetails] = useState({
    name: "",
    schoolName: "",
    subject: "",
    rollNumber: "",
    section: "",
    class: "",
  });

  const [studentName, setStudentName] = useState("");
  const [fontSize, setFontSize] = useState(16);
  const [fontColor, setFontColor] = useState("#000000");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [quantity, setQuantity] = useState(1);
  const [product,setProduct]=useState({});
  // Handle input changes
  useEffect(() => {
        const fetchData = async () => {
          const url = '../nameslip_data.json';
          try {
            const response = await fetch(url);
            if (!response.ok) {
              throw new Error('Network response was not ok ' + response.statusText);
            }
            const data = await response.json();
            localStorage.setItem('data', JSON.stringify(data));
            return data;
          } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
          }
        };
   
    const loadProductDetails = async () => {
        const data = await fetchData();
        const key = localStorage.getItem('keyid');
        if (key && data[key]) {
          setProduct(data[key]);
          document.title = data[key].name;
        }
      };
  
      loadProductDetails();
    }, []);
  

  const handleStudentNameChange = (event) => {
    setStudentName(event.target.value);
    console.log(product.id)
  };

  // Handle font size change
  const handleFontSizeChange = (size) => {
    setFontSize(size);
  };

  // Handle font color change
  const handleFontColorChange = (event) => {
    setFontColor(event.target.value);
  };

  // Handle font family change
  const handleFontFamilyChange = (event) => {
    setFontFamily(event.target.value);
  };
  // Handle image change
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      // When the file is read, update the state with the image's base64 string
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
      };

      reader.readAsDataURL(file); // Read the file as a data URL
    }
  };

  // Handle slider changes
  const handleBrightnessChange = (e) => setBrightness(e.target.value);
  const handleContrastChange = (e) => setContrast(e.target.value);

  // Handle student details change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStudentDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDeleteImage = () => {
    setSelectedImage(null);
    setTransformations({
      scale: 1,
      rotate: 0,
      translateX: 0,
      translateY: 0,
      mirror: 1,
    });
  };
  const updateTransforminput = (type, value) => {
    setNameTrans((prev) => ({ ...prev, [type]: prev[type] + value }));
  };
  const updateTransform = (type, value) => {
    setTransformations((prev) => ({ ...prev, [type]: prev[type] + value }));
  };
  const updatetransformschool = (type, value) => {
    setschooltrans((prev) => ({ ...prev, [type]: prev[type] + value }));
  };

  const toggleMirror = () => {
    setTransformations((prev) => ({
      ...prev,
      mirror: prev.mirror === 1 ? -1 : 1,
    }));
  };
  const handlePrice = (e) => {
    setQuantity(e.target.value);
  };

  const handleDownload = () => {
    const element = persImgContRef.current; // Get the referenced div
    if (!element) {
      console.error("Element not found for download");
      return;
    }

    html2canvas(element)
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = imgData;
        link.download = "personalized-image.png";
        link.click();
      })
      .catch((error) => {
        console.error("Error capturing the div:", error);
      });
  };
  const handlecustomImage = () => {
    if (document.getElementById("customizediv").style.display === "block") {
      document.getElementById("customizediv").style.display = "none";
    } else {
      document.getElementById("customizediv").style.display = "block";
    }
  };
  const handleotherDetails = () => {
    if (document.getElementById("OD").style.display === "block") {
      document.getElementById("OD").style.display = "none";
    } else {
      document.getElementById("OD").style.display = "block";
    }
  };
  const handlehidename = () => {
    if (document.getElementById("namecustomizediv").style.display === "block") {
      document.getElementById("namecustomizediv").style.display = "none";
    } else {
      document.getElementById("namecustomizediv").style.display = "block";
    }
  };
  const handlehideschoolname = () => {
    if (
      document.getElementById("schoolnamecustomizediv").style.display ===
      "block"
    ) {
      document.getElementById("schoolnamecustomizediv").style.display = "none";
    } else {
      document.getElementById("schoolnamecustomizediv").style.display = "block";
    }
  };
  return (
    <div className="personalizecontainer">
      <div className="pers-img-cont" ref={persImgContRef}>
        <img
          src={product.source}
          alt="productImage"
          className="personalise-Image"
        />
        <img
          src={selectedImage}
          alt="yours Image"
          style={{
            filter: `brightness(${brightness}%) contrast(${contrast}%)`,
            border: "1px solid #ccc",
            borderRadius: "10px",
            transform: `scale(${transformations.scale}) rotate(${transformations.rotate}deg) translate(${transformations.translateX}px, ${transformations.translateY}px) scaleX(${transformations.mirror})`,
            transition: "transform 0.2s",
          }}
          className="personImage"
        />
        <label
          className="studentname-lab"
          onClick={updateTransforminput}
          style={{
            fontSize: `${fontSize}px`,
            color: fontColor,
            fontFamily: fontFamily,
            transform: `scale(${nameTrans.scale}) rotate(${nameTrans.rotate}deg) translate(${nameTrans.translateX}px, ${nameTrans.translateY}px) scaleX(${nameTrans.mirror})`,
            transition: "transform 0.2s",
          }}
        >
          {studentDetails.name}
        </label>
        <label
          className="schoolname-lab"
          style={{
            fontSize: `${fontSize}px`,
            color: fontColor,
            fontFamily: fontFamily,
            transform: `scale(${schooltrans.scale}) rotate(${schooltrans.rotate}deg) translate(${schooltrans.translateX}px, ${schooltrans.translateY}px) scaleX(${schooltrans.mirror})`,
            transition: "transform 0.2s",
          }}
        >
          {studentDetails.schoolName}
        </label>
        <label
          className="subjectname-lab"
          style={{
            fontSize: `${fontSize}px`,
            color: fontColor,
            fontFamily: fontFamily,
          }}
        >
          {studentDetails.subject}
        </label>
        <label
          className="rollnu-lab"
          style={{
            fontSize: `${fontSize}px`,
            color: fontColor,
            fontFamily: fontFamily,
          }}
        >
          {studentDetails.rollNumber}
        </label>
        <label
          className="sectionname-lab"
          style={{
            fontSize: `${fontSize}px`,
            color: fontColor,
            fontFamily: fontFamily,
          }}
        >
          {studentDetails.section}
        </label>
        <label
          className="classname-lab"
          style={{
            fontSize: `${fontSize}px`,
            color: fontColor,
            fontFamily: fontFamily,
          }}
        >
          {studentDetails.class}
        </label>
      </div>

      <div className="controllize-container">
        <div id="buttonscontrol">
          <label htmlFor="select-image" id="sel-img-btn">
            select image
          </label>
          <button id="editImage" onClick={handlecustomImage}>
            <img src="/images/custamize.png" width={"25px"} alt="" />
          </button>
          <input
            type="file"
            id="select-image"
            onChange={handleImageChange}
            accept="image/*"
          />
          <div id="customizediv">
            <button className="del-btn" onClick={handleDeleteImage}>
              delete
            </button>
            <button
              className="zoom-in"
              onClick={() => updateTransform("scale", 0.1)}
            >
              zoom in
            </button>
            <button onClick={() => updateTransform("scale", -0.1)}>
              zoom out
            </button>
            <button onClick={() => updateTransform("rotate", 10)}>
              tilt left
            </button>
            <button onClick={() => updateTransform("rotate", -10)}>
              tilt right
            </button>
            <button onClick={() => updateTransform("rotate", 180)}>
              Upside Down
            </button>
            <button onClick={() => updateTransform("translateY", -10)}>
              up
            </button>
            <button onClick={() => updateTransform("translateY", 10)}>
              down
            </button>
            <button onClick={() => updateTransform("translateX", -10)}>
              left
            </button>
            <button onClick={() => updateTransform("translateX", 10)}>
              right
            </button>
            <button onClick={toggleMirror}>
              {transformations.mirror === 1 ? "Mirror Image" : "Unmirror Image"}
            </button>

            <div style={{ padding: "20px" }}>
              <h3>Image Brightness & Contrast Adjustment</h3>

              <div style={{ marginBottom: "20px" }}>
                {/* Brightness Slider */}
                <label>
                  Brightness ({brightness}%):
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={brightness}
                    onChange={handleBrightnessChange}
                    style={{ marginLeft: "10px" }}
                  />
                </label>
              </div>

              <div style={{ marginBottom: "20px" }}>
                {/* Contrast Slider */}
                <label>
                  Contrast ({contrast}%):
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={contrast}
                    onChange={handleContrastChange}
                    style={{ marginLeft: "10px" }}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
        {/* Input Fields for Student Details */}
        <div className="student-details">
          <input
            type="text"
            name="name"
            placeholder="Student Name"
            value={studentDetails.name}
            onChange={handleInputChange}
            className="studentDetails"
          />
          <div id="namecustomizediv">
            <button
              className="zoom-in"
              onClick={() => updateTransforminput("scale", 0.1)}
            >
              zoom in
            </button>
            <button onClick={() => updateTransforminput("scale", -0.1)}>
              zoom out
            </button>
            <button onClick={() => updateTransforminput("rotate", 10)}>
              tilt left
            </button>
            <button onClick={() => updateTransforminput("rotate", -10)}>
              tilt right
            </button>
            <button onClick={() => updateTransforminput("rotate", 180)}>
              Upside Down
            </button>
            <button onClick={() => updateTransforminput("translateY", -10)}>
              up
            </button>
            <button onClick={() => updateTransforminput("translateY", 10)}>
              down
            </button>
            <button onClick={() => updateTransforminput("translateX", -10)}>
              left
            </button>
            <button onClick={() => updateTransforminput("translateX", 10)}>
              right
            </button>
          </div>
          <img
            src="/images/custamize.png"
            width={"25px"}
            alt=""
            onClick={handlehidename}
            className="custamlogo"
          />
          <input
            type="text"
            name="schoolName"
            placeholder="School Name"
            value={studentDetails.schoolName}
            onChange={handleInputChange}
            className="studentDetails"
          />
          <div id="schoolnamecustomizediv">
            <button
              className="zoom-in"
              onClick={() => updatetransformschool("scale", 0.1)}
            >
              zoom in
            </button>
            <button onClick={() => updatetransformschool("scale", -0.1)}>
              zoom out
            </button>
            <button onClick={() => updatetransformschool("rotate", 10)}>
              tilt left
            </button>
            <button onClick={() => updatetransformschool("rotate", -10)}>
              tilt right
            </button>
            <button onClick={() => updatetransformschool("rotate", 180)}>
              Upside Down
            </button>
            <button onClick={() => updatetransformschool("translateY", -10)}>
              up
            </button>
            <button onClick={() => updatetransformschool("translateY", 10)}>
              down
            </button>
            <button onClick={() => updatetransformschool("translateX", -10)}>
              left
            </button>
            <button onClick={() => updatetransformschool("translateX", 10)}>
              right
            </button>
          </div>
          <img
            src="/images/custamize.png"
            alt=""
            onClick={handlehideschoolname}
            className="custamlogo"
          />
          <button id="otherdetails" onClick={handleotherDetails}>
            Other Details
          </button>
          <div id="OD">
            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={studentDetails.subject}
              onChange={handleInputChange}
              className="studentDetails"
            />
            <img src="/images/custamize.png" alt="" className="custamlogo" />
            <input
              type="text"
              name="rollNumber"
              placeholder="Roll Number"
              value={studentDetails.rollNumber}
              onChange={handleInputChange}
              className="studentDetails"
            />
            <img
              src="/images/custamize.png"
              width={"25px"}
              alt=""
              className="custamlogo"
            />
            <input
              type="text"
              name="section"
              placeholder="Section"
              value={studentDetails.section}
              onChange={handleInputChange}
              className="studentDetails"
            />
            <img
              src="/images/custamize.png"
              width={"25px"}
              alt=""
              className="custamlogo"
            />
            <input
              type="text"
              name="class"
              placeholder="Class"
              value={studentDetails.class}
              onChange={handleInputChange}
              className="studentDetails"
            />
            <img
              src="/images/custamize.png"
              width={"25px"}
              alt=""
              className="custamlogo"
            />
          </div>
          <div id="fontcenter">
            <div>
              <button
                onClick={() => handleFontSizeChange(fontSize + 2)}
                className="fontsizebtn"
              >
                Increase Font Size
              </button>
              <button
                onClick={() => handleFontSizeChange(fontSize - 2)}
                className="fontsizebtn"
              >
                Decrease Font Size
              </button>
            </div>
            {/* Customize Font Color */}
            <div>
              <label>Pick Font Color: </label>
              <input
                type="color"
                value={fontColor}
                onChange={handleFontColorChange}
              />
            </div>
            {/* Customize Font Family */}
            <div>
              <label>Font Family: </label>
              <select onChange={handleFontFamilyChange} value={fontFamily}>
                <option value="Arial">Arial</option>
                <option value="Verdana">Verdana</option>
                <option value="Courier New">Courier New</option>
                <option value="Georgia">Georgia</option>
                <option value="Times New Roman">Times New Roman</option>
              </select>
            </div>
            Quantity
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={handlePrice}
              style={{ width: "30px" }}
            />
            <br />
            <button id="add">Add to cart</button>
            <br />
            <label id="ad">Rs.price {product.price * quantity}</label>
            <br />
            <button onClick={handleDownload} id="down">
              Download Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NSPersonalize;