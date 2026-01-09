import { useState, useRef } from 'react';
import axios from 'axios';
import { router } from '@inertiajs/react';

export function usePatternEngraver() {
    const [uploadedImage, setUploadedImage] = useState(null);
    const [imageSize, setImageSize] = useState(null);
    const [maskDataUrl, setMaskDataUrl] = useState(null);
    const [selectedPattern, setSelectedPattern] = useState(null);
    const [processedPatterns, setProcessedPatterns] = useState({});

    // Default settings
    const [settings, setSettings] = useState({
        scale: 1,
        rotation: 0,
        posX: 0,
        posY: 0,
        stagger: 0,
        outlineOffset: 0,
        tileH: true,
        tileV: true,
        invert: false,
    });

    const updateSetting = (key, val) => {
        setSettings(prev => ({ ...prev, [key]: val }));
    };

    const processPattern = (patternImg) => {
        return new Promise((resolve) => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            canvas.width = patternImg.width;
            canvas.height = patternImg.height;
            ctx.drawImage(patternImg, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                if (avg > 100) {
                    data[i + 3] = 0;
                } else {
                    data[i] = 0;
                    data[i + 1] = 0;
                    data[i + 2] = 0;
                    data[i + 3] = 255;
                }
            }
            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL());
        });
    };

    const createMaskFromImage = (img) => {
        return new Promise((resolve) => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            canvas.width = img.width;
            canvas.height = img.height;

            // Fill white background
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const w = canvas.width;
            const h = canvas.height;

            // Step 1: Detect boundaries
            const isBoundary = new Uint8Array(w * h);
            for (let idx = 0; idx < w * h; idx++) {
                const i = idx * 4;
                const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
                if (lum < 250) isBoundary[idx] = 1;
            }

            // Step 2: Dilate
            const dilatedBoundary = new Uint8Array(w * h);
            for (let y = 1; y < h - 1; y++) {
                for (let x = 1; x < w - 1; x++) {
                    const idx = y * w + x;
                    if (isBoundary[idx]) {
                        dilatedBoundary[idx] = 1;
                        dilatedBoundary[idx - 1] = 1;
                        dilatedBoundary[idx + 1] = 1;
                        dilatedBoundary[idx - w] = 1;
                        dilatedBoundary[idx + w] = 1;
                        // diagonals
                        dilatedBoundary[idx - w - 1] = 1;
                        dilatedBoundary[idx - w + 1] = 1;
                        dilatedBoundary[idx + w - 1] = 1;
                        dilatedBoundary[idx + w + 1] = 1;
                    }
                }
            }

            // Step 3: Region growing/Flood fill
            const visited = new Uint8Array(w * h);
            const regions = [];

            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    const idx = y * w + x;
                    if (visited[idx] || dilatedBoundary[idx]) continue;

                    const region = [];
                    const queue = [idx];
                    visited[idx] = 1;
                    let touchesBorder = false;

                    while (queue.length > 0) {
                        const cIdx = queue.shift();
                        region.push(cIdx);
                        const cx = cIdx % w;
                        const cy = Math.floor(cIdx / w);

                        if (cx === 0 || cx === w - 1 || cy === 0 || cy === h - 1) {
                            touchesBorder = true;
                        }

                        // Neighbors (4-way)
                        const neighbors = [cIdx + 1, cIdx - 1, cIdx + w, cIdx - w];
                        // Validate coords for wrap-around safety (simplified check)
                        if (cx < w - 1 && !visited[cIdx + 1] && !dilatedBoundary[cIdx + 1]) { visited[cIdx + 1] = 1; queue.push(cIdx + 1); }
                        if (cx > 0 && !visited[cIdx - 1] && !dilatedBoundary[cIdx - 1]) { visited[cIdx - 1] = 1; queue.push(cIdx - 1); }
                        if (cy < h - 1 && !visited[cIdx + w] && !dilatedBoundary[cIdx + w]) { visited[cIdx + w] = 1; queue.push(cIdx + w); }
                        if (cy > 0 && !visited[cIdx - w] && !dilatedBoundary[cIdx - w]) { visited[cIdx - w] = 1; queue.push(cIdx - w); }
                    }
                    regions.push({ pixels: region, touchesBorder });
                }
            }

            const fillMask = new Uint8Array(w * h);
            for (const region of regions) {
                if (!region.touchesBorder && region.pixels.length > 50) {
                    for (const pIdx of region.pixels) fillMask[pIdx] = 1;
                }
            }

            for (let idx = 0; idx < w * h; idx++) {
                const i = idx * 4;
                if (fillMask[idx]) {
                    data[i] = 255; data[i + 1] = 255; data[i + 2] = 255; data[i + 3] = 255;
                } else {
                    data[i] = 0; data[i + 1] = 0; data[i + 2] = 0; data[i + 3] = 0;
                }
            }

            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL());
        });
    };

    const handleUpload = (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (ev) => {
            const vectorImg = new Image();
            vectorImg.src = ev.target.result;
            vectorImg.onload = async () => {
                setUploadedImage(ev.target.result);
                setImageSize({ width: vectorImg.width, height: vectorImg.height });
                const mask = await createMaskFromImage(vectorImg);
                setMaskDataUrl(mask);
            };
        };
    };

    const handlePatternSelect = (patternUrl) => {
        setSelectedPattern(patternUrl);
        if (patternUrl && !processedPatterns[patternUrl]) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = patternUrl;
            img.onload = async () => {
                const processed = await processPattern(img);
                setProcessedPatterns(prev => ({ ...prev, [patternUrl]: processed }));
            };
        }
    };

    const handleDownloadSvg = async (svgRef, filename = "engrave-design.svg") => {
        if (!svgRef.current) return;

        try {
            const response = await axios.post('/credits/deduct');

            if (response.status === 200) {
                const svgData = new XMLSerializer().serializeToString(svgRef.current);
                const blob = new Blob([svgData], { type: "image/svg+xml" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = filename;
                link.click();
                URL.revokeObjectURL(url);

                // Reload auth props to update credits in UI
                router.reload({ only: ['auth'] });
            }
        } catch (error) {
            if (error.response && error.response.status === 403) {
                alert("Insufficient credits. Please purchase more tokens.");
            } else {
                console.error("Download error", error);
                alert("An error occurred. Please try again.");
            }
        }
    };

    return {
        uploadedImage,
        imageSize,
        maskDataUrl,
        selectedPattern,
        processedPatterns,
        settings,
        updateSetting,
        handleUpload,
        handlePatternSelect,
        handleDownloadSvg
    };
}
