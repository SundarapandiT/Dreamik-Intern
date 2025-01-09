const bgImageInput = document.getElementById('bgImage');
const canvasContainer = document.getElementById('canvasContainer');
const downloadAllButton = document.getElementById('downloadAllButton');
const imageFolderInput = document.getElementById('imageFolder');
let backgroundImgDataUrl = '';

bgImageInput.addEventListener('change', function () {
    const file = bgImageInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            backgroundImgDataUrl = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

function generateLabels() {
    const textFile = document.getElementById('textFile').files[0];
    const imageFiles = Array.from(imageFolderInput.files);

    if (textFile && imageFiles.length > 0) {
        const reader = new FileReader();
        reader.onload = function (e) {
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
                        downloadAllButton.style.display = 'block';
                    }
                });
            });
        };
        reader.readAsText(textFile);
    } else {
        alert('Please upload both text file and image folder.');
    }
}

function parseTxtFile(content) {
    const lines = content.split('\n').filter(line => line.trim() !== '');
    return lines.map(line => {
        const values = line.split(',').map(val => val.trim().replace(/"/g, ''));
        return {
            name: values[0],
            className: values[1],
            section: values[2],
            subject: values[3],
            school: values[4]
        };
    });
}

function drawLabel(ctx, data, imageFile, canvasWidth, canvasHeight) {
    return new Promise((resolve) => {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        const { name, className, section, subject, school } = data;

        const backgroundImg = new Image();
        backgroundImg.onload = function () {
            ctx.drawImage(backgroundImg, 0, 0, canvasWidth, canvasHeight);

            const image = new Image();
            image.onload = function () {
                ctx.save();
                ctx.beginPath();
                const circleX = canvasWidth * 0.17;
                const circleY = canvasHeight * 0.375;
                const circleRadius = canvasWidth * 0.125;
                ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(image, canvasWidth * 0.04, canvasHeight * 0.1875, canvasWidth * 0.25, canvasHeight * 0.375);
                ctx.restore();

                ctx.fillStyle = '#000';
                ctx.font = `${canvasWidth * 0.036}px Arial`;
                ctx.fillText(`Name: ${name}`, canvasWidth * 0.54, canvasHeight * 0.1875);
                ctx.fillText(`${className}`, canvasWidth * 0.54, canvasHeight * 0.3125);
                ctx.fillText(`${section}`, canvasWidth * 0.79, canvasHeight * 0.3125);
                ctx.fillText(`${subject}`, canvasWidth * 0.54, canvasHeight * 0.4375);
                ctx.fillText(`${school}`, canvasWidth * 0.52, canvasHeight * 0.5625);

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
}

function downloadAllLabels() {
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

    zip.generateAsync({ type: 'blob' }).then(function (content) {
        saveAs(content, 'labels.zip');
    });
}
