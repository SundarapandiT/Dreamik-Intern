import React, { useState } from 'react';
import JSZip from 'jszip';
import JSZipUtils from 'jszip-utils';
import { saveAs } from 'file-saver';
import "./bulkorder_style.css";

const BulkOrder = () => {
    const [backgroundImgDataUrl, setBackgroundImgDataUrl] = useState('');
    const [imageFiles, setImageFiles] = useState([]);
    const [textFile, setTextFile] = useState(null);

    const handleBgImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setBackgroundImgDataUrl(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleTextFileChange = (event) => {
        setTextFile(event.target.files[0]);
    };

    const handleImageFolderChange = (event) => {
        setImageFiles(Array.from(event.target.files));
    };

    const generateLabels = () => {
        if (textFile && imageFiles.length > 0) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                let data;

                if (textFile.name.endsWith('.json')) {
                    try {
                        data = JSON.parse(content);
                    } catch (err) {
                        alert("Invalid JSON file format.");
                        return;
                    }
                } else {
                    data = parseTxtFile(content);
                }

                if (!Array.isArray(data)) {
                    alert("Invalid file format. Please provide an array of objects.");
                    return;
                }

                const canvasContainer = document.getElementById('canvasContainer');
                canvasContainer.innerHTML = '';

                imageFiles.forEach((imageFile, index) => {
                    const canvas = document.createElement('canvas');
                    canvas.width = 450;
                    canvas.height = 300;

                    const ctx = canvas.getContext('2d');
                    const textData = data[index % data.length];

                    drawLabel(ctx, textData, imageFile, canvas.width, canvas.height).then(() => {
                        canvasContainer.appendChild(canvas);
                        if (index === imageFiles.length - 1) {
                            document.getElementById('downloadAllButton').style.display = 'block';
                        }
                    });
                });
            };
            reader.readAsText(textFile);
        } else {
            alert('Please upload both text file and image folder.');
        }
    };

    const parseTxtFile = (content) => {
        const lines = content.split('\n').filter(line => line.trim() !== '');
        const data = [];
        const headers = lines[1].split(',').map(val => val.trim());

        for (let i = 2; i < lines.length; i++) {
            const values = lines[i].split(',').map(val => val.trim().replace(/"/g, ''));
            if (values.length < 6) continue;

            data.push({
                imgname: values[0],
                name: values[1],
                className: values[2],
                section: values[3],
                rollNumber: values[4],
                school: values[5]
            });
        }
        return data;
    };

    const drawLabel = (ctx, data, imageFile, canvasWidth, canvasHeight) => {
        return new Promise((resolve) => {
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);

            const { name, className, section, rollNumber, school } = data;

            const backgroundImg = new Image();
            backgroundImg.onload = function () {
                ctx.drawImage(backgroundImg, 0, 0, canvasWidth, canvasHeight);

                const image = new Image();
                image.onload = function () {
                    ctx.save();
                    ctx.beginPath();

                    const centerX = canvasWidth * 0.17;
                    const centerY = canvasHeight * 0.375;
                    const radiusX = canvasWidth * 0.125;
                    const radiusY = canvasHeight * 0.1875;

                    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
                    ctx.closePath();
                    ctx.clip();

                    ctx.drawImage(image, canvasWidth * 0.03, canvasHeight * 0.1875, canvasWidth * 0.25, canvasHeight * 0.375);
                    ctx.restore();

                    ctx.fillStyle = '#000';
                    ctx.font = `bold ${canvasWidth * 0.042 * 1.2}px sans-serif`;
                    ctx.fillText(`${name}`, canvasWidth * 0.34, canvasHeight * 0.1475);
                    ctx.font = `${canvasWidth * 0.036}px Arial`;
                    ctx.fillText(`${className}`, canvasWidth * 0.425, canvasHeight * 0.2725);
                    ctx.fillText(`${section}`, canvasWidth * 0.69, canvasHeight * 0.2725);
                    ctx.fillText(`${rollNumber}`, canvasWidth * 0.9, canvasHeight * 0.2725);
                    ctx.font = `${canvasWidth * 0.032}px Arial`;
                    ctx.fillText(`${school}`, canvasWidth * 0.44, canvasHeight * 0.5625);

                    resolve();
                };

                const reader = new FileReader();
                reader.onload = function (e) {
                    image.src = e.target.result;
                };
                reader.readAsDataURL(imageFile);
            };
            backgroundImg.src = backgroundImgDataUrl;
        });
    };

    const downloadAllLabels = () => {
        const zip = new JSZip();
        const canvasElements = document.querySelectorAll('#canvasContainer canvas');

        if (canvasElements.length === 0) {
            alert('No labels to download.');
            return;
        }

        canvasElements.forEach((canvas, index) => {
            const dataUrl = canvas.toDataURL();
            const imgData = dataUrl.replace(/^data:image\/(png|jpg);base64,/, '');
            zip.file(`label_${index + 1}.png`, imgData, { base64: true });
        });

        zip.generateAsync({ type: 'blob' }).then((content) => {
            saveAs(content, 'labels.zip');
        });
    };

    return (
        <div className='--bulkorder'>
            <h1>Kids Label Generator</h1>
            <div id="uploadSection">
                <label htmlFor="bgImage">Upload Background Image:</label>
                <input type="file" id="bgImage" accept="image/*" onChange={handleBgImageChange} />
                <br /><br />
                <label htmlFor="textFile">Upload TXT/JSON File:</label>
                <input type="file" id="textFile" accept=".txt,.json,.csv" onChange={handleTextFileChange} />
                <br /><br />
                <label htmlFor="imageFolder">Upload Kid's Image Folder:</label>
                <input type="file" id="imageFolder" accept="image/*" webkitdirectory="true" onChange={handleImageFolderChange} />
                <br /><br />
                <button onClick={generateLabels}>Generate Labels</button>
            </div>

            <div id="canvasContainer"></div>

            <button id="downloadAllButton" style={{ display: 'none' }} onClick={downloadAllLabels}>
                Download All Labels
            </button>
        </div>
    );
};

export default BulkOrder;
