import React, { useRef, useState } from "react";
import DesignUploader from "../components/DesignUploader";
import SeamlessPatternStyling from "../components/SeamlessPatternStyling";
import { usePatternEngraver } from "../hooks/usePatternEngraver";
import { SliderData } from "../Data/SliderData";

export default function SeamlessPatternCreator() {
    const svgRef = useRef(null);
    const [designs, setDesigns] = useState(SliderData);

    const {
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
    } = usePatternEngraver();

    const handlePatternUpload = (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const newDesign = {
                id: Date.now(), // simple unique id
                src: e.target.result,
                alt: file.name
            };
            setDesigns(prev => [newDesign, ...prev]);
            handlePatternSelect(newDesign.src);
        };
    };

    return (
        <>
            {/* <DesignGeneratorHeader title="Seamless Pattern Creator" /> */}
            <div className="flex flex-col xl:flex-row gap-8 justify-center px-4 mx-auto mt-4 mb-15">
                <DesignUploader
                    onUpload={handleUpload}
                    onPatternSelect={handlePatternSelect}
                    uploadedImage={uploadedImage}
                    maskDataUrl={maskDataUrl}
                    imageSize={imageSize}
                    selectedPattern={selectedPattern}
                    processedOnePattern={processedPatterns[selectedPattern]}
                    settings={settings}
                    svgRef={svgRef}
                    designs={designs}
                    onPatternUpload={handlePatternUpload}
                />
                <SeamlessPatternStyling
                    settings={settings}
                    updateSetting={updateSetting}
                    onDownload={() => handleDownloadSvg(svgRef)}
                />
            </div>
        </>
    )
}
