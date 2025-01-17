import React, { useContext,useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import "./NSPersonalize.css"
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../CartContext';

const NSPersonalize = () => {
  const persImgContRef = useRef(null);
  const navigate=useNavigate();
  const [brightness, setBrightness] = useState(100); // Default 100% (no change)
  const [contrast, setContrast] = useState(100); // Default 100% (no change)
  const { addToCart, cartCount } = useContext(CartContext);

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
  const [subjecttrans, setsubjecttrans] = useState({
    scale: 1, // Zoom level
    rotate: 0, // Rotation angle
    translateX: 0, // Horizontal movement
    translateY: 0, // Vertical movement
    mirror: 1,
  });
  const [rollnotrans, setrollnotrans] = useState({
    scale: 1, // Zoom level
    rotate: 0, // Rotation angle
    translateX: 0, // Horizontal movement
    translateY: 0, // Vertical movement
    mirror: 1,
  });
  const [sectiontrans, setsectiontrans] = useState({
    scale: 1, // Zoom level
    rotate: 0, // Rotation angle
    translateX: 0, // Horizontal movement
    translateY: 0, // Vertical movement
    mirror: 1,
  });
  const [classtrans, setclasstrans] = useState({
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

  function sendToWhatsApp() {
    var message = " ";
    var phoneNumber = "919498088659";
    var whatsappLink =
      "https://api.whatsapp.com/send?phone=" +
      phoneNumber +
      "&text=" +
      encodeURIComponent(message);
    window.location.href = whatsappLink;
    // window.open() = Window.prototype.open();
    // window.open(whatsappLink);
  };

  const [studentName, setStudentName] = useState("");
  const [fontSize, setFontSize] = useState(16);
  const [fontColor, setFontColor] = useState("#000000");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [quantity, setQuantity] = useState(1);
  const [product,setProduct]=useState({});

  // const [cartCount, setCartCount] = useState(0);

  // useEffect(() => {
  //   const storedCartCount = JSON.parse(localStorage.getItem('CartCount')) || 0;
  //   setCartCount(storedCartCount);
  // }, []);
  // Handle input changes
  useEffect(() => {
        const fetchData = async () => {
          const url = '/nameslip_data.json';
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
    var glossy1=document.getElementById('glossy')
    var normal1=document.getElementById('normal')
    var labelstyle = "matte";
  const normal=()=>{
    normal1.style.backgroundColor = "#13aa52";
    normal1.style.color = "#fff";
    normal1.style.transform = "scale(1.2)";
    glossy1.style.backgroundColor = "snow";
    glossy1.style.borderRadius = "0px";
    normal1.style.borderRadius = "15px";
    glossy1.style.color = "black";
    glossy1.style.transform = "scale(1)";
    normal1.style.transition = ".4s";
    glossy1.style.transition = ".4s";
    labelstyle = "matte";
   
  };
  const glossy=()=>{
    glossy1.style.backgroundColor = "#13aa52";
    glossy1.style.color = "#fff";
    glossy1.style.transform = "scale(1.2)";
    normal1.style.backgroundColor = "snow";
    normal1.style.borderRadius = "0px";
    glossy1.style.borderRadius = "15px";
    normal1.style.color = "black";
    normal1.style.transform = "scale(1)";
    normal1.style.transition = ".4s";
    glossy1.style.transition = ".4s";
    labelstyle = "glossy";
  };



    //add to the cart
    const handleAddToCart = async () => {
      if (persImgContRef.current) {
        try {
          // Convert the div to an image using html2canvas
          const canvas = await html2canvas(persImgContRef.current);
          const imageData = canvas.toDataURL('image/png'); // Export as a Base64 image
      
          // Ensure price and quantity are being passed correctly
          const productDetails = {
            image: imageData,  // Base64 image data
            quantity: quantity,  // User-selected quantity
            price: product.price * quantity,  // Calculated price for the given quantity
            Name: product.name,  // Product name
            labeltype: product.labeltype,  // Example for extra info like label type
            size: product.size,  // Size information (if needed)
          };
    
          console.log("Product details being added:", productDetails); // Debugging step to check the values
    
          // Retrieve existing cart from localStorage
          const existingCart = JSON.parse(localStorage.getItem('OrderData')) || [];
    
          // Push the new product to the cart
          existingCart.push(productDetails);
    
          // Store the updated cart back into localStorage
          localStorage.setItem('OrderData', JSON.stringify(existingCart));

          // Update cart count
          addToCart();
        // const newCartCount = cartCount + 1;
        // setCartCount(newCartCount);
        // localStorage.setItem('CartCount', newCartCount);

          alert('Product added to cart successfully!');
        } catch (error) {
          console.error('Error capturing the div:', error);
        }
      }
      navigate('/Order');
    };
    

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
  const updatetransformsubject = (type, value) => {
    setsubjecttrans((prev) => ({ ...prev, [type]: prev[type] + value }));
  };
  const updatetransformrollno = (type, value) => {
    setrollnotrans((prev) => ({ ...prev, [type]: prev[type] + value }));
  };
  const updatetransformsection = (type, value) => {
    setsectiontrans((prev) => ({ ...prev, [type]: prev[type] + value }));
  };
  const updatetransformclass = (type, value) => {
    setclasstrans((prev) => ({ ...prev, [type]: prev[type] + value }));
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
    if (document.getElementById("schoolnamecustomizediv").style.display ==="block") {
      document.getElementById("schoolnamecustomizediv").style.display = "none";
    } else {
      document.getElementById("schoolnamecustomizediv").style.display = "block";
    }
  };
  const handlehideSubject = () => {
    if (
      document.getElementById("subjectcustomizediv").style.display ===
      "block"
    ) {
      document.getElementById("subjectcustomizediv").style.display = "none";
    } else {
      document.getElementById("subjectcustomizediv").style.display = "block";
    }
  };
  const handlehideRollno = () => {
    if (
      document.getElementById("rollcustomizediv").style.display ===
      "block"
    ) {
      document.getElementById("rollcustomizediv").style.display = "none";
    } else {
      document.getElementById("rollcustomizediv").style.display = "block";
    }
  };
  const handlehidesection = () => {
    if (
      document.getElementById("sectioncustomizediv").style.display ==="block") {
      document.getElementById("sectioncustomizediv").style.display = "none";
    } else {
      document.getElementById("sectioncustomizediv").style.display = "block";
    }
  };
  const handlehideclass = () => {
    if (
      document.getElementById("classcustomizediv").style.display ===
      "block"
    ) {
      document.getElementById("classcustomizediv").style.display = "none";
    } else {
      document.getElementById("classcustomizediv").style.display = "block";
    }
  };
  return (
    <div className="personalizecontainer">
      <div className="pers-img-cont" >
        <div ref={persImgContRef}>
        <div className='stickerdiv'>
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
        </div>
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
            transform: `scale(${subjecttrans.scale}) rotate(${subjecttrans.rotate}deg) translate(${subjecttrans.translateX}px, ${subjecttrans.translateY}px) scaleX(${subjecttrans.mirror})`,
            transition: "transform 0.2s",
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
            transform: `scale(${rollnotrans.scale}) rotate(${rollnotrans.rotate}deg) translate(${rollnotrans.translateX}px, ${rollnotrans.translateY}px) scaleX(${rollnotrans.mirror})`,
            transition: "transform 0.2s",
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
            transform: `scale(${sectiontrans.scale}) rotate(${sectiontrans.rotate}deg) translate(${sectiontrans.translateX}px, ${sectiontrans.translateY}px) scaleX(${sectiontrans.mirror})`,
            transition: "transform 0.2s",
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
            transform: `scale(${classtrans.scale}) rotate(${classtrans.rotate}deg) translate(${classtrans.translateX}px, ${classtrans.translateY}px) scaleX(${classtrans.mirror})`,
            transition: "transform 0.2s",
          }}
        >
          {studentDetails.class}
        </label>
      </div>
      </div>
      <div className="controllize-container">
        <div id="buttonscontrol">
          <label htmlFor="select-image" id="sel-img-btn">
            select image
          </label>
          <button id="editImage" onClick={handlecustomImage}>
            <img src="/image/custamize.png" width={"25px"} alt="" />
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
            src="/image/custamize.png"
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
            src="/image/custamize.png"
            alt=""
            width={"25px"}
            onClick={handlehideschoolname}
            className="custamlogo"
          />
          <button id="otherdetails" onClick={handleotherDetails}>
            Other Details
          </button>
          <div id="OD">
          <div className='img-cus'>
            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={studentDetails.subject}
              onChange={handleInputChange}
              className="studentDetails"
            />
            <div id="subjectcustomizediv">
            <button
              className="zoom-in"
              onClick={() => updatetransformsubject("scale", 0.1)}
            >
              zoom in
            </button>
            <button onClick={() => updatetransformsubject("scale", -0.1)}>
              zoom out
            </button>
            <button onClick={() => updatetransformsubject("rotate", 10)}>
              tilt left
            </button>
            <button onClick={() => updatetransformsubject("rotate", -10)}>
              tilt right
            </button>
            <button onClick={() => updatetransformsubject("rotate", 180)}>
              Upside Down
            </button>
            <button onClick={() => updatetransformsubject("translateY", -10)}>
              up
            </button>
            <button onClick={() => updatetransformsubject("translateY", 10)}>
              down
            </button>
            <button onClick={() => updatetransformsubject("translateX", -10)}>
              left
            </button>
            <button onClick={() => updatetransformsubject("translateX", 10)}>
              right
            </button>
          </div>
            <img src="/image/custamize.png" alt="" className="custamlogo"  width={"25px"} onClick={handlehideSubject}/>
            </div>
            <div className='img-cus'>
            <input
              type="text"
              name="rollNumber"
              placeholder="Roll Number"
              value={studentDetails.rollNumber}
              onChange={handleInputChange}
              className="studentDetails"
            />
            <div id="rollcustomizediv">
            <button
              className="zoom-in"
              onClick={() => updatetransformrollno("scale", 0.1)}
            >
              zoom in
            </button>
            <button onClick={() => updatetransformrollno("scale", -0.1)}>
              zoom out
            </button>
            <button onClick={() => updatetransformrollno("rotate", 10)}>
              tilt left
            </button>
            <button onClick={() => updatetransformrollno("rotate", -10)}>
              tilt right
            </button>
            <button onClick={() => updatetransformrollno("rotate", 180)}>
              Upside Down
            </button>
            <button onClick={() => updatetransformrollno("translateY", -10)}>
              up
            </button>
            <button onClick={() => updatetransformrollno("translateY", 10)}>
              down
            </button>
            <button onClick={() => updatetransformrollno("translateX", -10)}>
              left
            </button>
            <button onClick={() => updatetransformrollno("translateX", 10)}>
              right
            </button>
          </div>
            <img
              src="/image/custamize.png"
              width={"25px"}
              alt=""
              className="custamlogo"
              onClick={handlehideRollno}
            />
            </div>

            <div className='img-cus'>
            <input
              type="text"
              name="section"
              placeholder="Section"
              value={studentDetails.section}
              onChange={handleInputChange}
              className="studentDetails"
            />
            <div id="sectioncustomizediv">
            <button
              className="zoom-in"
              onClick={() => updatetransformsection("scale", 0.1)}
            >
              zoom in
            </button>
            <button onClick={() => updatetransformsection("scale", -0.1)}>
              zoom out
            </button>
            <button onClick={() => updatetransformsection("rotate", 10)}>
              tilt left
            </button>
            <button onClick={() => updatetransformsection("rotate", -10)}>
              tilt right
            </button>
            <button onClick={() => updatetransformsection("rotate", 180)}>
              Upside Down
            </button>
            <button onClick={() => updatetransformsection("translateY", -10)}>
              up
            </button>
            <button onClick={() => updatetransformsection("translateY", 10)}>
              down
            </button>
            <button onClick={() => updatetransformsection("translateX", -10)}>
              left
            </button>
            <button onClick={() => updatetransformsection("translateX", 10)}>
              right
            </button>
          </div>
            <img
              src="/image/custamize.png"
              width={"25px"}
              alt=""
              className="custamlogo"
              onClick={handlehidesection}
            />
            </div>
            <div className='img-cus'>
            <input
              type="text"
              name="class"
              placeholder="Class"
              value={studentDetails.class}
              onChange={handleInputChange}
              className="studentDetails"
            />
             <div id="classcustomizediv">
            <button
              className="zoom-in"
              onClick={() => updatetransformclass("scale", 0.1)}
            >
              zoom in
            </button>
            <button onClick={() => updatetransformclass("scale", -0.1)}>
              zoom out
            </button>
            <button onClick={() => updatetransformclass("rotate", 10)}>
              tilt left
            </button>
            <button onClick={() => updatetransformclass("rotate", -10)}>
              tilt right
            </button>
            <button onClick={() => updatetransformclass("rotate", 180)}>
              Upside Down
            </button>
            <button onClick={() => updatetransformclass("translateY", -10)}>
              up
            </button>
            <button onClick={() => updatetransformclass("translateY", 10)}>
              down
            </button>
            <button onClick={() => updatetransformclass("translateX", -10)}>
              left
            </button>
            <button onClick={() => updatetransformclass("translateX", 10)}>
              right
            </button>
            </div>
            <img
              src="/image/custamize.png"
              width={"25px"}
              alt=""
              className="custamlogo"
              onClick={handlehideclass}
            />
            </div>
          </div >
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
            <div id="type">
            <h3>Type</h3>
            
            <button id="normal" onClick={normal} ><h4>Matte</h4></button>
            <button id="glossy" onClick={glossy} ><h4>Glossy</h4></button>
            
          </div>
          <div id="size">
            <h3>Size</h3>
            <select name="" id="selectsize">
               {/* <option value="small">
                Small - (100mm * 34 mm) 16 labels - 32nos
              </option> */}
              <option value="medium">
                Medium - (100mm * 44 mm) 12 labels - 36nos
              </option>
               {/* <option value="large">
                Large - (100mm * 58 mm) 10 labels - 40nos
              </option>
              <option value="jumbo">
                Jumbo - (100mm * 68 mm) 8 labels - 48nos
              </option> -->  */}
            </select>
          </div>
          <div id="quantity">
          Quantity
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={handlePrice}
              style={{ width: "50px" }}
            />
          </div>
            <br />
            <button id="add" onClick={handleAddToCart}>Add to cart</button>
            <br />
            <label id="ad">Rs.price {product.price * quantity}</label>
            <br />
            <button onClick={handleDownload} id="down">
              Download Image
            </button>
            <button id="whatsapp" onClick={sendToWhatsApp}>
            For More Than One Image Contact Us in WhatsApp
          </button>
          </div>
          <button onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>
        Go Back
      </button>
        </div>
      </div>
    </div>
  );
};

export default NSPersonalize;