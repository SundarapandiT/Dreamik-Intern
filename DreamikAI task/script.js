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

            // Loop through each image in the folder and generate a label
            imageFiles.forEach((imageFile, index) => {
                const canvas = document.createElement('canvas');
                canvas.width = 1200;
                canvas.height = 800;

                const ctx = canvas.getContext('2d');
                const textData = data[index % data.length]; // Loop through text data if images are more

                drawLabel(ctx, textData, imageFile).then(() => {
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

function drawLabel(ctx, data, imageFile) {
    return new Promise((resolve) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        const { name, className, section, subject, school } = data;

        const backgroundImg = new Image();
        backgroundImg.onload = function () {
            ctx.drawImage(backgroundImg, 0, 0, ctx.canvas.width, ctx.canvas.height);

            const image = new Image();
            image.onload = function () {
                ctx.save();
                ctx.beginPath();
                ctx.arc(200, 300, 150, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(image, 50, 150, 300, 300);
                ctx.restore();

                ctx.fillStyle = '#000';
                ctx.font = 'bold 36px Arial';
                ctx.fillText(`Name: ${name}`, 650, 150);
                ctx.fillText(`${className}`, 650, 250);
                ctx.fillText(`${section}`, 950, 250);
                ctx.fillText(`${subject}`, 650, 350);
                ctx.fillText(`${school}`, 650, 450);

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
