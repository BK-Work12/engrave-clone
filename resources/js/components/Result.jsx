import { useRef, useState } from "react";
import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";
import DesignsSlider from "./DesignsSlider";

export default function Result({ className, patternEngraver }) {
    const svgRef = useRef(null);
    const [selectedId, setSelectedId] = useState(null);

    const {
        maskDataUrl,
        imageSize,
        uploadedImage,
        selectedPattern,
        processedPatterns,
        settings,
        handlePatternSelect,
        handleDownloadSvg
    } = patternEngraver || {};

    const handleSelect = (src, id) => {
        setSelectedId(id);
        if (handlePatternSelect) handlePatternSelect(src);
    };

    // Styling constants
    const tileBase = 160;
    const scale = settings?.scale || 1;
    const effectiveTileW = settings?.tileH === false ? imageSize?.width : (tileBase * scale);
    const effectiveTileH = settings?.tileV === false ? imageSize?.height : (tileBase * scale);
    const rotation = settings?.rotation || 0;
    const posX = settings?.posX || 0;
    const posY = settings?.posY || 0;
    const stagger = settings?.stagger || 0;
    const transform = `rotate(${rotation}) translate(${posX} ${posY}) skewX(${stagger})`;
    const invertFilter = settings?.invert ? 'invert(1)' : 'none';
    const outlineRadius = (settings?.outlineOffset || 0) / 2;

    const processedOnePattern = selectedPattern ? processedPatterns?.[selectedPattern] : null;

    return (
        <div className={`bg-[#171616] max-w-[562px] mx-auto rounded-[30px] p-5 ${className}`}>
            <h2 className="card-head">Result: Engrave-Ready <span className="bg-gradient-to-r from-[#5F34FF] to-[#C459C6] bg-clip-text text-transparent">Design</span></h2>

            <div className="border border-[#2F2E2E] rounded-xl w-full h-[468px] relative mt-3 flex justify-center items-center overflow-hidden bg-black">
                {maskDataUrl ? (
                    <svg
                        ref={svgRef}
                        viewBox={`0 0 ${imageSize?.width} ${imageSize?.height}`}
                        className="w-full h-full object-contain"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <defs>
                            <filter id="outlineOffsetResult">
                                <feMorphology operator="dilate" radius={outlineRadius} in="SourceAlpha" result="dilated" />
                                <feComposite in="dilated" in2="SourceAlpha" operator="out" result="outline" />
                                <feFlood floodColor="white" result="white" />
                                <feComposite in="white" in2="dilated" operator="in" />
                            </filter>
                            <pattern id="engravePatternResult" patternUnits="userSpaceOnUse" width={effectiveTileW} height={effectiveTileH} patternTransform={transform}>
                                <image href={processedOnePattern || selectedPattern} width={effectiveTileW} height={effectiveTileH} preserveAspectRatio="xMidYMid slice" style={{ filter: invertFilter }} />
                            </pattern>
                            <mask id="shapeMaskResult">
                                <image
                                    href={maskDataUrl}
                                    width={imageSize?.width}
                                    height={imageSize?.height}
                                    preserveAspectRatio="xMidYMid meet"
                                    style={{ filter: outlineRadius > 0 ? 'url(#outlineOffsetResult)' : 'none' }}
                                />
                            </mask>
                            <filter id="dilateMaskResult">
                                <feMorphology operator="dilate" radius={outlineRadius} />
                            </filter>
                        </defs>
                        <rect width={imageSize?.width} height={imageSize?.height} fill="white" />
                        <image href={uploadedImage} width={imageSize?.width} height={imageSize?.height} preserveAspectRatio="xMidYMid meet" opacity="0.3" />
                        <mask id="finalMaskResult">
                            <image
                                href={maskDataUrl}
                                width={imageSize?.width}
                                height={imageSize?.height}
                                preserveAspectRatio="xMidYMid meet"
                                filter={outlineRadius > 0 ? "url(#dilateMaskResult)" : ""}
                            />
                        </mask>
                        <rect width={imageSize?.width} height={imageSize?.height} fill="url(#engravePatternResult)" mask="url(#finalMaskResult)" />
                    </svg>
                ) : (
                    <span className="text-sm font-medium text-[#616161] absolute">Your generated design will appear here.</span>
                )}
            </div>

            {/* Pattern Selection */}
            {maskDataUrl && (
                <div className="mt-4">
                    <DesignsSlider onSelect={handleSelect} selectedId={selectedId} />
                </div>
            )}

            <div className="mt-8 flex flex-col justify-center lg:flex-row gap-4.5 w-full">
                <PrimaryButton text="Sign In" className="w-full" />
                <div className="w-full" onClick={() => handleDownloadSvg && handleDownloadSvg(svgRef)}>
                    <SecondaryButton text="Download SVG" className="w-full" />
                </div>
                <PrimaryButton text="Open In SVG Tool" className="bg-none w-full border border-[#F5F5FF]" />
            </div>
        </div>
    )
}