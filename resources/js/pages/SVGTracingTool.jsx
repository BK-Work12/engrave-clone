import { useState, useRef } from "react";

import ImageProcessor from "../components/ImageProcessor";
import SVGUploader from "../components/SVGUploader"
import SeamlessPatternStyling from "../components/SeamlessPatternStyling"; // Import styling
import { usePatternEngraver } from "../hooks/usePatternEngraver";

export default function SVGTracingTool() {
    const [currentDesign, setCurrentDesign] = useState(null);
    const patternEngraver = usePatternEngraver(); // Use the hook
    const svgRef = useRef(null);

    // Intercept upload to update both local engraver state and parent design state
    const handleUploadWrapper = (file) => {
        // Call pattern engraver upload
        patternEngraver.handleUpload(file);
        // We don't have the response from the server here yet if we use the hook directly?
        // Actually SVGUploader handles the server upload. 
        // We need to coordinate.
    };

    return (
        <>
            {/* <DesignGeneratorHeader title="SVG Tracing Tool" /> */}
            <div className="flex flex-col lg:flex-row gap-8 container justify-center mx-auto w-full mt-4 mb-15">
                <div className="flex flex-col gap-8 w-full lg:w-auto">
                    <SVGUploader
                        className="lg:w-full"
                        onDesignUploaded={setCurrentDesign}
                        // Pass pattern engraver props
                        {...patternEngraver}
                        svgRef={svgRef}
                    />
                </div>
                <div className="flex flex-col gap-4">
                    <ImageProcessor design={currentDesign} />
                    {/* Add styling controls below image processor */}
                    <SeamlessPatternStyling
                        settings={patternEngraver.settings}
                        updateSetting={patternEngraver.updateSetting}
                        onDownload={() => patternEngraver.handleDownloadSvg(svgRef)}
                    />
                </div>
            </div>
        </>
    )
}